from typing import Any

from flask import Flask

from backend.routes.maps import maps_routes


def create_app(config: dict[str, Any] | None = None) -> Flask:
    app = Flask(__name__)
    if config:
        app.config.update(config)
    app.register_blueprint(maps_routes)

    # Registro das rotas
    @app.route('/', methods=['GET'])
    def test():
        return {'message': 'Hello World'}

    return app
