from backend.models import ExchangeOfferDB
from backend.config import db
from typing import Optional


class ExchangeOffer:
    """
    Represents an exchange offer with encapsulated access and database interaction.
    """

    __offer_pk: Optional[str] = None

    def __init__(
        self,
        offered_by_id: list[str],
        item_id: str,
        offered_item_id: Optional[str] = None,
        message: str = "",
    ):
        """
        Creates a new exchange offer in the database and initialises internal state.
        """
        new_offer = ExchangeOfferDB(
            offered_by_id=offered_by_id,
            item_id=item_id,
            offered_item_id=offered_item_id,
            message=message,
        )
        db.session.add(new_offer)
        db.session.commit()
        self.set_offer_pk(new_offer.id)

    @classmethod
    def load(cls, offer_id: str) -> Optional["ExchangeOffer"]:
        """
        Loads an existing offer by ID from the database.
        """
        offer = ExchangeOfferDB.query.filter_by(id=offer_id).first()
        if not offer:
            return None
        offer_obj = cls.__new__(cls)
        offer_obj.set_offer_pk(offer.id)
        return offer_obj

    @classmethod
    def backup(cls) -> dict[str, "ExchangeOffer"]:
        """
        Loads all exchange offers and returns them as a dictionary of ExchangeOffer instances.
        """
        offer_records = ExchangeOfferDB.query.all()
        if not offer_records:
            return {}

        offer_dict = {}
        for offer in offer_records:
            offer_obj = cls.__new__(cls)
            offer_obj.set_offer_pk(offer.id)
            offer_dict[str(offer.id)] = offer_obj

        return offer_dict

    def offer_data(self) -> dict:
        """
        Returns the exchange offer data in dictionary form.
        """
        return ExchangeOfferDB.query.filter_by(id=self.get_offer_pk()).first().to_json()

    def get_offer_pk(self) -> str:
        return self.__offer_pk

    def set_offer_pk(self, offer_pk: str) -> None:
        self.__offer_pk = offer_pk

    def get_status(self) -> str:
        return ExchangeOfferDB.query.filter_by(id=self.get_offer_pk()).first().status

    def set_status(self, new_status: str) -> None:
        ExchangeOfferDB.query.filter_by(id=self.get_offer_pk()).first().status = (
            new_status
        )
        db.session.commit()

    def get_message(self) -> Optional[str]:
        return ExchangeOfferDB.query.filter_by(id=self.get_offer_pk()).first().message

    def set_message(self, new_message: str) -> None:
        ExchangeOfferDB.query.filter_by(id=self.get_offer_pk()).first().message = (
            new_message
        )
        db.session.commit()

    def get_requested_item_id(self) -> Optional[str]:
        return (
            ExchangeOfferDB.query.filter_by(id=self.get_offer_pk())
            .first()
            .offered_item_id
        )

    def set_requested_item_id(self, new_item_id: Optional[str]) -> None:
        offer = ExchangeOfferDB.query.filter_by(id=self.get_offer_pk()).first()
        offer.offered_item_id = new_item_id
        db.session.commit()

    def get_offered_by_id(self) -> list[str]:
        return (
            ExchangeOfferDB.query.filter_by(id=self.get_offer_pk())
            .first()
            .offered_by_id
        )

    def set_offered_by_id(self, new_offered_by_id: list[str]) -> None:
        offer = ExchangeOfferDB.query.filter_by(id=self.get_offer_pk()).first()
        offer.offered_by_id = new_offered_by_id
        db.session.commit()
