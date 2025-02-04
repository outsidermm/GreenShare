from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from os import environ, getenv

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = environ.get('DATABASE_URL')
# Set secret key for secure sessions and CSRF protection, fetched from environment variables
app.config["SECRET_KEY"] = getenv("SECRET_KEY")
# Enforce secure cookies for sessions
app.config["SESSION_COOKIE_SECURE"] = True  # Ensures cookie is sent only over HTTPS
app.config["SESSION_COOKIE_HTTPONLY"] = (
    True  # Restricts access to cookies from JavaScript
)
app.config["SESSION_COOKIE_SAMESITE"] = (
    "Strict"  # Limits cookie sharing across sites to reduce CSRF risk
)

# Set up Cross-Origin Resource Sharing (CORS) to allow requests from a specific front-end origin
CORS(app, supports_credentials=True, origins="http://127.0.0.1:3000")

db = SQLAlchemy(app)