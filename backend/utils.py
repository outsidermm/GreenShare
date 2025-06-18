# Utility functions for sanitising user inputs in the GreenShare backend.
# These functions help prevent security vulnerabilities like XSS attacks
# and ensure consistency in user-provided data such as emails.

from markupsafe import escape as markupsafe_escape


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
