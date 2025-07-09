import pytest
from werkzeug.exceptions import HTTPException

# Import the functions under test from your auth.py
from backend.auth import (
    name_auth,
    pwd_auth,
    email_auth,
)

# Import the global users dictionary so we can reset it between tests.
from backend.config import app


# Fixtures
@pytest.fixture(scope="module", autouse=True)
def app_context():
    with app.app_context():
        yield app


# Synchronous Validation Function Tests
def test_name_auth_valid():
    """
    Ensure that valid names pass the name_auth validation function.

    These names:
        - Include standard names
        - Include hyphenated and apostrophised surnames
        - Include names with spaces

    Expected:
        - Function returns True without raising an error
    """
    # Valid names should return True.
    assert name_auth("John") is True
    assert name_auth("Anne-Marie") is True
    assert name_auth("O'Connor") is True
    assert name_auth("Le Blanc") is True


def test_name_auth_invalid():
    """
    Verify that invalid names fail the name_auth validation function.

    This test uses a name that is too short to be valid according to the regex.

    Expected:
        - Function raises HTTPException with status code 400
    """
    # Names that do not meet the regex requirements should abort with a 400.
    with pytest.raises(HTTPException) as excinfo:
        name_auth("A")  # Too short to be valid.
    assert excinfo.value.code == 400


def test_pwd_auth_valid():
    """
    Confirm that passwords meeting complexity and length requirements pass validation.

    Passwords tested include:
        - Containing uppercase, lowercase, digits, and special characters
        - Various lengths above minimum requirement

    Expected:
        - Function returns True without raising an error
    """
    # A password that meets the complexity and length requirements.
    assert pwd_auth("Password1!") is True
    assert pwd_auth("Strong&Password9") is True
    assert pwd_auth("Val234id1$") is True


def test_pwd_auth_invalid():
    """
    Ensure that weak or improperly formatted passwords fail pwd_auth validation.

    Passwords tested include:
        - Too short or simple
        - Missing digits
        - Missing special characters

    Expected:
        - Function raises HTTPException with status code 400 for each invalid password
    """
    # A weak password should result in a 400 abort.
    with pytest.raises(HTTPException) as excinfo:
        pwd_auth("weak")  # Does not meet complexity requirements.
    assert excinfo.value.code == 400

    with pytest.raises(HTTPException) as excinfo:
        pwd_auth("NoDigit!")  # Does not meet complexity requirements.
    assert excinfo.value.code == 400

    with pytest.raises(HTTPException) as excinfo:
        pwd_auth("NoSpecialChar1")
    assert excinfo.value.code == 400


def test_email_auth_valid():
    """
    Verify that valid email addresses pass the email_auth validation function.

    Emails tested include:
        - Standard email formats
        - Subdomains
        - Country-code top-level domains
        - University email addresses

    Expected:
        - Function returns True without raising an error
    """
    # A valid email should pass validation.
    assert email_auth("user@example.com") is True
    assert email_auth("user@sub.domain.com") is True
    assert email_auth("user@domain.co.uk") is True
    assert email_auth("r_ianni@student.kings.edu.au") is True


def test_email_auth_invalid():
    """
    Confirm that invalid email addresses fail the email_auth validation function.

    Emails tested include:
        - Missing '@' symbol
        - Missing domain part
        - General malformed email strings

    Expected:
        - Function raises HTTPException with status code 400 for each invalid email
    """
    # An email that does not match the regex should abort.
    with pytest.raises(HTTPException) as excinfo:
        email_auth("not-an-email")
    assert excinfo.value.code == 400

    with pytest.raises(HTTPException) as excinfo:
        email_auth("missingatsign.com")
    assert excinfo.value.code == 400

    with pytest.raises(HTTPException) as excinfo:
        email_auth("no.domain@")
    assert excinfo.value.code == 400
