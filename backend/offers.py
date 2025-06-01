from typing import Optional, Tuple

from flask import abort

from backend.data import items, exchange_offers
from backend.data import admin_retrieve_user_id
from backend.classes.exchange_offer import ExchangeOffer


async def user_create_offer(
    session_token: str,
    csrf_token: str,
    offered_item_ids: Optional[list[str]],
    requested_item_id: str,
    message: str,
):
    new_offered_by_id = admin_retrieve_user_id(session_token, csrf_token)
    new_message = message.lower()
    if len(new_message) > 1000 or len(new_message) < 10:
        abort(400, "Message must be between 10 and 1000 characters.")

    if not requested_item_id.isdigit():
        abort(400, "Requested item ID must be an integer.")
    else:
        new_requested_item_id = int(requested_item_id)
        if requested_item_id not in items:
            abort(404, f"Requested item with ID {requested_item_id} does not exist.")

    for offered_item_id in offered_item_ids:
        if not offered_item_id.isdigit():
            abort(400, "Offered item IDs must be integers.")
        else:
            offered_item_id = int(offered_item_id)
            if offered_item_id not in items:
                abort(404, f"Offered item with ID {offered_item_id} does not exist.")

            if offered_item_id == requested_item_id:
                abort(400, "Offered item cannot be the same as the requested item.")

    requested_item_id = int(requested_item_id)
    new_offered_item_ids = [
        int(item_id) for item_id in offered_item_ids if item_id.isdigit()
    ]

    if items[requested_item_id].get_statis() != "available":
        abort(400, "Requested item is not available for exchange.")

    if items[requested_item_id].get_user_id() == new_offered_by_id:
        abort(400, "You cannot exchange your own item.")

    if items[requested_item_id].get_type() == "free" and offered_item_ids:
        abort(400, "This item is free, you cannot offer items in exchange.")

    if items[requested_item_id].get_type() == "exchange" and not offered_item_ids:
        abort(400, "You must offer at least one item in exchange for this item.")
    try:
        new_offer = ExchangeOffer(
            offered_by_id=new_offered_by_id,
            requested_item_id=new_requested_item_id,
            message=new_message,
            offered_items=new_offered_item_ids,
        )
        exchange_offers[new_offer.get_offer_pk()] = new_offer
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
