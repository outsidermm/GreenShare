"""
Configuration setup for the Flask application, including database connection,
security parameters, and CORS policy for frontend integration.
"""

from os import environ, getenv
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from authlib.integrations.flask_client import OAuth
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)

limiter = Limiter(
    get_remote_address, app=app, default_limits=["1000 per day", "200 per hour"]
)

app.config["SQLALCHEMY_DATABASE_URI"] = environ.get("DATABASE_URL")
# Set secret key for secure sessions and CSRF protection, fetched from environment variables
app.config["SECRET_KEY"] = getenv("SECRET_KEY")
# Enforce secure cookies for sessions
app.config["SESSION_COOKIE_SECURE"] = False  # Ensures cookie is sent only over HTTPS
app.config["SESSION_COOKIE_HTTPONLY"] = (
    True  # Restricts access to cookies from JavaScript
)
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

# Set up Cross-Origin Resource Sharing (CORS) to allow requests from a specific front-end origin
CORS(
    app,
    supports_credentials=True,
    origins=["http://127.0.0.1:3000", "http://nextapp:3000", "http://localhost:3000"],
)

db = SQLAlchemy(app)

oauth = OAuth(app)

google_oauth = oauth.register(
    name="google",
    client_id=environ.get("GOOGLE_OAUTH_CLIENT_ID"),
    client_secret=environ.get("GOOGLE_OAUTH_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    # The URL to fetch the OpenID Connect configuration from Google
    client_kwargs={"scope": "openid email profile"},
)
