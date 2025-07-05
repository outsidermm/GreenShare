"""
Module: item.py

This module defines the `Item` class which provides an abstraction over item records stored in the GreenShare platform database.
It encapsulates data access and manipulation logic, including creation, retrieval, update, and deletion of item-related attributes.
The module interacts with SQLAlchemy models defined in `ItemDB` and `ItemImageDB`.

Attributes:
    None

Classes:
    Item: Represents an item with various accessors, mutators, and persistence logic.
"""

from typing import Dict
from backend.models import ItemDB, ItemImageDB
from backend.config import db
from backend.utils import unsanitize_output


class Item:
    """
    Represents an item listed on the GreenShare platform.
    Provides accessors, mutators, and internal DB reference.
    """

    __item_pk: int = None

    # Constructor for creating and saving a new item in the database
    def __init__(
        self,
        new_title: str,
        new_description: str,
        new_condition: str,
        new_location: str,
        new_user_id: int,
        new_type: str,
        new_category: str,
        new_images: list[str] = [],
    ) -> None:
        """
        Creates a new item in the database and sets internal state.
        """

        # Create main item first
        new_item = ItemDB(
            title=new_title,
            description=new_description,
            condition=new_condition,
            location=new_location,
            user_id=new_user_id,
            category=new_category,
            type=new_type,
            status="available",  # Explicitly set status
        )
        db.session.add(new_item)
        db.session.commit()

        # Then create associated images separately
        for image_url in new_images:
            image = ItemImageDB(item_id=new_item.id, url=image_url)
            db.session.add(image)
        db.session.commit()

        self.set_item_pk(new_item.id)

    # Class method to retrieve all items from DB and instantiate them
    @classmethod
    def backup(cls) -> Dict[int, "Item"]:
        """
        Loads all items from the database and returns a dictionary of Item instances keyed by item ID.
        """
        item_records = db.session.get(ItemDB, {}).all()
        if not item_records:
            return {}

        item_dict: Dict[int, Item] = {}
        for item in item_records:
            # Create Item instance without calling __init__
            item_obj = cls.__new__(cls)
            item_obj.set_item_pk(item.id)
            item_dict[item.id] = item_obj

        return item_dict

    # Accessor/Mutator for item_pk
    def get_item_pk(self) -> int:
        """
        Returns the primary key of the item.
        """
        return self.__item_pk

    def set_item_pk(self, item_pk: int) -> None:
        """
        Sets the primary key of the item.
        """
        self.__item_pk = item_pk

    # Accessor/Mutator for title
    def get_title(self) -> str:
        """
        Returns the title of the item.
        """
        title = db.session.get(ItemDB, self.get_item_pk()).title
        return unsanitize_output(title)

    def set_title(self, new_title: str) -> None:
        """
        Sets a new title for the item and commits the change.
        """
        db.session.get(ItemDB, self.get_item_pk()).title = new_title
        db.session.commit()

    # Accessor/Mutator for description
    def get_description(self) -> str:
        """
        Returns the description of the item.
        """
        description = db.session.get(ItemDB, self.get_item_pk()).description
        return unsanitize_output(description)

    def set_description(self, new_description: str) -> None:
        """
        Sets a new description for the item and commits the change.
        """
        db.session.get(ItemDB, self.get_item_pk()).description = new_description
        db.session.commit()

    # Accessor/Mutator for condition
    def get_condition(self) -> str:
        """
        Returns the condition of the item.
        """
        return db.session.get(ItemDB, self.get_item_pk()).condition

    def set_condition(self, new_condition: str) -> None:
        """
        Sets a new condition for the item and commits the change.
        """
        db.session.get(ItemDB, self.get_item_pk()).condition = new_condition
        db.session.commit()

    # Accessor/Mutator for status
    def get_status(self) -> str:
        """
        Returns the status of the item.
        """
        return db.session.get(ItemDB, self.get_item_pk()).status

    def set_status(self, new_status: str) -> None:
        """
        Sets a new status for the item and commits the change.
        """
        db.session.get(ItemDB, self.get_item_pk()).status = new_status
        db.session.commit()

    # Accessor/Mutator for location
    def get_location(self) -> str:
        """
        Returns the location of the item.
        """
        location = db.session.get(ItemDB, self.get_item_pk()).location
        return unsanitize_output(location)

    def set_location(self, new_location: str) -> None:
        """
        Sets a new location for the item and commits the change.
        """
        db.session.get(ItemDB, self.get_item_pk()).location = new_location
        db.session.commit()

    # Accessor/Mutator for category
    def get_category(self) -> str:
        """
        Returns the category of the item.
        """
        return db.session.get(ItemDB, self.get_item_pk()).category

    # Accessor/Mutator for images
    def get_images(self) -> list[str]:
        """
        Returns the list of image URLs associated with the item.
        """
        return db.session.get(ItemDB, self.get_item_pk()).images

    def set_images(self, new_images: list[str]) -> None:
        """
        Replaces existing images with new ones and commits the changes.
        """
        # Remove all existing images for this item
        db.session.query(ItemImageDB).filter_by(item_id=self.get_item_pk()).delete()
        db.session.commit()

        # Add new images
        for image_url in new_images:
            image = ItemImageDB(item_id=self.get_item_pk(), url=image_url)
            db.session.add(image)
        db.session.commit()

    # Accessor/Mutator for user_id
    def get_user_id(self) -> int:
        """
        Returns the user ID associated with the item.
        """
        return db.session.get(ItemDB, self.get_item_pk()).user_id

    # Accessor/Mutator for type
    def get_type(self) -> str:
        """
        Returns the type of the item.
        """
        return db.session.get(ItemDB, self.get_item_pk()).type

    def set_type(self, new_type: str) -> None:
        """
        Sets a new type for the item and commits the change.
        """
        db.session.get(ItemDB, self.get_item_pk()).type = new_type
        db.session.commit()

    def to_dict(self) -> dict:
        """
        Returns a dictionary representation of the item.
        """
        return db.session.get(ItemDB, self.get_item_pk()).to_json()
