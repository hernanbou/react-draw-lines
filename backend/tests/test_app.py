from http import HTTPStatus

from flask.testing import FlaskClient


def test_root_deve_retornar_ola_mundo(client: FlaskClient) -> None:
    response = client.get('/')
    assert response.get_json() == {'message': 'Hello World'}
    assert response.status_code == HTTPStatus.OK
    ...
