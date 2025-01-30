from flask import request, jsonify, make_response
from config import app,db
from user_db import User


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    app.run(host="0.0.0.0", port = 4000, debug=True)