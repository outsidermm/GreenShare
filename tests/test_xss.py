import re
import pytest
from backend.auth import user_auth_register
from backend.data import users,items, exchange_offers
from backend.classes.user import User
from backend.config import app, db
from markupsafe import escape
from backend.models import UserDB, ItemDB, ItemImageDB, OfferedItemDB, ExchangeOfferDB


# -----------------------------------------------------------------------------
# Fixture: Clear the global users dictionary before each test.
# -----------------------------------------------------------------------------
@pytest.fixture(autouse=True)
def clear_users():
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
    # Override pwd_auth, email_auth, and name_auth if needed.
    monkeypatch.setattr("backend.auth.pwd_auth", lambda pwd: True)
    monkeypatch.setattr("backend.auth.email_auth", lambda email: True)
    monkeypatch.setattr("backend.auth.name_auth", lambda name, err_prefix: True)


# -----------------------------------------------------------------------------
# XSS Escaping Tests for auth.py using getters and setters from User class
# -----------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_xss_escaping_all_fields():
    """
    Register a user with malicious payloads in email, first name, last name,
    and password. Verify that each field is normalized and escaped as expected.
    """
    # Malicious input values.
    malicious_email = "evil<script>@example.com"
    malicious_first_name = "<script>alert('xss')</script>"
    malicious_last_name = "<img src=x onerror=alert('xss')>"
    malicious_password = "Pass<script>word1!"

    # Expected values after normalization and sanitization:
    # - The email is lowercased (no HTML escaping needed for emails)
    expected_email = malicious_email.lower()
    # - First and last names are capitalized then HTML escaped
    expected_first_name = str(escape(malicious_first_name.capitalize()))
    expected_last_name = str(escape(malicious_last_name.capitalize()))
    # - Password is not escaped (it's hashed, not displayed)
    expected_password = malicious_password

    # Register the user (auth.py performs validation, normalization, and sanitization).
    tokens = await user_auth_register(
        email=malicious_email,
        pwd=malicious_password,
        first_name=malicious_first_name,
        last_name=malicious_last_name,
    )
    # Tokens are returned as (session_token, csrf_token), but here we focus on stored values.

    # The global users dictionary is keyed by the sanitized email.
    assert (
        expected_email in users
    ), "The sanitized email should be used as the key in users."

    # Retrieve the stored User instance.
    user: User = users[expected_email]

    # Using the getters provided in the User class, assert that each field is stored as expected.
    assert (
        user.get_email() == expected_email
    ), "User email should be normalized (lowercased)."
    assert (
        user.get_first_name() == expected_first_name
    ), "User first name should be capitalized and HTML escaped."
    assert (
        user.get_last_name() == expected_last_name
    ), "User last name should be capitalized and HTML escaped."
    assert (
        user.verify_pwd(expected_password) is True
    ), "User password should verify correctly (not escaped)."
