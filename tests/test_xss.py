import re
import pytest
from backend.auth import user_auth_register
from backend.data import users
from backend.classes.user import User
from backend.config import app, db
from backend.db.user_db import UserDB


# -----------------------------------------------------------------------------
# Fixture: Clear the global users dictionary before each test.
# -----------------------------------------------------------------------------
@pytest.fixture(autouse=True)
def clear_users():
    users.clear()
    with app.app_context():
        db.drop_all()
        db.create_all()


@pytest.fixture(scope="module", autouse=True)
def app_context():
    with app.app_context():
        yield app


@pytest.fixture(autouse=True)
def bypass_validations(monkeypatch):
    # Override pwd_auth, email_auth, and name_auth if needed.
    monkeypatch.setattr("backend.auth.pwd_auth", lambda pwd: True)
    monkeypatch.setattr("backend.auth.email_auth", lambda email: True)
    monkeypatch.setattr("backend.auth.name_auth", lambda name: True)


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

    # Expected values after normalization and escaping:
    # - The email is lowercased then escaped.
    expected_email = re.escape(malicious_email.lower())
    # - First and last names are capitalized then escaped.
    expected_first_name = re.escape(malicious_first_name.capitalize())
    expected_last_name = re.escape(malicious_last_name.capitalize())
    # - Password is simply escaped (no normalization).
    expected_password = re.escape(malicious_password)

    # Register the user (auth.py performs validation, normalization, and escaping).
    tokens = await user_auth_register(
        email=malicious_email,
        pwd=malicious_password,
        first_name=malicious_first_name,
        last_name=malicious_last_name,
    )
    # Tokens are returned as (session_token, csrf_token), but here we focus on stored values.

    # The global users dictionary is keyed by the escaped email.
    assert (
        expected_email in users
    ), "The escaped email should be used as the key in users."

    # Retrieve the stored User instance.
    user: User = users[expected_email]

    # Using the getters provided in the User class, assert that each field is stored as expected.
    assert (
        user.get_email() == expected_email
    ), "User email should be normalized and escaped."
    assert (
        user.get_first_name() == expected_first_name
    ), "User first name should be capitalized and escaped."
    assert (
        user.get_last_name() == expected_last_name
    ), "User last name should be capitalized and escaped."
    assert (
        user.verify_pwd(expected_password) is True
    ), "User password should be escaped."
