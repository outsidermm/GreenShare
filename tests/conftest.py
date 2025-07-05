import pytest
from backend.models import ExchangeOfferDB, ItemDB, ItemImageDB, OfferedItemDB, UserDB
from backend.data import users, items, exchange_offers
from backend.config import db


@pytest.fixture(scope="function", autouse=True)
def clear_users():
    """
    Clears the global users dictionary and related data before each test to ensure test isolation.
    This prevents state leakage between tests, ensuring each test runs with a clean slate.
    """
    users.clear()
    items.clear()
    exchange_offers.clear()
    db.session.query(OfferedItemDB).delete()
    db.session.query(ExchangeOfferDB).delete()
    db.session.query(ItemImageDB).delete()
    db.session.query(ItemDB).delete()
    db.session.query(UserDB).delete()
    db.session.commit()

    yield

    users.clear()
    items.clear()
    exchange_offers.clear()
    db.session.query(OfferedItemDB).delete()
    db.session.query(ExchangeOfferDB).delete()
    db.session.query(ItemImageDB).delete()
    db.session.query(ItemDB).delete()
    db.session.query(UserDB).delete()
    db.session.commit()
