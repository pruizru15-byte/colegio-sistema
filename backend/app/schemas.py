# Copyright (c) 2026 MyCompany LLC
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#     http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr

# --- Modelos de Autenticación y Usuarios ---
class UsuarioBase(BaseModel):
    nombre: str
    email: EmailStr
    rol: Optional[str] = "consulta"

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    rol: Optional[str] = None
    password: Optional[str] = None

class UsuarioResponse(UsuarioBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class PerfilUpdateRequest(BaseModel):
    nombre: str
    email: EmailStr

class CambiarPasswordRequest(BaseModel):
    current_password: str
    new_password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioResponse


# --- Modelos de Ubicaciones ---
class UbicacionBase(BaseModel):
    nombre: str
    pabellon: Optional[str] = None
    piso: Optional[str] = None
    responsable: Optional[str] = None

class UbicacionCreate(UbicacionBase):
    pass

class UbicacionResponse(UbicacionBase):
    id: int

    class Config:
        from_attributes = True


# --- Modelos de Códigos QR ---
class CodigoQRBase(BaseModel):
    codigo_hash: str
    url_destino: str
    ruta_imagen: Optional[str] = None

class CodigoQRResponse(CodigoQRBase):
    id: int
    equipo_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Modelos de Equipos ---
class EquipoBase(BaseModel):
    codigo_patrimonial: str
    nombre: str
    tipo: str
    marca: Optional[str] = None
    modelo: Optional[str] = None
    numero_serie: Optional[str] = None
    estado: Optional[str] = "operativo"
    observaciones: Optional[str] = None
    ubicacion_id: Optional[int] = None

class EquipoCreate(EquipoBase):
    pass

class EquipoUpdate(BaseModel):
    nombre: Optional[str] = None
    tipo: Optional[str] = None
    marca: Optional[str] = None
    modelo: Optional[str] = None
    numero_serie: Optional[str] = None
    estado: Optional[str] = None
    observaciones: Optional[str] = None
    ubicacion_id: Optional[int] = None

class EquipoResponse(EquipoBase):
    id: int
    created_at: Optional[datetime] = None
    ubicacion: Optional[UbicacionResponse] = None
    codigo_qr: Optional[CodigoQRResponse] = None

    class Config:
        from_attributes = True


# --- Ficha Digital Completa para Escaneo QR ---
class FichaEquipoQRResponse(BaseModel):
    id: int
    codigo_patrimonial: str
    nombre: str
    tipo: str
    marca: Optional[str] = None
    modelo: Optional[str] = None
    numero_serie: Optional[str] = None
    estado: str
    observaciones: Optional[str] = None
    ubicacion: Optional[UbicacionResponse] = None
    codigo_hash: str
    qr_imagen_base64: Optional[str] = None

