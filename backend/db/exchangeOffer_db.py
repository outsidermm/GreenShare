from datetime import datetime
from backend.config import db


class ExchangeOfferDB(db.Model):
    __tablename__ = "exchange_offers"

    id = db.Column(db.Integer, primary_key=True)

    offered_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    item_id = db.Column(
        db.Integer, db.ForeignKey("items.id"), nullable=False
    )  # the item being requested
    offered_item_id = db.Column(
        db.Integer, db.ForeignKey("items.id"), nullable=True
    )  # optional item in return

    message = db.Column(db.Text, nullable=False)
    status = db.Column(
        db.String(50), default="Pending"
    )  # Pending, Accepted, Rejected, Cancelled

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # New relationships for multiple offered/requested items
    offered_items = db.relationship(
        "ItemDB", secondary="offer_offered_items", backref="offers_made_for"
    )
    requested_items = db.relationship(
        "ItemDB", secondary="offer_requested_items", backref="offers_requested_for"
    )

    def to_json(self) -> dict:
        return {
            "id": self.id,
            "offered_by_id": self.offered_by_id,
            "item_id": self.item_id,
            "offered_item_id": self.offered_item_id,
            "message": self.message,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "offered_items": [item.id for item in self.offered_items],
            "requested_items": [item.id for item in self.requested_items],
        }
