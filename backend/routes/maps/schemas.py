from marshmallow import Schema, fields


class PointSchema(Schema):
    x = fields.Float(required=True)
    y = fields.Float(required=True)


class LineSchema(Schema):
    start = fields.Nested(PointSchema, required=True)
    end = fields.Nested(PointSchema, required=True)
    length = fields.Float(required=True)
    color = fields.Str(required=True)
    index = fields.Int(required=True)


class BaseDotSchema(Schema):
    id = fields.Int(required=False)
    name = fields.Str(required=False)


class CalibrationSchema(BaseDotSchema):
    positionMeters = fields.Float(required=True)


class ZoneSchema(BaseDotSchema):
    positionZoneEndPixelsAbsolute = fields.Float(required=True)
    positionZoneStartPixelsAbsolute = fields.Float(required=True)
    positionZoneEndMetersAbsolute = fields.Float(required=True)
    positionZoneStartMetersAbsolute = fields.Float(required=True)
    positionZoneTotalLengthMeters = fields.Float(required=True)
    positionZoneTotalLengthPixels = fields.Float(required=True)


class AlarmSchema(BaseDotSchema):
    positionMeters = fields.Float(required=True)
    zoneID = fields.Float(required=True)


class PutLinePayloadSchema(Schema):
    lines = fields.List(fields.Nested(LineSchema), required=True)
