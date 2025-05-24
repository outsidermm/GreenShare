from backend.db.item_db import ItemDB
from backend.config import db


class Item:
    """
    Represents an item listed on the GreenShare platform.
    Provides accessors, mutators, and internal DB reference.
    """

    __item_pk: str = None

    def __init__(
        self,
        new_title: str,
        new_description: str,
        new_condition: str,
        new_location: str,
        new_user_id: str,
        new_images: list[str] = [],
    ):
        """
        Creates a new item in the database and sets internal state.
        """
        new_category = "Uncategorized"  # Default category if not specified
        new_item = ItemDB(
            title=new_title,
            description=new_description,
            condition=new_condition,
            location=new_location,
            user_id=new_user_id,
            images = new_images
            category=new_category,
        )
        db.session.add(new_item)
        db.session.commit()

        self.set_item_pk(new_item.id)

    @classmethod
    def backup(cls) -> dict[str, "Item"]:
        """
        Loads all items from the database and returns a dictionary of Item instances keyed by item ID.
        """
        item_records = ItemDB.query.all()
        if not item_records:
            return {}

        item_dict = {}
        for item in item_records:
            item_obj = cls.__new__(cls)
            item_obj.set_item_pk(item.id)
            item_dict[str(item.id)] = item_obj

        return item_dict

    def item_data(self) -> dict:
        """
        Returns item data from the database.
        """
        return ItemDB.query.filter_by(id=self.get_item_pk()).first().to_json()

    def get_item_pk(self) -> str:
        return self.__item_pk

    def set_item_pk(self, item_pk: str) -> None:
        self.__item_pk = item_pk

    def get_title(self) -> str:
        return ItemDB.query.filter_by(id=self.get_item_pk()).first().title

    def set_title(self, new_title: str) -> None:
        ItemDB.query.filter_by(id=self.get_item_pk()).first().title = new_title
        db.session.commit()

    def get_description(self) -> str:
        return ItemDB.query.filter_by(id=self.get_item_pk()).first().description

    def set_description(self, new_description: str) -> None:
        ItemDB.query.filter_by(id=self.get_item_pk()).first().description = new_description
        db.session.commit()

    def get_condition(self) -> str:
        return ItemDB.query.filter_by(id=self.get_item_pk()).first().condition

    def set_condition(self, new_condition: str) -> None:
        ItemDB.query.filter_by(id=self.get_item_pk()).first().condition = new_condition
        db.session.commit()

    def get_status(self) -> str:
        return ItemDB.query.filter_by(id=self.get_item_pk()).first().status

    def set_status(self, new_status: str) -> None:
        ItemDB.query.filter_by(id=self.get_item_pk()).first().status = new_status
        db.session.commit()

    def get_location(self) -> str:
        return ItemDB.query.filter_by(id=self.get_item_pk()).first().location

    def set_location(self, new_location: str) -> None:
        ItemDB.query.filter_by(id=self.get_item_pk()).first().location = new_location
        db.session.commit()
        
    def get_category(self) -> str:
        return ItemDB.query.filter_by(id=self.get_item_pk()).first().category
    
    def set_category(self, new_category: str) -> None:
        ItemDB.query.filter_by(id=self.get_item_pk()).first().category = new_category
        db.session.commit()
        
    def get_images(self) -> list[str]:
        return ItemDB.query.filter_by(id=self.get_item_pk()).first().images
    
    def set_images(self, new_images: list[str]) -> None:
        item = ItemDB.query.filter_by(id=self.get_item_pk()).first()
        item.images = new_images
        db.session.commit()