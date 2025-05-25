from datetime import datetime
from backend.config import db

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
            "first_name": self.first_name,
            "last_name": self.last_name,
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
            "title": self.title,
            "description": self.description,
            "condition": self.condition,
            "status": self.status,
            "location": self.location,
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

    message = db.Column(db.Text, nullable=False)
    status = db.Column(
        db.String(50), default="Pending"
    )  # Pending, Accepted, Rejected, Cancelled

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_json(self) -> dict:
        return {
            "id": self.id,
            "offered_by_id": self.offered_by_id,
            "message": self.message,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "offered_items": [item.id for item in self.offered_items],
            "requested_items": [item.id for item in self.requested_items],
        }


offer_offered_items = db.Table(
    "offer_offered_items",
    db.Model.metadata,
    db.Column("offer_id", db.Integer, db.ForeignKey("exchange_offers.id")),
    db.Column("item_id", db.Integer, db.ForeignKey("items.id")),
)

offer_requested_items = db.Table(
    "offer_requested_items",
    db.Model.metadata,
    db.Column("offer_id", db.Integer, db.ForeignKey("exchange_offers.id")),
    db.Column("item_id", db.Integer, db.ForeignKey("items.id")),
)


ItemDB.images = db.relationship(
    "ItemImageDB",
    backref="item",
    lazy=True
)

ExchangeOfferDB.offered_items = db.relationship(
    "ItemDB",
    secondary=offer_offered_items,
    backref="offers_made_for"
)

ExchangeOfferDB.requested_items = db.relationship(
    "ItemDB",
    secondary=offer_requested_items,
    backref="offers_requested_for"
)
