from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime  

class LoginRequest(BaseModel):
    code: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    role: str

class UserResponse(BaseModel):
    code: str
    name: str
    phone: Optional[str] = None
class PermitRequest(BaseModel):
    phone: str
    dates: List[str]
    noveltyType: str
    time: Optional[str] = None
    description: str
    files: Optional[List[str]] = []
    
class EquipmentRequest(BaseModel):
    type: str
    description: str
    zona: Optional[str] = None
    
class PhoneUpdate(BaseModel):
    phone: str


class NotificationStatusUpdate(BaseModel):
    notification_status: int
    
class SolicitudResponse(BaseModel):
    id: int
    code: str
    name: str
    tipo_novedad: str
    description: str
    status: str
    respuesta: str
    zona: str | None
    createdAt: datetime