from marshmallow import Schema, fields


class User(Schema):
    id = fields.UUID(required=True)
    username = fields.Str(required=True)
    password = fields.Str(required=True)
    created_at = fields.DateTime(required=True)
    updated_at = fields.DateTime(required=True)


class UserResponseFields(User):
    class Meta:
        exclude = ['password']


class UsersResponseFieldsArray(Schema):
    users = fields.List(fields.Nested(UserResponseFields), required=True)
    message = fields.Str(
        required=True, metadata={'example': 'We found x users'}
    )
