import pytest
from backend.auth import user_auth_register
from backend.data import users
from backend.classes.user import User
from backend.config import app
from markupsafe import escape


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
    monkeypatch.setattr("backend.classes.user.unsanitize_output", lambda x: x)


# XSS Escaping Tests for auth.py using getters and setters from User class
@pytest.mark.asyncio
async def test_xss_escaping_all_fields():
    """
    Test that all user fields are properly escaped or normalised during registration to prevent XSS.

    Steps:
        - Attempt to register a user using malicious HTML/JavaScript payloads in the email, first name, last name, and password fields.
        - Verify that:
            - Email is normalised (lowercased) but not escaped.
            - First and last names are capitalised and HTML-escaped.
            - Password is accepted as-is since it is hashed and not rendered in plaintext.

    Expected:
        - The global `users` dictionary uses the normalised email as its key.
        - The stored user's fields match the expected sanitised versions when accessed via class getters.
    """

    # Declare malicious input values to simulate XSS attempts.
    malicious_email = "evil<script>@example.com"
    malicious_first_name = "<script>alert('xss')</script>"
    malicious_last_name = "<img src=x onerror=alert('xss')>"
    malicious_password = "Pass<script>word1!"

    # Define expected values after normalisation and sanitisation.
    # Email is lowercased; first and last names are capitalised and escaped; password remains unchanged.
    expected_email = malicious_email.lower()
    expected_first_name = str(escape(malicious_first_name.capitalize()))
    expected_last_name = str(escape(malicious_last_name.capitalize()))
    expected_password = malicious_password

    # Register the user with malicious inputs; auth.py handles validation, normalisation, and sanitisation.
    tokens = await user_auth_register(
        malicious_email,
        malicious_password,
        malicious_first_name,
        malicious_last_name,
    )

    # Assert that the sanitised email is used as the key in the global users dictionary.
    assert (
        expected_email in users
    ), "The sanitized email should be used as the key in users."

    # Retrieve the stored User instance from the users dictionary.
    user: User = users[expected_email]

    # Assert that the stored email matches the expected normalised email.
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
