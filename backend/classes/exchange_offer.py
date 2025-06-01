from backend.models import ExchangeOfferDB
from backend.config import db
from backend.models import ItemDB
from typing import Optional


class ExchangeOffer:
    """
    Represents an exchange offer with encapsulated access and database interaction.
    """

    __offer_pk: int = None

    def __init__(
        self,
        offered_by_id: int,
        requested_item_id: int,
        offered_item_ids: Optional[list[int]] = None,
        message: str = "",
    ):
        new_offer = ExchangeOfferDB(
            offered_by_id=offered_by_id,
            requested_item_id=requested_item_id,
            message=message,
        )
        if offered_item_ids:
            new_offer.offered_items = ItemDB.query.filter(ItemDB.id.in_(offered_item_ids)).all()

        db.session.add(new_offer)
        db.session.commit()
        self.set_offer_pk(new_offer.id)


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

    def set_offer_pk(self, offer_pk: int):
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

        offer_record = ExchangeOfferDB.query.get(self.__offer_pk)
        if not offer_record:
            raise ValueError("Exchange offer not found in the database.")

        return offer_record.to_json()
    
    def get_status(self) -> str:
        """
        Returns the status of the exchange offer.
        """

        offer_record = ExchangeOfferDB.query.get(self.__offer_pk)
        if not offer_record:
            raise ValueError("Exchange offer not found in the database.")

        return offer_record.status

    def set_status(self, status: str):
        """
        Sets the status of the exchange offer.
        """

        offer_record = ExchangeOfferDB.query.get(self.__offer_pk)
        if not offer_record:
            raise ValueError("Exchange offer not found in the database.")

        offer_record.status = status
        db.session.commit()
        self.set_offer_pk(offer_record.id)

    def get_offered_items(self) -> list[int]:
        """
        Returns a list of offered item IDs for the exchange offer.
        """

        offer_record = ExchangeOfferDB.query.get(self.__offer_pk)
        if not offer_record:
            raise ValueError("Exchange offer not found in the database.")

        return [item.id for item in offer_record.offered_items]

    def get_offered_by_id(self) -> int:
        """
        Returns the user ID of the person who made the offer.
        """

        offer_record = ExchangeOfferDB.query.get(self.__offer_pk)
        if not offer_record:
            raise ValueError("Exchange offer not found in the database.")

        return offer_record.offered_by_id
    
    def get_requested_item_id(self) -> int:
        """
        Returns the ID of the requested item in the exchange offer.
        """

        offer_record = ExchangeOfferDB.query.get(self.__offer_pk)
        if not offer_record:
            raise ValueError("Exchange offer not found in the database.")

        return offer_record.requested_item_id
    
    def get_message(self) -> str:
        """
        Returns the message associated with the exchange offer.
        """

        offer_record = ExchangeOfferDB.query.get(self.__offer_pk)
        if not offer_record:
            raise ValueError("Exchange offer not found in the database.")

        return offer_record.message
    
    def set_message(self, message: str):
        """
        Sets the message for the exchange offer.
        """

        offer_record = ExchangeOfferDB.query.get(self.__offer_pk)
        if not offer_record:
            raise ValueError("Exchange offer not found in the database.")

        offer_record.message = message
        db.session.commit()
        
    def delete(self):
        """
        Deletes the exchange offer from the database.
        """

        offer_record = ExchangeOfferDB.query.get(self.__offer_pk)
        if not offer_record:
            raise ValueError("Exchange offer not found in the database.")

        db.session.delete(offer_record)
        db.session.commit()