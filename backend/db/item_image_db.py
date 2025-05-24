from backend.config import db

class ItemImageDB(db.Model):
    __tablename__ = 'item_images'
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('items.id'), nullable=False)
    url = db.Column(db.String, nullable=False)

    item = db.relationship("ItemDB", backref=db.backref("images", lazy=True))
