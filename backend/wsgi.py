# wsgi.py

from backend.app import create_app

app = create_app({
    'API_TITLE': 'Sistema de Mapas - Alfa Sense',
    'API_VERSION': 'v1',
    'OPENAPI_VERSION': '3.0.2',
    'OPENAPI_URL_PREFIX': '/',
    'OPENAPI_SWAGGER_UI_PATH': '/swagger-ui',
    'OPENAPI_SWAGGER_UI_URL': 'https://cdn.jsdelivr.net/npm/swagger-ui-dist/',
})
