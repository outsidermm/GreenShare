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


# -----------------------------------------------------------------------------
# Fixtures
# -----------------------------------------------------------------------------
@pytest.fixture(scope="module", autouse=True)
def app_context():
    with app.app_context():
        yield app


# -----------------------------------------------------------------------------
# Synchronous Validation Function Tests
# -----------------------------------------------------------------------------
def test_name_auth_valid():
    # Valid names should return True.
    assert name_auth("John") is True
    assert name_auth("Anne-Marie") is True
    assert name_auth("O'Connor") is True
    assert name_auth("Le Blanc") is True


def test_name_auth_invalid():
    # Names that do not meet the regex requirements should abort with a 400.
    with pytest.raises(HTTPException) as excinfo:
        name_auth("A")  # Too short to be valid.
    assert excinfo.value.code == 400


def test_pwd_auth_valid():
    # A password that meets the complexity and length requirements.
    assert pwd_auth("Password1!") is True
    assert pwd_auth("Strong&Password9") is True
    assert pwd_auth("Val234id1$") is True


def test_pwd_auth_invalid():
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
    # A valid email should pass validation.
    assert email_auth("user@example.com") is True
    assert email_auth("user@sub.domain.com") is True
    assert email_auth("user@domain.co.uk") is True
    assert email_auth("r_ianni@student.kings.edu.au") is True


def test_email_auth_invalid():
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
