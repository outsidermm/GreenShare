import pytest
from backend.auth import user_auth_register
from backend.items import user_create_item
from backend.offers import user_create_offer
from backend.data import users, items, exchange_offers
from backend.config import app, db
from backend.models import UserDB, ItemDB, ItemImageDB, OfferedItemDB, ExchangeOfferDB
from markupsafe import escape


@pytest.fixture(autouse=True)
def clear_data():
    """Clear all data before each test."""
    users.clear()
    items.clear()
    exchange_offers.clear()
    db.session.query(OfferedItemDB).delete()
    db.session.query(ExchangeOfferDB).delete()
    db.session.query(ItemImageDB).delete()
    db.session.query(ItemDB).delete()
    db.session.query(UserDB).delete()
    db.session.commit()


@pytest.fixture(scope="module", autouse=True)
def app_context():
    with app.app_context():
        yield app


@pytest.fixture(autouse=True)
def bypass_validations(monkeypatch):
    """Bypass validation functions for testing."""
    monkeypatch.setattr("backend.auth.pwd_auth", lambda pwd: True)
    monkeypatch.setattr("backend.auth.email_auth", lambda email: True)
    monkeypatch.setattr("backend.auth.name_auth", lambda name, err_prefix: True)


@pytest.mark.asyncio
async def test_xss_prevention_in_offer_messages():
    """
    Test that XSS payloads in offer messages are properly sanitized.
    """
    # Create two users
    session_a, csrf_a = await user_auth_register(
        email="user_a@example.com",
        pwd="password123",
        first_name="User",
        last_name="A",
    )
    
    session_b, csrf_b = await user_auth_register(
        email="user_b@example.com",
        pwd="password123",
        first_name="User",
        last_name="B",
    )
    
    # User A creates an item
    item_a = await user_create_item(
        session_token=session_a,
        csrf_token=csrf_a,
        title="Safe Item",
        description="A safe item for testing",
        condition="new",
        type="free",
        category="Electronics",
        images=[],
        location="Sydney, Australia",
    )
    
    # User B creates an offer with XSS payload in message
    malicious_message = "<script>alert('XSS')</script>This is a malicious offer!"
    
    offer = await user_create_offer(
        session_token=session_b,
        csrf_token=csrf_b,
        offered_item_ids=[],
        requested_item_id=item_a.get_pk(),
        message=malicious_message,
    )
    
    # The message should be sanitized and lowercased
    expected_message = str(escape(malicious_message.lower()))
    
    # Verify the offer message is properly sanitized
    assert offer.get_message() == expected_message, (
        f"Offer message should be sanitized. Got: {offer.get_message()}, "
        f"Expected: {expected_message}"
    )
    
    # Verify the sanitized message doesn't contain script tags
    assert "<script>" not in offer.get_message()
    assert "alert(" not in offer.get_message()
    
    # Verify HTML entities are used instead
    assert "&lt;script&gt;" in offer.get_message()
    assert "&#39;" in offer.get_message()  # Single quote escaped


@pytest.mark.asyncio
async def test_xss_prevention_in_cancel_message():
    """
    Test that XSS payloads in cancel messages are properly sanitized.
    """
    # Create two users
    session_a, csrf_a = await user_auth_register(
        email="user_a@example.com",
        pwd="password123",
        first_name="User",
        last_name="A",
    )
    
    session_b, csrf_b = await user_auth_register(
        email="user_b@example.com",
        pwd="password123",
        first_name="User",
        last_name="B",
    )
    
    # User A creates an item
    item_a = await user_create_item(
        session_token=session_a,
        csrf_token=csrf_a,
        title="Item to trade",
        description="An item for testing cancellation",
        condition="new",
        type="free",
        category="Electronics",
        images=[],
        location="Sydney, Australia",
    )
    
    # User B creates a normal offer
    offer = await user_create_offer(
        session_token=session_b,
        csrf_token=csrf_b,
        offered_item_ids=[],
        requested_item_id=item_a.get_pk(),
        message="This is a normal offer message",
    )
    
    # Import the cancel function
    from backend.offers import user_cancel_offer
    
    # Cancel with XSS payload
    malicious_cancel_message = "<img src=x onerror=alert('XSS')>Cancelled with XSS"
    
    await user_cancel_offer(
        session_token=session_b,
        csrf_token=csrf_b,
        offer_id=offer.get_offer_pk(),
        message=malicious_cancel_message,
    )
    
    # The cancel message should be sanitized and lowercased
    expected_cancel_message = str(escape(malicious_cancel_message.lower()))
    
    # Verify the offer's message is updated with sanitized cancel message
    assert offer.get_message() == expected_cancel_message, (
        f"Cancel message should be sanitized. Got: {offer.get_message()}, "
        f"Expected: {expected_cancel_message}"
    )
    
    # Verify no raw HTML/JS in the message
    assert "<img" not in offer.get_message()
    assert "onerror=" not in offer.get_message()
    assert "alert(" not in offer.get_message()