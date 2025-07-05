import pytest
from werkzeug.exceptions import HTTPException

# Import the functions under test from your auth.py
from backend.auth import (
    generate_reset_token,
    user_auth_register,
    user_auth_login,
    user_auth_logout,
    user_auth_reset_pwd,
    user_auth_validate_session_token,
    user_auth_validate_csrf_token,
    verify_reset_token,
)

# Import the global users dictionary so we can reset it between tests.
from backend.data import users, items, exchange_offers
from backend.config import app, db
from backend.models import ExchangeOfferDB, UserDB, ItemDB, ItemImageDB, OfferedItemDB
from backend.utils import sanitize_email, sanitize_input


# -----------------------------------------------------------------------------
# Fixtures
# -----------------------------------------------------------------------------
@pytest.fixture(autouse=True)
def clear_users():
    """
    Clears the global users dictionary and related data before each test to ensure test isolation.
    This prevents state leakage between tests, ensuring each test runs with a clean slate.
    """
    users.clear()
    items.clear()
    exchange_offers.clear()
    db.session.delete(OfferedItemDB)
    db.session.delete(ExchangeOfferDB)
    db.session.delete(ItemImageDB)
    db.session.delete(ItemDB)
    db.session.delete(UserDB)
    db.session.commit()


@pytest.fixture(scope="module", autouse=True)
def app_context():
    """
    Provides the Flask application context for the duration of the test module.
    This is necessary for tests that rely on Flask's app context, such as database operations.
    """
    with app.app_context():
        yield app


# -----------------------------------------------------------------------------
# Asynchronous Authentication Function Tests
# -----------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_user_auth_register_success():
    """
    Ensure that a user can register successfully.
    Validates that both session and CSRF tokens are returned as strings and that the user is added to the global registry.

    Expected:
        - Tokens are strings
        - Email is normalised and stored
    """
    email_input = "test@domain.com"
    session_token, csrf_token = await user_auth_register(
        email=email_input, pwd="Password1!", first_name="Alice", last_name="Smith"
    )
    # Tokens should be returned as strings.
    assert isinstance(session_token, str)
    assert isinstance(csrf_token, str)
    # The email is normalized to lowercase and escaped.
    safe_email = sanitize_email(email_input.lower())
    assert safe_email in users


@pytest.mark.asyncio
async def test_user_auth_register_duplicate():
    """
    Verify that attempting to register the same email twice raises a 409 conflict error.
    This prevents duplicate user accounts with the same email.

    Expected:
        - First registration succeeds
        - Second registration raises HTTPException with conflict message
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
    Test that registration normalises the email to lowercase and sanitises input,
    and that first and last names are capitalised as expected.

    Also verifies that logging in with a mixed-case email still works and
    generates new tokens.

    Expected:
        - Email stored in normalised form
        - Login with mixed-case email succeeds
        - New tokens differ from registration tokens
    """
    session_token, csrf_token = await user_auth_register(
        email="TEST@DOMAIN.COM", pwd="Password1!", first_name="alice", last_name="smith"
    )
    safe_email = sanitize_input("test@domain.com")
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
    Validate that a user can log in successfully after registration,
    receiving new session and CSRF tokens.

    Expected:
        - Login returns session and CSRF tokens as strings
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
    Confirm that logging in with an incorrect password raises a 401 unauthorized error.

    Expected:
        - HTTPException with 'Invalid password' message is raised
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
    Verify that attempting to log in with an unregistered email raises a 401 error.

    Expected:
        - HTTPException with 'Email does not exist' message is raised
    """
    with pytest.raises(HTTPException) as excinfo:
        await user_auth_login(email="nonexistent@domain.com", pwd_input="Password1!")
    assert "Email does not exist" in excinfo.value.description


@pytest.mark.asyncio
async def test_user_auth_logout_and_token_validation():
    """
    Test that after a user logs out:
      - The session and CSRF tokens become invalid.
      - Attempts to validate these tokens return False.

    Expected:
        - Tokens valid before logout
        - Tokens invalid after logout
    """
    session_token, csrf_token = await user_auth_register(
        email="logout@domain.com", pwd="Password1!", first_name="Eva", last_name="Green"
    )

    session_token = sanitize_input(session_token)
    csrf_token = sanitize_input(csrf_token)

    # Validate that the tokens are recognised as valid.
    assert await user_auth_validate_session_token(session_token) is True
    assert await user_auth_validate_csrf_token(csrf_token) is True

    # Log out the user.
    await user_auth_logout(session_token, csrf_token)

    # After logout, token validation should fail.
    assert await user_auth_validate_session_token(session_token) is False
    assert await user_auth_validate_csrf_token(csrf_token) is False


@pytest.mark.asyncio
async def test_user_auth_logout_invalid_tokens():
    """
    Ensure that providing invalid session and CSRF tokens to the logout function
    raises a 401 error indicating no matching tokens exist.

    Expected:
        - HTTPException with 'Matching tokens do not exist' message is raised
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

@pytest.mark.asyncio
async def test_user_password_reset_token():
    """
    Verify that a user can successfully reset their password using a valid reset token.

    Steps:
        - Register a user
        - Generate a reset token for the user's email
        - Verify the token returns the correct email
        - Reset the password using the token
        - Confirm the new password is accepted

    Expected:
        - Reset token correctly generated and verified
        - Password updated successfully
    """
    await user_auth_register(
        email="pwdreset@domain.com",
        pwd="Password1!",
        first_name="Frank",
        last_name="Miller",
    )
    
    reset_token = generate_reset_token("pwdreset@domain.com".lower().strip())
    email = verify_reset_token(reset_token)
    
    assert email == "pwdreset@domain.com"
    
    await user_auth_reset_pwd(reset_token, "NewPassword1!")
    assert users[email].verify_pwd("NewPassword1!") == True


@pytest.mark.asyncio
async def test_user_password_reset_invalid_token():
    """
    Confirm that verifying an invalid or expired reset token raises an error.

    Expected:
        - HTTPException with 'Invalid or expired token' message is raised
    """
    with pytest.raises(HTTPException) as excinfo:
        verify_reset_token("invalid_token")
    assert "Invalid or expired token" in excinfo.value.description