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


@router.get("/equipos/stats")
def estadisticas_equipos(
    db: Session = Depends(get_db),
    user: UsuarioModel = Depends(get_current_user)
):
    """
    Retorna métricas consolidadas del parque de equipos escolares.
    """
    total = db.query(EquipoModel).count()
    operativos = db.query(EquipoModel).filter(EquipoModel.estado == "operativo").count()
    mantenimiento = db.query(EquipoModel).filter(EquipoModel.estado == "mantenimiento").count()
    de_baja = db.query(EquipoModel).filter(EquipoModel.estado.in_(["de_baja", "desuso"])).count()
    prestados = db.query(EquipoModel).filter(EquipoModel.estado == "prestado").count()
    en_reserva = db.query(EquipoModel).filter(EquipoModel.estado == "en_reserva").count()

    from sqlalchemy import func
    tipos_raw = db.query(EquipoModel.tipo, func.count(EquipoModel.id)).group_by(EquipoModel.tipo).all()
    tipos = [{"tipo": t or "Otro", "cantidad": c} for t, c in tipos_raw]

    ubics_raw = db.query(UbicacionModel.nombre, func.count(EquipoModel.id))\
        .outerjoin(EquipoModel, EquipoModel.ubicacion_id == UbicacionModel.id)\
        .group_by(UbicacionModel.nombre).all()
    ubicaciones = [{"ubicacion": u or "Sin Asignar", "cantidad": c} for u, c in ubics_raw]

    return {
        "total": total,
        "operativos": operativos,
        "mantenimiento": mantenimiento,
        "de_baja": de_baja,
        "prestados": prestados,
        "en_reserva": en_reserva,
        "tipos": tipos,
        "ubicaciones": ubicaciones
    }


@router.get("/equipos/{equipo_id}/historial")
def historial_equipo(
    equipo_id: int, 
    db: Session = Depends(get_db),
    user: UsuarioModel = Depends(get_current_user)
):
    """
    Retorna la Hoja de Vida integral del equipo: especificaciones,
    código QR, órdenes de mantenimiento y registros de préstamo.
    """
    equipo = db.query(EquipoModel).filter(EquipoModel.id == equipo_id).first()
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    mantenimientos = [
        {
            "id": m.id,
            "codigo_orden": m.codigo_orden,
            "tipo": m.tipo,
            "prioridad": m.prioridad,
            "estado": m.estado,
            "fecha_programada": str(m.fecha_programada),
            "fecha_completada": str(m.fecha_completada) if m.fecha_completada else None,
            "tecnico_responsable": m.tecnico_responsable,
            "costo_estimado": m.costo_estimado,
            "descripcion_problema": m.descripcion_problema,
            "diagnostico_solucion": m.diagnostico_solucion,
        }
        for m in sorted(equipo.mantenimientos, key=lambda x: x.id, reverse=True)
    ]

    prestamos = [
        {
            "id": p.id,
            "codigo_prestamo": p.codigo_prestamo,
            "usuario_nombre": p.usuario.nombre if p.usuario else "Docente / Alumno",
            "ubicacion_nombre": p.ubicacion.nombre if p.ubicacion else "Ubicación Escolar",
            "fecha_prestamo": p.fecha_prestamo.isoformat() if p.fecha_prestamo else None,
            "fecha_devolucion_esperada": str(p.fecha_devolucion_esperada) if p.fecha_devolucion_esperada else None,
            "fecha_devolucion_real": p.fecha_devolucion_real.isoformat() if p.fecha_devolucion_real else None,
            "estado": p.estado,
            "motivo": p.motivo,
        }
        for p in sorted(equipo.prestamos, key=lambda x: x.id, reverse=True)
    ]

    return {
        "id": equipo.id,
        "codigo_patrimonial": equipo.codigo_patrimonial,
        "nombre": equipo.nombre,
        "tipo": equipo.tipo,
        "marca": equipo.marca,
        "modelo": equipo.modelo,
        "numero_serie": equipo.numero_serie,
        "estado": equipo.estado,
        "observaciones": equipo.observaciones,
        "created_at": equipo.created_at.isoformat() if equipo.created_at else None,
        "ubicacion": {
            "id": equipo.ubicacion.id,
            "nombre": equipo.ubicacion.nombre,
            "pabellon": equipo.ubicacion.pabellon,
            "piso": equipo.ubicacion.piso,
        } if equipo.ubicacion else None,
        "codigo_qr": {
            "codigo_hash": equipo.codigo_qr.codigo_hash,
            "url_destino": equipo.codigo_qr.url_destino,
        } if equipo.codigo_qr else None,
        "mantenimientos": mantenimientos,
        "prestamos": prestamos
    }


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
    current_user: UsuarioModel = Depends(get_current_user)
):
    """
    5. Actualizar datos del equipo (Diagrama de secuencia):
    Edita estado, ubicación u observaciones técnicas.
    """
    if current_user.rol.lower() not in ["administrador", "admin", "tecnico", "docente"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para modificar información de equipos."
        )

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

