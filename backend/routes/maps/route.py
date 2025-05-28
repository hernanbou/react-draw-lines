from http import HTTPMethod, HTTPStatus

from flask import Blueprint, jsonify
from flask_pydantic_spec import Response
from pydantic import ValidationError

from backend.routes.maps.schemas import LINES, PutLinePayload
from backend.shared.schemas import DefaultMessageResponse
from backend.spec import api

maps = Blueprint('maps', __name__, url_prefix='/maps')


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


@maps.errorhandler(ValidationError)
def handle_maps_validation_error(error):
    print('ERROR HANDLER')
    return jsonify({'msg': 'Deu errinho'}), HTTPStatus.BAD_REQUEST
    ...


@maps.route(
    '/',
)
@api.validate(resp=Response(HTTP_200=None))
def maps_root():
    try:
        print('try')
        # raise Exception('ERRORING')
        return jsonify('Ok', HTTPStatus.OK)
    except Exception as error:
        print(f'Exception occurred {error}')
        return jsonify('Not Ok', HTTPStatus.INTERNAL_SERVER_ERROR)


@maps.route('/<int:line_id>/line', methods=[HTTPMethod.PUT.value])
@api.validate(body=PutLinePayload, resp=Response(HTTP_200=None))
def create_line(
    line_id: int,
):
    try:
        print(line_id, PutLinePayload.lines)
        return jsonify(
            {'msg': 'ok'},
        ), 200
    except Exception as e:
        print('EXECPTIONADO', e)
        return jsonify({'msg': 'not ok'}), HTTPStatus.BAD_REQUEST


@maps.route('/<int:id>/line', methods=[HTTPMethod.GET.value])
@api.validate(resp=Response(HTTP_200=LINES, HTTP_404=DefaultMessageResponse))
def get_map_lines(id: int):
    map = next((m for m in maps_db if m['id'] == id), None)
    if map is None:
        return jsonify({'message': 'There is no lines in the selected map'})
    return jsonify({
        'message': f'We have found {len(map["lines"])} lines',
        'data': map['lines'],
    })
