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

from datetime import datetime, date
from typing import List, Optional
from pydantic import BaseModel, EmailStr

# --- Modelos de Ubicaciones ---
class UbicacionBase(BaseModel):
    nombre: str
    pabellon: Optional[str] = None
    piso: Optional[str] = None
    responsable: Optional[str] = None

class UbicacionCreate(UbicacionBase):
    pass

class UbicacionUpdate(BaseModel):
    nombre: Optional[str] = None
    pabellon: Optional[str] = None
    piso: Optional[str] = None
    responsable: Optional[str] = None

class UbicacionResponse(UbicacionBase):
    id: int
    total_equipos: Optional[int] = 0
    equipos_prestados_activos: Optional[int] = 0
    usuarios_asignados: Optional[int] = 0

    class Config:
        from_attributes = True


# --- Modelos de Autenticación y Usuarios ---
class UsuarioBase(BaseModel):
    nombre: str
    email: EmailStr
    rol: Optional[str] = "consulta"
    ubicacion_defecto_id: Optional[int] = None

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    rol: Optional[str] = None
    password: Optional[str] = None
    ubicacion_defecto_id: Optional[int] = None

class UsuarioResponse(UsuarioBase):
    id: int
    created_at: Optional[datetime] = None
    ubicacion_defecto: Optional[UbicacionResponse] = None

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class PerfilUpdateRequest(BaseModel):
    nombre: str
    email: EmailStr
    ubicacion_defecto_id: Optional[int] = None

class CambiarPasswordRequest(BaseModel):
    current_password: str
    new_password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioResponse


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


# --- Modelos de Mantenimiento y Seguimiento ---
class MantenimientoBase(BaseModel):
    equipo_id: int
    tipo: str = "preventivo"
    prioridad: str = "media"
    estado: Optional[str] = "programado"
    fecha_programada: date
    tecnico_responsable: str
    costo_estimado: Optional[float] = 0.0
    descripcion_problema: str
    diagnostico_solucion: Optional[str] = None
    piezas_reemplazadas: Optional[str] = None

class MantenimientoCreate(MantenimientoBase):
    pass

class MantenimientoUpdate(BaseModel):
    tipo: Optional[str] = None
    prioridad: Optional[str] = None
    estado: Optional[str] = None
    fecha_programada: Optional[date] = None
    fecha_completada: Optional[date] = None
    tecnico_responsable: Optional[str] = None
    costo_estimado: Optional[float] = None
    descripcion_problema: Optional[str] = None
    diagnostico_solucion: Optional[str] = None
    piezas_reemplazadas: Optional[str] = None

class MantenimientoResponse(MantenimientoBase):
    id: int
    codigo_orden: str
    fecha_completada: Optional[date] = None
    created_at: Optional[datetime] = None
    equipo: Optional[EquipoResponse] = None

    class Config:
        from_attributes = True


# --- Modelos de Préstamos y Trazabilidad ---
class PrestamoBase(BaseModel):
    equipo_id: int
    usuario_id: int
    ubicacion_id: Optional[int] = None
    fecha_devolucion_esperada: Optional[date] = None
    motivo: Optional[str] = None
    observaciones: Optional[str] = None

class PrestamoCreate(PrestamoBase):
    pass

class PrestamoUpdate(BaseModel):
    fecha_devolucion_esperada: Optional[date] = None
    estado: Optional[str] = None
    motivo: Optional[str] = None
    observaciones: Optional[str] = None

class PrestamoResponse(BaseModel):
    id: int
    codigo_prestamo: str
    equipo_id: int
    usuario_id: int
    ubicacion_id: int
    fecha_prestamo: datetime
    fecha_devolucion_esperada: Optional[date] = None
    fecha_devolucion_real: Optional[datetime] = None
    estado: str
    motivo: Optional[str] = None
    observaciones: Optional[str] = None
    created_at: Optional[datetime] = None
    equipo: Optional[EquipoResponse] = None
    usuario: Optional[UsuarioResponse] = None
    ubicacion: Optional[UbicacionResponse] = None

    class Config:
        from_attributes = True


class UbicacionDetailResponse(UbicacionResponse):
    equipos: List[EquipoResponse] = []
    prestamos_activos: List[PrestamoResponse] = []
    usuarios_asignados_detalle: List[UsuarioResponse] = []


# --- Modelos de Notificaciones ---
class NotificacionBase(BaseModel):
    titulo: str
    descripcion: str
    tipo: Optional[str] = "info"  # danger, warning, success, info
    categoria: Optional[str] = "sistema"  # mantenimiento, prestamo, equipo, sistema
    enlace_url: Optional[str] = None

class NotificacionCreate(NotificacionBase):
    usuario_id: Optional[int] = None

class NotificacionResponse(NotificacionBase):
    id: int
    leido: bool = False
    usuario_id: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class NotificacionesListResponse(BaseModel):
    total: int
    no_leidas: int
    urgentes: int
    advertencias: int
    informativas: int
    notificaciones: List[NotificacionResponse]



