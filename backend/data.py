# In-memory storage for users
users = {}  # Dictionary to store user objects by their unique identifier (e.g., email)


def admin_retrieve_author_name(session_token: str, csrf_token: str) -> str:
    """
    Retrieves the full name of a user based on valid session and CSRF tokens.

    Args:
        session_token (str): Session token of the user.
        csrf_token (str): CSRF token of the user.

    Returns:
        str: Full name of the user if tokens are valid, otherwise None.
    """
    # Iterate through each user object in the users dictionary
    for _, user_obj in users.items():
        # Check if both session and CSRF tokens are valid for the user
        if user_obj.is_valid_session_token(
            session_token
        ) and user_obj.is_valid_csrf_token(csrf_token):
            # Return the user's full name if tokens match
            return f"{user_obj.get_first_name()} {user_obj.get_last_name()}"
    # Return None if no valid tokens are found
    return None
