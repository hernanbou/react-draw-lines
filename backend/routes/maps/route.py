from http import HTTPStatus

from flask.views import MethodView
from flask_smorest import Blueprint, abort

from .schemas import PutLinePayloadSchema

maps = Blueprint('maps', 'maps', url_prefix='/maps')


maps_db = [
    {
        'id': 1,
        'owner': 'Chitãozinho e Xoxoró',
        'name': 'Rancho Fundo',
        'image': 'img/farm_1.png',
        'lines_list': [],
        'calibration_list': [],
        'zone_list': [],
    },
    {
        'id': 2,
        'owner': 'Menino da Porteira',
        'name': 'Sérgio Reis',
        'image': 'img/farm_2.png',
        'lines_list': [],
        'calibration_list': [],
        'zone_list': [],
    },
    {
        'id': 3,
        'owner': 'Seu Lobato',
        'name': 'Sítio do Seu Lobato',
        'image': 'img/farm_3.png',
        'lines_list': [],
        'calibration_list': [],
        'zone_list': [],
    },
    {
        'id': 4,
        'owner': 'Thiago Violeiro e Thalysson',
        'name': 'Ranchinho',
        'image': 'img/farm_4.png',
        'lines_list': [],
        'calibration_list': [],
        'zone_list': [],
    },
    {
        'id': 5,
        'owner': 'Victor Diago',
        'name': 'Alfa Sense',
        'image': 'img/farm_6.jpeg',
        'lines_list': [],
        'calibration_list': [],
        'zone_list': [],
    },
]


@maps.route('/')
class MapsRootResource(MethodView):
    @maps.response(HTTPStatus.OK)
    def get(self):
        """Root endpoint for Maps"""
        try:
            return {'message': 'Ok', 'data': maps_db}
        except Exception as error:
            print(f'Exception occurred {error}')
            abort(HTTPStatus.INTERNAL_SERVER_ERROR, message='Unexpected error')


@maps.route('/<int:map_id>')
class MapsRootId(MethodView):
    @maps.response(HTTPStatus.OK)
    @maps.alt_response(HTTPStatus.NOT_FOUND, description='Map not found')
    def get(self, map_id):
        """Endpoint to get more info about a specific map"""
        try:
            print('MapsRootId')
            found_map = next((m for m in maps_db if m['id'] == map_id), None)
            if not found_map:
                abort(
                    HTTPStatus.NOT_FOUND, message=f'Map ID {map_id} not found'
                )
            return {
                'message': f'Map found: {found_map["name"]}',
                'data': found_map,
            }
        except Exception as error:
            print(f'Exception occurred {error}')
            abort(HTTPStatus.INTERNAL_SERVER_ERROR, message='Unexpected error')


@maps.route('/<int:map_id>/line_list')
class MapLineResource(MethodView):
    @maps.response(HTTPStatus.OK)
    @maps.alt_response(HTTPStatus.NOT_FOUND, description='Map not found')
    def get(self, map_id):
        """Get lines for a map"""
        found_map = next((m for m in maps_db if m['id'] == map_id), None)
        if not found_map:
            abort(HTTPStatus.NOT_FOUND, message=f'Map ID {map_id} not found')

        return {
            'message': f'We have found {len(found_map["lines"])} lines',
            'data': {'lines': found_map['lines']},
        }

    @maps.arguments(PutLinePayloadSchema)
    @maps.response(HTTPStatus.OK)
    def put(self, body, map_id):
        """Create lines for a map"""
        print(f'Body: {body}')
        found_map = next((m for m in maps_db if m['id'] == map_id), None)
        if not found_map:
            abort(HTTPStatus.NOT_FOUND, message=f'Map ID {map_id} not found')

        # Exemplo: salvar no "banco de dados"
        found_map['lines'] = body['lines']
        return {'message': 'Lines saved successfully'}
