from enum import Enum
from pydantic import BaseModel


class FacialExpression(str, Enum):
    smile = "smile"
    sad = "sad"
    angry = "angry"
    surprised = "surprised"
    funnyFace = "funnyFace"
    default = "default"


class Animation(str, Enum):
    Talking_0 = "Talking_0"
    Talking_1 = "Talking_1"
    Talking_2 = "Talking_2"
    Idle = "Idle"
    # Angry = "Angry"
    # Laughing = "Laughing"
    # Terrified = "Terrified"
    # Rumba = "Rumba"
    # Crying = "Crying"


class Response(BaseModel):
    text: str
    facialExpression: FacialExpression
    animation: Animation
