from pydantic import BaseModel
from typing import List, Optional

class LoginRequest(BaseModel):
    code: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    role: str

class UserResponse(BaseModel):
    code: str
    name: str

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
    
class PhoneUpdate(BaseModel):
    phone: str
