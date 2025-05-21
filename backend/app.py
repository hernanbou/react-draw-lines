from typing import Any

from flask import Flask


def create_app(config: dict[str, Any] | None = None) -> Flask:
    app = Flask(__name__)
    if config:
        app.config.update(config)

    # Registro das rotas
    @app.route('/', methods=['GET'])
    def test():
        return {'message': 'Hello World'}

    return app
