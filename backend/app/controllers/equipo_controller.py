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

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import EquipoModel, UbicacionModel, UsuarioModel
from app.schemas import (
    EquipoCreate, EquipoUpdate, EquipoResponse,
    UbicacionCreate, UbicacionResponse
)
from app.auth import get_current_user, require_admin
from app.controllers.qr_controller import crear_codigo_qr_para_equipo

router = APIRouter(tags=["Gestión de Equipos e Inventario"])

# --- Ubicaciones ---
@router.get("/ubicaciones", response_model=List[UbicacionResponse])
def listar_ubicaciones(db: Session = Depends(get_db)):
    return db.query(UbicacionModel).all()

@router.post("/ubicaciones", response_model=UbicacionResponse, status_code=status.HTTP_201_CREATED)
def crear_ubicacion(
    ubicacion_in: UbicacionCreate,
    db: Session = Depends(get_db),
    admin: UsuarioModel = Depends(require_admin)
):
    nueva_ubicacion = UbicacionModel(**ubicacion_in.model_dump())
    db.add(nueva_ubicacion)
    db.commit()
    db.refresh(nueva_ubicacion)
    return nueva_ubicacion


# --- Equipos e Inventario ---
@router.post("/equipos", response_model=EquipoResponse, status_code=status.HTTP_201_CREATED)
def registrar_equipo(
    equipo_in: EquipoCreate,
    db: Session = Depends(get_db),
    admin: UsuarioModel = Depends(require_admin)
):
    """
    2. Registrar equipo (Diagrama de secuencia):
    - Verifica ubicación
    - Crea equipo
    - Genera y asocia código QR automático
    - Retorna equipo registrado + QR
    """
    # Verificar si código patrimonial ya existe
    existe = db.query(EquipoModel).filter(EquipoModel.codigo_patrimonial == equipo_in.codigo_patrimonial).first()
    if existe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un equipo con el código patrimonial '{equipo_in.codigo_patrimonial}'"
        )

    # Verificar ubicación si fue provista
    if equipo_in.ubicacion_id:
        ubicacion = db.query(UbicacionModel).filter(UbicacionModel.id == equipo_in.ubicacion_id).first()
        if not ubicacion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"La ubicación con ID {equipo_in.ubicacion_id} no existe."
            )

    # Crear equipo
    nuevo_equipo = EquipoModel(**equipo_in.model_dump())
    db.add(nuevo_equipo)
    db.commit()
    db.refresh(nuevo_equipo)

    # Generar y vincular Código QR
    crear_codigo_qr_para_equipo(nuevo_equipo, db)
    db.refresh(nuevo_equipo)

    return nuevo_equipo


@router.get("/equipos", response_model=List[EquipoResponse])
def consultar_inventario(
    busqueda: Optional[str] = Query(None, description="Buscar por nombre, código patrimonial o serie"),
    ubicacion_id: Optional[int] = Query(None, description="Filtrar por ubicación"),
    estado: Optional[str] = Query(None, description="Filtrar por estado"),
    db: Session = Depends(get_db),
    user: UsuarioModel = Depends(get_current_user)
):
    """
    3. Consultar inventario (Diagrama de secuencia):
    Retorna listado completo o filtrado de equipos.
    """
    query = db.query(EquipoModel)

    if busqueda:
        term = f"%{busqueda}%"
        query = query.filter(
            (EquipoModel.nombre.ilike(term)) |
            (EquipoModel.codigo_patrimonial.ilike(term)) |
            (EquipoModel.numero_serie.ilike(term)) |
            (EquipoModel.marca.ilike(term))
        )
    if ubicacion_id:
        query = query.filter(EquipoModel.ubicacion_id == ubicacion_id)
    if estado:
        query = query.filter(EquipoModel.estado == estado)

    return query.order_by(EquipoModel.id.desc()).all()


@router.get("/equipos/{equipo_id}", response_model=EquipoResponse)
def detalle_equipo(equipo_id: int, db: Session = Depends(get_db)):
    equipo = db.query(EquipoModel).filter(EquipoModel.id == equipo_id).first()
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    return equipo


@router.put("/equipos/{equipo_id}", response_model=EquipoResponse)
def actualizar_datos_equipo(
    equipo_id: int,
    equipo_update: EquipoUpdate,
    db: Session = Depends(get_db),
    admin: UsuarioModel = Depends(require_admin)
):
    """
    5. Actualizar datos del equipo (Diagrama de secuencia):
    Edita estado, ubicación u observaciones técnicas.
    """
    equipo = db.query(EquipoModel).filter(EquipoModel.id == equipo_id).first()
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    update_data = equipo_update.model_dump(exclude_unset=True)

    if "ubicacion_id" in update_data and update_data["ubicacion_id"] is not None:
        ubicacion = db.query(UbicacionModel).filter(UbicacionModel.id == update_data["ubicacion_id"]).first()
        if not ubicacion:
            raise HTTPException(status_code=404, detail="La ubicación seleccionada no existe")

    for key, value in update_data.items():
        setattr(equipo, key, value)

    db.commit()
    db.refresh(equipo)
    return equipo


@router.delete("/equipos/{equipo_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_equipo(
    equipo_id: int,
    db: Session = Depends(get_db),
    admin: UsuarioModel = Depends(require_admin)
):
    equipo = db.query(EquipoModel).filter(EquipoModel.id == equipo_id).first()
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    db.delete(equipo)
    db.commit()
    return None
