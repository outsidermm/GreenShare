"""
This module defines the ExchangeOffer class, which manages the creation, retrieval,
update, and deletion of exchange offers in the GreenShare platform. It interfaces
with SQLAlchemy models to persist and query data from the backend database.
"""

from backend.models import ExchangeOfferDB
from backend.config import db
from backend.models import OfferedItemDB
from backend.utils import unsanitize_output


class ExchangeOffer:
    """
    Represents an exchange offer with encapsulated access and database interaction.
    """

    # Internal storage for the primary key of the exchange offer instance
    __offer_pk: int = None

    # Initialise a new ExchangeOffer instance and persist it with its offered items
    def __init__(
        self,
        offered_by_id: int,
        requested_item_id: int,
        offered_item_ids: list[int],
        message: str = "",
    ):
        new_offer = ExchangeOfferDB(
            offered_by_id=offered_by_id,
            requested_item_id=requested_item_id,
            message=message,
        )
        db.session.add(new_offer)
        db.session.commit()

        for offered_item_id in offered_item_ids:
            offered_item = OfferedItemDB(item_id=offered_item_id, offer_id=new_offer.id)
            db.session.add(offered_item)
        db.session.commit()

        self.set_offer_pk(new_offer.id)

    @classmethod
    def backup(cls) -> dict[int, "ExchangeOffer"]:
        """
        Loads all exchange offers and returns them as a dictionary of ExchangeOffer instances.
        """
        offer_records = db.session.get(ExchangeOfferDB, {}).all()
        if not offer_records:
            return {}

        offer_dict = {}
        for offer in offer_records:
            offer_obj = cls.__new__(cls)
            offer_obj.set_offer_pk(offer.id)
            offer_dict[offer.id] = offer_obj

        return offer_dict

    def set_offer_pk(self, offer_pk: int) -> None:
        """
        Sets the primary key for the exchange offer.
        """
        self.__offer_pk = offer_pk

    def get_offer_pk(self) -> int:
        """
        Returns the primary key of the exchange offer.
        """
        return self.__offer_pk

    def to_json(self) -> dict:
        """
        Converts the exchange offer to a JSON serializable dictionary.
        """
        return db.session.get(ExchangeOfferDB, self.get_offer_pk()).to_json()

    def get_status(self) -> str:
        """
        Returns the status of the exchange offer.
        """
        return db.session.get(ExchangeOfferDB, self.get_offer_pk()).status

    def set_status(self, status: str) -> None:
        """
        Sets the status of the exchange offer.
        """

        db.session.get(ExchangeOfferDB, self.get_offer_pk()).status = status
        db.session.commit()

    def get_offered_items(self) -> list[int]:
        """
        Returns a list of offered item IDs for the exchange offer.
        """
        offered_items = db.session.get(
            ExchangeOfferDB, self.get_offer_pk()
        ).offered_items
        return [item.item_id for item in offered_items]

    def get_offered_by_id(self) -> int:
        """
        Returns the user ID of the person who made the offer.
        """
        return db.session.get(ExchangeOfferDB, self.get_offer_pk()).offered_by_id

    def get_requested_item_id(self) -> int:
        """
        Returns the ID of the requested item in the exchange offer.
        """
        return db.session.get(ExchangeOfferDB, self.get_offer_pk()).requested_item_id

    def get_message(self) -> str:
        """
        Returns the message associated with the exchange offer.
        """
        message = db.session.get(ExchangeOfferDB, self.get_offer_pk()).message
        return unsanitize_output(message)

    def set_message(self, message: str) -> None:
        """
        Sets the message for the exchange offer.
        """
        db.session.get(ExchangeOfferDB, self.get_offer_pk()).message = message
        db.session.commit()