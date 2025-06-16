from backend.data import admin_retrieve_user_id, items
from backend.models import ItemDB
from sqlalchemy import select, func, desc
from backend.config import db
from backend.classes.item import Item
from difflib import SequenceMatcher
from flask import abort
from backend.utils import sanitize_input


def validate_item_id(item_id: str) -> int:
    if not item_id.isdigit() or int(item_id) <= 0:
        abort(400, "Item ID must be a positive integer.")
    item_id = int(item_id)
    if item_id not in items:
        abort(404, f"Item with ID {item_id} does not exist.")
    return item_id


def validate_condition(condition: str) -> str:
    valid_conditions = ["new", "like-new", "used-good", "used-fair", "poor"]
    condition = condition.lower()
    if condition not in valid_conditions:
        abort(
            400, "Condition must be one of: new, like-new, used-good, used-fair, poor."
        )
    return sanitize_input(condition)


def validate_type(item_type: str) -> str:
    valid_types = ["free", "exchange"]
    item_type = item_type.lower()
    if item_type not in valid_types:
        abort(400, "Type must be either 'Free' or 'Exchange'.")
    return sanitize_input(item_type)


def validate_category(category: str) -> str:
    valid_categories = [
        "essentials",
        "living",
        "tools-tech",
        "style-expression",
        "leisure-learning",
    ]
    category = category.lower()
    if category not in valid_categories:
        abort(
            400,
            "Category must be one of: essentials, living, tools-tech, style-expression, leisure-learning.",
        )
    return sanitize_input(category)


def validate_string_length(
    value: str, field_name: str, min_length: int, max_length: int
) -> str:
    if not (min_length <= len(value) <= max_length):
        abort(
            400,
            f"{field_name} must be between {min_length} and {max_length} characters.",
        )
    return sanitize_input(value.lower())


def title_matches(user_input: str, item_title: str, threshold: float = 0.4) -> bool:
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
) -> Item:
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
    new_category = validate_category("essentials")
    safe_title = validate_string_length(new_title, "Title", 3, 100)
    safe_description = validate_string_length(new_description, "Description", 10, 1000)
    safe_condition = validate_condition(new_condition)
    safe_location = sanitize_input(new_location.lower())
    safe_type = validate_type(new_type)

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
        return new_item
    except Exception as e:
        abort(500, f"Failed to create an item: {str(e)}")


async def user_view_item(session_token: str, csrf_token: str) -> list[Item]:
    """
    Retrieves all items from the database.

    Args:
        session_token (str): User's session token.
        csrf_token (str): User's CSRF token.

    Returns:
        dict[int, Item]: Dictionary of all item data in dictionary format.
    """
    user_id = admin_retrieve_user_id(session_token, csrf_token)

    owned_items: list[Item] = []
    for item in items.values():
        if item.get_user_id() == user_id and item.get_status() == "available":
            owned_items.append(item)

    return owned_items


async def user_get_browse_items(
    category_filter: str = None,
    condition_filter: str = None,
    type_filter: str = None,
    title_filter: str = None,
    item_id: str = None,
) -> dict[int, Item]:
    """
    Retrieves filtered items from the database.

    Args:
        category_filter (str): Filter items by category.
        condition_filter (str): Filter items by condition.
        type_filter (str): Filter items by type.
        title_filter (str): Filter items by title.
        item_id (str): Retrieve a single item by ID.

    Returns:
        dict[dict]: Dictionary of all item data in dictionary format.
    """
    if item_id is not None:
        item_id = validate_item_id(item_id)
        item = items[item_id]
        if item.get_status() == "available":
            return {item_id: item}

    filtered_items: dict[int, Item] = {}
    for item_key, item in items.items():
        if item.get_status() == "available":
            filtered_items[item_key] = item

    filtered_items_copy = (
        filtered_items.copy()
    )  # Create a copy to avoid modifying the original

    if title_filter is not None:
        safe_title_filter = validate_string_length(title_filter, "Title filter", 3, 100)
        for item_key, item in filtered_items_copy.items():
            if not title_matches(safe_title_filter, item.get_title()):
                del filtered_items[item_key]

    filtered_items_copy = (
        filtered_items.copy()
    )  # Create a copy to avoid modifying the original

    if category_filter is not None:
        safe_category_filter = validate_category(category_filter)
        for item_key, item in filtered_items_copy.items():
            if item.get_category() != safe_category_filter:
                del filtered_items[item_key]

    filtered_items_copy = (
        filtered_items.copy()
    )  # Create a copy to avoid modifying the original

    if condition_filter is not None:
        safe_condition_filter = validate_condition(condition_filter)
        for item_key, item in filtered_items_copy.items():
            if item.get_condition() != safe_condition_filter:
                del filtered_items[item_key]

    filtered_items_copy = (
        filtered_items.copy()
    )  # Create a copy to avoid modifying the original

    if type_filter is not None:
        safe_type_filter = validate_type(type_filter)
        for item_key, item in filtered_items_copy.items():
            if item.get_type() != safe_type_filter:
                del filtered_items[item_key]

    return filtered_items


async def user_modify_item(
    session_token: str,
    csrf_token: str,
    item_id: str,
    new_title: str = None,
    new_description: str = None,
    new_condition: str = None,
    new_location: str = None,
    new_type: str = None,
    new_images: list[str] = None,
) -> Item:
    """
    Modifies an existing item in the database.

    Args:
        item_id (str): ID of the item to modify.
        new_title (str): New title for the item.
        new_description (str): New description for the item.
        new_condition (str): New condition for the item.
        new_location (str): New location for the item.
        new_type (str): New type for the item.
        new_images (list[str]): New list of image URLs for the item.
        session_token (str): User's session token.
        csrf_token (str): User's CSRF token.

    Returns:
        Item: The modified item object.
    """
    user_id = admin_retrieve_user_id(session_token, csrf_token)
    item_id = validate_item_id(item_id)
    if items[item_id].get_user_id() != user_id:
        abort(403, "You do not have permission to modify this item.")

    if new_title:
        new_title = validate_string_length(new_title, "Title", 3, 100)
        items[item_id].set_title(sanitize_input(new_title.lower()))

    if new_description:
        new_description = validate_string_length(
            new_description, "Description", 10, 1000
        )
        items[item_id].set_description(sanitize_input(new_description.lower()))

    if new_condition:
        new_condition = validate_condition(
            new_condition
        )  # This will raise an error if invalid
        items[item_id].set_condition(sanitize_input(new_condition.lower()))

    if new_location:
        items[item_id].set_location(sanitize_input(new_location.lower()))

    if new_type:
        new_type = validate_type(new_type)  # This will raise an error if invalid
        items[item_id].set_type(sanitize_input(new_type.lower()))

    if new_images:
        if not isinstance(new_images, list):
            abort(400, "Images must be a list of URLs.")
        if len(new_images) > 10:
            abort(400, "You can only upload up to 10 images.")
        items[item_id].set_images(new_images)

    return items[item_id]  # Return the modified item object


async def user_delete_item(
    item_id: str,
    session_token: str,
    csrf_token: str,
) -> None:
    """
    Deletes an item from the database.

    Args:
        item_id (str): ID of the item to delete.
        session_token (str): User's session token.
        csrf_token (str): User's CSRF token.
    """
    item_id = validate_item_id(item_id)

    if session_token and csrf_token:
        user_id = admin_retrieve_user_id(session_token, csrf_token)
        if items[item_id].get_user_id() != user_id:
            abort(403, "You do not have permission to delete this item.")

    del items[item_id]  # Remove the item from the dictionary


async def search_item_similarity_pg(
    search_query: str, threshold: float = 0.4, limit: int = 6
) -> list[str]:
    """
    Search items using PostgreSQL trigram similarity.

    Args:
        search_query (str): The query string to match.
        threshold (float): Minimum similarity threshold.
        limit (int): Maximum number of results.

    Returns:
        list[str]: Sorted list of item titles with similarity above the threshold.
    """
    if not search_query or len(search_query) < 3:
        return []

    stmt = (
        select(
            ItemDB.title, func.similarity(ItemDB.title, search_query).label("sim_score")
        )
        .where(func.similarity(ItemDB.title, search_query) > threshold)
        .order_by(desc("sim_score"))
        .limit(limit)
    )

    result = db.session.execute(stmt)
    return [row.title for row in result]
