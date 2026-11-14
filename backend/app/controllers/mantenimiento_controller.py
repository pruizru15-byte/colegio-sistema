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

from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import MantenimientoModel, EquipoModel, UsuarioModel
from app.schemas import (
    MantenimientoCreate, MantenimientoUpdate, MantenimientoResponse
)
from app.auth import get_current_user

router = APIRouter(prefix="/mantenimientos", tags=["Gestión de Mantenimientos"])

def generar_codigo_orden(db: Session) -> str:
    count = db.query(MantenimientoModel).count() + 1
    return f"MNT-{date.today().year}-{count:04d}"

@router.get("", response_model=List[MantenimientoResponse])
def listar_mantenimientos(
    estado: Optional[str] = Query(None, description="Filtrar por estado: programado, en_proceso, completado"),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo: preventivo, correctivo"),
    prioridad: Optional[str] = Query(None, description="Filtrar por prioridad: urgente, alta, media, baja"),
    busqueda: Optional[str] = Query(None, description="Buscar por código, técnico o descripción"),
    db: Session = Depends(get_db),
    user: UsuarioModel = Depends(get_current_user)
):
    """
    Lista todos los registros de mantenimiento con opciones de búsqueda y filtrado.
    """
    query = db.query(MantenimientoModel)

    if estado:
        query = query.filter(MantenimientoModel.estado == estado.lower())
    if tipo:
        query = query.filter(MantenimientoModel.tipo == tipo.lower())
    if prioridad:
        query = query.filter(MantenimientoModel.prioridad == prioridad.lower())
    if busqueda:
        term = f"%{busqueda}%"
        query = query.filter(
            (MantenimientoModel.codigo_orden.ilike(term)) |
            (MantenimientoModel.tecnico_responsable.ilike(term)) |
            (MantenimientoModel.descripcion_problema.ilike(term))
        )

    return query.order_by(MantenimientoModel.fecha_programada.asc()).all()

@router.post("", response_model=MantenimientoResponse, status_code=status.HTTP_201_CREATED)
def crear_mantenimiento(
    mnt_in: MantenimientoCreate,
    db: Session = Depends(get_db),
    user: UsuarioModel = Depends(get_current_user)
):
    """
    Genera una nueva orden de mantenimiento y sincroniza el estado del equipo.
    """
    equipo = db.query(EquipoModel).filter(EquipoModel.id == mnt_in.equipo_id).first()
    if not equipo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El equipo con ID {mnt_in.equipo_id} no existe."
        )

    codigo_orden = generar_codigo_orden(db)
    nuevo_mnt = MantenimientoModel(
        codigo_orden=codigo_orden,
        **mnt_in.model_dump()
    )
    db.add(nuevo_mnt)

    # Si la orden entra en proceso o es correctiva urgente, actualizamos el estado del equipo
    if nuevo_mnt.estado == "en_proceso" or nuevo_mnt.tipo == "correctivo":
        equipo.estado = "mantenimiento"

    db.commit()
    db.refresh(nuevo_mnt)
    return nuevo_mnt

@router.get("/{id}", response_model=MantenimientoResponse)
def detalle_mantenimiento(
    id: int,
    db: Session = Depends(get_db),
    user: UsuarioModel = Depends(get_current_user)
):
    mnt = db.query(MantenimientoModel).filter(MantenimientoModel.id == id).first()
    if not mnt:
        raise HTTPException(status_code=404, detail="Orden de mantenimiento no encontrada")
    return mnt

@router.put("/{id}", response_model=MantenimientoResponse)
def actualizar_mantenimiento(
    id: int,
    mnt_update: MantenimientoUpdate,
    db: Session = Depends(get_db),
    user: UsuarioModel = Depends(get_current_user)
):
    """
    Actualiza el estado de seguimiento, diagnóstico y sincroniza el estado del activo.
    """
    mnt = db.query(MantenimientoModel).filter(MantenimientoModel.id == id).first()
    if not mnt:
        raise HTTPException(status_code=404, detail="Orden de mantenimiento no encontrada")

    update_data = mnt_update.model_dump(exclude_unset=True)

    # Lógica de seguimiento de estados
    if "estado" in update_data:
        nuevo_estado = update_data["estado"].lower()
        equipo = db.query(EquipoModel).filter(EquipoModel.id == mnt.equipo_id).first()

        if nuevo_estado == "completado":
            if not update_data.get("fecha_completada"):
                update_data["fecha_completada"] = date.today()
            if equipo:
                equipo.estado = "operativo"  # El equipo vuelve a estar operativo
        elif nuevo_estado == "en_proceso":
            if equipo:
                equipo.estado = "mantenimiento"

    for key, value in update_data.items():
        setattr(mnt, key, value)

    db.commit()
    db.refresh(mnt)
    return mnt

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_mantenimiento(
    id: int,
    db: Session = Depends(get_db),
    user: UsuarioModel = Depends(get_current_user)
):
    mnt = db.query(MantenimientoModel).filter(MantenimientoModel.id == id).first()
    if not mnt:
        raise HTTPException(status_code=404, detail="Orden de mantenimiento no encontrada")

    db.delete(mnt)
    db.commit()
    return None
