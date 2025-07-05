"""
This module defines the User class responsible for managing user-related operations
such as registration, authentication, session handling, CSRF protection, and
encrypted password management. It interfaces with the UserDB SQLAlchemy model
to persist user information and provides methods for secure user interaction.
"""

import hashlib
import os
import secrets
from cryptography.fernet import Fernet
from backend.models import UserDB
from backend.config import db
from backend.utils import sanitize_input, unsanitize_output

# Initialize Fernet encryption suite with user key from environment variables
user_key: str = os.getenv("USER_FERNET_KEY")
user_cipher_suite: Fernet = Fernet(user_key)


class User:
    """
    Represents a user with attributes for email, name, password, and session management.

    Attributes:
        __session_token (str): Token to manage user's session.
        __csrf_token (str): Token to prevent cross-site request forgery.
        __user_pk (int): Primary key of the user in the database.
        __is_google_oauth (bool): Flag indicating if the user registered via Google OAuth.
    """

    __session_token: str = None
    __csrf_token: str = None
    __user_pk: int = None
    __is_google_oauth: bool = False

    def __init__(
        self,
        new_email: str,
        new_first_name: str,
        new_last_name: str,
        new_pwd_input: str,
        is_google_oauth: bool = False,
    ):
        """
        Initialises the user with email, name, password, session, and CSRF tokens.

        Args:
            new_email (str): User's email address.
            new_first_name (str): User's first name.
            new_last_name (str): User's last name.
            new_pwd_input (str): Plaintext password to be hashed and encrypted.
        """
        
        new_user:UserDB = None
        
        # Create a new user database entry with encrypted password
        if is_google_oauth:
            new_user: UserDB = UserDB(
            email=new_email,
            first_name=new_first_name,
            last_name=new_last_name,
            )
        else:
            new_user: UserDB = UserDB(
            email=new_email,
            first_name=new_first_name,
            last_name=new_last_name,
            password=self.encrypt_pwd(self.hash_pwd(new_pwd_input)),
        )

        db.session.add(new_user)
        db.session.commit()

        # Set internal user primary key and generate tokens
        self.set_user_pk(new_user.id)
        self.set_is_google_oauth(is_google_oauth)
        self.set_session_token(self.generate_session_token())
        self.set_csrf_token(self.generate_csrf_token())

    @classmethod
    def backup(cls) -> dict[str, "User"]:
        """
        Return a dictionary of existing users from UserDB.

        Returns:
            dict[str, User]: Dictionary mapping user emails to User instances.
        """
        user_record = db.session.get(UserDB, {}).all()
        if not user_record:
            return {}

        user_dict: dict[str, User] = {}
        # Recreate User instances for each user record without re-adding to DB
        for user in user_record:
            user_obj: User = cls.__new__(cls)
            user_obj.set_user_pk(user.id)
            user_obj.set_session_token(user_obj.generate_session_token())
            user_obj.set_csrf_token(user_obj.generate_csrf_token())
            user_dict[user.email] = user_obj

        return user_dict

    def generate_session_token(self) -> str:
        """
        Generates a secure session token for the user.

        Returns:
            str: A URL-safe session token.
        """
        # Generate a random URL-safe token of 32 bytes
        return secrets.token_urlsafe(32)

    def generate_csrf_token(self) -> str:
        """
        Generates a CSRF token by combining the session token and a new secure string.

        Returns:
            str: A URL-safe CSRF token.
        """
        # Combine session token with a new random token for CSRF protection
        return self.get_session_token() + secrets.token_urlsafe(32)

    def is_valid_session_token(self, session_token: str) -> bool:
        """
        Validates if the provided session token matches the stored session token.

        Args:
            session_token (str): Session token to be validated.

        Returns:
            bool: True if valid, False otherwise.
        """
        # Check if current session token matches sanitized input token
        return (
            self.get_session_token() is not None
            and sanitize_input(self.get_session_token()) == session_token
        )

    def is_valid_csrf_token(self, csrf_token: str) -> bool:
        """
        Validates if the provided CSRF token matches the stored CSRF token.

        Args:
            csrf_token (str): CSRF token to be validated.

        Returns:
            bool: True if valid, False otherwise.
        """
        # Check if current CSRF token matches sanitized input token
        return (
            self.get_csrf_token() is not None
            and sanitize_input(self.get_csrf_token()) == csrf_token
        )

    def revoke_session_token(self) -> None:
        """
        Revokes the user's session token by setting it to None.
        """
        self.set_session_token(None)

    def revoke_csrf_token(self) -> None:
        """
        Revokes the user's CSRF token by setting it to None.
        """
        self.set_csrf_token(None)

    def hash_pwd(self, unhashed_pwd: str) -> str:
        """
        Hashes the provided password using SHA-256.

        Args:
            unhashed_pwd (str): Plaintext password.

        Returns:
            str: SHA-256 hash of the password.
        """
        # Return SHA-256 hash hex digest of password string
        return hashlib.sha256(unhashed_pwd.encode()).hexdigest()

    def encrypt_pwd(self, pwd: str) -> str:
        """
        Encrypts the hashed password using Fernet encryption.

        Args:
            pwd (str): Hashed password.

        Returns:
            str: Encrypted password.
        """
        # Encrypt password bytes and return as bytes
        return user_cipher_suite.encrypt(pwd.encode())

    def decrypt_pwd(self, encrypted_pwd: str) -> str:
        """
        Decrypts the encrypted password.

        Args:
            encrypted_pwd (str): Encrypted password.

        Returns:
            str: Decrypted password.
        """
        # Decrypt encrypted password bytes and decode to string
        return user_cipher_suite.decrypt(encrypted_pwd).decode()

    def verify_pwd(self, pwd_input: str) -> bool:
        """
        Verifies if the input password matches the stored password.

        Args:
            pwd_input (str): Plaintext password to verify.

        Returns:
            bool: True if passwords match, False otherwise.
        """
        # Retrieve encrypted password from DB and compare after decryption and hashing
        encrypted_pwd: str = db.session.get(UserDB, self.get_user_pk()).password
        return self.decrypt_pwd(encrypted_pwd) == self.hash_pwd(pwd_input)

    def user_data(self) -> dict:
        """
        Retrieves user's core data in dictionary form.

        Returns:
            dict: User data including email, first name, last name, and encrypted password.
        """
        # Return JSON representation of user from DB
        return db.session.get(UserDB, self.get_user_pk()).to_json()

    # Getters and Setters for encapsulated fields

    def set_session_token(self, session_token: str) -> None:
        """
        Sets the session token for the user.

        Args:
            session_token (str): Session token.
        """
        self.__session_token = session_token

    def get_session_token(self) -> str:
        """
        Returns the session token.

        Returns:
            str: Session token.
        """
        return self.__session_token

    def set_csrf_token(self, csrf_token: str) -> None:
        """
        Sets the CSRF token.

        Args:
            csrf_token (str): CSRF token.
        """
        self.__csrf_token = csrf_token

    def get_csrf_token(self) -> str:
        """
        Returns the CSRF token.

        Returns:
            str: CSRF token.
        """
        return self.__csrf_token

    def set_user_pk(self, user_pk: int) -> None:
        """
        Sets the user's primary key.

        Args:
            user_pk (int): User's primary key.
        """
        self.__user_pk = user_pk

    def get_user_pk(self) -> int:
        """
        Returns the user's primary key.

        Returns:
            int: User's primary key.
        """
        return self.__user_pk

    def get_first_name(self) -> str:
        """
        Returns the user's first name.

        Returns:
            str: User's first name.
        """
        first_name = db.session.get(UserDB, self.get_user_pk()).first_name
        return unsanitize_output(first_name)

    def get_last_name(self) -> str:
        """
        Returns the user's last name.

        Returns:
            str: User's last name.
        """
        last_name = db.session.get(UserDB, self.get_user_pk()).last_name
        return unsanitize_output(last_name)

    def get_email(self) -> str:
        """
        Returns the user's email.

        Returns:
            str: User's email.
        """
        return db.session.get(UserDB, self.get_user_pk()).email

    def set_password(self, new_pwd: str) -> None:
        """
        Sets the user's password.

        Args:
            new_pwd (str): New encrypted password to set.
        """
        db.session.get(UserDB, self.get_user_pk()).password = self.encrypt_pwd(
            self.hash_pwd(new_pwd)
        )
        db.session.commit()

    def set_is_google_oauth(self, is_google_oauth: bool) -> None:
        """
        Sets the user's Google OAuth registration status.

        Args:
            is_google_oauth (bool): True if registered via Google OAuth, False otherwise.
        """
        self.__is_google_oauth = is_google_oauth
    
    def is_google_oauth(self) -> bool:
        """        Checks if the user registered via Google OAuth.
        Returns:
            bool: True if registered via Google OAuth, False otherwise.
        """
        return self.__is_google_oauth