from backend.data import admin_retrieve_user_id, items
import re
from backend.classes.item import Item
from difflib import SequenceMatcher
from flask import abort


def title_matches(user_input: str, item_title: str, threshold: float = 0.7) -> bool:
    user_input = user_input.lower()
    item_title = item_title.lower()
    return (
        user_input in item_title
        or SequenceMatcher(None, user_input, item_title).ratio() >= threshold
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
    new_category = "Essentials"
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

    if len(new_title) > 100 or len(new_title) < 3:
        abort(400, "Title must be between 3 and 100 characters.")

    if len(new_description) > 1000 or len(new_description) < 10:
        abort(400, "Description must be between 10 and 1000 characters.")

    if new_condition not in [
        "New",
        "Like-New",
        "used-Good",
        "Used-Fair",
        "Poor",
    ]:
        abort(
            400, "Condition must be one of: New, Like New, Good, Fair, Poor."
        )

    if new_type not in ["Free", "Exchange"]:
        abort(400, "Type must be either 'Free' or 'Exchange'.")

    if new_category not in [
        "Essentials",
        "Living",
        "Tools-Tech",
        "Style-Expression",
        "Leisure-Learning",
    ]:
        abort(
            400,
            "Category must be one of: essentials, living, tools-tech, style-expression, leisure-learning.",
        )

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


async def user_get_browse_items(
    category_filter: str = None,
    condition_filter: str = None,
    location_filter: str = None,
    type_filter: str = None,
    title_filter: str = None,
    item_id: str = None,
    user_id: str = None,
) -> dict[int, Item]:
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
    filtered_items : dict[int, Item]= {}
    for item_key, item in items.items():
        if item.get_status() == "Available":
            filtered_items[item_key] = item

    if title_filter is not None:
        title_filter = title_filter.title()
        if len(title_filter) < 3 or len(title_filter) > 100:
            abort(400, "Title filter must be between 3 and 100 characters.")
        safe_title_filter = re.escape(title_filter)
        for item_key, item in filtered_items.items():
            if title_matches(safe_title_filter, item.get_title()):
                filtered_items[item.get_item_pk()] = item.item_data()

    if category_filter is not None:
        category_filter = category_filter.title()
        if category_filter not in [
            "Essentials",
            "Living",
            "Tools-Tech",
            "Style-Expression",
            "Leisure-Learning",
        ]:
            abort(
                400,
                "Category must be one of: Essentials, Living, Tools & Tech, Style & Expression, Leisure & Learning.",
            )
        safe_category_filter = re.escape(category_filter)
        for item_key, item in filtered_items.items():
            if item.get_category() != safe_category_filter:
                del filtered_items[item_key]

    if condition_filter is not None:
        condition_filter = condition_filter.title()
        if condition_filter not in [
            "New",
            "Like New",
            "Very Good",
            "Good",
            "Fair",
            "Poor",
        ]:
            abort(
                400,
                "Condition must be one of: New, Like New, Very Good, Good, Fair, Poor.",
            )
        safe_condition_filter = re.escape(condition_filter)
        for item_key, item in filtered_items.items():
            if item.get_condition() != safe_condition_filter:
                del filtered_items[item_key]

    if location_filter is not None:
        location_filter = location_filter.title()
        if len(location_filter) < 3 or len(location_filter) > 100:
            abort(400, "Location filter must be between 3 and 100 characters.")
        safe_location_filter = re.escape(location_filter)
        for item_key, item in filtered_items.items():
            if item.get_location() != safe_location_filter:
                del filtered_items[item_key]

    if type_filter is not None:
        type_filter = type_filter.title()
        if type_filter not in ["Free", "Exchange"]:
            abort(400, "Type must be either 'Free' or 'Exchange'.")
        safe_type_filter = re.escape(type_filter)
        for item_key, item in filtered_items.items():
            if item.get_type() != safe_type_filter:
                del filtered_items[item_key]

    if item_id is not None:
        if not item_id.isdigit() or int(item_id) <= 0:
            abort(400, "Item ID must be a positive integer.")
        for item_key, item in filtered_items.items():
            if item.get_item_pk() != int(item_id):
                del filtered_items[item_key]
                
    if user_id is not None:
        if not user_id.isdigit() or int(user_id) <= 0:
            abort(400, "User ID must be a positive integer.")
        for item_key, item in filtered_items.items():
            if item.get_user_id() != int(user_id):
                del filtered_items[item_key]
    return filtered_items
