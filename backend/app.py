from typing import Any

from flask import Flask
from flask_smorest import Api

from backend.routes.maps.route import maps


def create_app(config: dict[str, Any] | None = None) -> Flask:
    app = Flask(__name__)
    if config:
        app.config.update(config)

    api = Api(app)
    api.register_blueprint(maps)

    # Registro das rotas
    @app.route('/', methods=['GET'])
    def home():
        return {'message': 'Hello World'}

    # Registro das configurações de documentação
    return app
