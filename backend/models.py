from datetime import datetime
from backend.config import db
from backend.utils import unsanitize_output


class UserDB(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(512), nullable=False)
    password = db.Column(db.LargeBinary(2048), nullable=False)

    def to_json(self) -> dict:
        return {
            "id": self.id,
            "first_name": unsanitize_output(self.first_name),
            "last_name": unsanitize_output(self.last_name),
            "email": self.email,
            "password": self.password,
        }


class ItemDB(db.Model):
    __tablename__ = "items"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(512), nullable=False)
    description = db.Column(db.Text, nullable=False)
    condition = db.Column(db.String(512), nullable=False)
    status = db.Column(db.String(100), nullable=False, default="Available")
    location = db.Column(db.String(512), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    type = db.Column(db.String(100), nullable=False)

    def to_json(self) -> dict:
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


class ItemImageDB(db.Model):
    __tablename__ = "item_images"
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey("items.id"), nullable=False)
    url = db.Column(db.String, nullable=False)


class ExchangeOfferDB(db.Model):
    __tablename__ = "exchange_offers"

    id = db.Column(db.Integer, primary_key=True)

    offered_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    requested_item_id = db.Column(db.Integer, db.ForeignKey("items.id"), nullable=False)
    message = db.Column(db.String, nullable=False)
    status = db.Column(
        db.String(50), default="pending"
    )  # pending, accepted, cancelled, completed, confirmed

    created_at = db.Column(db.DateTime, default=datetime.now)

    def to_json(self) -> dict:
        requested_item = ItemDB.query.get(self.requested_item_id)
        offered_items = [ItemDB.query.get(item.item_id) for item in self.offered_items]

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
            "requested_item_name": unsanitize_output(requested_item.title) if requested_item else None,
            "requested_item_location": (
                unsanitize_output(requested_item.location) if requested_item else None
            ),
            "offered_item_names": [unsanitize_output(item.title) for item in offered_items if item],
        }


class OfferedItemDB(db.Model):
    __tablename__ = "offered_items"
    id = db.Column(db.Integer, primary_key=True)
    offer_id = db.Column(
        db.Integer, db.ForeignKey("exchange_offers.id"), nullable=False
    )
    item_id = db.Column(db.Integer, db.ForeignKey("items.id"), nullable=False)


ExchangeOfferDB.offered_items = db.relationship(
    "OfferedItemDB", backref="offer", lazy=True
)
ItemDB.images = db.relationship("ItemImageDB", backref="item", lazy=True)
