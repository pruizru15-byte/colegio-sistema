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
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import UbicacionModel, EquipoModel, UsuarioModel, PrestamoModel
from app.schemas import (
    UbicacionCreate, UbicacionUpdate, UbicacionResponse, UbicacionDetailResponse,
    PrestamoCreate, PrestamoUpdate, PrestamoResponse
)
from app.auth import get_current_user, require_admin

router = APIRouter(tags=["Gestión de Ubicaciones y Préstamos"])

# --- Resumen Superior y Estadísticas del Módulo de Ubicaciones ---
@router.get("/ubicaciones/resumen/stats")
def obtener_resumen_ubicaciones(
    db: Session = Depends(get_db),
    user: UsuarioModel = Depends(get_current_user)
):
    total_ubicaciones = db.query(UbicacionModel).count()
    total_equipos = db.query(EquipoModel).count()
    prestamos_activos = db.query(PrestamoModel).filter(PrestamoModel.estado == "activo").count()
    usuarios_con_sede = db.query(UsuarioModel).filter(UsuarioModel.ubicacion_defecto_id != None).count()

    return {
        "total_ubicaciones": total_ubicaciones,
        "total_equipos": total_equipos,
        "prestamos_activos": prestamos_activos,
        "usuarios_asignados": usuarios_con_sede
    }


# --- Listado y CRUD de Ubicaciones ---
@router.get("/ubicaciones", response_model=List[UbicacionResponse])
def listar_ubicaciones(db: Session = Depends(get_db)):
    """
    Retorna la lista de todas las ubicaciones escolares con conteos dinámicos
    de equipos alojados, préstamos activos y usuarios asignados por defecto.
    """
    ubicaciones = db.query(UbicacionModel).order_by(UbicacionModel.nombre.asc()).all()
    resultado = []
    
    for u in ubicaciones:
        tot_eq = db.query(EquipoModel).filter(EquipoModel.ubicacion_id == u.id).count()
        prest_act = db.query(PrestamoModel).filter(
            PrestamoModel.ubicacion_id == u.id,
            PrestamoModel.estado == "activo"
        ).count()
        usr_asig = db.query(UsuarioModel).filter(UsuarioModel.ubicacion_defecto_id == u.id).count()

        resultado.append(
            UbicacionResponse(
                id=u.id,
                nombre=u.nombre,
                pabellon=u.pabellon,
                piso=u.piso,
                responsable=u.responsable,
                total_equipos=tot_eq,
                equipos_prestados_activos=prest_act,
                usuarios_asignados=usr_asig
            )
        )
    return resultado


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
    
    return UbicacionResponse(
        id=nueva_ubicacion.id,
        nombre=nueva_ubicacion.nombre,
        pabellon=nueva_ubicacion.pabellon,
        piso=nueva_ubicacion.piso,
        responsable=nueva_ubicacion.responsable,
        total_equipos=0,
        equipos_prestados_activos=0,
        usuarios_asignados=0
    )


@router.get("/ubicaciones/{ubicacion_id}", response_model=UbicacionDetailResponse)
def detalle_ubicacion(
    ubicacion_id: int,
    db: Session = Depends(get_db),
    user: UsuarioModel = Depends(get_current_user)
):
    """
    Retorna el detalle completo de la ubicación:
    - Datos del ambiente
    - Equipos que residen actualmente en este espacio
    - Préstamos activos (dispositivos en uso, quién los tiene y hasta cuándo)
    - Usuarios que tienen esta ubicación como predeterminada
    """
    ub = db.query(UbicacionModel).filter(UbicacionModel.id == ubicacion_id).first()
    if not ub:
        raise HTTPException(status_code=404, detail="Ubicación no encontrada")

    equipos = db.query(EquipoModel).filter(EquipoModel.ubicacion_id == ub.id).all()
    prestamos_activos = db.query(PrestamoModel).filter(
        PrestamoModel.ubicacion_id == ub.id,
        PrestamoModel.estado == "activo"
    ).all()
    usuarios_asignados = db.query(UsuarioModel).filter(UsuarioModel.ubicacion_defecto_id == ub.id).all()

    return UbicacionDetailResponse(
        id=ub.id,
        nombre=ub.nombre,
        pabellon=ub.pabellon,
        piso=ub.piso,
        responsable=ub.responsable,
        total_equipos=len(equipos),
        equipos_prestados_activos=len(prestamos_activos),
        usuarios_asignados=len(usuarios_asignados),
        equipos=equipos,
        prestamos_activos=prestamos_activos,
        usuarios_asignados_detalle=usuarios_asignados
    )


@router.put("/ubicaciones/{ubicacion_id}", response_model=UbicacionResponse)
def actualizar_ubicacion(
    ubicacion_id: int,
    ub_update: UbicacionUpdate,
    db: Session = Depends(get_db),
    admin: UsuarioModel = Depends(require_admin)
):
    ub = db.query(UbicacionModel).filter(UbicacionModel.id == ubicacion_id).first()
    if not ub:
        raise HTTPException(status_code=404, detail="Ubicación no encontrada")

    update_data = ub_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(ub, field, val)

    db.commit()
    db.refresh(ub)

    tot_eq = db.query(EquipoModel).filter(EquipoModel.ubicacion_id == ub.id).count()
    prest_act = db.query(PrestamoModel).filter(
        PrestamoModel.ubicacion_id == ub.id,
        PrestamoModel.estado == "activo"
    ).count()
    usr_asig = db.query(UsuarioModel).filter(UsuarioModel.ubicacion_defecto_id == ub.id).count()

    return UbicacionResponse(
        id=ub.id,
        nombre=ub.nombre,
        pabellon=ub.pabellon,
        piso=ub.piso,
        responsable=ub.responsable,
        total_equipos=tot_eq,
        equipos_prestados_activos=prest_act,
        usuarios_asignados=usr_asig
    )


@router.delete("/ubicaciones/{ubicacion_id}")
def eliminar_ubicacion(
    ubicacion_id: int,
    db: Session = Depends(get_db),
    admin: UsuarioModel = Depends(require_admin)
):
    ub = db.query(UbicacionModel).filter(UbicacionModel.id == ubicacion_id).first()
    if not ub:
        raise HTTPException(status_code=404, detail="Ubicación no encontrada")

    equipos_asoc = db.query(EquipoModel).filter(EquipoModel.ubicacion_id == ubicacion_id).count()
    if equipos_asoc > 0:
        raise HTTPException(
            status_code=400,
            detail=f"No se puede eliminar la ubicación porque tiene {equipos_asoc} equipos vinculados. Muévelos primero."
        )

    db.delete(ub)
    db.commit()
    return {"message": "Ubicación eliminada exitosamente."}


# --- Gestión de Préstamos y Trazabilidad de Dispositivos ---
@router.get("/prestamos", response_model=List[PrestamoResponse])
def listar_prestamos(
    ubicacion_id: Optional[int] = Query(None, description="Filtrar por ubicación"),
    usuario_id: Optional[int] = Query(None, description="Filtrar por usuario prestatario"),
    estado: Optional[str] = Query(None, description="activo, devuelto o todos"),
    busqueda: Optional[str] = Query(None, description="Buscar por código, equipo o usuario"),
    db: Session = Depends(get_db),
    user: UsuarioModel = Depends(get_current_user)
):
    """
    Lista todos los préstamos registrados para supervisar quién tiene cada dispositivo,
    en qué ubicación está usándose y el estado del préstamo.
    """
    query = db.query(PrestamoModel)

    if ubicacion_id:
        query = query.filter(PrestamoModel.ubicacion_id == ubicacion_id)
    if usuario_id:
        query = query.filter(PrestamoModel.usuario_id == usuario_id)
    if estado and estado != "todos":
        query = query.filter(PrestamoModel.estado == estado)
    
    if busqueda:
        term = f"%{busqueda}%"
        query = query.join(EquipoModel, PrestamoModel.equipo_id == EquipoModel.id)\
                     .join(UsuarioModel, PrestamoModel.usuario_id == UsuarioModel.id)\
                     .filter(
                         (PrestamoModel.codigo_prestamo.ilike(term)) |
                         (EquipoModel.nombre.ilike(term)) |
                         (EquipoModel.codigo_patrimonial.ilike(term)) |
                         (UsuarioModel.nombre.ilike(term)) |
                         (UsuarioModel.email.ilike(term))
                     )

    return query.order_by(PrestamoModel.fecha_prestamo.desc()).all()


@router.post("/prestamos", response_model=PrestamoResponse, status_code=status.HTTP_201_CREATED)
def registrar_prestamo(
    prestamo_in: PrestamoCreate,
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_user)
):
    """
    Registra el préstamo de un equipo a un usuario.
    REQUISITO CLAVE:
    La ubicación es PREFIJADA automáticamenta con la ubicación predeterminada del usuario
    si no se envía explícitamente otra, o utiliza su sede asignada.
    """
    # 1. Validar equipo
    equipo = db.query(EquipoModel).filter(EquipoModel.id == prestamo_in.equipo_id).first()
    if not equipo:
        raise HTTPException(status_code=404, detail="El equipo seleccionado no existe.")
    
    if equipo.estado == "en_mantenimiento":
        raise HTTPException(
            status_code=400,
            detail="El equipo está en mantenimiento y no puede ser prestado."
        )

    # 2. Validar usuario prestatario
    usuario_dest = db.query(UsuarioModel).filter(UsuarioModel.id == prestamo_in.usuario_id).first()
    if not usuario_dest:
        raise HTTPException(status_code=404, detail="El usuario prestatario no existe.")

    # 3. Determinar ubicación predeterminada
    ubicacion_final_id = prestamo_in.ubicacion_id
    if not ubicacion_final_id:
        if usuario_dest.ubicacion_defecto_id:
            ubicacion_final_id = usuario_dest.ubicacion_defecto_id
        else:
            # Si el usuario aún no tenía sede predeterminada, tomar la primera del colegio
            primera_ub = db.query(UbicacionModel).first()
            ubicacion_final_id = primera_ub.id if primera_ub else 1
            # Actualizarla en el perfil del usuario para futuras operaciones
            usuario_dest.ubicacion_defecto_id = ubicacion_final_id

    # 4. Generar código de orden de préstamo único
    now = datetime.now()
    count_hoy = db.query(PrestamoModel).count() + 1
    codigo = f"PR-{now.year}-{count_hoy:03d}"

    nuevo_prestamo = PrestamoModel(
        codigo_prestamo=codigo,
        equipo_id=equipo.id,
        usuario_id=usuario_dest.id,
        ubicacion_id=ubicacion_final_id,
        fecha_prestamo=now,
        fecha_devolucion_esperada=prestamo_in.fecha_devolucion_esperada,
        estado="activo",
        motivo=prestamo_in.motivo,
        observaciones=prestamo_in.observaciones
    )
    db.add(nuevo_prestamo)

    # 5. Sincronizar el equipo: cambiar a 'prestado' y moverlo a la ubicación del préstamo
    equipo.estado = "prestado"
    equipo.ubicacion_id = ubicacion_final_id

    db.commit()
    db.refresh(nuevo_prestamo)
    return nuevo_prestamo


@router.post("/prestamos/{prestamo_id}/devolver", response_model=PrestamoResponse)
def devolver_prestamo(
    prestamo_id: int,
    ubicacion_retorno_id: Optional[int] = Query(None, description="Ubicación donde queda almacenado"),
    observacion_retorno: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_user)
):
    """
    Registra la devolución de un equipo prestado:
    - Marca el préstamo como 'devuelto'
    - Registra fecha y hora exacta de retorno
    - Retorna el estado del equipo a 'operativo'
    - Reubica opcionalmente el equipo en su almacén o base
    """
    prestamo = db.query(PrestamoModel).filter(PrestamoModel.id == prestamo_id).first()
    if not prestamo:
        raise HTTPException(status_code=404, detail="Préstamo no encontrado")

    if prestamo.estado == "devuelto":
        raise HTTPException(status_code=400, detail="Este préstamo ya ha sido devuelto anteriormente.")

    prestamo.estado = "devuelto"
    prestamo.fecha_devolucion_real = datetime.now()
    if observacion_retorno:
        prestamo.observaciones = (prestamo.observaciones or "") + f" [Devolución: {observacion_retorno}]"

    # Actualizar estado del equipo a operativo
    if prestamo.equipo:
        prestamo.equipo.estado = "operativo"
        if ubicacion_retorno_id:
            prestamo.equipo.ubicacion_id = ubicacion_retorno_id

    db.commit()
    db.refresh(prestamo)
    return prestamo
