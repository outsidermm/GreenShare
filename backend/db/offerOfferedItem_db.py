from backend.config import db


# Join table for offered items in offers
class OfferOfferedItem(db.Model):
    __tablename__ = "offer_offered_items"
    id = db.Column(db.Integer, primary_key=True)
    offer_id = db.Column(
        db.Integer, db.ForeignKey("exchange_offers.id"), nullable=False
    )
    item_id = db.Column(db.Integer, db.ForeignKey("items.id"), nullable=False)
