import pytest
from backend.config import app
from backend.auth import user_auth_register
from werkzeug.exceptions import HTTPException
from backend.data import exchange_offers
from backend.items import user_create_item
from backend.offers import (
    user_create_offer,
    user_get_offers,
    user_accept_offer,
    user_get_offer_details,
    user_cancel_offer,
    user_complete_offer,
    user_confirm_offer,
)
from backend.utils import sanitize_input


@pytest.fixture(scope="module", autouse=True)
def app_context():
    with app.app_context():
        yield app


@pytest.mark.asyncio
async def test_offer_cancellation_by_offer_maker():
    """
    Ensure an offer maker can cancel their own offer before it is accepted.

    Steps:
        - Register two users: offer maker and item owner
        - Each user creates one item (requested and offered)
        - Offer maker submits an offer
        - Offer maker cancels it
    Expected:
        - Offer status becomes 'cancelled'
    """
    # Register users
    maker_token, maker_csrf = await user_auth_register(
        "cancelmaker@test.com", "Password1!", "Maker", "Cancel"
    )
    owner_token, owner_csrf = await user_auth_register(
        "cancelowner@test.com", "Password1!", "Owner", "Cancel"
    )
    # Clean input
    maker_csrf = sanitize_input(maker_csrf)
    owner_csrf = sanitize_input(owner_csrf)
    maker_token = sanitize_input(maker_token)
    owner_token = sanitize_input(owner_token)

    # Owner creates an item to be requested
    req_item = await user_create_item(
        new_title="Requested Cancel",
        new_description="Cancel test request",
        new_condition="used-fair",
        new_location="Sydney, NSW, Australia",
        new_type="Exchange",
        new_images=["http://imgur.com/reqcancel.png"],
        session_token=owner_token,
        csrf_token=owner_csrf,
    )
    req_id = req_item.get_item_pk()

    # Maker creates an item to offer
    offer_item = await user_create_item(
        new_title="Offered Cancel",
        new_description="Cancel test offer",
        new_condition="used-good",
        new_location="Sydney, NSW, Australia",
        new_type="Exchange",
        new_images=["http://imgur.com/offercancel.png"],
        session_token=maker_token,
        csrf_token=maker_csrf,
    )
    offer_id = offer_item.get_item_pk()

    # Maker submits an offer
    offer = await user_create_offer(
        requested_item_id=req_id,
        offered_item_ids=[offer_id],
        message="cancel this please",
        session_token=maker_token,
        csrf_token=maker_csrf,
    )
    offer_key = offer.get_offer_pk()

    # Maker cancels the offer
    await user_cancel_offer(
        offer_id=offer_key,
        session_token=maker_token,
        csrf_token=maker_csrf,
    )
    # Offer should now be cancelled
    assert exchange_offers[offer_key].get_status() == "cancelled"


@pytest.mark.asyncio
async def test_unauthorised_offer_acceptance():
    """
    Ensure that only the item owner can accept an offer.

    Steps:
        - Register three users: owner, offer maker, and attacker
        - Owner and maker each create an item
        - Maker submits an offer to owner's item
        - Attacker attempts to accept the offer
    Expected:
        - Acceptance attempt by attacker raises HTTPException
        - Offer status remains 'pending'
    """
    # Register users
    owner_token, owner_csrf = await user_auth_register(
        "unauthowner@test.com", "Password1!", "Unauth", "Owner"
    )
    maker_token, maker_csrf = await user_auth_register(
        "unauthmaker@test.com", "Password1!", "Unauth", "Maker"
    )
    attacker_token, attacker_csrf = await user_auth_register(
        "attacker@test.com", "Password1!", "Bad", "Guy"
    )
    # Clean input
    owner_csrf = sanitize_input(owner_csrf)
    maker_csrf = sanitize_input(maker_csrf)
    attacker_csrf = sanitize_input(attacker_csrf)
    owner_token = sanitize_input(owner_token)
    maker_token = sanitize_input(maker_token)
    attacker_token = sanitize_input(attacker_token)

    # Owner creates an item to be requested
    req_item = await user_create_item(
        new_title="Protected Request",
        new_description="Only owner can accept",
        new_condition="Like-New",
        new_location="Sydney, NSW, Australia",
        new_type="Exchange",
        new_images=["http://imgur.com/protected.png"],
        session_token=owner_token,
        csrf_token=owner_csrf,
    )
    req_id = req_item.get_item_pk()

    # Maker creates an item to offer
    offer_item = await user_create_item(
        new_title="Offer to Protect",
        new_description="From Maker",
        new_condition="Used-Good",
        new_location="Sydney, NSW, Australia",
        new_type="Exchange",
        new_images=["http://imgur.com/offerguard.png"],
        session_token=maker_token,
        csrf_token=maker_csrf,
    )
    offer_id = offer_item.get_item_pk()

    # Maker submits an offer
    offer = await user_create_offer(
        requested_item_id=req_id,
        offered_item_ids=[offer_id],
        message="Hope this goes through",
        session_token=maker_token,
        csrf_token=maker_csrf,
    )
    offer_key = offer.get_offer_pk()

    # Attacker tries to accept the offer, which should fail
    with pytest.raises(HTTPException) as excinfo:
        await user_accept_offer(
            offer_id=(offer_key),
            session_token=attacker_token,
            csrf_token=attacker_csrf,
        )
    assert "not authorised to accept" in excinfo.value.description
    # Offer should remain pending
    assert exchange_offers[offer_key].get_status() == "pending"


@pytest.mark.asyncio
async def test_cancel_after_accept_fails():
    """
    Ensure an offer cannot be cancelled by the maker after it has been accepted.

    Steps:
        - Register two users: owner and offer maker
        - Each creates an item
        - Maker submits an offer
        - Owner accepts the offer
        - Maker tries to cancel the offer after acceptance
    Expected:
        - Cancellation attempt raises HTTPException
    """
    # Register users
    owner_token, owner_csrf = await user_auth_register(
        "cancelaccowner@test.com", "Password1!", "Owner", "Accept"
    )
    maker_token, maker_csrf = await user_auth_register(
        "cancelaccmaker@test.com", "Password1!", "Maker", "Accept"
    )
    owner_csrf = sanitize_input(owner_csrf)
    maker_csrf = sanitize_input(maker_csrf)
    owner_token = sanitize_input(owner_token)
    maker_token = sanitize_input(maker_token)

    # Owner creates item
    req_item = await user_create_item(
        new_title="Cannot Cancel",
        new_description="Test accept cancel fail",
        new_condition="New",
        new_location="Sydney, NSW, Australia",
        new_type="Exchange",
        new_images=["http://imgur.com/nocancel.png"],
        session_token=owner_token,
        csrf_token=owner_csrf,
    )
    req_id = req_item.get_item_pk()

    # Maker creates item
    offer_item = await user_create_item(
        new_title="Attempt Cancel",
        new_description="Try cancelling",
        new_condition="Used-Fair",
        new_location="Sydney, NSW, Australia",
        new_type="Exchange",
        new_images=["http://imgur.com/trycancel.png"],
        session_token=maker_token,
        csrf_token=maker_csrf,
    )
    off_id = offer_item.get_item_pk()

    # Maker submits offer
    offer = await user_create_offer(
        requested_item_id=req_id,
        offered_item_ids=[off_id],
        message="I might cancel",
        session_token=maker_token,
        csrf_token=maker_csrf,
    )
    key = offer.get_offer_pk()

    # Owner accepts the offer
    await user_accept_offer(
        offer_id=key,
        session_token=owner_token,
        csrf_token=owner_csrf,
    )

    # Maker tries to cancel after acceptance, which should fail
    with pytest.raises(HTTPException) as excinfo:
        await user_cancel_offer(
            offer_id=key,
            session_token=maker_token,
            csrf_token=maker_csrf,
        )
    assert "cannot be cancelled" in excinfo.value.description


@pytest.mark.asyncio
async def test_full_offer_flow():
    """
    Test the full lifecycle of an exchange offer, from creation to confirmation.

    Steps:
        - Register two users: owner and offerer
        - Owner creates a requested item, offerer creates an offered item
        - Offerer submits an offer
        - Owner accepts the offer
        - Offerer completes the offer
        - Owner confirms the offer
    Expected:
        - Offer status transitions: pending -> accepted -> completed -> confirmed
    """
    # Register users
    owner_token, owner_csrf = await user_auth_register(
        "owner@test.com", "Password1!", "Owner", "User"
    )
    offerer_token, offerer_csrf = await user_auth_register(
        "offerer@test.com", "Password1!", "Offerer", "User"
    )

    owner_csrf = sanitize_input(owner_csrf)
    offerer_csrf = sanitize_input(offerer_csrf)
    owner_token = sanitize_input(owner_token)
    offerer_token = sanitize_input(offerer_token)

    # Owner creates the item being requested
    req_item = await user_create_item(
        new_title="Request Item",
        new_description="An item to be requested",
        new_condition="Used-good",
        new_location="Sydney, NSW, Australia",
        new_type="Exchange",
        new_images=["http://image.url/requested.png"],
        session_token=owner_token,
        csrf_token=owner_csrf,
    )
    requested_item_id = req_item.get_item_pk()

    # Offerer creates the item to offer
    offer_item = await user_create_item(
        new_title="Offered Item",
        new_description="An item to be offered",
        new_condition="used-fair",
        new_location="Sydney, NSW, Australia",
        new_type="Exchange",
        new_images=["http://image.url/offered.png"],
        session_token=offerer_token,
        csrf_token=offerer_csrf,
    )
    offered_item_id = offer_item.get_item_pk()

    # Offerer submits an offer
    offer = await user_create_offer(
        requested_item_id=requested_item_id,
        offered_item_ids=[offered_item_id],
        message="Please accept this trade!",
        session_token=offerer_token,
        csrf_token=offerer_csrf,
    )
    offer_id = offer.get_offer_pk()

    # Owner accepts the offer
    await user_accept_offer(
        offer_id=offer_id,
        session_token=owner_token,
        csrf_token=owner_csrf,
    )
    assert exchange_offers[offer_id].get_status() == "accepted"

    # Offerer marks the offer as completed
    await user_complete_offer(
        offer_id=offer_id,
        session_token=offerer_token,
        csrf_token=offerer_csrf,
    )
    assert exchange_offers[offer_id].get_status() == "completed"

    # Owner confirms the completion
    await user_confirm_offer(
        offer_id=offer_id,
        session_token=owner_token,
        csrf_token=owner_csrf,
    )
    assert exchange_offers[offer_id].get_status() == "confirmed"


@pytest.mark.asyncio
async def test_multiple_offers_conflict():
    """
    Ensure that only one offer can be accepted for a given requested item.

    Steps:
        - Register owner and two offerers
        - Owner creates a requested item
        - Each offerer creates and offers a different item to the same request
        - Owner accepts the first offer
        - Owner attempts to accept the second offer
    Expected:
        - First offer is accepted
        - Second acceptance raises HTTPException
    """
    # Register users
    owner_token, owner_csrf = await user_auth_register(
        "owner2@test.com", "Password1!", "Ownertwo", "User"
    )
    offerer1_token, offerer1_csrf = await user_auth_register(
        "offerer1@test.com", "Password1!", "Offererone", "User"
    )
    offerer2_token, offerer2_csrf = await user_auth_register(
        "offerer2@test.com", "Password1!", "Offerertwo", "User"
    )

    owner_csrf = sanitize_input(owner_csrf)
    offerer1_csrf = sanitize_input(offerer1_csrf)
    offerer2_csrf = sanitize_input(offerer2_csrf)
    owner_token = sanitize_input(owner_token)
    offerer1_token = sanitize_input(offerer1_token)
    offerer2_token = sanitize_input(offerer2_token)

    # Owner creates the requested item
    req_item = await user_create_item(
        new_title="Requested Item",
        new_description="One requested item",
        new_condition="Poor",
        new_location="Sydney, NSW, Australia",
        new_type="Exchange",
        new_images=["http://image.url/request2.png"],
        session_token=owner_token,
        csrf_token=owner_csrf,
    )
    requested_item_id = req_item.get_item_pk()

    # Each offerer creates a unique item to offer
    offer_item_a = await user_create_item(
        new_title="Offer A",
        new_description="Offered by user A",
        new_condition="New",
        new_location="Sydney, NSW, Australia",
        new_type="Exchange",
        new_images=["http://image.url/a.png"],
        session_token=offerer1_token,
        csrf_token=offerer1_csrf,
    )
    offer_a_id = offer_item_a.get_item_pk()

    offer_item_b = await user_create_item(
        new_title="Offer B",
        new_description="Offered by user B",
        new_condition="Poor",
        new_location="Sydney, NSW, Australia",
        new_type="Exchange",
        new_images=["http://image.url/b.png"],
        session_token=offerer2_token,
        csrf_token=offerer2_csrf,
    )
    offer_b_id = offer_item_b.get_item_pk()

    # Both users submit offers
    offer1 = await user_create_offer(
        requested_item_id=(requested_item_id),
        offered_item_ids=[offer_a_id],
        message="Offer from A",
        session_token=offerer1_token,
        csrf_token=offerer1_csrf,
    )
    offer1_id = offer1.get_offer_pk()

    offer2 = await user_create_offer(
        requested_item_id=(requested_item_id),
        offered_item_ids=[offer_b_id],
        message="Offer from B",
        session_token=offerer2_token,
        csrf_token=offerer2_csrf,
    )
    offer2_id = offer2.get_offer_pk()

    # Owner accepts the first offer
    await user_accept_offer(
        offer_id=(offer1_id),
        session_token=owner_token,
        csrf_token=owner_csrf,
    )
    assert exchange_offers[offer1_id].get_status() == "accepted"

    # Owner tries to accept the second offer, which should fail
    with pytest.raises(HTTPException) as excinfo:
        await user_accept_offer(
            offer_id=(offer2_id),
            session_token=owner_token,
            csrf_token=owner_csrf,
        )
    assert "already been accepted or confirmed" in excinfo.value.description


@pytest.mark.asyncio
async def test_unauthorised_offer_confirmation():
    """
    Ensure only the item owner can confirm an offer after completion.

    Steps:
        - Register owner, maker, and a stranger
        - Owner and maker each create an item
        - Maker submits an offer; owner accepts it
        - Stranger attempts to confirm the offer
    Expected:
        - Confirmation attempt by stranger raises HTTPException
        - Offer status remains 'accepted'
    """
    owner_token, owner_csrf = await user_auth_register(
        "unauthcowner@test.com", "Password1!", "Owner", "Confirm"
    )
    maker_token, maker_csrf = await user_auth_register(
        "unauthcmaker@test.com", "Password1!", "Maker", "Confirm"
    )
    stranger_token, stranger_csrf = await user_auth_register(
        "stranger@test.com", "Password1!", "Strange", "Guy"
    )

    owner_csrf = sanitize_input(owner_csrf)
    maker_csrf = sanitize_input(maker_csrf)
    stranger_csrf = sanitize_input(stranger_csrf)
    owner_token = sanitize_input(owner_token)
    maker_token = sanitize_input(maker_token)
    stranger_token = sanitize_input(stranger_token)

    req_item = await user_create_item(
        new_title="Secure Request",
        new_description="Request for secure confirm test",
        new_condition="poor",
        new_location="Sydney, NSW, Australia",
        new_type="Exchange",
        new_images=["http://imgur.com/secure.png"],
        session_token=owner_token,
        csrf_token=owner_csrf,
    )
    req_id = req_item.get_item_pk()

    offer_item = await user_create_item(
        new_title="Confirm Attempt",
        new_description="Confirm from stranger test",
        new_condition="Used-good",
        new_location="Sydney, NSW, Australia",
        new_type="Exchange",
        new_images=["http://imgur.com/attempt.png"],
        session_token=maker_token,
        csrf_token=maker_csrf,
    )
    off_id = offer_item.get_item_pk()

    offer = await user_create_offer(
        requested_item_id=(req_id),
        offered_item_ids=[off_id],
        message="Please confirm this offer.",
        session_token=maker_token,
        csrf_token=maker_csrf,
    )
    offer_key = offer.get_offer_pk()

    await user_accept_offer(
        session_token=owner_token,
        csrf_token=owner_csrf,
        offer_id=(offer_key),
    )

    with pytest.raises(HTTPException) as excinfo:
        await user_confirm_offer(
            session_token=stranger_token,
            csrf_token=stranger_csrf,
            offer_id=(offer_key),
        )
    assert "not authorised to confirm" in excinfo.value.description
    assert exchange_offers[offer_key].get_status() == "accepted"


@pytest.mark.asyncio
async def test_offer_confirmation_before_completion():
    """
    Ensure an offer cannot be confirmed before it is marked as completed.

    Steps:
        - Register owner and maker
        - Owner and maker each create an item
        - Maker submits an offer; owner accepts it
        - Owner attempts to confirm before completion
    Expected:
        - Confirmation attempt raises HTTPException
        - Offer status remains 'accepted'
    """
    owner_token, owner_csrf = await user_auth_register(
        "compowner@test.com", "Password1!", "Owner", "Complete"
    )
    maker_token, maker_csrf = await user_auth_register(
        "compmaker@test.com", "Password1!", "Maker", "Complete"
    )

    owner_csrf = sanitize_input(owner_csrf)
    maker_csrf = sanitize_input(maker_csrf)
    owner_token = sanitize_input(owner_token)
    maker_token = sanitize_input(maker_token)

    req_item = await user_create_item(
        new_title="Completion Attempt",
        new_description="Trying to complete before confirmation",
        new_condition="Like-New",
        new_location="Sydney, NSW, Australia",
        new_type="Exchange",
        new_images=["http://imgur.com/earlycomplete.png"],
        session_token=owner_token,
        csrf_token=owner_csrf,
    )
    req_id = req_item.get_item_pk()

    offer_item = await user_create_item(
        new_title="Early Complete",
        new_description="Offer made prematurely",
        new_condition="Used-fair",
        new_location="Sydney, NSW, Australia",
        new_type="Exchange",
        new_images=["http://imgur.com/early.png"],
        session_token=maker_token,
        csrf_token=maker_csrf,
    )
    offer_id = offer_item.get_item_pk()

    offer = await user_create_offer(
        session_token=maker_token,
        csrf_token=maker_csrf,
        requested_item_id=(req_id),
        offered_item_ids=[offer_id],
        message="Try completing early",
    )
    offer_key = offer.get_offer_pk()

    await user_accept_offer(
        session_token=owner_token,
        csrf_token=owner_csrf,
        offer_id=(offer_key),
    )

    with pytest.raises(HTTPException) as excinfo:
        await user_confirm_offer(
            session_token=owner_token,
            csrf_token=owner_csrf,
            offer_id=(offer_key),
        )
    assert "not in a completed state" in excinfo.value.description
    assert exchange_offers[offer_key].get_status() == "accepted"


@pytest.mark.asyncio
async def test_repeated_confirmation():
    """
    Ensure an offer cannot be confirmed more than once.

    Steps:
        - Register owner and maker
        - Owner and maker each create an item
        - Maker submits an offer; owner accepts it
        - Maker completes the offer
        - Owner confirms the offer
        - Owner tries to confirm again
    Expected:
        - Second confirmation attempt raises HTTPException
    """
    owner_token, owner_csrf = await user_auth_register(
        "reconfowner@test.com", "Password1!", "Owner", "Recon"
    )
    maker_token, maker_csrf = await user_auth_register(
        "reconfmaker@test.com", "Password1!", "Maker", "Recon"
    )

    owner_csrf = sanitize_input(owner_csrf)
    maker_csrf = sanitize_input(maker_csrf)
    owner_token = sanitize_input(owner_token)
    maker_token = sanitize_input(maker_token)

    req_item = await user_create_item(
        "Recon Req",
        "Confirm again test",
        "used-good",
        "Sydney, NSW, Australia",
        "Exchange",
        ["http://imgur.com/1.png"],
        owner_token,
        owner_csrf,
    )
    req_id = req_item.get_item_pk()

    off = await user_create_item(
        "Recon Offer",
        "Confirm again test",
        "Used-fair",
        "Sydney, NSW, Australia",
        "Exchange",
        ["http://imgur.com/2.png"],
        maker_token,
        maker_csrf,
    )
    off_id = off.get_item_pk()

    offer = await user_create_offer(
        maker_token, maker_csrf, [off_id], (req_id), "Try reconfirming"
    )
    offer_key = offer.get_offer_pk()

    await user_accept_offer(owner_token, owner_csrf, (offer_key))
    await user_complete_offer(maker_token, maker_csrf, (offer_key))
    await user_confirm_offer(owner_token, owner_csrf, (offer_key))

    with pytest.raises(HTTPException) as excinfo:
        await user_confirm_offer(owner_token, owner_csrf, (offer_key))
    assert "already been confirmed" in excinfo.value.description


@pytest.mark.asyncio
async def test_repeated_completion():
    """
    Ensure an offer cannot be completed more than once.

    Steps:
        - Register owner and maker
        - Owner and maker each create an item
        - Maker submits an offer; owner accepts it
        - Maker completes the offer
        - Maker tries to complete again
    Expected:
        - Second completion attempt raises HTTPException
    """
    owner_token, owner_csrf = await user_auth_register(
        "recompowner@test.com", "Password1!", "Owner", "Recomp"
    )
    maker_token, maker_csrf = await user_auth_register(
        "recompmaker@test.com", "Password1!", "Maker", "Recomp"
    )

    owner_csrf = sanitize_input(owner_csrf)
    maker_csrf = sanitize_input(maker_csrf)
    owner_token = sanitize_input(owner_token)
    maker_token = sanitize_input(maker_token)

    req_item = await user_create_item(
        "Recomp Req",
        "Complete again test",
        "used-Good",
        "Sydney, NSW, Australia",
        "Exchange",
        ["http://imgur.com/3.png"],
        owner_token,
        owner_csrf,
    )
    req_id = req_item.get_item_pk()

    off_item = await user_create_item(
        "Recomp Offer",
        "Complete again test",
        "used-fair",
        "Sydney, NSW, Australia",
        "Exchange",
        ["http://imgur.com/4.png"],
        maker_token,
        maker_csrf,
    )
    off_id = off_item.get_item_pk()

    offer = await user_create_offer(
        maker_token, maker_csrf, [off_id], (req_id), "Try recompleting"
    )
    offer_key = offer.get_offer_pk()

    await user_accept_offer(owner_token, owner_csrf, (offer_key))
    await user_complete_offer(maker_token, maker_csrf, (offer_key))

    with pytest.raises(HTTPException) as excinfo:
        await user_complete_offer(maker_token, maker_csrf, (offer_key))
    assert "already been completed" in excinfo.value.description


@pytest.mark.asyncio
async def test_invalid_offer_id():
    """
    Ensure an error is raised when attempting to accept a non-existent offer.

    Steps:
        - Register a user
        - Attempt to accept an offer with a made-up ID
    Expected:
        - Acceptance attempt raises HTTPException about non-existent offer
    """
    user_token, user_csrf = await user_auth_register(
        "invalidid@test.com", "Password1!", "Invalid", "ID"
    )
    user_csrf = sanitize_input(user_csrf)
    user_token = sanitize_input(user_token)
    with pytest.raises(HTTPException) as excinfo:
        await user_accept_offer(user_token, user_csrf, "999")
    assert "does not exist" in excinfo.value.description


@pytest.mark.asyncio
async def test_create_exchange_offer_missing_items():
    """
    Ensure exchange offers require at least one offered item.

    Steps:
        - Register owner and maker
        - Owner creates an exchange item
        - Maker attempts to create an offer with no offered items
    Expected:
        - Offer creation raises HTTPException about missing items
    """
    owner_token, owner_csrf = await user_auth_register(
        "recompowner@test.com", "Password1!", "Owner", "Recomp"
    )
    maker_token, maker_csrf = await user_auth_register(
        "recompmaker@test.com", "Password1!", "Maker", "Recomp"
    )

    owner_csrf = sanitize_input(owner_csrf)
    maker_csrf = sanitize_input(maker_csrf)
    owner_token = sanitize_input(owner_token)
    maker_token = sanitize_input(maker_token)

    item = await user_create_item(
        "Valid Item",
        "Used ilwjdijaliwdjlaidjlawjdiwj",
        "Used-fair",
        "Sydney, NSW, Australia",
        "Exchange",
        ["http://imgur.com/6.png"],
        owner_token,
        owner_csrf,
    )
    valid_id = item.get_item_pk()

    with pytest.raises(HTTPException) as excinfo:
        await user_create_offer(
            maker_token, maker_csrf, [], (valid_id), "Can't trade without items"
        )
    assert (
        "You must offer at least one item in exchange for this item."
        in excinfo.value.description
    )


@pytest.mark.asyncio
async def test_create_free_offer_having_items():
    """
    Ensure users can make a free offer (no items exchanged) for a 'Free' item.

    Steps:
        - Register owner and maker
        - Owner creates a free item
        - Maker creates a free offer (no items offered)
    Expected:
        - Offer is created successfully
    """
    owner_token, owner_csrf = await user_auth_register(
        "recompowner@test.com", "Password1!", "Owner", "Recomp"
    )
    maker_token, maker_csrf = await user_auth_register(
        "recompmaker@test.com", "Password1!", "Maker", "Recomp"
    )

    owner_csrf = sanitize_input(owner_csrf)
    maker_csrf = sanitize_input(maker_csrf)
    owner_token = sanitize_input(owner_token)
    maker_token = sanitize_input(maker_token)

    item = await user_create_item(
        "Valid Item",
        "Used ilwjdijaliwdjlaidjlawjdiwj",
        "Used-fair",
        "Sydney, NSW, Australia",
        "Free",
        ["http://imgur.com/6.png"],
        owner_token,
        owner_csrf,
    )
    valid_id = item.get_item_pk()

    await user_create_offer(
        maker_token, maker_csrf, [], (valid_id), "Can't trade without items"
    )
    assert len(exchange_offers) == 1


@pytest.mark.asyncio
async def test_accepting_own_offer():
    """
    Ensure users cannot create an offer on their own item.

    Steps:
        - Register a user
        - User creates two items
        - User attempts to offer their own item for their own request
    Expected:
        - Offer creation raises HTTPException about self-exchange
    """
    user_token, user_csrf = await user_auth_register(
        "selfaccept@test.com", "Password1!", "Self", "Accept"
    )
    user_csrf = sanitize_input(user_csrf)
    user_token = sanitize_input(user_token)

    req_item = await user_create_item(
        "Self Request",
        "Self owned",
        "used-Good",
        "Sydney, NSW, Australia",
        "Exchange",
        ["http://imgur.com/selfreq.png"],
        user_token,
        user_csrf,
    )
    req_id = req_item.get_item_pk()

    off_item = await user_create_item(
        "Self Offer",
        "Self owned",
        "Used-fair",
        "Sydney, NSW, Australia",
        "Exchange",
        ["http://imgur.com/selfoff.png"],
        user_token,
        user_csrf,
    )
    off_id = off_item.get_item_pk()

    with pytest.raises(HTTPException) as excinfo:
        await user_create_offer(
            user_token, user_csrf, [off_id], (req_id), "Trade with myself"
        )
    assert "cannot exchange your own item" in excinfo.value.description


@pytest.mark.asyncio
async def test_offer_with_already_used_item():
    """
    Ensure an item already used in a completed exchange cannot be offered again.

    Steps:
        - Register owner, maker1, maker2
        - Owner creates a request
        - Maker1 creates an item and uses it in a completed/confirmed offer
        - Maker2 attempts to offer the same item
    Expected:
        - Offer creation by maker2 raises HTTPException about item availability
    """
    owner_token, owner_csrf = await user_auth_register(
        "reuseowner@test.com", "Password1!", "Reuse", "Owner"
    )
    maker1_token, maker1_csrf = await user_auth_register(
        "reusemaker1@test.com", "Password1!", "Reuse", "Makerone"
    )
    maker2_token, maker2_csrf = await user_auth_register(
        "reusemaker2@test.com", "Password1!", "Reuse", "Makertwo"
    )

    owner_csrf = sanitize_input(owner_csrf)
    maker1_csrf = sanitize_input(maker1_csrf)
    maker2_csrf = sanitize_input(maker2_csrf)
    owner_token = sanitize_input(owner_token)
    maker1_token = sanitize_input(maker1_token)
    maker2_token = sanitize_input(maker2_token)

    req_item = await user_create_item(
        "Requested",
        "Base item xxxxxx",
        "new",
        "Sydney, NSW, Australia",
        "Exchange",
        ["http://imgur.com/basereq.png"],
        owner_token,
        owner_csrf,
    )
    req_id = req_item.get_item_pk()

    shared_item = await user_create_item(
        "Shared Offer",
        "Item to reuse xxxxxx",
        "new",
        "Sydney, NSW, Australia",
        "Exchange",
        ["http://imgur.com/shared.png"],
        maker1_token,
        maker1_csrf,
    )
    shared_id = shared_item.get_item_pk()

    first_offer = await user_create_offer(
        maker1_token, maker1_csrf, [shared_id], (req_id), "First user offer"
    )
    first_offer_key = first_offer.get_offer_pk()

    await user_accept_offer(owner_token, owner_csrf, (first_offer_key))
    await user_complete_offer(maker1_token, maker1_csrf, (first_offer_key))
    await user_confirm_offer(owner_token, owner_csrf, (first_offer_key))

    with pytest.raises(HTTPException) as excinfo:
        await user_create_offer(
            maker2_token,
            maker2_csrf,
            [shared_id],
            (req_id),
            "Second user reuse",
        )
    assert "not available." in excinfo.value.description


@pytest.mark.asyncio
async def test_user_get_offers_and_offer_details():
    """
    Ensure users can retrieve their outgoing offers and get offer details.

    Steps:
        - Register owner and maker
        - Owner creates an item, maker creates another
        - Maker submits an offer to owner's item
        - Maker retrieves their outgoing offers and offer details
    Expected:
        - Outgoing offers contain the submitted offer
        - Offer details match submitted data
    """
    # Register users
    owner_token, owner_csrf = await user_auth_register(
        "getoffersowner@test.com", "Password1!", "Owner", "Get"
    )
    maker_token, maker_csrf = await user_auth_register(
        "getoffersmaker@test.com", "Password1!", "Maker", "Get"
    )

    owner_csrf = sanitize_input(owner_csrf)
    maker_csrf = sanitize_input(maker_csrf)
    owner_token = sanitize_input(owner_token)
    maker_token = sanitize_input(maker_token)

    # Owner creates an item
    req_item = await user_create_item(
        "Detail Request",
        "Item to test get",
        "new",
        "Sydney, NSW, Australia",
        "Exchange",
        ["http://imgur.com/reqget.png"],
        owner_token,
        owner_csrf,
    )
    req_id = req_item.get_item_pk()

    # Maker creates an item
    off_item = await user_create_item(
        "Detail Offer",
        "Item to test get",
        "Used-fair",
        "Sydney, NSW, Australia",
        "Exchange",
        ["http://imgur.com/offerget.png"],
        maker_token,
        maker_csrf,
    )
    off_id = off_item.get_item_pk()

    # Maker creates offer
    offer = await user_create_offer(
        maker_token, maker_csrf, [off_id], (req_id), "Testing offer retrieval"
    )
    offer_key = offer.get_offer_pk()

    # Maker retrieves all offers (should see their outgoing offer)
    outgoing_off, incoming_off = await user_get_offers(maker_token, maker_csrf)
    assert len(outgoing_off) == 1
    assert len(incoming_off) == 0

    # Maker retrieves offer details and checks content
    offer_detail = await user_get_offer_details(maker_token, maker_csrf, (offer_key))
    assert offer_detail["id"] == offer_key
    assert offer_detail["message"] == "testing offer retrieval"
    assert offer_detail["status"] == "pending"
