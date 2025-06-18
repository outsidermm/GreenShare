"""
This module handles item-related operations for the GreenShare platform,
including item validation, creation, viewing, filtering, modification, and deletion.
"""

from difflib import SequenceMatcher
from sqlalchemy import select, func, desc
from flask import abort
from backend.utils import (
    validate_string_length,
    sanitize_input,
)
from backend.auth import validate_user_id
from backend.data import admin_retrieve_user_id, item_categorisation, items
from backend.models import ItemDB
from backend.config import db
from backend.classes.item import Item


def validate_item_id(item_id: str) -> int:
    """
    Validates the given item ID string.

    Args:
        item_id (str): The item ID as a string.

    Returns:
        int: The validated item ID as an integer.

    Raises:
        400: If the item ID is not a positive integer.
        404: If the item ID does not exist in the items dictionary.
    """
    if not item_id.isdigit() or int(item_id) <= 0:
        abort(400, "Item ID must be a positive integer.")
    item_id_int: int = int(item_id)
    if item_id_int not in items:
        abort(404, f"Item with ID {item_id_int} does not exist.")
    return item_id_int


def validate_condition(condition: str) -> str:
    """
    Validates the condition of an item.

    Args:
        condition (str): The condition string to validate.

    Returns:
        str: Sanitized, validated condition string.

    Raises:
        400: If the condition is not one of the allowed values.
    """
    valid_conditions: list[str] = ["new", "like-new", "used-good", "used-fair", "poor"]
    condition_lc: str = condition.lower()
    if condition_lc not in valid_conditions:
        abort(
            400, "Condition must be one of: new, like-new, used-good, used-fair, poor."
        )
    return sanitize_input(condition_lc)


def validate_type(item_type: str) -> str:
    """
    Validates the type of an item.

    Args:
        item_type (str): The type string to validate.

    Returns:
        str: Sanitized, validated type string.

    Raises:
        400: If the type is not one of the allowed values.
    """
    valid_types: list[str] = ["free", "exchange"]
    item_type_lc: str = item_type.lower()
    if item_type_lc not in valid_types:
        abort(400, "Type must be either 'Free' or 'Exchange'.")
    return sanitize_input(item_type_lc)


def validate_category(category: str) -> str:
    """
    Validates the category of an item.

    Args:
        category (str): The category string to validate.

    Returns:
        str: Sanitized, validated category string. Defaults to "essentials" if invalid.
    """
    valid_categories: list[str] = [
        "essentials",
        "living",
        "tools-tech",
        "style-expression",
        "leisure-learning",
    ]
    category_lc: str = category.lower()
    if category_lc not in valid_categories:
        category_lc = "essentials"  # Default category if invalid
    return sanitize_input(category_lc)


def title_matches(user_input: str, item_title: str, threshold: float = 0.4) -> bool:
    """
    Determines if the user input matches the item title by substring or similarity.

    Args:
        user_input (str): The user's search input.
        item_title (str): The item title to check against.
        threshold (float): Similarity threshold for fuzzy matching.

    Returns:
        bool: True if input matches by substring or similarity, False otherwise.
    """
    user_input_lc: str = user_input.lower()
    item_title_lc: str = item_title.lower()
    return (
        user_input_lc in item_title_lc
        or SequenceMatcher(None, user_input_lc, item_title_lc).ratio() >= threshold
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
        new_type (str): Type of the item (free/exchange).
        new_images (list[str]): List of image URLs for the item.
        session_token (str): User's session token.
        csrf_token (str): User's CSRF token.

    Returns:
        Item: The newly created Item object.

    Raises:
        400: If any field is invalid.
        500: If creation fails due to an internal error.
    """
    # Retrieve and validate user ID from session and CSRF tokens
    new_user_id: int = admin_retrieve_user_id(session_token, csrf_token)
    validate_user_id(new_user_id)  # Ensure the user ID is valid
    # Validate and sanitize input fields
    safe_title: str = validate_string_length(new_title, "Title", 3, 100)
    safe_description: str = validate_string_length(
        new_description, "Description", 10, 1000
    )
    # Categorise item using title and description
    new_category_raw: str = await item_categorisation(safe_title, safe_description)
    new_category: str = validate_category(new_category_raw)
    safe_condition: str = validate_condition(new_condition)
    safe_location: str = sanitize_input(new_location.lower())
    safe_type: str = validate_type(new_type)
    try:
        # Create Item instance and store in global items dictionary
        new_item: Item = Item(
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
    Retrieves all available items owned by the user.

    Args:
        session_token (str): User's session token.
        csrf_token (str): User's CSRF token.

    Returns:
        list[Item]: List of Item objects owned by the user and available.
    """
    user_id: int = admin_retrieve_user_id(session_token, csrf_token)
    owned_items: list[Item] = []
    # Iterate through all items and collect those that are available and owned by the user
    for item in items.values():
        if item.get_user_id() == user_id:
            owned_items.append(item)
    return owned_items


async def user_get_browse_items(
    category_filter: str | None = None,
    condition_filter: str | None = None,
    type_filter: str | None = None,
    title_filter: str | None = None,
    item_id: str | None = None,
) -> dict[int, Item]:
    """
    Retrieves items from the database, filtered by various criteria.

    Args:
        category_filter (str | None): Filter items by category.
        condition_filter (str | None): Filter items by condition.
        type_filter (str | None): Filter items by type.
        title_filter (str | None): Filter items by title.
        item_id (str | None): Retrieve a single item by ID.

    Returns:
        dict[int, Item]: Dictionary of filtered Item objects, keyed by item ID.
    """
    # If a specific item ID is provided, return that item if available
    if item_id is not None:
        item_id_int: int = validate_item_id(item_id)
        item: Item = items[item_id_int]
        if item.get_status() == "available":
            return {item_id_int: item}
    # Otherwise, build a filtered dictionary of available items

    filtered_items: dict[int, Item] = {}
    for item_key, item in items.items():
        if item.get_status() == "available":
            filtered_items[item_key] = item

    # Filter by title if provided
    filtered_items_copy = filtered_items.copy()
    if title_filter is not None:
        safe_title_filter: str = validate_string_length(
            title_filter, "Title filter", 3, 100
        )
        for item_key, item in filtered_items_copy.items():
            if not title_matches(safe_title_filter, item.get_title()):
                del filtered_items[item_key]

    # Filter by category if provided
    filtered_items_copy = filtered_items.copy()
    if category_filter is not None:
        safe_category_filter: str = validate_category(category_filter)
        for item_key, item in filtered_items_copy.items():
            if item.get_category() != safe_category_filter:
                del filtered_items[item_key]

    # Filter by condition if provided
    filtered_items_copy = filtered_items.copy()
    if condition_filter is not None:
        safe_condition_filter: str = validate_condition(condition_filter)
        for item_key, item in filtered_items_copy.items():
            if item.get_condition() != safe_condition_filter:
                del filtered_items[item_key]

    # Filter by type if provided
    filtered_items_copy = filtered_items.copy()
    if type_filter is not None:
        safe_type_filter: str = validate_type(type_filter)
        for item_key, item in filtered_items_copy.items():
            if item.get_type() != safe_type_filter:
                del filtered_items[item_key]
    return filtered_items


async def user_modify_item(
    session_token: str,
    csrf_token: str,
    item_id: str,
    new_title: str | None = None,
    new_description: str | None = None,
    new_condition: str | None = None,
    new_location: str | None = None,
    new_type: str | None = None,
    new_images: list[str] | None = None,
) -> Item:
    """
    Modifies an existing item in the database.

    Args:
        session_token (str): User's session token.
        csrf_token (str): User's CSRF token.
        item_id (str): ID of the item to modify.
        new_title (str | None): New title for the item.
        new_description (str | None): New description for the item.
        new_condition (str | None): New condition for the item.
        new_location (str | None): New location for the item.
        new_type (str | None): New type for the item.
        new_images (list[str] | None): New list of image URLs for the item.

    Returns:
        Item: The modified Item object.

    Raises:
        400: If any field is invalid.
        403: If the user does not own the item.
    """
    user_id: int = admin_retrieve_user_id(session_token, csrf_token)
    validate_user_id(user_id)  # Ensure the user ID is valid
    item_id_int: int = validate_item_id(item_id)
    # Check permission: only owner can modify
    if items[item_id_int].get_user_id() != user_id:
        abort(403, "You do not have permission to modify this item.")
    # Update fields if provided, validating and sanitizing as needed
    if new_title is not None:
        safe_title: str = validate_string_length(new_title, "Title", 3, 100)
        items[item_id_int].set_title(sanitize_input(safe_title.lower()))

    if new_description is not None:
        safe_description: str = validate_string_length(
            new_description, "Description", 10, 1000
        )
        items[item_id_int].set_description(sanitize_input(safe_description.lower()))

    if new_condition is not None:
        safe_condition: str = validate_condition(new_condition)
        items[item_id_int].set_condition(sanitize_input(safe_condition.lower()))

    if new_location is not None:
        items[item_id_int].set_location(sanitize_input(new_location.lower()))

    if new_type is not None:
        safe_type: str = validate_type(new_type)
        items[item_id_int].set_type(sanitize_input(safe_type.lower()))

    if new_images is not None:
        if not isinstance(new_images, list):
            abort(400, "Images must be a list of URLs.")
        if len(new_images) > 10:
            abort(400, "You can only upload up to 10 images.")
        items[item_id_int].set_images(new_images)
    # Return the modified item object
    return items[item_id_int]


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

    Returns:
        None

    Raises:
        403: If the user does not own the item.
    """
    item_id_int: int = validate_item_id(item_id)
    # Only allow deletion if valid session/CSRF tokens are provided
    if session_token and csrf_token:
        user_id: int = admin_retrieve_user_id(session_token, csrf_token)
        validate_user_id(user_id)  # Ensure the user ID is valid
        if items[item_id_int].get_user_id() != user_id:
            abort(403, "You do not have permission to delete this item.")
    # Remove the item from the global items dictionary
    del items[item_id_int]


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
    # Return empty list for invalid queries
    if not search_query or len(search_query) < 3:
        return []
    # Prepare SQL statement using trigram similarity
    stmt = (
        select(
            ItemDB.title, func.similarity(ItemDB.title, search_query).label("sim_score")
        )
        .where(func.similarity(ItemDB.title, search_query) > threshold)
        .order_by(desc("sim_score"))
        .limit(limit)
    )
    # Execute query and return matching titles
    result = db.session.execute(stmt)
    return [row.title for row in result]
