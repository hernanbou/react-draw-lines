from marshmallow import Schema, fields


class UserResponseFields(Schema):
    id = fields.UUID(required=True)
    username = fields.Str(required=True)


class UsersResponseFieldsArray(Schema):
    users = fields.List(fields.Nested(UserResponseFields), required=True)
    message = fields.Str(
        required=True, metadata={'example': 'Foram encontrado x usuários'}
    )
