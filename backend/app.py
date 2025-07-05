"""
GreenShare Backend Application

This module defines the Flask application routes for the GreenShare platform.
It includes endpoints for user authentication, item management, exchange offers,
and auxiliary services such as autocomplete and item search.
"""

import requests
from urllib.parse import quote
from flask import redirect, request, jsonify, make_response, Response

# Application config and database
from backend.config import app, db, google_oauth, limiter

# Auth-related imports
from backend.auth import (
    user_auth_forgot_pwd,
    user_auth_google_oauth,
    user_auth_register,
    user_auth_login,
    user_auth_logout,
    user_auth_reset_pwd,
    user_auth_validate_session_token,
    user_auth_validate_csrf_token,
)

# Classes
from backend.classes.user import User
from backend.classes.item import Item
from backend.classes.exchange_offer import ExchangeOffer

# Data management
from backend.data import (
    image_upload,
    users,
    items,
    exchange_offers,
    PLACES_API_KEY,
    NEXT_PUBLIC_URL,
)

# Items
from backend.items import (
    search_item_similarity_pg,
    user_create_item,
    user_delete_item,
    user_get_browse_items,
    user_modify_item,
    user_view_item,
)

# Offers
from backend.offers import (
    user_accept_offer,
    user_cancel_offer,
    user_complete_offer,
    user_confirm_offer,
    user_create_offer,
    user_get_offers,
    validate_offer_id,
)

# Utils
from backend.utils import sanitize_input


@app.route("/")
def index() -> str:
    """
    Simple index route to verify the server is running.

    Returns:
        str: A string indicating the index route.
    """
    return "Index route"


# POST API for user registration
@app.route("/auth/register", methods=["POST"])
async def register_user() -> Response:
    """
    Registers a new user with email, password, first name, and last name.

    Extracts user data from request JSON, registers the user, and returns a CSRF token.
    On success, sets a secure session cookie and returns a CSRF token for future requests.

    Returns:
        Response: Flask response with success or error message.
    """
    # Extract user data from request JSON and annotate types
    data: dict = request.json
    email: str = data["email"]
    pwd: str = data["password"]
    first_name: str = data["firstName"]
    last_name: str = data["lastName"]

    try:
        # Register user and retrieve session and CSRF tokens
        session_token: str
        csrf_token: str
        session_token, csrf_token = await user_auth_register(
            email, pwd, first_name, last_name
        )
        # Create a response with CSRF token and set the secure session cookie
        response: Response = make_response(
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
async def login_user() -> Response:
    """
    Authenticates an existing user with email and password.

    Extracts login credentials from request JSON, authenticates user, and returns a CSRF token.
    On success, issues a session cookie and returns a CSRF token.

    Returns:
        Response: Flask response with success or error message.
    """
    # Extract login credentials from request JSON and annotate types
    data: dict = request.json
    email: str = data["email"]
    pwd: str = data["password"]

    try:
        # Authenticate user and obtain session and CSRF tokens
        session_token: str
        csrf_token: str
        session_token, csrf_token = await user_auth_login(email, pwd)
        # Prepare response with CSRF token in JSON and session token as a secure cookie
        response: Response = make_response(
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


@app.route("/auth/logout", methods=["DELETE"])
@limiter.limit("100 per minute;1000 per hour")
async def logout_user() -> Response:
    """
    Logs out the user by invalidating session and CSRF tokens.

    Requires session token from cookies and CSRF token from headers.

    Returns:
        Response: Flask response with success or error message.
    """
    # Retrieve session and CSRF tokens from request
    # Tokens don't need HTML escaping as they're not displayed
    session_token: str = request.cookies.get("session_token")
    csrf_token: str = request.headers.get("X-CSRF-TOKEN")

    try:
        # Invalidate user session and CSRF tokens
        await user_auth_logout(session_token, csrf_token)
        # Clear session cookie and return logout success response
        response: Response = make_response(
            jsonify({"message": "User logged out successfully"}),
            200,
        )
        response.delete_cookie("session_token")
        return response
    except Exception as e:
        # Print unexpected errors to the console and return an error response
        print(f"Unexpected error: {str(e)}")
        return jsonify({"error": str(e)}), 401


@app.route("/auth/validate", methods=["POST"])
@limiter.limit("100 per minute;1000 per hour")
async def validate_token() -> Response:
    """
    Validates both session and CSRF tokens to verify if a user session is active.

    Requires session token from cookies and CSRF token from headers.

    Returns:
        Response: Flask response indicating session validity.
    """
    # Retrieve session and CSRF tokens
    try:
        # Tokens don't need HTML escaping as they're not displayed
        session_token: str = request.cookies.get("session_token")
        csrf_token: str = request.headers.get("X-CSRF-TOKEN")
        # Check the validity of session and CSRF tokens
        if await user_auth_validate_session_token(
            session_token
        ) and await user_auth_validate_csrf_token(csrf_token):
            return jsonify({"message": "Token is valid and user is in session"}), 200
        return jsonify({"message": "user is not in session"}), 200
    except Exception as e:
        # Return error response if tokens are invalid
        return jsonify({"error": str(e)}), 401


@app.route("/auth/forgot_pwd", methods=["POST"])
async def forgot_pwd() -> Response:
    """
    Initiates the password reset process for a user.

    Expects user email in JSON format and returns a success message.

    Returns:
        Response: Flask response with success or error message.
    """
    data: dict = request.json
    email: str = data["email"]

    try:
        # Call the user authentication function to initiate password reset
        await user_auth_forgot_pwd(email)
        return jsonify({"message": "Password reset link sent to your email."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/auth/reset_pwd", methods=["POST"])
@limiter.limit("100 per minute;1000 per hour")
async def reset_pwd() -> Response:
    """
    Resets the user's password.

    Expects user email and new password in JSON format and returns a success message.

    Returns:
        Response: Flask response with success or error message.
    """
    data: dict = request.json
    token: str = data["token"]
    new_password: str = data["newPassword"]

    try:
        # Call the user authentication function to reset the password
        await user_auth_reset_pwd(token, new_password)
        return jsonify({"message": "Password has been successfully reset."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/auth/google/login", methods=["GET"])
@limiter.limit("100 per minute;1000 per hour")
def google_auth_login():
    """
    Initiates Google OAuth 2.0 login by redirecting the user to Google's auth URL.

    Returns:
        Response: Redirect to Google's OAuth 2.0 authorisation page.
    """
    redirect_uri = "http://localhost:4000/auth/google/callback"
    return google_oauth.authorize_redirect(redirect_uri)


@app.route("/auth/google/callback", methods=["GET"])
@limiter.limit("100 per minute;1000 per hour")
async def google_auth_callback() -> Response:
    """
    Handles the callback from Google OAuth authentication.

    This route is called after the user has authenticated with Google.
    It retrieves the user's information and logs them in to the GreenShare platform.

    Returns:
        Response: Flask response with success or error message.
    """
    try:
        token = google_oauth.authorize_access_token()
        userinfo_endpoint = google_oauth.server_metadata["userinfo_endpoint"]
        response = google_oauth.get(userinfo_endpoint)
        user_info = response.json()
        email: str = user_info["email"]
        first_name: str = user_info.get("given_name", "")
        last_name: str = user_info.get("family_name", "")
        session_token, csrf_token = await user_auth_google_oauth(
            email, first_name=first_name, last_name=last_name
        )

        redirect_response = make_response(
            redirect(f"{NEXT_PUBLIC_URL}/login?csrfToken={quote(csrf_token)}")
        )

        redirect_response.set_cookie(
            "session_token",
            session_token,
            httponly=True,
            secure=True,
            samesite="Strict",
        )

        return redirect_response

    except Exception as e:
        return redirect(f"{NEXT_PUBLIC_URL}/login?error={quote(str(e))}")


@app.route("/item/create", methods=["POST"])
@limiter.limit("100 per minute;1000 per hour")
async def create_item() -> Response:
    """
    Creates a new item with the provided details.

    Expects item data in form-data format and returns a success message.

    Returns:
        Response: Flask response with success or error message.
    """
    try:
        # Extract form data and annotate types
        data: dict = request.form
        # Tokens don't need HTML escaping as they're not displayed
        session_token: str = request.cookies.get("session_token")
        csrf_token: str = request.headers.get("X-CSRF-TOKEN")
        # Get raw input data - sanitization happens in user_create_item
        title: str = data["title"]
        description: str = data["description"]
        condition: str = data["condition"]
        location: str = data["location"]
        type_: str = data["type"]
        images_file = request.files.getlist("images")

        if not all([title, description, condition, location, type_]):
            return jsonify({"error": "All fields are required"}), 400

        # Upload each image to Imgur and collect URLs
        image_urls: list = []
        for image in images_file:
            image_url: str = await image_upload(image)
            image_urls.append(image_url)

        # Create a new item using the provided data
        await user_create_item(
            new_title=title,
            new_description=description,
            new_condition=condition,
            new_location=location,
            new_type=type_,
            new_images=image_urls,
            session_token=session_token,
            csrf_token=csrf_token,
        )
        return jsonify({"message": "Item has been successfully created."}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/item", methods=["GET"])
@limiter.limit("100 per minute;1000 per hour")
async def get_browse_items() -> Response:
    """
    Retrieves items from the database with optional filters:
    - category: filter by category
    - condition: filter by condition
    - type: filter by type
    - title: filter by title
    - id: retrieve a single item by ID

    Returns:
        Response: Single item (if id provided) or list of filtered items.
    """
    # Get filter parameters from query string and annotate types
    category: str = request.args.get("category")
    condition: str = request.args.get("condition")
    type_: str = request.args.get("type")
    title: str = request.args.get("title")
    item_id: str = request.args.get("id")

    try:
        filtered_items: dict = await user_get_browse_items(
            category, condition, type_, title, item_id
        )
        return jsonify([item.to_dict() for item in filtered_items.values()]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/item/userview", methods=["GET"])
@limiter.limit("100 per minute;1000 per hour")
async def get_user_items() -> Response:
    """
    Retrieves all items created by the user.

    Returns:
        Response: List of items created by the user.
    """
    # Retrieve session and CSRF tokens and sanitise
    session_token: str = request.cookies.get("session_token")
    csrf_token: str = request.headers.get("X-CSRF-TOKEN")

    try:
        user_items: list = await user_view_item(session_token, csrf_token)
        return jsonify([item.to_dict() for item in user_items]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/item/edit", methods=["POST"])
@limiter.limit("100 per minute;1000 per hour")
async def edit_item() -> Response:
    """
    Edits an existing item with the provided details.

    Expects item data in form-data format and returns a success message.

    Returns:
        Response: Flask response with success or error message.
    """
    try:
        data: dict = request.form
        session_token: str = request.cookies.get("session_token")
        csrf_token: str = request.headers.get("X-CSRF-TOKEN")
        # Get raw input data - sanitization happens in user_create_item
        item_id: str = data["id"]
        title: str = data["title"]
        description: str = data["description"]
        condition: str = data["condition"]
        location: str = data["location"]
        type_: str = data["type"]
        images_file = request.files.getlist("images")

        # Upload each image to Imgur and collect URLs
        image_urls: list = []
        for image in images_file:
            image_url: str = await image_upload(image)
            image_urls.append(image_url)

        await user_modify_item(
            item_id=item_id,
            new_title=title,
            new_description=description,
            new_condition=condition,
            new_location=location,
            new_type=type_,
            session_token=session_token,
            csrf_token=csrf_token,
            new_images=image_urls,
        )
        return jsonify({"message": "Item has been successfully edited."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/item/delete", methods=["DELETE"])
@limiter.limit("100 per minute;1000 per hour")
async def delete_item() -> Response:
    """
    Deletes an existing item based on the provided item ID.

    Expects item ID in JSON format and returns a success message.

    Returns:
        Response: Flask response with success or error message.
    """
    try:
        data: dict = request.json
        session_token: str = request.cookies.get("session_token")
        csrf_token: str = request.headers.get("X-CSRF-TOKEN")
        item_id: str = data["id"]

        await user_delete_item(
            item_id=item_id,
            session_token=session_token,
            csrf_token=csrf_token,
        )
        return jsonify({"message": "Item has been successfully deleted."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/offer/create", methods=["POST"])
@limiter.limit("100 per minute;1000 per hour")
async def create_exchange_offer() -> Response:
    """
    Creates a new exchange offer with the provided details.

    Expects offer data in JSON format and returns a success message.

    Returns:
        Response: Flask response with success or error message.
    """
    try:
        data: dict = request.json
        session_token: str = request.cookies.get("session_token")
        csrf_token: str = request.headers.get("X-CSRF-TOKEN")
        offered_item_ids: list = data["offeredItemIds"]
        requested_item_id: str = data["requestedItemId"]
        message: str = data["message"]

        await user_create_offer(
            session_token,
            csrf_token,
            offered_item_ids,
            requested_item_id,
            message,
        )
        return (
            jsonify({"message": "Exchange offer has been successfully created."}),
            201,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/offer/userview", methods=["GET"])
@limiter.limit("100 per minute;1000 per hour")
async def view_exchange_offers() -> Response:
    """
    Retrieves all exchange offers from the database for the user.

    Returns:
        Response: List of exchange offers.
    """
    session_token: str = request.cookies.get("session_token")
    csrf_token: str = request.headers.get("X-CSRF-TOKEN")

    try:
        outgoing_offers, incoming_offers = await user_get_offers(
            session_token, csrf_token
        )
        outgoing_offers_dict: list = [offer.to_json() for offer in outgoing_offers]
        incoming_offers_dict: list = [offer.to_json() for offer in incoming_offers]
        return (
            jsonify(
                {
                    "outgoingOffers": outgoing_offers_dict,
                    "incomingOffers": incoming_offers_dict,
                }
            ),
            200,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/offer/accept", methods=["POST"])
@limiter.limit("100 per minute;1000 per hour")
async def accept_exchange_offer() -> Response:
    """
    Accepts an exchange offer based on the provided offer ID.

    Expects offer ID in JSON format and returns a success message.

    Returns:
        Response: Flask response with success or error message.
    """
    data: dict = request.json
    offer_id: int = data["offerId"]
    session_token: str = request.cookies.get("session_token")
    csrf_token: str = request.headers.get("X-CSRF-TOKEN")

    try:
        await user_accept_offer(
            session_token,
            csrf_token,
            offer_id,
        )
        return jsonify({"message": "Offer accepted successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/offer/exchange_complete", methods=["POST"])
@limiter.limit("100 per minute;1000 per hour")
async def complete_exchange_offer() -> Response:
    """
    Completes an exchange offer based on the provided offer ID.

    Expects offer ID in JSON format and returns a success message.

    Returns:
        Response: Flask response with success or error message.
    """
    data: dict = request.json
    offer_id: int = data["offerId"]
    session_token: str = request.cookies.get("session_token")
    csrf_token: str = request.headers.get("X-CSRF-TOKEN")

    try:
        await user_complete_offer(
            session_token,
            csrf_token,
            offer_id,
        )
        return jsonify({"message": "Offer completed successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/offer/exchange_confirmed", methods=["POST"])
@limiter.limit("100 per minute;1000 per hour")
async def confirm_exchange_offer() -> Response:
    """
    Confirms an exchange offer based on the provided offer ID.

    Expects offer ID in JSON format and returns a success message.

    Returns:
        Response: Flask response with success or error message.
    """
    data: dict = request.json
    offer_id: int = data["offerId"]
    session_token: str = request.cookies.get("session_token")
    csrf_token: str = request.headers.get("X-CSRF-TOKEN")

    try:
        await user_confirm_offer(
            session_token,
            csrf_token,
            offer_id,
        )
        return jsonify({"message": "Offer completion confirmed successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/offer/details", methods=["GET"])
@limiter.limit("100 per minute;1000 per hour")
async def get_offer_details() -> Response:
    """
    Retrieves details of a specific exchange offer based on the provided offer ID.

    Expects offer ID as a query parameter and returns the offer details.

    Returns:
        Response: Flask response with offer details or error message.
    """
    offer_id: str = request.args.get("offerId")

    if not offer_id:
        return jsonify({"error": "Offer ID is required"}), 400

    try:
        if not offer_id.isdigit():
            raise ValueError("Offer ID must be an integer.")
        offer_id_int: int = int(offer_id)

        validate_offer_id(offer_id_int)

        offer = exchange_offers[offer_id_int]
        return jsonify(offer.to_json()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/offer/cancel", methods=["POST"])
@limiter.limit("100 per minute;1000 per hour")
async def cancel_exchange_offer() -> Response:
    """
    Cancels an exchange offer based on the provided offer ID.

    Expects offer ID in JSON format and returns a success message.

    Returns:
        Response: Flask response with success or error message.
    """
    data: dict = request.json
    session_token: str = request.cookies.get("session_token")
    csrf_token: str = request.headers.get("X-CSRF-TOKEN")
    message: str = data["message"]
    offer_id: str = data["offerId"]

    try:
        await user_cancel_offer(
            session_token,
            csrf_token,
            offer_id,
            message,
        )
        return jsonify({"message": "Offer cancelled successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/autocomplete", methods=["POST"])
async def address_autocomplete() -> Response:
    """
    Provides address autocomplete suggestions using Google Places API.

    Expects input in JSON format and returns autocomplete predictions.

    Returns:
        Response: Flask response with autocomplete predictions.
    """
    data: dict = request.json
    # Sanitize input for API request
    user_input: str = sanitize_input(data["input"])

    google_url: str = "https://maps.googleapis.com/maps/api/place/autocomplete/json"
    params: dict = {
        "input": user_input,
        "types": "address",
        "key": PLACES_API_KEY,
    }

    response = requests.get(google_url, params=params, timeout=10)
    return jsonify(response.json())


@app.route("/api/item_search", methods=["POST"])
@limiter.limit("100 per minute;1000 per hour")
async def search_items() -> Response:
    """
    Searches for items based on the provided search term.

    Expects search term in JSON format and returns a list of matching items.

    Returns:
        Response: Flask response with matching item predictions.
    """
    data: dict = request.json
    search: str = sanitize_input(data["input"])
    try:
        recommendation_list: list = await search_item_similarity_pg(search)
        return jsonify({"predictions": recommendation_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Entry point to run the Flask app
#
# The following block creates all database tables and loads users/items/offers
# from backup, then runs the Flask development server.

# Entry point to run the Flask app
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        users.update(User.backup())  # Load users from the database
        items.update(Item.backup())
        exchange_offers.update(ExchangeOffer.backup())

    # Run Flask server in production mode on port 4000 for local testing
    app.run(host="0.0.0.0", port=4000)
