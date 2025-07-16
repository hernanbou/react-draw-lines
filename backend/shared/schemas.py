from http import HTTPStatus

from marshmallow import Schema, fields


class BaseDotSchema(Schema):
    id = fields.Int(required=True)
    lineIndex = fields.Int(required=True)
    positionPx = fields.Float(required=True)
    color = fields.Str(required=True)


class DefaultMessageResponseSchema(Schema):
    message = fields.Str(required=True)


class ErrorResponseSchema(Schema):
    code = fields.Int(
        required=True, metadata={'example': HTTPStatus.BAD_REQUEST.value}
    )
    status = fields.Str(
        required=True, metadata={'example': HTTPStatus.BAD_REQUEST.phrase}
    )
    message = fields.Str(required=False, metadata={'example': 'Invalid input'})
    errors = fields.Dict(
        keys=fields.Str(),
        values=fields.List(fields.Str()),
        required=False,
        metadata={'example': ['This field is required']},
    )
