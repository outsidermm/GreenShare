from backend.classes.user import User
from flask import abort
import re
from backend.data import users


def name_auth(name: str) -> bool:
    """
    Validates a name to ensure it meets length and character requirements.

    Args:
        name (str): Name to validate.

    Returns:
        bool: True if the name is valid.

    Raises:
        400 Error: If name does not meet required format.
    """
    # Regular expression for basic name validation (no Unicode characters).
    name_pattern = r"^[A-Za-zÀ-ÖØ-öø-ÿ'-.][A-Za-zÀ-ÖØ-öø-ÿ'-. ]{1,49}$"

    # Check if name matches the pattern and is within length limits.
    if re.match(name_pattern, name):
        return True
    abort(
        400,
        description="Name must be 2 to 50 characters long and can only include letters, spaces, hyphens, apostrophes, and periods",
    )


def pwd_auth(pwd: str) -> bool:
    """
    Validates a password to ensure it meets complexity and length requirements.

    Args:
        pwd (str): Password to validate.

    Returns:
        bool: True if the password is valid.

    Raises:
        400 Error: If password does not meet required format.
    """
    # Regular expression for strong password validation.
    pwd_pattern = r"^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,32}$"

    if re.match(pwd_pattern, pwd):
        return True
    abort(
        400,
        description="Password must contain one digit from 1 to 9, one lowercase letter, one uppercase letter, one special character, no space, and it must be 8-32 characters long.",
    )


def email_auth(email: str) -> bool:
    """
    Validates an email to ensure it meets format and length requirements.

    Args:
        email (str): Email to validate.

    Returns:
        bool: True if the email is valid.

    Raises:
        400 Error: If email does not meet required format.
    """
    # Regular expression for basic email validation.
    email_pattern = r"^[0-9a-z]+([0-9a-z]*[-._+])*[0-9a-z]+@[0-9a-z]+([-.][0-9a-z]+)*([0-9a-z]*[.])[a-z]{2,8}$"

    if re.match(email_pattern, email) and 3 <= len(email) <= 320:
        return True
    abort(
        400,
        description="Email must start with letters or numbers, include @ and a valid domain, have a 2-8 character extension, and be 3-320 characters long.",
    )


async def user_auth_register(
    email: str, pwd: str, first_name: str, last_name: str
) -> str:
    """
    Registers a new user by validating credentials and creating a user instance.

    Args:
        email (str): User's email.
        pwd (str): User's password.
        first_name (str): User's first name.
        last_name (str): User's last name.

    Returns:
        tuple: New session token and CSRF token for the user.

    Raises:
        409 Error: If the email already exists in the user database.
    """
    email = email.lower()  # Normalise the email to lowercase
    first_name = (
        first_name.capitalize()
    )  # Normalise the first name to start with a capital letter
    last_name = (
        last_name.capitalize()
    )  # Normalise the last name to start with a capital letter

    email_auth(email)
    name_auth(first_name)
    name_auth(last_name)
    pwd_auth(pwd)

    # Sanitise and secure input data
    safe_email = re.escape(email)
    safe_first_name = re.escape(first_name)
    safe_last_name = re.escape(last_name)
    safe_pwd = re.escape(pwd)

    if safe_email in users:
        abort(409, description="Email already exists")

    new_user = User(safe_email, safe_first_name, safe_last_name, safe_pwd)
    users[safe_email] = new_user  # Store the user object by email

    return new_user.get_session_token(), new_user.get_csrf_token()


async def user_auth_login(email: str, pwd_input: str) -> str:
    """
    Authenticates an existing user with email and password, generating new session tokens.

    Args:
        email (str): User's email.
        pwd_input (str): User's password input for validation.

    Returns:
        tuple: New session token and CSRF token for the user.

    Raises:
        401 Error: If the email does not exist or password is incorrect.
    """
    email = email.lower()  # Normalise the email to lowercase

    email_auth(email)
    pwd_auth(pwd_input)

    safe_email = re.escape(email)
    safe_pwd = re.escape(pwd_input)

    if safe_email not in users:
        potential_user = User.from_email(safe_email)
        if not potential_user:
            abort(401, description="Email does not exist")
        else:
            users[safe_email] = potential_user

    user: User = users[safe_email]

    if not user.verify_pwd(safe_pwd):
        abort(401, description="Invalid password")

    # Generate new session and CSRF tokens and update the user's token attributes
    user.set_session_token(user.generate_session_token())
    user.set_csrf_token(user.generate_csrf_token())

    return user.get_session_token(), user.get_csrf_token()


async def user_auth_logout(session_token: str, csrf_token: str) -> None:
    """
    Logs out a user by revoking session and CSRF tokens if they are valid.

    Args:
        session_token (str): User's session token.
        csrf_token (str): User's CSRF token.

    Raises:
        401 Error: If tokens do not match any existing session.
    """
    for user in users.values():
        # Check if both session and CSRF tokens are valid
        if user.is_valid_session_token(session_token) and user.is_valid_csrf_token(
            csrf_token
        ):
            user.revoke_csrf_token()
            user.revoke_session_token()
            return  # Exit function after revoking tokens

    abort(401, description="Matching tokens do not exist")


async def user_auth_validate_session_token(session_token: str) -> bool:
    """
    Validates if the provided session token matches an active user session.

    Args:
        session_token (str): Session token to validate.

    Returns:
        bool: True if the session token is valid.

    Raises:
        401 Error: If session token does not match any active session.
    """
    for user in users.values():
        if user.is_valid_session_token(session_token):
            return True

    abort(401, description="Session token does not exist")


async def user_auth_validate_csrf_token(csrf_token: str) -> bool:
    """
    Validates if the provided CSRF token matches an active user session.

    Args:
        csrf_token (str): CSRF token to validate.

    Returns:
        bool: True if the CSRF token is valid.

    Raises:
        401 Error: If CSRF token does not match any active session.
    """

    for user in users.values():
        if user.is_valid_csrf_token(csrf_token):
            return True

    abort(401, description="CSRF token does not exist")
