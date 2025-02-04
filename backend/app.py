from flask import request, jsonify, make_response
from config import app, db
from auth import (
    user_auth_register,
    user_auth_login,
    user_auth_logout,
    user_auth_validate_session_token,
    user_auth_validate_csrf_token,
)
import re


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
    # Retrieve and sanitise session and CSRF tokens from request
    session_token = re.escape(request.cookies.get("session_token"))
    csrf_token = re.escape(request.headers.get("X-CSRF-TOKEN"))

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
    # Retrieve and sanitise session and CSRF tokens
    session_token = re.escape(request.cookies.get("session_token"))
    csrf_token = re.escape(request.headers.get("X-CSRF-TOKEN"))

    try:
        # Check the validity of session and CSRF tokens
        if await user_auth_validate_session_token(
            session_token
        ) and await user_auth_validate_csrf_token(csrf_token):
            return jsonify({"message": "Token is valid and user is in session"}), 200
    except Exception as e:
        # Return error response if tokens are invalid
        return jsonify({"error": str(e)}), 401


# Entry point to run the Flask app
if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    # Run Flask server in debug mode on port 4000 for local testing
    app.run(host="0.0.0.0", port=4000, debug=True)
