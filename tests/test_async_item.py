import pytest
import re
from backend.config import app, db
from backend.models import UserDB, ItemDB, ItemImageDB
from backend.auth import user_auth_register
from werkzeug.exceptions import HTTPException
from backend.data import users, items
from backend.items import user_create_item, user_get_browse_items

@pytest.fixture(autouse=True)
def clear_data():
    users.clear()
    items.clear()
    db.session.query(ItemImageDB).delete()
    db.session.query(ItemDB).delete()
    db.session.query(UserDB).delete()
    db.session.commit()


@pytest.fixture(scope="module", autouse=True)
def app_context():
    with app.app_context():
        yield app

@pytest.mark.asyncio
async def test_create_item_success():
    session_token, csrf_token = await user_auth_register("creator@test.com", "Password1!", "John", "Doe")
    session_token = re.escape(session_token)
    csrf_token = re.escape(csrf_token)
    await user_create_item(
        new_title="Test Item",
        new_description="A very useful item",
        new_condition="New",
        new_location="Sydney",
        new_type="Free",
        new_images=["http://image.url/1.png"],
        session_token=session_token,
        csrf_token=csrf_token,
    )
    assert len(items) == 1

@pytest.mark.asyncio
async def test_create_item_invalid_title_length():
    with pytest.raises(HTTPException) as excinfo:
        session_token, csrf_token = await user_auth_register("creator@test.com", "Password1!", "John", "Doe")
        session_token = re.escape(session_token)
        csrf_token = re.escape(csrf_token)
        await user_create_item(
        new_title="Te",
        new_description="A very useful item",
        new_condition="New",
        new_location="Sydney",
        new_type="Free",
        new_images=["http://image.url/1.png"],
        session_token=session_token,
        csrf_token=csrf_token,
    )
    assert "Title must be between 3 and 100 characters" in excinfo.value.description
        

@pytest.mark.asyncio
async def test_create_item_invalid_description_length():
    with pytest.raises(HTTPException) as excinfo:
        session_token, csrf_token = await user_auth_register("creator@test.com", "Password1!", "John", "Doe")
        session_token = re.escape(session_token)
        csrf_token = re.escape(csrf_token)
        await user_create_item(
        new_title="Teii",
        new_description="short",
        new_condition="New",
        new_location="Sydney",
        new_type="Free",
        new_images=["http://image.url/1.png"],
        session_token=session_token,
        csrf_token=csrf_token,
        )
    assert "Description must be between 10 and 1000 characters." in excinfo.value.description


@pytest.mark.asyncio
async def test_create_item_invalid_condition():
    with pytest.raises(HTTPException) as excinfo:
        session_token, csrf_token = await user_auth_register("creator@test.com", "Password1!", "John", "Doe")
        session_token = re.escape(session_token)
        csrf_token = re.escape(csrf_token)
        await user_create_item(
        new_title="Legit",
        new_description="I love this item",
        new_condition="terrible",
        new_location="Sydney",
        new_type="Free",
        new_images=["http://image.url/1.png"],
        session_token=session_token,
        csrf_token=csrf_token,
        )
    assert "Condition must be one of: New, Like New, Very Good, Good, Fair, Poor." in excinfo.value.description


@pytest.mark.asyncio
async def test_create_item_invalid_type():
    with pytest.raises(HTTPException) as excinfo:
        session_token, csrf_token = await user_auth_register("creator@test.com", "Password1!", "John", "Doe")
        session_token = re.escape(session_token)
        csrf_token = re.escape(csrf_token)
        await user_create_item(
        new_title="Legit",
        new_description="I love this item",
        new_condition="Fair",
        new_location="Sydney",
        new_type="Trade",
        new_images=["http://image.url/1.png"],
        session_token=session_token,
        csrf_token=csrf_token,
        )
    assert "Type must be either 'Free' or 'Exchange'." in excinfo.value.description

@pytest.mark.asyncio
async def test_view_items_filter_by_location_and_type():
        session_token, csrf_token = await user_auth_register("creator@test.com", "Password1!", "John", "Doe")
        session_token = re.escape(session_token)
        csrf_token = re.escape(csrf_token)
        await user_create_item(
        new_title="Location Type Match",
        new_description="Description for location type match.",
        new_condition="Good",
        new_location="Sydney",
        new_type="Free",
        new_images=["http://image.url/5.png"],
        session_token=session_token,
        csrf_token=csrf_token,
        )
        filtered_items = await user_get_browse_items(location_filter="Sydney", type_filter="Free")
        assert len(filtered_items) > 0


@pytest.mark.asyncio
async def test_view_items_invalid_item_id():
    invalid_id = "-5"
    with pytest.raises(HTTPException) as excinfo:
        await user_get_browse_items(item_id=invalid_id)
    assert "Item ID must be a positive integer." in excinfo.value.description


@pytest.mark.asyncio
async def test_view_items_invalid_user_id():
    invalid_id = "-5"
    with pytest.raises(HTTPException) as excinfo:
        await user_get_browse_items(user_id=invalid_id)
    assert "User ID must be a positive integer." in excinfo.value.description
