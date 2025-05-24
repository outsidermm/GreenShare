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
    new_type: str,
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
        session_token (str): User's session token.
        csrf_token (str): User's CSRF token.
    """
    new_user_id = admin_retrieve_user_id(session_token, csrf_token)
    new_category = "Uncategorized" 
    new_title = new_title.title()
    new_description = new_description.title()
    new_condition = new_condition.title()
    new_location = new_location.title()
    new_type = new_type.title()
    
    safe_title = re.escape(new_title)
    safe_description = re.escape(new_description)
    safe_condition = re.escape(new_condition)
    safe_location = re.escape(new_location)
    safe_type = re.escape(new_type)
    
    try:
        new_item = Item(
            new_title=safe_title,
            new_description=safe_description,
            new_condition=safe_condition,
            new_location=safe_location,
            new_user_id=new_user_id,
            new_type=safe_type,
            new_category=new_category,
            new_images=new_images,
        )
        items[new_item.get_item_pk()] = new_item  # Store the item object by item ID
    except Exception as e:
        raise Exception(f"Failed to create item: {str(e)}")
    
async def user_get_browse_items(category_filter: str, condition_filter:str , location_filter:str , type_filter:str, title_filter:str, item_id:str, user_id:str) -> dict[dict]:
    """
    Retrieves filtered items from the database.
    
    Args:
        category_filter (str): Filter items by category.
        condition_filter (str): Filter items by condition.
        location_filter (str): Filter items by location.
        type_filter (str): Filter items by type.
        title_filter (str): Filter items by title.
        item_id (str): Retrieve a single item by ID.
        user_id (str): Filter items by user ID.
        
    Returns:
        dict[dict]: Dictionary of all item data in dictionary format.
    """
    
    safe_category_filter = re.escape(category_filter.title()) if category_filter else None
    safe_condition_filter = re.escape(condition_filter.title()) if condition_filter else None
    safe_location_filter = re.escape(location_filter.title()) if location_filter else None
    safe_type_filter = re.escape(type_filter.title()) if type_filter else None
    safe_title_filter = re.escape(title_filter.title()) if title_filter else None
    
    filtered_items = {}
    
    for item in items.values():
        if (
            (safe_category_filter is None or item.get_category() == safe_category_filter) and
            (safe_condition_filter is None or item.get_condition() == safe_condition_filter) and
            (safe_location_filter is None or item.get_location() == safe_location_filter) and
            (safe_type_filter is None or item.get_type() == safe_type_filter) and
            (safe_title_filter is None or title_matches(safe_title_filter, item.get_title())) and
            (item.get_status() == "Available") and  # Only include available items
            (user_id is None or item.get_user_id() == user_id) and  # Filter by user ID if provided
            (item_id is None or item.get_item_pk() == item_id)  # Include item if item_id matches
        ):
            filtered_items[item.get_item_pk()] = item.item_data()
    
    return filtered_items
