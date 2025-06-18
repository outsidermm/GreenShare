"""
This module provides functions for managing exchange offers in the GreenShare platform.
It handles creation, retrieval, status updates (acceptance, completion, confirmation, cancellation),
and access control for user-submitted exchange offers.
"""

from typing import Tuple

from flask import abort
from backend.utils import validate_string_length
from backend.auth import validate_user_id
from backend.data import items, exchange_offers
from backend.data import admin_retrieve_user_id
from backend.classes.exchange_offer import ExchangeOffer


def validate_offer_id(offer_id: int) -> None:
    """
    Validates that the given offer_id exists in the exchange_offers dictionary.
    If not found, aborts with a 404 error.

    Args:
        offer_id (int): The ID of the offer to validate.

    Raises:
        404 Error: If the offer_id does not exist in exchange_offers.
    """
    if offer_id not in exchange_offers:
        abort(404, f"Offer with ID {offer_id} does not exist.")


async def user_create_offer(
    session_token: str,
    csrf_token: str,
    offered_item_ids: list[int],
    requested_item_id: int,
    message: str,
) -> ExchangeOffer:
    """
    Creates a new exchange offer by a user.

    Parameters:
        session_token (str): The session token of the user.
        csrf_token (str): The CSRF token for security.
        offered_item_ids (list[int]): List of item IDs offered in exchange.
        requested_item_id (int): The ID of the requested item.
        message (str): Message from the user regarding the offer.

    Returns:
        ExchangeOffer: The newly created exchange offer.

    Raises:
        400 Error: If the request is invalid, such as missing required fields or invalid item IDs.
        404 Error: If the requested or offered items do not exist.
        403 Error: If the user is not authorized to create the offer.
        500 Error: If there is an internal server error while creating the offer.
    """
    # Authenticate and validate user
    new_offered_by_id: int = admin_retrieve_user_id(session_token, csrf_token)
    validate_user_id(new_offered_by_id)

    # Validate requested item existence
    requested_item_id = int(requested_item_id)
    if requested_item_id not in items:
        abort(404, f"Requested item with ID {requested_item_id} does not exist.")

    # Validate offer requirements based on item type
    if items[requested_item_id].get_type() == "exchange" and not offered_item_ids:
        abort(400, "You must offer at least one item in exchange for this item.")

    # Validate each offered item
    for offered_item_id in offered_item_ids:
        if offered_item_id not in items:
            abort(404, f"Offered item with ID {offered_item_id} does not exist.")

        if offered_item_id == requested_item_id:
            abort(400, "Offered item cannot be the same as the requested item.")

    # Check availability and ownership constraints
    if items[requested_item_id].get_status() != "available":
        abort(400, "Requested item is not available for exchange.")

    if items[requested_item_id].get_user_id() == new_offered_by_id:
        abort(400, "You cannot exchange your own item.")

    if items[requested_item_id].get_type() == "free" and offered_item_ids:
        abort(400, "This item is free, you cannot offer items in exchange.")

    # Validate message length and format
    new_message: str = validate_string_length(message, "Message", 10, 1000)

    # Create and store new offer
    try:
        new_offer: ExchangeOffer = ExchangeOffer(
            offered_by_id=new_offered_by_id,
            requested_item_id=requested_item_id,
            message=new_message,
            offered_item_ids=offered_item_ids,
        )
        exchange_offers[new_offer.get_offer_pk()] = new_offer
        return new_offer
    except Exception as e:
        abort(500, f"Failed to create a offer: {str(e)}")


async def user_get_offers(
    session_token: str, csrf_token: str
) -> Tuple[list[ExchangeOffer], list[ExchangeOffer]]:
    """
    Retrieves outgoing and incoming exchange offers for the authenticated user.

    Parameters:
    session_token (str): The session token of the user.
    csrf_token (str): The CSRF token for security.
    Returns:
    Tuple[list[ExchangeOffer], list[ExchangeOffer]]: A tuple containing two lists:
        - Outgoing offers made by the user.
        - Incoming offers for the user's items.
    """
    # Authenticate and validate user
    new_user_id: int = admin_retrieve_user_id(session_token, csrf_token)
    validate_user_id(new_user_id)

    outgoing_offers: list[ExchangeOffer] = []
    incoming_offers: list[ExchangeOffer] = []

    # Separate offers into outgoing and incoming based on user ID
    for offer in exchange_offers.values():
        if offer.get_offered_by_id() == new_user_id:
            outgoing_offers.append(offer)
        elif (
            offer.get_requested_item_id() in items
            and items[offer.get_requested_item_id()].get_user_id() == new_user_id
        ):
            incoming_offers.append(offer)

    return outgoing_offers, incoming_offers


async def user_accept_offer(session_token: str, csrf_token: str, offer_id: int) -> None:
    """
    Allows the owner of the requested item to accept an exchange offer.

    Args:
        session_token (str): The session token of the user.
        csrf_token (str): The CSRF token for security.
        offer_id (int): The ID of the offer to accept.

    Returns:
        None

    Raises:
        400 Error: If the offer is not in a pending state or if another offer has already been accepted or confirmed for the requested item.
        403 Error: If the user is not authorized to accept the offer.
        404 Error: If the requested item does not exist or if the offered items do not exist.
        500 Error: If there is an internal server error while accepting the offer.
    """
    # Authenticate and validate user
    new_user_id: int = admin_retrieve_user_id(session_token, csrf_token)
    validate_user_id(new_user_id)
    validate_offer_id(offer_id)

    offer: ExchangeOffer = exchange_offers[offer_id]

    # Check if another offer has already been accepted or confirmed for the requested item
    for existing_offer in exchange_offers.values():
        if (
            existing_offer.get_requested_item_id() == offer.get_requested_item_id()
            and existing_offer.get_status() in ["accepted", "confirmed", "completed"]
            and existing_offer.get_offer_pk() != offer.get_offer_pk()
        ):
            abort(
                400,
                "Another offer has already been accepted or confirmed for this item.",
            )

    # Validate requested item existence
    if offer.get_requested_item_id() not in items:
        await user_cancel_offer(session_token, csrf_token, offer_id)
        abort(404, "Requested item does not exist.")

    # Verify user authorization to accept the offer
    if items[offer.get_requested_item_id()].get_user_id() != new_user_id:
        abort(403, "You are not authorised to accept this offer.")

    # Check offer status
    if offer.get_status() != "pending":
        abort(400, "Offer is not in a pending state.")

    # Validate existence of all offered items
    for offered_item_id in offer.get_offered_items():
        if offered_item_id not in items:
            await user_cancel_offer(session_token, csrf_token, offer_id)
            abort(404, f"Offered item with ID {offered_item_id} does not exist.")

    # Update offer status to accepted
    offer.set_status("accepted")


async def user_complete_offer(
    session_token: str, csrf_token: str, offer_id: int
) -> None:
    """
    Allows the user who made the offer to mark it as completed.

    Args:
        session_token (str): The session token of the user.
        csrf_token (str): The CSRF token for security.
        offer_id (int): The ID of the offer to complete.

    Returns:
        None

    Raises:
        400 Error: If the offer is not in an accepted state or has already been completed.
        403 Error: If the user is not authorized to complete the offer.
        404 Error: If the requested item does not exist.
        500 Error: If there is an internal server error while completing the offer.
    """
    # Authenticate and validate user
    new_user_id: int = admin_retrieve_user_id(session_token, csrf_token)
    validate_user_id(new_user_id)
    validate_offer_id(offer_id)

    offer: ExchangeOffer = exchange_offers[offer_id]

    # Validate requested item existence
    if offer.get_requested_item_id() not in items:
        abort(404, "Requested item does not exist.")

    # Verify user authorization to complete the offer
    if offer.get_offered_by_id() != new_user_id:
        abort(403, "You are not authorised to complete this offer.")

    # Check offer status for completion
    if offer.get_status() != "accepted":
        if offer.get_status() == "completed":
            abort(400, "Offer has already been completed.")
        abort(400, "Offer is not in an accepted state.")

    # Update offer status to completed
    offer.set_status("completed")


async def user_confirm_offer(
    session_token: str, csrf_token: str, offer_id: int
) -> None:
    """
    Allows the owner of the requested item to confirm a completed offer.

    Args:
        session_token (str): The session token of the user.
        csrf_token (str): The CSRF token for security.
        offer_id (int): The ID of the offer to confirm.

    Returns:
        None

    Raises:
        400 Error: If the offer is not in a completed state or has already been confirmed.
        403 Error: If the user is not authorized to confirm the offer.
        404 Error: If the requested item does not exist or if the offered items do not exist.
        500 Error: If there is an internal server error while confirming the offer.
    """
    # Authenticate and validate user
    new_user_id: int = admin_retrieve_user_id(session_token, csrf_token)
    validate_user_id(new_user_id)
    validate_offer_id(offer_id)

    offer: ExchangeOffer = exchange_offers[offer_id]

    # Verify user authorization to confirm the offer
    if items[offer.get_requested_item_id()].get_user_id() != new_user_id:
        abort(403, "You are not authorised to confirm this offer.")

    # Check offer status for confirmation
    if offer.get_status() != "completed":
        if offer.get_status() == "confirmed":
            abort(400, "Offer has already been confirmed.")
        abort(400, "Offer is not in a completed state.")

    # Update offer status to confirmed
    offer.set_status("confirmed")

    # Update status of requested item to 'offer_complete'
    items[offer.get_requested_item_id()].set_status("exchanged")

    # Update status of all offered items to 'offer_complete'
    for offered_item_id in offer.get_offered_items():
        if offered_item_id in items:
            items[offered_item_id].set_status("exchanged")


async def user_get_offer_details(
    session_token: str, csrf_token: str, offer_id: int
) -> dict:
    """
    Retrieves the details of a specific exchange offer for the authenticated user.

    Args:
        session_token (str): The session token of the user.
        csrf_token (str): The CSRF token for security.
        offer_id (int): The ID of the offer to retrieve.

    Returns:
        dict: The JSON representation of the offer.

    Raises:
        403 Error: If the user is not authorized to view the offer.
    """
    # Authenticate and validate user
    new_user_id: int = admin_retrieve_user_id(session_token, csrf_token)
    validate_user_id(new_user_id)
    validate_offer_id(offer_id)

    offer: ExchangeOffer = exchange_offers[offer_id]

    # Verify user authorization to view the offer
    if offer.get_offered_by_id() != new_user_id and (
        offer.get_requested_item_id() not in items
        or items[offer.get_requested_item_id()].get_user_id() != new_user_id
    ):
        abort(403, "You are not authorised to view this offer.")

    return offer.to_json()


async def user_cancel_offer(
    session_token: str,
    csrf_token: str,
    offer_id: int,
    message: str = "Offer cancelled by the user.",
) -> None:
    """
    Allows a user to cancel an exchange offer.

    Args:
        session_token (str): The session token of the user.
        csrf_token (str): The CSRF token for security.
        offer_id (int): The ID of the offer to cancel.
        message (str, optional): The cancellation message. Defaults to "Offer cancelled by the user.".

    Returns:
        None

    Raises:
        400 Error: If the offer is already completed, confirmed, or accepted.
        403 Error: If the user is not authorized to cancel the offer.
        404 Error: If the offer does not exist.
        500 Error: If there is an internal server error while cancelling the offer.
    """
    message = validate_string_length(
        message, "Cancellation Message", 10, 1000
    )

    # Authenticate and validate user
    new_user_id: int = admin_retrieve_user_id(session_token, csrf_token)
    validate_user_id(new_user_id)
    validate_offer_id(offer_id)

    offer: ExchangeOffer = exchange_offers[offer_id]

    # Verify user authorization to cancel the offer
    if (
        offer.get_offered_by_id() != new_user_id
        and items[offer.get_requested_item_id()].get_user_id() != new_user_id
    ):
        abort(403, "You are not authorised to cancel this offer.")

    # Prevent cancellation if offer is already completed, confirmed, or accepted
    if offer.get_status() in ["completed", "confirmed", "accepted"]:
        abort(
            400,
            "Offer cannot be cancelled after it has been completed, confirmed, or accepted.",
        )

    # Update offer status to cancelled and set cancellation message
    offer.set_status("cancelled")
    offer.set_message(message)
