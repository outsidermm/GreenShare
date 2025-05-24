from backend.data import admin_retrieve_user_id, items
import re
from backend.classes.item import Item
from difflib import SequenceMatcher


def title_matches(user_input: str, item_title: str, threshold: float = 0.7) -> bool:
    user_input = user_input.lower()
    item_title = item_title.lower()
    return (
        user_input in item_title or
        SequenceMatcher(None, user_input, item_title).ratio() >= threshold
    )


async def user_create_item(
    new_title: str,
    new_description: str,
    new_condition: str,
    new_location: str,
    new_images: list[str],
    session_token: str,
    csrf_token: str,
) -> None:
    """
    Creates a new item in the database.

    Args:
        new_title (str): Title of the item.
        new_description (str): Description of the item.
        new_condition (str): Condition of the item.
        new_location (str): Location of the item.
        new_user_id (int): ID of the user creating the item.
        new_images (list[str]): List of image URLs for the item.
        new_category (str): Category of the item.
        session_token (str): User's session token.
        csrf_token (str): User's CSRF token.
    """
    new_user_id = admin_retrieve_user_id(session_token, csrf_token)
    new_title = new_title.title()
    new_description = new_description.title()
    new_condition = new_condition.title()
    new_location = new_location.title()
    
    safe_title = re.escape(new_title)
    safe_description = re.escape(new_description)
    safe_condition = re.escape(new_condition)
    safe_location = re.escape(new_location)
    
    new_item = Item(
        title=safe_title,
        description=safe_description,
        condition=safe_condition,
        location=safe_location,
        user_id=new_user_id,
        images=new_images,
    )
    
    items[new_item.get_item_pk()] = new_item  # Store the item object by item ID
    