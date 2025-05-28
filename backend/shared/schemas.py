from pydantic import BaseModel


class BaseDot(BaseModel):
    id: int
    lineIndex: int
    positionPx: float
    color: str


class DefaultMessageResponse(BaseModel):
    message: str
