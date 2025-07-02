"""
This module provides data handling functionality for the GreenShare backend.
It manages in-memory data storage for users, items, and exchange offers, and includes
utilities for image uploading and item categorisation using external APIs.
"""

import os
from flask import abort
import requests
from werkzeug.datastructures import FileStorage
from google import genai
from google.genai import types
from backend.classes.user import User
from backend.classes.item import Item
from backend.classes.exchange_offer import ExchangeOffer

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

# Load environment variables for external service credentials
IMGUR_CLIENT_ID: str | None = os.getenv("IMGUR_CLIENT_ID")
GENAI_API_KEY: str | None = os.getenv("GENAI_API_KEY")
PLACES_API_KEY: str | None = os.getenv("PLACES_API_KEY")
EMAIL_PASSWORD: str | None = os.getenv("EMAIL_PASSWORD")
NEXT_PUBLIC_URL: str | None = os.getenv("NEXT_PUBLIC_URL")


def admin_retrieve_user_id(session_token: str, csrf_token: str) -> int | None:
    """
    Retrieves the user ID of a user based on valid session and CSRF tokens.

    Args:
        session_token (str): Session token of the user.
        csrf_token (str): CSRF token of the user.

    Returns:
        int | None: User ID if both tokens are valid, otherwise None.
    """
    # Iterate through each user object in the users dictionary
    for _, user_obj in users.items():
        # Check if both session and CSRF tokens are valid for the user
        if user_obj.is_valid_session_token(
            session_token
        ) and user_obj.is_valid_csrf_token(csrf_token):
            # Return the user's primary key (user ID) if tokens match
            return user_obj.get_user_pk()
    # Return None if no valid tokens are found
    return None


async def image_upload(image: FileStorage) -> str:
    """
    Uploads an image file to Imgur and returns its URL.

    Args:
        image (FileStorage): The image file to be uploaded.

    Returns:
        str: URL of the uploaded image.

    Raises:
        werkzeug.exceptions.InternalServerError: If image upload fails.
    """
    # Prepare authorization header with Imgur client ID
    headers: dict[str, str] = {"Authorization": f"Client-ID {IMGUR_CLIENT_ID}"}
    # Make POST request to Imgur API to upload the image
    upload_response: requests.Response = requests.post(
        "https://api.imgur.com/3/image",
        headers=headers,
        files={"image": image.read()},
        timeout=10,
    )
    # Check if the upload was successful
    if upload_response.status_code == 200:
        # Return the direct link to the uploaded image
        return upload_response.json()["data"]["link"]
    abort(500, "Image upload failed. Please try again later.")


async def item_categorisation(title: str, description: str) -> str:
    """
    Classifies an item into a predefined category using Gemini model.

    Args:
        title (str): Title of the item.
        description (str): Description of the item.

    Returns:
        str: One of the predefined categories in lowercase:
             'essentials', 'living', 'tools-tech', 'style-expression', or 'leisure-learning'.

    Raises:
        Exception: If the Gemini API call fails or returns an unexpected result.
    """
    # Initialize Gemini client with API key
    client: genai.Client = genai.Client(api_key=GENAI_API_KEY)
    # Generate content classification using Gemini model
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        config=types.GenerateContentConfig(
            system_instruction=(
                "You are a product category classifier. "
                "Only respond with one of the following categories: essentials, living, tools-tech, style-expression, leisure-learning."
            )
        ),
        contents=(
            f"Classify the following item into one of the categories: essentials, living, tools-tech, style-expression, leisure-learning. "
            f"Title: {title} Description: {description} Only respond with the category name."
        ),
    )
    # Return the category name in lowercase without extra whitespace
    return response.text.strip().lower()
