from flask import request, jsonify, make_response
from backend.config import app, db
from backend.auth import (
    user_auth_register,
    user_auth_login,
    user_auth_logout,
    user_auth_validate_session_token,
    user_auth_validate_csrf_token,
)
from backend.classes.user import User
from backend.classes.item import Item
from backend.classes.exchange_offer import ExchangeOffer
import re
from backend.items import user_create_item, user_get_browse_items
from backend.data import users, items, exchange_offers
import os, requests
from backend.utils import sanitize_input

PLACES_API_KEY = os.getenv("PLACES_API_KEY")
IMGUR_CLIENT_ID = os.getenv("IMGUR_CLIENT_ID")


@app.route("/")
def index():
    """Simple index route to verify the server is running."""
    return "Index route"


# POST API for user registration
@app.route("/auth/register", methods=["POST"])
async def register_user():
    """
    Registers a new user with email, password, first name, and last name.

    On success, sets a secure session cookie and returns a CSRF token for future requests.
    """
    # Extract user data from request JSON
    data = request.json
    email = data["email"]
    pwd = data["password"]
    first_name = data["firstName"]
    last_name = data["lastName"]

    try:
        # Register user and retrieve session and CSRF tokens
        session_token, csrf_token = await user_auth_register(
            email, pwd, first_name, last_name
        )

        # Create a response with CSRF token and set the secure session cookie
        response = make_response(
            jsonify(
                {
                    "message": "User registered successfully",
                    "csrf_token": csrf_token,
                }
            ),
            201,
        )
        # Set session token as a secure, HTTP-only cookie
        response.set_cookie(
            "session_token",
            session_token,
            httponly=True,
            samesite="Strict",
            secure=True,
        )
        return response
    except Exception as e:
        # Print unexpected errors to the console and return an error response
        print(f"Unexpected error: {str(e)}")
        return jsonify({"error": str(e)}), 406


# POST API for user login
@app.route("/auth/login", methods=["POST"])
async def login_user():
    """
    Authenticates an existing user with email and password.

    On success, issues a session cookie and returns a CSRF token.
    """
    # Extract login credentials from request JSON
    data = request.json
    email = data["email"]
    pwd = data["password"]

    try:
        # Authenticate user and obtain session and CSRF tokens
        session_token, csrf_token = await user_auth_login(email, pwd)

        # Prepare response with CSRF token in JSON and session token as a secure cookie
        response = make_response(
            jsonify(
                {
                    "message": "User logged in successfully",
                    "csrf_token": csrf_token,
                }
            ),
            201,
        )
        # Set session token as a secure, HTTP-only cookie
        response.set_cookie(
            "session_token",
            session_token,
            httponly=True,
            samesite="Strict",
            secure=True,
        )
        return response
    except Exception as e:
        # Print any login errors to the console and return an error response
        print(f"Unexpected error: {str(e)}")
        return jsonify({"error": str(e)}), 401


# DELETE API for user logout
@app.route("/auth/logout", methods=["DELETE"])
async def logout_user():
    """
    Logs out the user by invalidating session and CSRF tokens.

    Requires session token from cookies and CSRF token from headers.
    """
    # Retrieve session and CSRF tokens from request
    # Tokens don't need HTML escaping as they're not displayed
    session_token = request.cookies.get("session_token")
    csrf_token = request.headers.get("X-CSRF-TOKEN")

    try:
        # Invalidate user session and CSRF tokens
        await user_auth_logout(session_token, csrf_token)

        # Clear session cookie and return logout success response
        response = make_response(
            jsonify({"message": "User logged out successfully"}),
            200,
        )
        response.delete_cookie("session_token")
        return response
    except Exception as e:
        # Print unexpected errors to the console and return an error response
        print(f"Unexpected error: {str(e)}")
        return jsonify({"error": str(e)}), 401


# POST API to validate tokens for active session verification
@app.route("/auth/validate", methods=["POST"])
async def validate_token():
    """
    Validates both session and CSRF tokens to verify if a user session is active.

    Requires session token from cookies and CSRF token from headers.
    """
    # Retrieve session and CSRF tokens
    try:
        # Tokens don't need HTML escaping as they're not displayed
        session_token = request.cookies.get("session_token")
        csrf_token = request.headers.get("X-CSRF-TOKEN")
        # Check the validity of session and CSRF tokens
        if await user_auth_validate_session_token(
            session_token
        ) and await user_auth_validate_csrf_token(csrf_token):
            return jsonify({"message": "Token is valid and user is in session"}), 200
    except Exception as e:
        # Return error response if tokens are invalid
        return jsonify({"error": str(e)}), 401


@app.route("/item/create", methods=["POST"])
async def create_item():
    """
    Creates a new item with the provided details.

    Expects item data in JSON format and returns the created item ID.
    """
    try:
        data = request.form
        # Tokens don't need HTML escaping as they're not displayed
        session_token = request.cookies.get("session_token")
        csrf_token = request.headers.get("X-CSRF-TOKEN")
        # Get raw input data - sanitization happens in user_create_item
        title = data["title"]
        description = data["description"]
        condition = data["condition"]
        location = data["location"]
        type = data["type"]
        images_file = request.files.getlist("images")

        if not all([title, description, condition, location, type]):
            return jsonify({"error": "All fields are required"}), 400

        headers = {"Authorization": f"Client-ID {IMGUR_CLIENT_ID}"}

        # Upload each image to Imgur and collect URLs
        image_urls = []
        for file in images_file:
            upload_response = requests.post(
                "https://api.imgur.com/3/image",
                headers=headers,
                files={"image": file.read()},
            )
            if upload_response.status_code == 200:
                image_urls.append(upload_response.json()["data"]["link"])
                print(f"Image uploaded successfully: {image_urls[-1]}")
            else:
                return jsonify({"error": "Failed to upload image to Imgur"}), 500

        # Create a new item using the provided data
        await user_create_item(
            new_title=title,
            new_description=description,
            new_condition=condition,
            new_location=location,
            new_type=type,
            new_images=image_urls,
            session_token=session_token,
            csrf_token=csrf_token,
        )
        return jsonify({"message": "Item has been successfully created."}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# Unified GET /item route with optional filters
@app.route("/items", methods=["GET"])
async def get_browse_items():
    """
    Retrieves items from the database with optional filters:
    - category: filter by category
    - condition: filter by condition
    - location: filter by location
    - type: filter by type
    - title: filter by title
    - id: retrieve a single item by ID
    - user_id: filter by user ID

    Returns:
        Single item (if id provided) or list of filtered items.
    """
    category = request.args.get("category")
    condition = request.args.get("condition")
    location = request.args.get("location")
    type = request.args.get("type")
    title = request.args.get("title")
    item_id = request.args.get("id")
    user_id = request.args.get("user_id")

    try:
        filtered_items = await user_get_browse_items(
            category, condition, location, type, title, item_id, user_id
        )
        return jsonify([item.to_dict() for key, item in filtered_items.items()]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/autocomplete", methods=["POST"])
async def address_autocomplete():
    data = request.json
    # Sanitize input for API request
    input = sanitize_input(data["input"])

    google_url = "https://maps.googleapis.com/maps/api/place/autocomplete/json"
    params = {
        "input": input,
        "types": "address",
        "key": PLACES_API_KEY,
    }

    response = requests.get(google_url, params=params)
    return jsonify(response.json())


# Entry point to run the Flask app
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        users.update(User.backup())  # Load users from the database
        items.update(Item.backup())
        exchange_offers.update(ExchangeOffer.backup())

    # Run Flask server in debug mode on port 4000 for local testing
    app.run(host="0.0.0.0", port=4000, debug=True)
