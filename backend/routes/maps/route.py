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
        'original_image': 'img/farm_1.png',
        'lines': [],
        'point_list': [],
        'zone_list': [],
    },
    {
        'id': 2,
        'owner': 'Menino da Porteira',
        'name': 'Sérgio Reis',
        'original_image': 'img/farm_2.png',
        'lines': [],
        'point_list': [],
        'zone_list': [],
    },
    {
        'id': 3,
        'owner': 'Seu Lobato',
        'name': 'Sítio do Seu Lobato',
        'original_image': 'img/farm_3.png',
        'lines': [],
        'point_list': [],
        'zone_list': [],
    },
    {
        'id': 4,
        'owner': 'Thiago Violeiro e Thalysson',
        'name': 'Ranchinho',
        'original_image': 'img/farm_4.png',
        'lines': [],
        'point_list': [],
        'zone_list': [],
    },
    {
        'id': 5,
        'owner': 'Victor Diago',
        'name': 'Alfa Sense',
        'original_image': 'img/farm_6.jpeg',
        'lines': [],
        'point_list': [],
        'zone_list': [],
    },
]


# @maps.route(
#     '/',
# )
# @api.validate(resp=Response(HTTP_200=None))
# def maps_root():
#     try:
#         print('try')
#         # raise Exception('ERRORING')
#         return jsonify('Ok', HTTPStatus.OK)
#     except Exception as error:
#         print(f'Exception occurred {error}')
#         return jsonify('Not Ok', HTTPStatus.INTERNAL_SERVER_ERROR)


# @maps.route('/<int:map_id>/line', methods=[HTTPMethod.PUT.value])
# @api.validate(
#     body=Request(PutLinePayload),
#     resp=Response(HTTP_200=None, validate=False),
# )
# def create_line(map_id: int):
#     body: PutLinePayload = request.json
#     # var = PutLinePayload.model_dump_json(**request.get_json())
#     print(f'Teste -> {body}')
#     if not any(m['id'] == map_id for m in maps_db):
#         return jsonify({
#             'error': 'Mapa não encontrado',
#             'message': f'Não foi possível encontrar um mapa com ID: {map_id}',
#         }), HTTPStatus.NOT_FOUND
#     print(map_id, body)
#     return jsonify(
#         {'msg': 'ok'},
#     ), 200


# @maps.route('/<int:map_id>/line', methods=[HTTPMethod.GET.value])
# @api.validate(resp=Response(HTTP_200=None, HTTP_404=None))
# def get_map_lines(map_id: int):
#     if map_id < 0 or map_id > len(maps_db):
#         abort(HTTPStatus.NOT_FOUND, 'testes')
#     found_map = next((n for n in maps_db if n.get('id') == map_id), None)
#     if found_map is None:
#         return jsonify({
#             'message': (
#                 f"We couldn't find any map with map_id: {map_id}"
#                 ', try again with a different map_id'
#             )
#         }), HTTPStatus.NOT_FOUND
#     return jsonify({
#         'message': f'We have found {len(found_map["lines"])} lines',
#         'data': {'lines': found_map['lines']},
#     }), HTTPStatus.OK


@maps.route('/')
class MapsRootResource(MethodView):
    @maps.response(HTTPStatus.OK)
    def get(self):
        """Root endpoint for Maps"""
        try:
            print('try')
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


@maps.route('/<int:map_id>/line')
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
