from backend.config import db


# Join table for requested items in offers
class OfferRequestedItem(db.Model):
    __tablename__ = "offer_requested_items"
    id = db.Column(db.Integer, primary_key=True)
    offer_id = db.Column(
        db.Integer, db.ForeignKey("exchange_offers.id"), nullable=False
    )
    item_id = db.Column(db.Integer, db.ForeignKey("items.id"), nullable=False)
