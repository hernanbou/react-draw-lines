from marshmallow import (
    Schema,
    ValidationError,
    fields,
)
from marshmallow.decorators import validates

from backend.routes.users.schemas import UserResponseFields

MIN_PASSWORD_LENGTH = 5
MIN_USERNAME_LENGTH = 4


class AuthLoginInput(Schema):
    username = fields.Str(required=True)
    password = fields.Str(required=True)
    errors = {}

    @validates('password')
    def validate_password(self, value, data_key):
        if len(value) < MIN_PASSWORD_LENGTH:
            raise ValidationError(
                f'A senha deve ter pelo menos {MIN_PASSWORD_LENGTH} caracteres.'
            )

    @validates('username')
    def validate_username(self, value, data_key):
        if len(value) < MIN_USERNAME_LENGTH:
            raise ValidationError(
                f'O usuário deve ter pelo menos {MIN_USERNAME_LENGTH} caracteres.'
            )


class AuthLoginOutput(Schema):
    message = fields.Str(required=True)
    data = fields.Nested(UserResponseFields, required=True)
