from typing import Any

from flask import Flask
from flask_cors import CORS
from flask_smorest import Api
from flask_smorest.error_handler import HTTPException
from webargs import ValidationError

from backend.routes.auth.route import auth
from backend.routes.maps.route import maps
from backend.routes.users.route import users
from backend.settings import Settings
from backend.shared.error_handlers import (
    unified_error_handler,
)
from backend.shared.schemas import (
    ErrorResponseSchema,
)


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
    app.register_error_handler(HTTPException, unified_error_handler)
    app.register_error_handler(ValidationError, unified_error_handler)
    app.register_error_handler(Exception, unified_error_handler)

    # Registro das rotas
    api.register_blueprint(auth)
    api.register_blueprint(maps)
    api.register_blueprint(users)

    @app.route('/', methods=['GET'])
    def home():
        print('teste', Settings().DATABASE_URL)
        return {'message': f'Server Working Fine {Settings().DATABASE_URL}'}

    # Registro das configurações de documentação
    with app.app_context():
        api_ext = app.extensions['flask-smorest']['apis']['']['ext_obj']

        spec = api_ext.spec
        if 'ErrorResponse' in spec.components.schemas:
            spec.components.schemas.pop('ErrorResponse')

        spec.components.schema('ErrorResponse', schema=ErrorResponseSchema)

        if 'DEFAULT_ERROR' in spec.components.responses:
            spec.components.responses.pop('DEFAULT_ERROR')

        spec.components.response(
            'DEFAULT_ERROR',
            {
                'description': 'Erro de validação.',
                'content': {
                    'application/json': {
                        'schema': {
                            '$ref': '#/components/schemas/ErrorResponse'
                        }
                    }
                },
            },
        )

    return app
