"""Database models for the GreenShare backend application.

This module defines the ORM models representing users, items, item images, exchange offers,
and offered items in the system. It includes class definitions with attributes mapped to
database columns, relationships between entities, and serialization methods for JSON output.
"""

from datetime import datetime
from typing import List, Dict, Any
from backend.config import db
from backend.utils import unsanitize_output


# UserDB represents a user in the system with personal and authentication details.
class UserDB(db.Model):
    """Model representing a user with personal information and credentials."""

    __tablename__ = "users"

    id: int = db.Column(db.Integer, primary_key=True)
    first_name: str = db.Column(db.String(100), nullable=False)
    last_name: str = db.Column(db.String(100), nullable=False)
    email: str = db.Column(db.String(512), nullable=False)
    password: bytes = db.Column(db.LargeBinary(2048), nullable=False)

    def to_json(self) -> Dict[str, Any]:
        """Serialize UserDB instance to JSON-compatible dictionary.

        Returns:
            dict: A dictionary containing user details.
        """
        return {
            "id": self.id,
            "first_name": unsanitize_output(self.first_name),
            "last_name": unsanitize_output(self.last_name),
            "email": self.email,
            "password": self.password,
        }


# ItemDB represents an item listed by a user, including details and status.
class ItemDB(db.Model):
    """Model representing an item with details, status, and ownership."""

    __tablename__ = "items"

    id: int = db.Column(db.Integer, primary_key=True)
    user_id: int = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title: str = db.Column(db.String(512), nullable=False)
    description: str = db.Column(db.Text, nullable=False)
    condition: str = db.Column(db.String(512), nullable=False)
    status: str = db.Column(db.String(100), nullable=False, default="Available")
    location: str = db.Column(db.String(512), nullable=False)
    category: str = db.Column(db.String(100), nullable=False)
    updated_at: datetime = db.Column(
        db.DateTime, default=datetime.now, onupdate=datetime.now
    )
    type: str = db.Column(db.String(100), nullable=False)

    # Indexes for efficient querying by frequently filtered fields and text search
    __table_args__ = (
        db.Index(
            "idx_item_title_trgm",
            "title",
            postgresql_using="gin",
            postgresql_ops={"title": "gin_trgm_ops"},
        ),
        db.Index("idx_item_location", "location"),
        db.Index("idx_item_condition", "condition"),
        db.Index("idx_item_category", "category"),
        db.Index("idx_item_type", "type"),
        db.Index("idx_item_status", "status"),
        db.Index("idx_item_user_id", "user_id"),
    )

    def to_json(self) -> Dict[str, Any]:
        """Serialize ItemDB instance to JSON-compatible dictionary.

        Returns:
            dict: A dictionary containing item details including associated images.
        """
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": unsanitize_output(self.title),
            "description": unsanitize_output(self.description),
            "condition": self.condition,
            "status": self.status,
            "location": unsanitize_output(self.location),
            "images": [image.url for image in self.images],
            "updated_at": self.updated_at.isoformat(),
            "category": self.category,
            "type": self.type,
        }


# ItemImageDB stores URLs of images associated with items.
class ItemImageDB(db.Model):
    """Model representing images linked to an item."""

    __tablename__ = "item_images"

    id: int = db.Column(db.Integer, primary_key=True)
    item_id: int = db.Column(db.Integer, db.ForeignKey("items.id"), nullable=False)
    url: str = db.Column(db.String, nullable=False)


# ExchangeOfferDB represents an offer made by a user to exchange items.
class ExchangeOfferDB(db.Model):
    """Model representing an exchange offer made by a user for an item."""

    __tablename__ = "exchange_offers"

    id: int = db.Column(db.Integer, primary_key=True)

    offered_by_id: int = db.Column(
        db.Integer, db.ForeignKey("users.id"), nullable=False
    )
    requested_item_id: int = db.Column(
        db.Integer, db.ForeignKey("items.id"), nullable=False
    )
    message: str = db.Column(db.String, nullable=False)
    status: str = db.Column(
        db.String(50), default="pending"
    )  # pending, accepted, cancelled, completed, confirmed

    created_at: datetime = db.Column(db.DateTime, default=datetime.now)

    # Indexes to optimize queries filtering by user, requested item, and offer status
    __table_args__ = (
        db.Index("idx_offer_by_user", "offered_by_id"),
        db.Index("idx_offer_requested_item", "requested_item_id"),
        db.Index("idx_offer_status", "status"),
    )

    def to_json(self) -> Dict[str, Any]:
        """Serialize ExchangeOfferDB instance to JSON-compatible dictionary.

        Retrieves related requested item and offered items to include their details.

        Returns:
            dict: A dictionary containing offer details, including involved items and status.
        """
        requested_item: ItemDB = ItemDB.query.get(self.requested_item_id)
        offered_items: List[ItemDB] = [
            ItemDB.query.get(item.item_id) for item in self.offered_items
        ]

        return {
            "id": self.id,
            "offered_by_id": self.offered_by_id,
            "message": unsanitize_output(self.message),
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "offered_item_ids": [
                offered_item.item_id for offered_item in self.offered_items
            ],
            "requested_item_id": self.requested_item_id,
            "requested_item_name": (
                unsanitize_output(requested_item.title) if requested_item else None
            ),
            "requested_item_location": (
                unsanitize_output(requested_item.location) if requested_item else None
            ),
            "offered_item_names": [
                unsanitize_output(item.title) for item in offered_items if item
            ],
        }


# OfferedItemDB links items offered in exchange offers.
class OfferedItemDB(db.Model):
    """Model representing an item offered as part of an exchange offer."""

    __tablename__ = "offered_items"

    id: int = db.Column(db.Integer, primary_key=True)
    offer_id: int = db.Column(
        db.Integer, db.ForeignKey("exchange_offers.id"), nullable=False
    )
    item_id: int = db.Column(db.Integer, db.ForeignKey("items.id"), nullable=False)


# Relationship assignments to enable ORM navigation between related entities.
# ExchangeOfferDB has many OfferedItemDB entries representing the items offered.
ExchangeOfferDB.offered_items = db.relationship(
    "OfferedItemDB", backref="offer", lazy=True
)

# ItemDB has many ItemImageDB entries representing the images of the item.
ItemDB.images = db.relationship("ItemImageDB", backref="item", lazy=True)
