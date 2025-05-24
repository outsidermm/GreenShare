from datetime import datetime
from backend.config import db


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

    offers = db.relationship(
        "backend.db.exchangeOffer_db.ExchangeOfferDB",
        backref="item",
        foreign_keys="ExchangeOfferDB.item_id",
    )

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
