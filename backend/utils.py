# Utility functions for sanitising user inputs in the GreenShare backend.
# These functions help prevent security vulnerabilities like XSS attacks
# and ensure consistency in user-provided data such as emails.

from markupsafe import escape as markupsafe_escape
import html


# Sanitise general user input to prevent XSS attacks by escaping HTML characters.
def sanitize_input(user_input: str) -> str:
    """
    Properly sanitise user input to prevent XSS attacks.
    Uses MarkupSafe's escape function which converts dangerous characters to HTML entities.

    Args:
        user_input (str): Raw user input

    Returns:
        str: Sanitized input safe for HTML rendering
    """
    if user_input is None:
        return None
    return str(markupsafe_escape(user_input))


# Unsanitise output for display purposes by converting HTML entities back to normal characters.
def unsanitize_output(sanitized_input: str) -> str:
    """
    Converts HTML entities back to normal characters for display purposes.
    Use this when retrieving sanitized data from the database for display.

    Args:
        sanitized_input (str): HTML-escaped input from database

    Returns:
        str: Unescaped text safe for display
    """
    if sanitized_input is None:
        return None
    return html.unescape(sanitized_input)


# Sanitise email input specific to GreenShare by normalizing case and trimming whitespace.
def sanitize_email(email: str) -> str:
    """
    Sanitize email input while preserving valid email characters.
    Emails don't need HTML escaping but should be lowercased for consistency.

    Args:
        email (str): Raw email input

    Returns:
        str: Sanitized and lowercased email
    """
    if email is None:
        return None
    # Emails don't need HTML escaping, just normalize to lowercase
    return email.lower().strip()
