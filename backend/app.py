from typing import Any

from flask import Flask
from flask_cors import CORS
from flask_smorest import Api
from werkzeug.exceptions import HTTPException

from backend.routes.auth.route import auth
from backend.routes.maps.route import maps
from backend.routes.users.route import users
from backend.settings import Settings
from backend.shared.error_handlers import custom_error_handler


def create_app(config: dict[str, Any] | None = None) -> Flask:
    app = Flask(__name__)
    if config:
        app.config.update(config)
    CORS(
        app,
        supports_credentials=True,
        origins=[Settings().ORIGIN_URL],
        allow_headers=['Content-Type'],
    )

    api = Api(app)

    # Registro de Erros Customizados
    app.register_error_handler(HTTPException, custom_error_handler)

    # Registro das rotas
    api.register_blueprint(auth)
    api.register_blueprint(maps)
    api.register_blueprint(users)

    @app.route('/', methods=['GET'])
    def home():
        return {'message': 'Server Working Fine'}

    # Registro das configurações de documentação
    return app
