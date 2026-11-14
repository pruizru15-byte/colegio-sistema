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
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import EquipoModel, UbicacionModel, MantenimientoModel, PrestamoModel, UsuarioModel, CodigoQRModel
from app.auth import get_current_user

router = APIRouter(prefix="/reportes", tags=["Módulo de Reportes Estratégicos"])

@router.get("/resumen")
def obtener_resumen_global_reportes(
    db: Session = Depends(get_db),
    user: UsuarioModel = Depends(get_current_user)
):
    """
    Retorna métricas ejecutivas consolidadas para las tarjetas superiores de reportes.
    """
    total_equipos = db.query(EquipoModel).count()
    equipos_operativos = db.query(EquipoModel).filter(EquipoModel.estado == "operativo").count()
    equipos_prestados = db.query(EquipoModel).filter(EquipoModel.estado == "prestado").count()
    equipos_mantenimiento = db.query(EquipoModel).filter(EquipoModel.estado == "en_mantenimiento").count()
    equipos_baja = db.query(EquipoModel).filter(EquipoModel.estado == "de_baja").count()

    total_mantenimientos = db.query(MantenimientoModel).count()
    mantenimientos_completados = db.query(MantenimientoModel).filter(MantenimientoModel.estado == "completado").count()
    
    costo_total = db.query(func.sum(MantenimientoModel.costo_estimado)).scalar() or 0.0

    total_prestamos = db.query(PrestamoModel).count()
    prestamos_activos = db.query(PrestamoModel).filter(PrestamoModel.estado == "activo").count()
    prestamos_devueltos = db.query(PrestamoModel).filter(PrestamoModel.estado == "devuelto").count()

    total_ubicaciones = db.query(UbicacionModel).count()
    total_qr = db.query(CodigoQRModel).count()

    tasa_operatividad = round(((equipos_operativos + equipos_prestados) / total_equipos) * 100, 1) if total_equipos > 0 else 100.0
    cobertura_qr = round((total_qr / total_equipos) * 100, 1) if total_equipos > 0 else 100.0

    return {
        "total_equipos": total_equipos,
        "equipos_operativos": equipos_operativos,
        "equipos_prestados": equipos_prestados,
        "equipos_mantenimiento": equipos_mantenimiento,
        "equipos_baja": equipos_baja,
        "tasa_operatividad": tasa_operatividad,
        "cobertura_qr": cobertura_qr,
        "total_mantenimientos": total_mantenimientos,
        "mantenimientos_completados": mantenimientos_completados,
        "costo_total_mantenimiento": round(costo_total, 2),
        "total_prestamos": total_prestamos,
        "prestamos_activos": prestamos_activos,
        "prestamos_devueltos": prestamos_devueltos,
        "total_ubicaciones": total_ubicaciones,
        "fecha_generacion": datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    }


@router.get("/inventario")
def reporte_inventario(
    tipo: Optional[str] = Query(None, description="Filtrar por tipo de equipo"),
    estado: Optional[str] = Query(None, description="Filtrar por estado operativo"),
    ubicacion_id: Optional[int] = Query(None, description="Filtrar por ubicación"),
    busqueda: Optional[str] = Query(None, description="Búsqueda por nombre, marca o serie"),
    db: Session = Depends(get_db),
    user: UsuarioModel = Depends(get_current_user)
):
    """
    Genera el reporte tabular detallado de inventario de equipos tecnológicos.
    """
    query = db.query(EquipoModel)

    if tipo and tipo != "todos":
        query = query.filter(EquipoModel.tipo == tipo)
    if estado and estado != "todos":
        query = query.filter(EquipoModel.estado == estado)
    if ubicacion_id:
        query = query.filter(EquipoModel.ubicacion_id == ubicacion_id)
    if busqueda:
        term = f"%{busqueda}%"
        query = query.filter(
            (EquipoModel.nombre.ilike(term)) |
            (EquipoModel.codigo_patrimonial.ilike(term)) |
            (EquipoModel.marca.ilike(term)) |
            (EquipoModel.modelo.ilike(term)) |
            (EquipoModel.numero_serie.ilike(term))
        )

    equipos = query.order_by(EquipoModel.id.asc()).all()

    resultado = []
    for eq in equipos:
        ub_nombre = eq.ubicacion.nombre if eq.ubicacion else "Sin Asignar"
        ub_pabellon = eq.ubicacion.pabellon if eq.ubicacion else "-"
        qr_hash = eq.codigo_qr.codigo_hash if eq.codigo_qr else "Sin QR"

        resultado.append({
            "id": eq.id,
            "codigo_patrimonial": eq.codigo_patrimonial,
            "nombre": eq.nombre,
            "tipo": eq.tipo,
            "marca": eq.marca or "-",
            "modelo": eq.modelo or "-",
            "numero_serie": eq.numero_serie or "-",
            "estado": eq.estado,
            "ubicacion": ub_nombre,
            "pabellon": ub_pabellon,
            "codigo_qr": qr_hash,
            "fecha_registro": eq.created_at.strftime("%d/%m/%Y") if eq.created_at else "-"
        })
    return resultado


@router.get("/mantenimientos")
def reporte_mantenimientos(
    tipo: Optional[str] = Query(None),
    prioridad: Optional[str] = Query(None),
    estado: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user: UsuarioModel = Depends(get_current_user)
):
    """
    Genera el reporte de servicios de mantenimiento con costos y técnicos responsables.
    """
    query = db.query(MantenimientoModel)

    if tipo and tipo != "todos":
        query = query.filter(MantenimientoModel.tipo == tipo)
    if prioridad and prioridad != "todos":
        query = query.filter(MantenimientoModel.prioridad == prioridad)
    if estado and estado != "todos":
        query = query.filter(MantenimientoModel.estado == estado)

    registros = query.order_by(MantenimientoModel.fecha_programada.desc()).all()

    resultado = []
    for m in registros:
        resultado.append({
            "id": m.id,
            "codigo_orden": m.codigo_orden,
            "equipo_nombre": m.equipo.nombre if m.equipo else "Equipo no disponible",
            "equipo_codigo": m.equipo.codigo_patrimonial if m.equipo else "-",
            "tipo": m.tipo,
            "prioridad": m.prioridad,
            "estado": m.estado,
            "fecha_programada": m.fecha_programada.strftime("%d/%m/%Y") if m.fecha_programada else "-",
            "fecha_completada": m.fecha_completada.strftime("%d/%m/%Y") if m.fecha_completada else "Pendiente",
            "tecnico_responsable": m.tecnico_responsable,
            "costo_estimado": m.costo_estimado or 0.0,
            "descripcion_problema": m.descripcion_problema,
            "diagnostico_solucion": m.diagnostico_solucion or "En evaluación"
        })
    return resultado


@router.get("/prestamos")
def reporte_prestamos(
    estado: Optional[str] = Query(None),
    ubicacion_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    user: UsuarioModel = Depends(get_current_user)
):
    """
    Genera el reporte de trazabilidad de préstamos institucionales.
    """
    query = db.query(PrestamoModel)

    if estado and estado != "todos":
        query = query.filter(PrestamoModel.estado == estado)
    if ubicacion_id:
        query = query.filter(PrestamoModel.ubicacion_id == ubicacion_id)

    registros = query.order_by(PrestamoModel.fecha_prestamo.desc()).all()

    resultado = []
    for p in registros:
        resultado.append({
            "id": p.id,
            "codigo_prestamo": p.codigo_prestamo,
            "equipo_nombre": p.equipo.nombre if p.equipo else "Equipo",
            "equipo_codigo": p.equipo.codigo_patrimonial if p.equipo else "-",
            "usuario_nombre": p.usuario.nombre if p.usuario else "Usuario",
            "usuario_email": p.usuario.email if p.usuario else "-",
            "usuario_rol": p.usuario.rol if p.usuario else "-",
            "ubicacion_nombre": p.ubicacion.nombre if p.ubicacion else "Ambiente",
            "fecha_prestamo": p.fecha_prestamo.strftime("%d/%m/%Y %H:%M") if p.fecha_prestamo else "-",
            "fecha_devolucion_esperada": p.fecha_devolucion_esperada.strftime("%d/%m/%Y") if p.fecha_devolucion_esperada else "Sin límite",
            "fecha_devolucion_real": p.fecha_devolucion_real.strftime("%d/%m/%Y %H:%M") if p.fecha_devolucion_real else "En posesión",
            "estado": p.estado,
            "motivo": p.motivo or "Uso institucional",
            "observaciones": p.observaciones or "-"
        })
    return resultado


@router.get("/estadisticas")
def estadisticas_graficas(
    db: Session = Depends(get_db),
    user: UsuarioModel = Depends(get_current_user)
):
    """
    Genera agregaciones para gráficos estadísticos del módulo de reportes.
    """
    # Por tipo
    tipos_raw = db.query(EquipoModel.tipo, func.count(EquipoModel.id)).group_by(EquipoModel.tipo).all()
    equipos_por_tipo = [{"tipo": t[0].capitalize(), "cantidad": t[1]} for t in tipos_raw]

    # Por estado
    estados_raw = db.query(EquipoModel.estado, func.count(EquipoModel.id)).group_by(EquipoModel.estado).all()
    equipos_por_estado = [{"estado": e[0].capitalize(), "cantidad": e[1]} for e in estados_raw]

    # Por ubicación
    ubicaciones = db.query(UbicacionModel).all()
    equipos_por_ubicacion = []
    for u in ubicaciones:
        c = db.query(EquipoModel).filter(EquipoModel.ubicacion_id == u.id).count()
        equipos_por_ubicacion.append({"ubicacion": u.nombre, "pabellon": u.pabellon or "Campus", "cantidad": c})

    return {
        "equipos_por_tipo": equipos_por_tipo,
        "equipos_por_estado": equipos_por_estado,
        "equipos_por_ubicacion": equipos_por_ubicacion
    }
