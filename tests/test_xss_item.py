import pytest
from backend.auth import user_auth_register
from backend.items import user_create_item
from backend.config import app
from markupsafe import escape


@pytest.fixture(scope="module", autouse=True)
def app_context():
    with app.app_context():
        yield app


@pytest.fixture(autouse=True)
def bypass_validations(monkeypatch):
    """Bypass validation functions for testing."""
    monkeypatch.setattr("backend.classes.item.unsanitize_output", lambda x: x)


@pytest.mark.asyncio
async def test_xss_prevention_in_item_description():
    """
    Test that XSS payloads in item descriptions are properly sanitized.
    """
    # Register a user
    session, csrf = await user_auth_register(
        "user_xss@example.com",
        "Password123!",
        "Xss",
        "Tester",
    )

    # Malicious description with XSS
    malicious_description = (
        "<script>alert('xss')</script>This is a dangerous description!"
    )

    # Create item with malicious description
    item = await user_create_item(
        session_token=session,
        csrf_token=csrf,
        new_title="Dangerous Item",
        new_description=malicious_description,
        new_condition="new",
        new_type="free",
        new_images=["https://example.com/image1.jpg"],
        new_location="Melbourne, Australia",
    )

    # Expected output is escaped and lowercased
    expected_description = str(escape(malicious_description.lower()))

    # Verify that the description is properly sanitised
    assert item.get_description() == expected_description, (
        f"Item description should be sanitized. Got: {item.get_description()}, "
        f"Expected: {expected_description}"
    )

    assert "<script>" not in item.get_description()
    assert "&lt;script&gt;" in item.get_description()
    assert "&#39;" in item.get_description()  # Single quote escaped
