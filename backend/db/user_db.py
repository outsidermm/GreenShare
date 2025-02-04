from config import db

class UserDB(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(512), nullable=False)
    password = db.Column(db.String(512), nullable=False)
    
    def to_json(self) -> dict:
        return {"id": self.id, "name": self.name, "email": self.email, "password": self.password}