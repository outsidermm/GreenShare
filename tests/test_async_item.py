import pytest
from backend.config import app, db
from backend.models import UserDB, ItemDB, ItemImageDB, OfferedItemDB, ExchangeOfferDB
from backend.auth import user_auth_register
from werkzeug.exceptions import HTTPException
from backend.data import users, items, exchange_offers
from backend.items import (
    user_create_item,
    user_get_browse_items,
    user_modify_item,
    user_delete_item,
)
from backend.utils import sanitize_input



@pytest.fixture(scope="module", autouse=True)
def app_context():
    with app.app_context():
        yield app


@pytest.mark.asyncio
async def test_create_item_success():
    session_token, csrf_token = await user_auth_register(
        "creator@test.com", "Password1!", "John", "Doe"
    )
    session_token = sanitize_input(session_token)
    csrf_token = sanitize_input(csrf_token)
    await user_create_item(
        new_title="Test Item",
        new_description="A very useful item",
        new_condition="new",
        new_location="Sydney",
        new_type="free",
        new_images=["http://image.url/1.png"],
        session_token=session_token,
        csrf_token=csrf_token,
    )
    assert len(items) == 1


@pytest.mark.asyncio
async def test_create_item_invalid_title_length():
    with pytest.raises(HTTPException) as excinfo:
        session_token, csrf_token = await user_auth_register(
            "creator@test.com", "Password1!", "John", "Doe"
        )
        session_token = sanitize_input(session_token)
        csrf_token = sanitize_input(csrf_token)
        await user_create_item(
            new_title="Te",
            new_description="A very useful item",
            new_condition="new",
            new_location="Sydney",
            new_type="free",
            new_images=["http://image.url/1.png"],
            session_token=session_token,
            csrf_token=csrf_token,
        )
    assert "Title must be between 3 and 100 characters" in excinfo.value.description


@pytest.mark.asyncio
async def test_create_item_invalid_description_length():
    with pytest.raises(HTTPException) as excinfo:
        session_token, csrf_token = await user_auth_register(
            "creator@test.com", "Password1!", "John", "Doe"
        )
        session_token = sanitize_input(session_token)
        csrf_token = sanitize_input(csrf_token)
        await user_create_item(
            new_title="Teii",
            new_description="short",
            new_condition="new",
            new_location="Sydney",
            new_type="free",
            new_images=["http://image.url/1.png"],
            session_token=session_token,
            csrf_token=csrf_token,
        )
    assert (
        "Description must be between 10 and 1000 characters."
        in excinfo.value.description
    )


@pytest.mark.asyncio
async def test_create_item_invalid_condition():
    with pytest.raises(HTTPException) as excinfo:
        session_token, csrf_token = await user_auth_register(
            "creator@test.com", "Password1!", "John", "Doe"
        )
        session_token = sanitize_input(session_token)
        csrf_token = sanitize_input(csrf_token)
        await user_create_item(
            new_title="Legit",
            new_description="I love this item",
            new_condition="terrible",
            new_location="Sydney",
            new_type="free",
            new_images=["http://image.url/1.png"],
            session_token=session_token,
            csrf_token=csrf_token,
        )
    assert (
        "Condition must be one of: new, like-new, used-good, used-fair, poor."
        in excinfo.value.description
    )


@pytest.mark.asyncio
async def test_create_item_invalid_type():
    with pytest.raises(HTTPException) as excinfo:
        session_token, csrf_token = await user_auth_register(
            "creator@test.com", "Password1!", "John", "Doe"
        )
        session_token = sanitize_input(session_token)
        csrf_token = sanitize_input(csrf_token)
        await user_create_item(
            new_title="Legit",
            new_description="I love this item",
            new_condition="used-fair",
            new_location="Sydney",
            new_type="Trade",
            new_images=["http://image.url/1.png"],
            session_token=session_token,
            csrf_token=csrf_token,
        )
    assert "Type must be either 'Free' or 'Exchange'." in excinfo.value.description


@pytest.mark.asyncio
async def test_view_items_filter_by_location_and_type():
    """
    Verify that items can be filtered correctly by type and location.

    Steps:
        - Register a user
        - Create an item with specific location and type
        - Retrieve items filtered by type

    Expected:
        - At least one item matching the filter criteria is returned
    """
    session_token, csrf_token = await user_auth_register(
        "creator@test.com", "Password1!", "John", "Doe"
    )
    session_token = sanitize_input(session_token)
    csrf_token = sanitize_input(csrf_token)
    await user_create_item(
        new_title="Location Type Match",
        new_description="Description for location type match.",
        new_condition="used-good",
        new_location="Sydney",
        new_type="free",
        new_images=["http://image.url/5.png"],
        session_token=session_token,
        csrf_token=csrf_token,
    )
    filtered_items = await user_get_browse_items(
        type_filter="free"
    )
    assert len(filtered_items) > 0


@pytest.mark.asyncio
async def test_view_items_invalid_item_id():
    """
    Ensure that querying items with an invalid item ID raises an HTTPException.

    Steps:
        - Attempt to retrieve items using an invalid item ID

    Expected:
        - An HTTPException is raised indicating the item does not exist
    """
    invalid_id = "-5"
    with pytest.raises(HTTPException) as excinfo:
        await user_get_browse_items(item_id=invalid_id)
    assert "does not exist." in excinfo.value.description


@pytest.mark.asyncio
async def test_modify_item_success():
    """
    Test that a user can successfully modify their own item details.

    Steps:
        - Register a user
        - Create an item
        - Retrieve and verify the initial item title
        - Modify the item's details
        - Retrieve and verify the updated item details

    Expected:
        - Item title and location are updated correctly in the system
    """
    session_token, csrf_token = await user_auth_register(
        "modifier@test.com", "Password1!", "Alice", "Smith"
    )
    session_token = sanitize_input(session_token)
    csrf_token = sanitize_input(csrf_token)

    new_item = await user_create_item(
        new_title="Test Item",
        new_description="A very useful item",
        new_condition="new",
        new_location="Sydney",
        new_type="free",
        new_images=["http://image.url/1.png"],
        session_token=session_token,
        csrf_token=csrf_token,
    )

    item_id = new_item.get_item_pk()
    modified_item = await user_get_browse_items(item_id=str(item_id))
    # Confirm the initial title matches the sanitized input
    assert modified_item[item_id].get_title() == sanitize_input("Test Item".lower())

    await user_modify_item(
        item_id=item_id,
        new_title="New Title",
        new_description="New Description for the item",
        new_condition="used-good",
        new_location="Brisbane",
        new_type="free",
        session_token=session_token,
        csrf_token=csrf_token,
    )

    updated_item = await user_get_browse_items(item_id=str(item_id))
    # Verify the title and location have been updated as expected
    assert updated_item[item_id].get_title() == sanitize_input("New Title".lower())
    assert updated_item[item_id].get_location() == sanitize_input("Brisbane Qld, Australia".lower())


@pytest.mark.asyncio
async def test_delete_item_success():
    """
    Confirm that a user can successfully delete their own item.
    
    Steps:
        - Register a user
        - Create an item
        - Delete the item
        - Verify it is removed from the global registry
    
    Expected:
        - Item is removed from the global `items` dictionary
    """
    session_token, csrf_token = await user_auth_register(
        "deleter@test.com", "Password1!", "Bob", "Jones"
    )
    session_token = sanitize_input(session_token)
    csrf_token = sanitize_input(csrf_token)

    await user_create_item(
        new_title="Delete Me",
        new_description="Item to be deleted",
        new_condition="Used-Good",
        new_location="Adelaide",
        new_type="Free",
        new_images=["http://image.url/delete.png"],
        session_token=session_token,
        csrf_token=csrf_token,
    )

    item_id = next(iter(items.keys()))
    await user_delete_item(
        item_id=str(item_id), session_token=session_token, csrf_token=csrf_token
    )
    # Assert the item no longer exists in the global items dictionary
    assert item_id not in items


@pytest.mark.asyncio
async def test_modify_item_invalid_user():
    """
    Verify that a user cannot modify an item they do not own.

    Steps:
        - Register the actual owner and create an item
        - Register another user (attacker)
        - Attempt to modify the owner's item using the attacker's credentials

    Expected:
        - An HTTPException is raised denying permission to modify the item
    """
    session_token, csrf_token = await user_auth_register(
        "actualowner@test.com", "Password1!", "Emily", "White"
    )
    session_token = sanitize_input(session_token)
    csrf_token = sanitize_input(csrf_token)

    await user_create_item(
        new_title="Owner Title",
        new_description="Owner description",
        new_condition="Used-Fair",
        new_location="Perth",
        new_type="Free",
        new_images=["http://image.url/owner.png"],
        session_token=session_token,
        csrf_token=csrf_token,
    )

    item_id = next(iter(items.keys()))

    new_token, new_csrf = await user_auth_register(
        "attacker@test.com", "Password1!", "Mallory", "Red"
    )
    new_token = sanitize_input(new_token)
    new_csrf = sanitize_input(new_csrf)

    with pytest.raises(HTTPException) as excinfo:
        await user_modify_item(
            item_id=item_id,
            new_title="Hacked Title",
            new_description="Hacked Description",
            new_condition="Poor",
            new_location="Darwin",
            new_type="Exchange",
            session_token=new_token,
            csrf_token=new_csrf,
        )
    assert (
        "You do not have permission to modify this item." in excinfo.value.description
    )
