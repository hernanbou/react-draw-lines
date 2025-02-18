from flask_cors import CORS
from flask import Flask, jsonify, request, send_from_directory, make_response
import mimetypes
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:3000"], allow_headers=["Content-Type"])

maps = [
    {
        'id': 1,
        'owner': 'Chitãozinho e Xoxoró',
        'name': 'Rancho Fundo',
        'original_image': 'img/farm_1.png',
        'zone_image': '',
        'line_list': [],
        'point_list': [],
        'zone_list' : []
    },
    {
        'id': 2,
        'owner': 'Menino da Porteira',
        'name': 'Sérgio Reis',
        'original_image': 'img/farm_2.png',
        'zone_image': '',
        'line_list': [],
        'point_list': [],
        'zone_list' : []
    },
    {
        'id': 3,
        'owner': 'Seu Lobato',
        'name': 'Sítio do Seu Lobato',
        'original_image': 'img/farm_3.png',
        'zone_image': '',
        'line_list': [],
        'point_list': [],
        'zone_list' : []
    },
    {
        'id': 4,
        'owner': 'Thiago Violeiro e Thalysson',
        'name': 'Ranchinho',
        'original_image': 'img/farm_4.png',
        'zone_image': '',
        'line_list': [],
        'point_list': [],
        'zone_list' : []
    }
]

# Adicionar cabeçalhos CORS
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response

# Validar dados de entrada
def handle_map(data):
    required_fields = {'owner', 'name', 'original_image'}
    return all(field in data and isinstance(data[field], str) for field in required_fields)

# Consultar (todos)
@app.route('/maps', methods=['GET'])
def get_maps():
    return jsonify(maps)

# Consultar (ID)
@app.route('/maps/<int:id>', methods=['GET'])
def get_map_id(id):
    map = next((m for m in maps if m['id'] == id), None)
    return jsonify(map) if map else jsonify({'erro': 'Mapa não encontrado'}), 404

# Exibir imagem
def get_image(map_id, image_key, folder):
    map = next((m for m in maps if m['id'] == map_id), None)
    if map and map[image_key]:
        try:
            filename = map[image_key].split('/')[-1]
            mime_type = mimetypes.guess_type(map[image_key])[0]
            return send_from_directory(folder, filename, mimetype=mime_type)
        except FileNotFoundError:
            return jsonify({'erro': 'Imagem não encontrada'}), 404
    return jsonify({'erro': 'Mapa não encontrado'}), 404

@app.route('/maps/<int:id>/original_image', methods=['GET'])
def get_map_img(id):
    return get_image(id, 'original_image', 'img')

@app.route('/maps/<int:id>/zone_image', methods=['GET'])
def get_zone_img(id):
    return get_image(id, 'zone_image', 'img-zone')

# Exibir lista de linhas
@app.route('/maps/<int:id>/line_list', methods=['GET'])
def get_map_line_list(id):
    map = next((m for m in maps if m['id'] == id), None)
    return jsonify(map['line_list']) if map else jsonify({'erro': 'Lista de vetores não encontrada'}), 404

# Exibir lista de pontos
@app.route('/maps/<int:id>/point_list', methods=['GET'])
def get_map_point_list(id):
    map = next((m for m in maps if m['id'] == id), None)
    return jsonify(map['point_list']) if map else jsonify({'erro': 'Lista de pontos não encontrada'}), 404

# Exibir lista de zonas
@app.route('/maps/<int:id>/zone_list', methods=['GET'])
def get_map_zone_list(id):
    map = next((m for m in maps if m['id'] == id), None)
    return jsonify(map['zone_list']) if map else jsonify({'erro': 'Lista de zonas não encontrada'}), 404    

# Adicionar
@app.route('/maps', methods=['POST'])
def post_new_map():
    new_map = request.get_json()
    if not handle_map(new_map):
        return jsonify({'erro': 'Dados inválidos'}), 400
    new_map.update({
        'id': max((map['id'] for map in maps), default=0) + 1,
        'zone_image': '',
        'line_list': [],
        'point_list': [],
        'zone_list' : []
    })
    maps.append(new_map)
    return jsonify(new_map), 201

# Editar
@app.route('/maps/<int:id>', methods=['PUT'])
def put_map_id(id):
    set_map = request.get_json()
    map = next((m for m in maps if m['id'] == id), None)
    if map:
        map.update(set_map)
        map['id'] = id
        return jsonify(map)
    return jsonify({'erro': 'Mapa não encontrado'}), 404

# Excluir
@app.route('/maps/<int:id>', methods=['DELETE'])
def delete_map(id):
    map = next((m for m in maps if m['id'] == id), None)
    if map:
        maps.remove(map)
        return jsonify(maps)
    return jsonify({'erro': 'Mapa não encontrado'}), 404

# Salvar imagem alterada
@app.route('/maps/<int:id>/save_image', methods=['PUT'])
def save_image_blob(id):
    if 'image' not in request.files:
        return jsonify({'erro': 'Nenhuma imagem enviada'}), 400

    image_file = request.files['image']

    if image_file:
        filename = secure_filename(f'zone_img_ID-{id}.png')
        image_path = os.path.join('img-zone', filename).replace("\\", "/")
        image_file.save(image_path)

        map = next((m for m in maps if m['id'] == id), None)
        if map:
            map.update({
                'zone_image': image_path,
            })
            return jsonify({'message': 'Imagem salva com sucesso!'})
    return jsonify({'erro': 'Mapa não encontrado'}), 404

if __name__ == "__main__":
    app.run(port=5000, host='localhost', debug=True)
