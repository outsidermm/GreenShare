import re
import pytest
from werkzeug.exceptions import HTTPException

# Import the functions under test from your auth.py
from backend.auth import (
    user_auth_register,
    user_auth_login,
    user_auth_logout,
    user_auth_validate_session_token,
    user_auth_validate_csrf_token,
)

# Import the global users dictionary so we can reset it between tests.
from backend.data import users
from backend.config import app, db
from backend.db.user_db import UserDB


# -----------------------------------------------------------------------------
# Fixtures
# -----------------------------------------------------------------------------
@pytest.fixture(autouse=True)
def clear_users():
    """
    Clears the global users dictionary before each test to ensure test isolation.
    """
    users.clear()
    db.session.query(UserDB).delete()


@pytest.fixture(scope="module", autouse=True)
def app_context():
    with app.app_context():
        yield app


# -----------------------------------------------------------------------------
# Asynchronous Authentication Function Tests
# -----------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_user_auth_register_success():
    """
    Test that a valid registration returns session and CSRF tokens,
    and that the user is added to the global users dictionary.
    """
    email_input = "test@domain.com"
    session_token, csrf_token = await user_auth_register(
        email=email_input, pwd="Password1!", first_name="Alice", last_name="Smith"
    )
    # Tokens should be returned as strings.
    assert isinstance(session_token, str)
    assert isinstance(csrf_token, str)
    # The email is normalized to lowercase and escaped.
    safe_email = re.escape(email_input.lower())
    assert safe_email in users


@pytest.mark.asyncio
async def test_user_auth_register_duplicate():
    """
    Registering the same email twice should raise a 409 error.
    """
    email_input = "duplicate@domain.com"
    await user_auth_register(
        email=email_input, pwd="Password1!", first_name="Bob", last_name="Jones"
    )
    with pytest.raises(HTTPException) as excinfo:
        await user_auth_register(
            email=email_input, pwd="Password1!", first_name="Bob", last_name="Jones"
        )
    assert "Email already exists" in excinfo.value.description


@pytest.mark.asyncio
async def test_user_auth_register_normalisation():
    """
    Test that the registration process normalises the email to lowercase
    and capitalises the first and last names.
    """
    session_token, csrf_token = await user_auth_register(
        email="TEST@DOMAIN.COM", pwd="Password1!", first_name="alice", last_name="smith"
    )
    safe_email = re.escape("test@domain.com")
    assert safe_email in users

    # Try logging in with the same credentials (even with mixed-case email)
    new_session_token, new_csrf_token = await user_auth_login(
        email="TEST@DOMAIN.COM", pwd_input="Password1!"
    )
    # Tokens should be updated (new tokens are generated on login).
    assert new_session_token != session_token
    assert new_csrf_token != csrf_token


@pytest.mark.asyncio
async def test_user_auth_login_success():
    """
    After registration, a login with the correct credentials should return new tokens.
    """
    email_input = "login@domain.com"
    await user_auth_register(
        email=email_input, pwd="Password1!", first_name="Charlie", last_name="Brown"
    )
    session_token, csrf_token = await user_auth_login(
        email=email_input, pwd_input="Password1!"
    )
    assert isinstance(session_token, str)
    assert isinstance(csrf_token, str)


@pytest.mark.asyncio
async def test_user_auth_login_invalid_password():
    """
    Logging in with an incorrect password should abort with a 401 error.
    """
    email_input = "invalidpass@domain.com"
    await user_auth_register(
        email=email_input, pwd="Password1!", first_name="Dana", last_name="White"
    )
    with pytest.raises(HTTPException) as excinfo:
        await user_auth_login(email=email_input, pwd_input="WrongPassword2!")
    assert "Invalid password" in excinfo.value.description


@pytest.mark.asyncio
async def test_user_auth_login_nonexistent_email():
    """
    Attempting to log in with an email that has not been registered
    should abort with a 401 error.
    """
    with pytest.raises(HTTPException) as excinfo:
        await user_auth_login(email="nonexistent@domain.com", pwd_input="Password1!")
    assert "Email does not exist" in excinfo.value.description


@pytest.mark.asyncio
async def test_user_auth_logout_and_token_validation():
    """
    Test that after a user logs out:
      - The session and CSRF tokens are no longer valid.
      - Attempts to validate tokens result in a 401 error.
    """
    session_token, csrf_token = await user_auth_register(
        email="logout@domain.com", pwd="Password1!", first_name="Eva", last_name="Green"
    )

    session_token = re.escape(session_token)
    csrf_token = re.escape(csrf_token)

    # Validate that the tokens are recognized as valid.
    assert await user_auth_validate_session_token(session_token) is True
    assert await user_auth_validate_csrf_token(csrf_token) is True

    # Log out the user.
    await user_auth_logout(session_token, csrf_token)

    # After logout, token validation should fail.
    with pytest.raises(HTTPException) as excinfo:
        await user_auth_validate_session_token(session_token)
    assert "Session token does not exist" in excinfo.value.description

    with pytest.raises(HTTPException) as excinfo:
        await user_auth_validate_csrf_token(csrf_token)
    assert "CSRF token does not exist" in excinfo.value.description


@pytest.mark.asyncio
async def test_user_auth_logout_invalid_tokens():
    """
    Test that providing invalid tokens to the logout function
    results in a 401 error.
    """
    # First register a user to have some valid tokens (unused here).
    await user_auth_register(
        email="logoutinvalid@domain.com",
        pwd="Password1!",
        first_name="Frank",
        last_name="Miller",
    )
    # Attempt logout with tokens that do not match any user.
    with pytest.raises(HTTPException) as excinfo:
        await user_auth_logout("invalid_session", "invalid_csrf")
    assert "Matching tokens do not exist" in excinfo.value.description
