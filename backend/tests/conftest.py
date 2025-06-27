from contextlib import contextmanager
from datetime import datetime

import pytest
from flask import Flask
from flask.testing import FlaskClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm.session import Session

from backend.app import create_app
from backend.database.models import table_registry


@pytest.fixture
def app():
    app: Flask = create_app({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
        'API_TITLE': 'Test API',
        'API_VERSION': 'v1',
        'OPENAPI_VERSION': '3.0.2',
    })
    return app


@pytest.fixture
def client(app: Flask) -> FlaskClient:
    return app.test_client()


@pytest.fixture
def session():
    engine = create_engine('sqlite:///:memory:')

    table_registry.metadata.create_all(engine)

    with Session(engine) as session:
        yield session

    table_registry.metadata.drop_all(engine)


@contextmanager
def _mock_db_time(*, model, time=datetime(2022, 3, 19, 19, 30)):
    def fake_time_hook(mapper, connection, target):
        if hasattr(target, 'created_at'):
            target.created_at = time
        if hasattr(target, 'updated_at'):
            target.updated_at = time
        print(target)

    event.listen(model, 'before_insert', fake_time_hook)
    yield time
    event.remove(model, 'before_insert', fake_time_hook)


@pytest.fixture
def mock_db_time():
    return _mock_db_time
