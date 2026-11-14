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

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class UsuarioModel(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    rol = Column(String(50), nullable=False, default="consulta")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


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


class CodigoQRModel(Base):
    __tablename__ = "codigos_qr"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo_hash = Column(String(100), unique=True, nullable=False, index=True)
    equipo_id = Column(Integer, ForeignKey("equipos.id", ondelete="CASCADE"), nullable=False)
    url_destino = Column(String(255), nullable=False)
    ruta_imagen = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    equipo = relationship("EquipoModel", back_populates="codigo_qr")
