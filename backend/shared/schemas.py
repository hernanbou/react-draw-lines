from marshmallow import Schema, fields


class BaseDotSchema(Schema):
    id = fields.Int(required=True)
    lineIndex = fields.Int(required=True)
    positionPx = fields.Float(required=True)
    color = fields.Str(required=True)


class DefaultMessageResponseSchema(Schema):
    message = fields.Str(required=True)
