from typing import Any

from flask import Flask
from flask_pydantic_spec import Response

from backend.routes.maps.route import maps
from backend.shared.schemas import DefaultMessageResponse
from backend.spec import api


def create_app(config: dict[str, Any] | None = None) -> Flask:
    app = Flask(__name__)
    if config:
        app.config.update(config)
    app.register_blueprint(maps)

    # Registro das rotas
    @app.route('/', methods=['GET'])
    @api.validate(resp=Response(HTTP_200=DefaultMessageResponse))
    def test():
        return {'message': 'Hello World'}

    # Registro das configurações de documentação
    api.register(app)
    return app
