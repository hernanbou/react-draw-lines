from http import HTTPStatus

from flask import Blueprint, Response

maps_routes = Blueprint('maps', __name__, url_prefix='/maps')


@maps_routes.route('/')
def maps_root() -> Response:
    try:
        print('try')
        # raise Exception('ERRORING')
        return Response('Ok', HTTPStatus.OK)
    except Exception as error:
        print(f'Exception occurred {error}')
        return Response('Not Ok', HTTPStatus.INTERNAL_SERVER_ERROR)
