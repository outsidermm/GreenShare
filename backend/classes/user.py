import hashlib
from cryptography.fernet import Fernet
import secrets
import re
from db.user_db import UserDB
from config import db

user_key = Fernet.generate_key()
user_cipher_suite = Fernet(user_key)


class User:
    """
    Represents a user with attributes for email, name, password, and session management.

    Attributes:
        __session_token (str): Token to manage user's session.
        __csrf_token (str): Token to prevent cross-site request forgery.
    """

    __session_token: str = None
    __csrf_token: str = None
    __user_pk : str = None

    def __init__(self, new_email: str, new_first_name: str, new_last_name: str, new_pwd_input: str):
        """
        Initialises the user with email, name, password, session, and CSRF tokens.

        Args:
            new_email (str): User's email address.
            new_first_name (str): User's first name.
            new_last_name (str): User's last name.
            new_pwd_input (str): Plaintext password to be hashed and encrypted.
        """
        new_user = UserDB(email=new_email, first_name=new_first_name, last_name=new_last_name, password=self.encrypt_pwd(self.hash_pwd(new_pwd_input)))
        
        db.session.add(new_user)
        db.session.commit()
        
        self.set_user_pk(new_user.id)
        self.set_session_token(self.generate_session_token())
        self.set_csrf_token(self.generate_csrf_token())

    def generate_session_token(self) -> str:
        """
        Generates a secure session token for the user.

        Returns:
            str: A URL-safe session token.
        """
        return secrets.token_urlsafe(32)

    def generate_csrf_token(self) -> str:
        """
        Generates a CSRF token by combining the session token and a new secure string.

        Returns:
            str: A URL-safe CSRF token.
        """
        return self.get_session_token() + secrets.token_urlsafe(32)

    def is_valid_session_token(self, session_token: str) -> bool:
        """
        Validates if the provided session token matches the stored session token.

        Args:
            session_token (str): Session token to be validated.

        Returns:
            bool: True if valid, False otherwise.
        """
        return (
            self.get_session_token() is not None
            and re.escape(self.get_session_token()) == session_token
        )

    def is_valid_csrf_token(self, csrf_token: str) -> bool:
        """
        Validates if the provided CSRF token matches the stored CSRF token.

        Args:
            csrf_token (str): CSRF token to be validated.

        Returns:
            bool: True if valid, False otherwise.
        """
        return (
            self.get_csrf_token() is not None
            and re.escape(self.get_csrf_token()) == csrf_token
        )

    def revoke_session_token(self) -> None:
        """Revokes the user's session token by setting it to None."""
        self.set_session_token(None)

    def revoke_csrf_token(self) -> None:
        """Revokes the user's CSRF token by setting it to None."""
        self.set_csrf_token(None)

    def hash_pwd(self, unhashed_pwd: str) -> str:
        """
        Hashes the provided password using SHA-256.

        Args:
            unhashed_pwd (str): Plaintext password.

        Returns:
            str: SHA-256 hash of the password.
        """
        return hashlib.sha256(unhashed_pwd.encode()).hexdigest()

    def encrypt_pwd(self, pwd: str) -> str:
        """
        Encrypts the hashed password using Fernet encryption.

        Args:
            pwd (str): Hashed password.

        Returns:
            str: Encrypted password.
        """
        return user_cipher_suite.encrypt(pwd.encode())

    def decrypt_pwd(self, encrypted_pwd: str) -> str:
        """
        Decrypts the encrypted password.

        Args:
            encrypted_pwd (str): Encrypted password.

        Returns:
            str: Decrypted password.
        """
        return user_cipher_suite.decrypt(encrypted_pwd).decode()

    def verify_pwd(self, pwd_input: str) -> bool:
        """
        Verifies if the input password matches the stored password.

        Args:
            pwd_input (str): Plaintext password to verify.

        Returns:
            bool: True if passwords match, False otherwise.
        """
        encrypted_pwd = UserDB.query.filter_by(id=self.get_user_pk()).first().password
        return self.decrypt_pwd(encrypted_pwd) == self.hash_pwd(
            pwd_input
        )

    def user_data(self) -> dict:
        """
        Retrieves user's core data in dictionary form.

        Returns:
            dict: User data including email, first name, last name, and encrypted password.
        """
        return UserDB.query.filter_by(id=self.get_user_pk()).first().to_json()

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

    def set_user_pk(self, user_pk: str) -> None:
        """
        Sets the user's primary key.

        Args:
            user_pk (str): User's primary key.
        """
        self.__user_pk = user_pk
        
    def get_user_pk(self) -> str:
        """
        Returns the user's primary key.
        """
        return self.__user_pk
    
    def get_first_name(self) -> str:
        """
        Returns the user's first name.
        """
        return UserDB.query.filter_by(id=self.get_user_pk()).first().first_name
    
    def get_last_name(self) -> str:
        """
        Returns the user's last name.
        """
        return UserDB.query.filter_by(id=self.get_user_pk()).first().last_name