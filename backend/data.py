from flask import abort
import requests
from werkzeug.datastructures import FileStorage

from backend.classes.user import User
from backend.classes.item import Item
from backend.classes.exchange_offer import ExchangeOffer
import os

# In-memory storage for users
users: dict[str, User] = (
    {}
)  # Dictionary to store user objects by their unique identifier (e.g., email)
items: dict[int, Item] = (
    {}
)  # Dictionary to store item objects by their unique identifier (e.g., item ID)
exchange_offers: dict[int, ExchangeOffer] = (
    {}
)  # Dictionary to store exchange offer objects by their unique identifier (e.g., offer ID)
IMGUR_CLIENT_ID = os.getenv("IMGUR_CLIENT_ID")


def admin_retrieve_user_id(session_token: str, csrf_token: str) -> int:
    """
    Retrieves the full name of a user based on valid session and CSRF tokens.

    Args:
        session_token (str): Session token of the user.
        csrf_token (str): CSRF token of the user.

    Returns:
        str: user ID if both tokens are valid, otherwise None.
    """
    # Iterate through each user object in the users dictionary
    for _, user_obj in users.items():
        # Check if both session and CSRF tokens are valid for the user
        if user_obj.is_valid_session_token(
            session_token
        ) and user_obj.is_valid_csrf_token(csrf_token):
            # Return the user's full name if tokens match
            return user_obj.get_user_pk()
    # Return None if no valid tokens are found
    abort(
        403, "Invalid credentials. Please log in again."
    )  # Raise an error if no valid user is found


async def image_upload(image: FileStorage) -> str:
    """
    Uploads an image file and returns its URL.

    Args:
        image (FileStorage): The image file to be uploaded.

    Returns:
        str: URL of the uploaded image.
    """
    headers = {"Authorization": f"Client-ID {IMGUR_CLIENT_ID}"}
    upload_response = requests.post(
        "https://api.imgur.com/3/image",
        headers=headers,
        files={"image": image.read()},
    )
    if upload_response.status_code == 200:
        return upload_response.json()["data"]["link"]
    else:
        abort(500, "Image upload failed. Please try again later.")
