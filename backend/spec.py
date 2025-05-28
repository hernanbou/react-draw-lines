from flask_pydantic_spec import FlaskPydanticSpec

api = FlaskPydanticSpec(
    'flask', title='Sistema de Mapas', path='docs', version='v1.0'
)
