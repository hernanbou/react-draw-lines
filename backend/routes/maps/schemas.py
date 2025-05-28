from typing import List

from pydantic import BaseModel

from backend.shared.schemas import BaseDot


class Point(BaseModel):
    x: float
    y: float


class Line(BaseModel):
    start: Point
    end: Point
    length: float
    color: str
    index: int


class Calibration(BaseDot):
    positionMeters: float


class Zone(BaseDot):
    positionZoneEndPixelsAbsolute: float
    positionZoneStartPixelsAbsolute: float
    positionZoneEndMetersAbsolute: float
    positionZoneStartMetersAbsolute: float
    positionZoneTotalLengthMeters: float
    positionZoneTotalLengthPixels: float


class Alarm(BaseDot):
    positionMeters: float
    zoneID: float


LINES = List[Line]


class PutLinePayload(BaseModel):
    lines: LINES
