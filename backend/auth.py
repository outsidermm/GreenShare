"""
Authentication utility functions for user registration, login, logout, and token validation.
"""

import os
from email.message import EmailMessage
import re
import smtplib
import ssl
from typing import Tuple

from flask import abort
from itsdangerous import URLSafeTimedSerializer

from backend.classes.user import User
from backend.data import users
from backend.utils import sanitize_input, sanitize_email
from backend.config import app


def generate_reset_token(email:str) -> str:
    serialiser = URLSafeTimedSerializer(app.config["SECRET_KEY"])
    return serialiser.dumps(email, salt="reset-password-salt")

def verify_reset_token(token: str, expiration=300) -> str:
    serialiser = URLSafeTimedSerializer(app.config["SECRET_KEY"])
    try:
        email = serialiser.loads(token, salt="reset-password-salt", max_age=expiration)
        return email
    except Exception as e:
        abort(400, description=f"Invalid or expired token: {str(e)}")

def name_auth(name: str, err_prefix: str = "User") -> bool:
    """
    Validates a name to ensure it meets length and character requirements.

    Args:
        name (str): Name to validate.
        err_prefix (str): Prefix for error message.

    Returns:
        bool: True if the name is valid.

    Raises:
        400 Error: If name does not meet required format.
    """
    # Regular expression for basic name validation (includes accented characters, apostrophes, hyphens, periods, and spaces).
    name_pattern: str = r"^[A-Za-zÀ-ÖØ-öø-ÿ'-.][A-Za-zÀ-ÖØ-öø-ÿ'-. ]{1,49}$"

    # Check if name matches the pattern and is within length limits.
    if re.match(name_pattern, name):
        return True
    # Abort with 400 error if validation fails
    abort(
        400,
        description=err_prefix
        + " name must be 2 to 50 characters long and can only include letters, spaces, hyphens, apostrophes, and periods",
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
    # Regular expression for strong password validation:
    # at least one digit, one lowercase, one uppercase, one special character, no spaces, length 8-32
    pwd_pattern: str = r"^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,32}$"

    if re.match(pwd_pattern, pwd):
        return True
    # Abort with 400 error if validation fails
    abort(
        400,
        description="Password must be 8-32 characters, include a digit, lowercase and uppercase letter, special character, and no spaces.",
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
    email_pattern: str = (
        r"^[0-9a-z]+([0-9a-z]*[-._+])*[0-9a-z]+@[0-9a-z]+([-.][0-9a-z]+)*([0-9a-z]*[.])[a-z]{2,8}$"
    )

    if re.match(email_pattern, email) and 3 <= len(email) <= 320:
        return True
    # Abort with 400 error if validation fails
    abort(
        400,
        description="Email must start with letters or numbers, include @ and a valid domain, have a 2-8 character extension, and be 3-320 characters long.",
    )


async def user_auth_register(
    email: str, pwd: str, first_name: str, last_name: str
) -> Tuple[str, str]:
    """
    Registers a new user by validating credentials and creating a user instance.

    Args:
        email (str): User's email.
        pwd (str): User's password.
        first_name (str): User's first name.
        last_name (str): User's last name.

    Returns:
        Tuple[str, str]: New session token and CSRF token for the user.

    Raises:
        409 Error: If the email already exists in the user database.
    """
    # Normalize and validate inputs
    email = email.lower()  # Normalise the email to lowercase
    first_name = (
        first_name.capitalize()
    )  # Normalise the first name to start with a capital letter
    last_name = (
        last_name.capitalize()
    )  # Normalise the last name to start with a capital letter

    # Validate each input
    email_auth(email)
    pwd_auth(pwd)
    name_auth(first_name, "First")
    name_auth(last_name, "Last")

    # Properly sanitize input data to prevent XSS
    safe_email: str = sanitize_email(email)  # Emails don't need HTML escaping
    safe_first_name: str = sanitize_input(first_name)  # HTML escape for display
    safe_last_name: str = sanitize_input(last_name)  # HTML escape for display
    # Passwords should not be escaped as they're hashed, not displayed
    safe_pwd: str = pwd

    # Check if user exists using sanitized email
    if safe_email in users:
        abort(409, description="Email already exists")

    # Create new user with sanitized data
    new_user: User = User(safe_email, safe_first_name, safe_last_name, safe_pwd)
    users[safe_email] = new_user  # Store the user object by email

    # Return session and csrf tokens for the new user
    return new_user.get_session_token(), new_user.get_csrf_token()


async def user_auth_login(email: str, pwd_input: str) -> Tuple[str, str]:
    """
    Authenticates an existing user with email and password, generating new session tokens.

    Args:
        email (str): User's email.
        pwd_input (str): User's password input for validation.

    Returns:
        Tuple[str, str]: New session token and CSRF token for the user.

    Raises:
        401 Error: If the email does not exist or password is incorrect.
    """
    # Normalize and validate inputs
    email = email.lower()  # Normalise the email to lowercase

    email_auth(email)
    pwd_auth(pwd_input)

    # Sanitize email (no HTML escaping needed for emails)
    safe_email: str = sanitize_email(email)
    # Passwords are hashed, not displayed, so no escaping needed
    safe_pwd: str = pwd_input

    # Check if user exists
    if safe_email not in users:
        abort(401, description="Email does not exist")

    user: User = users[safe_email]

    # Verify password correctness
    if not user.verify_pwd(safe_pwd):
        abort(401, description="Invalid password")

    # Generate new session and CSRF tokens and update the user's token attributes
    user.set_session_token(user.generate_session_token())
    user.set_csrf_token(user.generate_csrf_token())

    # Return updated session and csrf tokens
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
    # Iterate through all users to find matching session and CSRF tokens
    for user in users.values():
        # Check if both session and CSRF tokens are valid
        if user.is_valid_session_token(session_token) and user.is_valid_csrf_token(
            csrf_token
        ):
            # Revoke tokens to log out the user
            user.revoke_csrf_token()
            user.revoke_session_token()
            return  # Exit function after revoking tokens

    # Abort if no matching tokens found
    abort(401, description="Matching tokens do not exist")


async def user_auth_validate_session_token(session_token: str) -> bool:
    """
    Validates if the provided session token matches an active user session.

    Args:
        session_token (str): Session token to validate.

    Returns:
        bool: True if the session token is valid, False otherwise.

    Raises:
        401 Error: If session token does not match any active session.
    """
    # Check all users for a valid session token match
    for user in users.values():
        if user.is_valid_session_token(session_token):
            return True

    # Return False if no valid session token found
    return False


async def user_auth_validate_csrf_token(csrf_token: str) -> bool:
    """
    Validates if the provided CSRF token matches an active user session.

    Args:
        csrf_token (str): CSRF token to validate.

    Returns:
        bool: True if the CSRF token is valid, False otherwise.

    Raises:
        401 Error: If CSRF token does not match any active session.
    """
    # Check all users for a valid CSRF token match
    for user in users.values():
        if user.is_valid_csrf_token(csrf_token):
            return True

    # Return False if no valid CSRF token found
    return False


def validate_user_id(user_id: int | None = None) -> None:
    """
    Validates the user ID to ensure it is a positive integer.

    Args:
        user_id (int | None): User ID to validate. Defaults to None.

    Raises:
        403 Error: If user ID is not a positive integer.
    """
    # Check if user_id is None, not an int, or less than or equal to zero
    if user_id is None or not isinstance(user_id, int) or user_id <= 0:
        # Abort with 403 error indicating invalid credentials
        abort(
            403, "Invalid credentials. Please log in again."
        )  # Raise an error if no valid user is found

async def user_auth_forgot_pwd(email: str) -> None:
    """
    Initiates the password reset process for a user by validating their email.

    Args:
        email (str): User's email to initiate password reset.

    Raises:
        400 Error: If the email does not exist in the user database.
    """
    # Normalize and validate email
    safe_email: str = sanitize_email(email)
    email_auth(safe_email)

    # Sanitize email (no HTML escaping needed for emails)

    # Check if user exists
    if safe_email not in users:
        abort(400, description="Email does not exist")
    
    token = generate_reset_token(safe_email)
    email_sender = "greenshare1234@gmail.com"
    email_subject = "GreenShare Password Reset"
    email_password = os.environ.get("EMAIL_PASSWORD")
    email_body = f"""
    Dear {users[safe_email].get_first_name()} {users[safe_email].get_last_name()},
    <br><br>
    You have requested a password reset for your GreenShare account.<br>
    Please click the link below to reset your password:<br>
    <a href="{os.environ.get("NEXT_PUBLIC_URL")}/reset_password?token={token}">Reset Password</a><br><br>
    If you did not request this, please ignore this email.<br><br>
    Thank you,<br>
    GreenShare Team
    """
    
    email = EmailMessage()
    email["From"] = email_sender
    email["To"] = safe_email
    email["Subject"] = email_subject
    email.set_content(email_body, subtype="html")
    
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
        server.login(email_sender, email_password)
        server.sendmail(email_sender, safe_email, email.as_string())
    
    
async def user_auth_reset_pwd(token: str, new_pwd: str) -> None:
    """
    Resets the user's password using a valid reset token.

    Args:
        token (str): Reset token for password reset.
        new_pwd (str): New password to set.

    Raises:
        400 Error: If the token is invalid or expired.
    """
    # Verify the reset token and get the associated email
    email = verify_reset_token(token)

    # Validate the new password
    pwd_auth(new_pwd)

    # Get the user by email and update their password
    user = users.get(email)
    if not user:
        abort(400, description="Invalid or expired token")

    user.set_password(new_pwd)
