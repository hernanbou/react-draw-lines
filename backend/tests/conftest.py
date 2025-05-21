import pytest
from flask import Flask
from flask.testing import FlaskClient

from backend.app import create_app


@pytest.fixture
def app():
    app: Flask = create_app({'TESTING': True})
    return app


@pytest.fixture
def client(app: Flask) -> FlaskClient:
    return app.test_client()
