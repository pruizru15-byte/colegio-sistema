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

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Date, Boolean, func
from sqlalchemy.orm import relationship
from app.database import Base

class UsuarioModel(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    rol = Column(String(50), nullable=False, default="consulta")
    ubicacion_defecto_id = Column(Integer, ForeignKey("ubicaciones.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    ubicacion_defecto = relationship("UbicacionModel", foreign_keys=[ubicacion_defecto_id], back_populates="usuarios_defecto")
    prestamos = relationship("PrestamoModel", back_populates="usuario")


class UbicacionModel(Base):
    __tablename__ = "ubicaciones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(120), nullable=False)
    pabellon = Column(String(50), nullable=True)
    piso = Column(String(20), nullable=True)
    responsable = Column(String(120), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    equipos = relationship("EquipoModel", back_populates="ubicacion")
    usuarios_defecto = relationship("UsuarioModel", foreign_keys=[UsuarioModel.ubicacion_defecto_id], back_populates="ubicacion_defecto")
    prestamos = relationship("PrestamoModel", back_populates="ubicacion")


class EquipoModel(Base):
    __tablename__ = "equipos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo_patrimonial = Column(String(80), unique=True, nullable=False, index=True)
    nombre = Column(String(150), nullable=False)
    tipo = Column(String(80), nullable=False)
    marca = Column(String(80), nullable=True)
    modelo = Column(String(80), nullable=True)
    numero_serie = Column(String(100), nullable=True)
    estado = Column(String(50), nullable=False, default="operativo")
    observaciones = Column(Text, nullable=True)
    ubicacion_id = Column(Integer, ForeignKey("ubicaciones.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    ubicacion = relationship("UbicacionModel", back_populates="equipos")
    codigo_qr = relationship("CodigoQRModel", back_populates="equipo", uselist=False, cascade="all, delete-orphan")
    mantenimientos = relationship("MantenimientoModel", back_populates="equipo", cascade="all, delete-orphan")
    prestamos = relationship("PrestamoModel", back_populates="equipo", cascade="all, delete-orphan")


class CodigoQRModel(Base):
    __tablename__ = "codigos_qr"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo_hash = Column(String(100), unique=True, nullable=False, index=True)
    equipo_id = Column(Integer, ForeignKey("equipos.id", ondelete="CASCADE"), nullable=False)
    url_destino = Column(String(255), nullable=False)
    ruta_imagen = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    equipo = relationship("EquipoModel", back_populates="codigo_qr")


class MantenimientoModel(Base):
    __tablename__ = "mantenimientos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo_orden = Column(String(50), unique=True, nullable=False, index=True)
    equipo_id = Column(Integer, ForeignKey("equipos.id", ondelete="CASCADE"), nullable=False)
    tipo = Column(String(50), nullable=False, default="preventivo")  # preventivo, correctivo, calibracion, limpieza
    prioridad = Column(String(50), nullable=False, default="media")  # urgente, alta, media, baja
    estado = Column(String(50), nullable=False, default="programado")  # programado, en_proceso, completado, cancelado
    fecha_programada = Column(Date, nullable=False)
    fecha_completada = Column(Date, nullable=True)
    tecnico_responsable = Column(String(120), nullable=False)
    costo_estimado = Column(Float, nullable=True, default=0.0)
    descripcion_problema = Column(Text, nullable=False)
    diagnostico_solucion = Column(Text, nullable=True)
    piezas_reemplazadas = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    equipo = relationship("EquipoModel", back_populates="mantenimientos")


class PrestamoModel(Base):
    __tablename__ = "prestamos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo_prestamo = Column(String(50), unique=True, nullable=False, index=True)
    equipo_id = Column(Integer, ForeignKey("equipos.id", ondelete="CASCADE"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    ubicacion_id = Column(Integer, ForeignKey("ubicaciones.id", ondelete="CASCADE"), nullable=False)
    fecha_prestamo = Column(DateTime, server_default=func.now(), nullable=False)
    fecha_devolucion_esperada = Column(Date, nullable=True)
    fecha_devolucion_real = Column(DateTime, nullable=True)
    estado = Column(String(50), nullable=False, default="activo")  # activo, devuelto, vencido
    motivo = Column(String(255), nullable=True)
    observaciones = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    equipo = relationship("EquipoModel", back_populates="prestamos")
    usuario = relationship("UsuarioModel", back_populates="prestamos")
    ubicacion = relationship("UbicacionModel", back_populates="prestamos")


class NotificacionModel(Base):
    __tablename__ = "notificaciones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    titulo = Column(String(180), nullable=False)
    descripcion = Column(Text, nullable=False)
    tipo = Column(String(50), nullable=False, default="info")  # danger, warning, success, info
    categoria = Column(String(50), nullable=False, default="sistema")  # mantenimiento, prestamo, equipo, sistema
    enlace_url = Column(String(255), nullable=True)
    leido = Column(Boolean, default=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())



