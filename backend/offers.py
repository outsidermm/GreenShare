from typing import Tuple

from flask import abort

from backend.data import items, exchange_offers
from backend.data import admin_retrieve_user_id
from backend.classes.exchange_offer import ExchangeOffer


def validate_offer_id(offer_id: str) -> int:
    if not offer_id.isdigit():
        abort(400, "Offer ID must be an integer.")
    offer_id_int = int(offer_id)
    if offer_id_int not in exchange_offers:
        abort(404, f"Offer with ID {offer_id_int} does not exist.")
    return offer_id_int


async def user_create_offer(
    session_token: str,
    csrf_token: str,
    offered_item_ids: list[str],
    requested_item_id: str,
    message: str,
) -> ExchangeOffer:

    new_offered_by_id = admin_retrieve_user_id(session_token, csrf_token)

    if not requested_item_id.isdigit():
        abort(400, "Requested item ID must be an integer.")
    else:
        new_requested_item_id = int(requested_item_id)
        if new_requested_item_id not in items:
            abort(
                404, f"Requested item with ID {new_requested_item_id} does not exist."
            )

    if items[new_requested_item_id].get_type() == "exchange" and not offered_item_ids:
        abort(400, "You must offer at least one item in exchange for this item.")

    new_offered_item_ids = [
        int(item_id) for item_id in offered_item_ids if item_id.isdigit()
    ]

    for offered_item_id in offered_item_ids:
        if not offered_item_id.isdigit():
            abort(400, "Offered item IDs must be integers.")
        else:
            offered_item_id = int(offered_item_id)
            if offered_item_id not in items:
                abort(404, f"Offered item with ID {offered_item_id} does not exist.")

            if offered_item_id == new_requested_item_id:
                abort(400, "Offered item cannot be the same as the requested item.")

    if items[new_requested_item_id].get_status() != "available":
        abort(400, "Requested item is not available for exchange.")

    if items[new_requested_item_id].get_user_id() == new_offered_by_id:
        abort(400, "You cannot exchange your own item.")

    if items[new_requested_item_id].get_type() == "free" and offered_item_ids:
        abort(400, "This item is free, you cannot offer items in exchange.")

    new_message = message.lower()
    if len(new_message) > 1000 or len(new_message) < 10:
        abort(400, "Message must be between 10 and 1000 characters.")

    try:
        new_offer = ExchangeOffer(
            offered_by_id=new_offered_by_id,
            requested_item_id=new_requested_item_id,
            message=new_message,
            offered_item_ids=new_offered_item_ids,
        )
        exchange_offers[new_offer.get_offer_pk()] = new_offer
        return new_offer
    except Exception as e:
        abort(500, f"Failed to create a offer: {str(e)}")


async def user_get_offers(
    session_token: str, csrf_token: str
) -> Tuple[list[ExchangeOffer], list[ExchangeOffer]]:
    new_user_id = admin_retrieve_user_id(session_token, csrf_token)
    outgoing_offers: list[ExchangeOffer] = []
    incoming_offers: list[ExchangeOffer] = []
    for offer in exchange_offers.values():
        if offer.get_offered_by_id() == new_user_id:
            outgoing_offers.append(offer)
        elif (
            offer.get_requested_item_id() in items
            and items[offer.get_requested_item_id()].get_user_id() == new_user_id
        ):
            incoming_offers.append(offer)

    return outgoing_offers, incoming_offers


async def user_accept_offer(session_token: str, csrf_token: str, offer_id: str):
    new_user_id = admin_retrieve_user_id(session_token, csrf_token)
    offer_id = validate_offer_id(offer_id)

    offer = exchange_offers[offer_id]

    for existing_offer in exchange_offers.values():
        if (
            existing_offer.get_requested_item_id() == offer.get_requested_item_id()
            and existing_offer.get_status() in ["accepted", "confirmed"]
            and existing_offer.get_offer_pk() != offer.get_offer_pk()
        ):
            abort(
                400,
                "Another offer has already been accepted or confirmed for this item.",
            )

    if offer.get_requested_item_id() not in items:
        await user_cancel_offer(session_token, csrf_token, str(offer_id))
        abort(404, "Requested item does not exist.")

    if items[offer.get_requested_item_id()].get_user_id() != new_user_id:
        abort(403, "You are not authorised to accept this offer.")

    if offer.get_status() != "pending":
        abort(400, "Offer is not in a pending state.")

    for offered_item_id in offer.get_offered_items():
        if offered_item_id not in items:
            await user_cancel_offer(session_token, csrf_token, str(offer_id))
            abort(404, f"Offered item with ID {offered_item_id} does not exist.")

    offer.set_status("accepted")  # Update the status to accepted

    return {
        "message": "Offer accepted successfully.",
        "location": items[offer.get_requested_item_id()].get_location(),
    }


async def user_complete_offer(session_token: str, csrf_token: str, offer_id: str):
    new_user_id = admin_retrieve_user_id(session_token, csrf_token)
    offer_id = validate_offer_id(offer_id)

    offer = exchange_offers[offer_id]
    if offer.get_requested_item_id() not in items:
        abort(404, "Requested item does not exist.")

    if offer.get_offered_by_id() != new_user_id:
        abort(403, "You are not authorised to complete this offer.")

    if offer.get_status() != "accepted":
        if offer.get_status() == "completed":
            abort(400, "Offer has already been completed.")
        abort(400, "Offer is not in an accepted state.")

    offer.set_status("completed")  # Update the status to completed

    return {
        "message": "Offer completed successfully.",
        "offer_id": offer.get_offer_pk(),
        "status": offer.get_status(),
    }


async def user_confirm_offer(session_token: str, csrf_token: str, offer_id: str):
    new_user_id = admin_retrieve_user_id(session_token, csrf_token)
    offer_id = validate_offer_id(offer_id)

    offer = exchange_offers[offer_id]

    if items[offer.get_requested_item_id()].get_user_id() != new_user_id:
        abort(403, "You are not authorised to confirm this offer.")

    if offer.get_status() != "completed":
        if offer.get_status() == "confirmed":
            abort(400, "Offer has already been confirmed.")
        abort(400, "Offer is not in a completed state.")

    offer.set_status("confirmed")  # Update the status to confirmed
    items[offer.get_requested_item_id()].set_status(
        "offer_complete"
    )  # Mark requested item as available

    for offered_item_id in offer.get_offered_items():
        if offered_item_id in items:
            items[offered_item_id].set_status("offer_complete")

    return {
        "message": "Offer confirmed successfully.",
        "offer_id": offer.get_offer_pk(),
        "status": offer.get_status(),
    }


async def user_get_offer_details(session_token: str, csrf_token: str, offer_id: str):
    new_user_id = admin_retrieve_user_id(session_token, csrf_token)
    offer_id = validate_offer_id(offer_id)

    offer = exchange_offers[offer_id]
    if offer.get_offered_by_id() != new_user_id and (
        offer.get_requested_item_id() not in items
        or items[offer.get_requested_item_id()].get_user_id() != new_user_id
    ):
        abort(403, "You are not authorised to view this offer.")

    return offer.to_json()


async def user_cancel_offer(
    session_token: str, csrf_token: str, offer_id: str, message: str = None
):
    new_user_id = admin_retrieve_user_id(session_token, csrf_token)
    offer_id = validate_offer_id(offer_id)

    offer = exchange_offers[offer_id]
    if (
        offer.get_offered_by_id() != new_user_id
        and items[offer.get_requested_item_id()].get_user_id() != new_user_id
    ):
        abort(403, "You are not authorised to cancel this offer.")

    if offer.get_status() in ["completed", "confirmed", "accepted"]:
        abort(
            400,
            "Offer cannot be cancelled after it has been completed, confirmed, or accepted.",
        )

    offer.set_status("cancelled")  # Update the status to cancelled
    offer.set_message(
        message if message else "Offer cancelled by the user."
    )  # Set cancellation message
    message = message if message else "Offer cancelled by the user."
    return {
        "message": message,
        "offer_id": offer.get_offer_pk(),
        "status": offer.get_status(),
    }
