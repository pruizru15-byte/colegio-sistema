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
from app.database import get_db, engine, Base
from app.models import (
    NotificacionModel, PrestamoModel, MantenimientoModel, 
    EquipoModel, UsuarioModel
)
from app.schemas import (
    NotificacionCreate, NotificacionResponse, NotificacionesListResponse
)
from app.auth import get_current_user

# Asegurar creación de la tabla en base de datos si no existe
Base.metadata.create_all(bind=engine)

router = APIRouter(prefix="/notificaciones", tags=["Centro de Notificaciones"])

def sincronizar_alertas_sistema(db: Session):
    """
    Evalúa en tiempo real el estado del colegio y genera alertas automáticas:
    - Préstamos vencidos o por vencer
    - Mantenimientos urgentes o programados para hoy
    - Equipos dados de baja o en estado crítico
    """
    hoy = date.today()

    # 1. Alertas de Préstamos
    prestamos_activos = db.query(PrestamoModel).filter(PrestamoModel.estado == "activo").all()
    for p in prestamos_activos:
        if p.fecha_devolucion_esperada:
            if p.fecha_devolucion_esperada < hoy:
                # Préstamo Vencido
                eq_nom = p.equipo.nombre if p.equipo else "Equipo escolar"
                usr_nom = p.usuario.nombre if p.usuario else "Docente"
                tit = f"⚠️ Préstamo Vencido: {eq_nom}"
                desc = f"El dispositivo {p.equipo.codigo_patrimonial if p.equipo else ''} en poder de {usr_nom} debía devolverse el {p.fecha_devolucion_esperada}."
                existe = db.query(NotificacionModel).filter(
                    NotificacionModel.titulo == tit,
                    NotificacionModel.categoria == "prestamo"
                ).first()
                if not existe:
                    db.add(NotificacionModel(
                        titulo=tit,
                        descripcion=desc,
                        tipo="danger",
                        categoria="prestamo",
                        enlace_url="/inventario?tab=prestamos"
                    ))
            elif p.fecha_devolucion_esperada == hoy:
                # Vence Hoy
                eq_nom = p.equipo.nombre if p.equipo else "Equipo escolar"
                usr_nom = p.usuario.nombre if p.usuario else "Docente"
                tit = f"🔔 Devolución Programada Hoy: {eq_nom}"
                desc = f"El equipo prestado a {usr_nom} tiene fecha límite de devolución para el día de hoy."
                existe = db.query(NotificacionModel).filter(
                    NotificacionModel.titulo == tit,
                    NotificacionModel.categoria == "prestamo"
                ).first()
                if not existe:
                    db.add(NotificacionModel(
                        titulo=tit,
                        descripcion=desc,
                        tipo="warning",
                        categoria="prestamo",
                        enlace_url="/inventario?tab=prestamos"
                    ))

    # 2. Alertas de Mantenimientos
    mantenimientos_pendientes = db.query(MantenimientoModel).filter(
        MantenimientoModel.estado.in_(["programado", "en_proceso"])
    ).all()
    for m in mantenimientos_pendientes:
        eq_nom = m.equipo.nombre if m.equipo else "Equipo escolar"
        if m.prioridad in ["urgente", "alta"]:
            tit = f"🚨 Mantenimiento Crítico: {eq_nom} ({m.codigo_orden})"
            desc = f"Falla de alta prioridad reportada: '{m.descripcion_problema}'. Técnico: {m.tecnico_responsable}."
            existe = db.query(NotificacionModel).filter(
                NotificacionModel.titulo == tit,
                NotificacionModel.categoria == "mantenimiento"
            ).first()
            if not existe:
                db.add(NotificacionModel(
                    titulo=tit,
                    descripcion=desc,
                    tipo="danger",
                    categoria="mantenimiento",
                    enlace_url="/mantenimientos?estado=en_proceso"
                ))
        elif m.fecha_programada == hoy and m.estado == "programado":
            tit = f"🔧 Servicio Programado Hoy: {eq_nom}"
            desc = f"Orden {m.codigo_orden} programada para intervención técnica hoy por {m.tecnico_responsable}."
            existe = db.query(NotificacionModel).filter(
                NotificacionModel.titulo == tit,
                NotificacionModel.categoria == "mantenimiento"
            ).first()
            if not existe:
                db.add(NotificacionModel(
                    titulo=tit,
                    descripcion=desc,
                    tipo="warning",
                    categoria="mantenimiento",
                    enlace_url="/mantenimientos?estado=programado"
                ))

    # 3. Notificación institucional inicial si está vacía
    cant_total = db.query(NotificacionModel).count()
    if cant_total == 0:
        db.add(NotificacionModel(
            titulo="🎓 Sistema de Inventario QR Inicializado",
            descripcion="El control escolar de bienes tecnológicos, ubicaciones y rótulos QR se encuentra 100% operativo.",
            tipo="success",
            categoria="sistema",
            enlace_url="/dashboard"
        ))
        db.add(NotificacionModel(
            titulo="📲 Cobertura Total de Rótulos QR",
            descripcion="Todos los equipos registrados cuentan con código QR para escaneo y consulta pública.",
            tipo="info",
            categoria="equipo",
            enlace_url="/escaner?tab=catalogo"
        ))

    db.commit()


@router.get("", response_model=NotificacionesListResponse)
def listar_notificaciones(
    categoria: Optional[str] = Query(None, description="Filtrar por categoría (mantenimiento, prestamo, equipo, sistema)"),
    tipo: Optional[str] = Query(None, description="danger, warning, success, info"),
    solo_no_leidas: bool = Query(False, description="Filtrar solo no leídas"),
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_user)
):
    """
    Retorna la lista consolidada de notificaciones activas del colegio,
    calculando alertas de mantenimientos y préstamos en tiempo real.
    """
    sincronizar_alertas_sistema(db)

    query = db.query(NotificacionModel)

    if categoria and categoria != "todas":
        query = query.filter(NotificacionModel.categoria == categoria)
    if tipo and tipo != "todos":
        query = query.filter(NotificacionModel.tipo == tipo)
    if solo_no_leidas:
        query = query.filter(NotificacionModel.leido == False)

    todas = query.order_by(NotificacionModel.id.desc()).all()

    # Métricas del centro de notificaciones
    total = len(todas)
    no_leidas = sum(1 for n in todas if not n.leido)
    urgentes = sum(1 for n in todas if n.tipo == "danger")
    advertencias = sum(1 for n in todas if n.tipo == "warning")
    informativas = sum(1 for n in todas if n.tipo in ["info", "success"])

    return {
        "total": total,
        "no_leidas": no_leidas,
        "urgentes": urgentes,
        "advertencias": advertencias,
        "informativas": informativas,
        "notificaciones": todas
    }


@router.put("/{notificacion_id}/leer", response_model=NotificacionResponse)
def marcar_como_leida(
    notificacion_id: int,
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_user)
):
    """
    Marca una notificación específica como leída.
    """
    notif = db.query(NotificacionModel).filter(NotificacionModel.id == notificacion_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")

    notif.leido = True
    db.commit()
    db.refresh(notif)
    return notif


@router.post("/marcar-todas-leidas")
def marcar_todas_como_leidas(
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_user)
):
    """
    Marca todas las notificaciones existentes como leídas.
    """
    db.query(NotificacionModel).filter(NotificacionModel.leido == False).update({"leido": True})
    db.commit()
    return {"message": "Todas las notificaciones han sido marcadas como leídas."}


@router.post("", response_model=NotificacionResponse, status_code=status.HTTP_201_CREATED)
def emitir_notificacion(
    notif_in: NotificacionCreate,
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_user)
):
    """
    Permite emitir un comunicado o alerta escolar general.
    """
    nueva = NotificacionModel(
        titulo=notif_in.titulo,
        descripcion=notif_in.descripcion,
        tipo=notif_in.tipo or "info",
        categoria=notif_in.categoria or "sistema",
        enlace_url=notif_in.enlace_url,
        usuario_id=current_user.id
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva


@router.delete("/{notificacion_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_notificacion(
    notificacion_id: int,
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_user)
):
    """
    Elimina una notificación del historial.
    """
    notif = db.query(NotificacionModel).filter(NotificacionModel.id == notificacion_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")

    db.delete(notif)
    db.commit()
    return None
