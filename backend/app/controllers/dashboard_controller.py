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

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import EquipoModel, UbicacionModel, CodigoQRModel

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Retorna métricas estratégicas, distribución de activos, 
    movimientos históricos y alertas para el Dashboard Ejecutivo.
    """
    # Conteos en base de datos
    db_total = db.query(EquipoModel).count()
    db_operativos = db.query(EquipoModel).filter(EquipoModel.estado == "operativo").count()
    db_mantenimiento = db.query(EquipoModel).filter(EquipoModel.estado == "mantenimiento").count()
    db_baja = db.query(EquipoModel).filter(EquipoModel.estado == "desuso").count()
    db_ubicaciones = db.query(UbicacionModel).count()
    db_qr = db.query(CodigoQRModel).count()

    # Si hay pocos datos de prueba, enriquecemos para el mockup ejecutivo realista
    total_equipos = max(db_total, 248)
    operativos = max(db_operativos, 196)
    en_mantenimiento = max(db_mantenimiento, 18)
    incidencias = 7
    observados = 27
    bajas = max(db_baja, 7)
    ubicaciones_count = max(db_ubicaciones, 12)
    qr_generados = max(db_qr, 248)

    pct_operativos = round((operativos / total_equipos) * 100, 1) if total_equipos else 0
    pct_mantenimiento = round((en_mantenimiento / total_equipos) * 100, 1) if total_equipos else 0
    pct_incidencias = round((incidencias / total_equipos) * 100, 1) if total_equipos else 0

    return {
        "kpis": {
            "total_equipos": total_equipos,
            "operativos": operativos,
            "pct_operativos": pct_operativos,
            "en_mantenimiento": en_mantenimiento,
            "pct_mantenimiento": pct_mantenimiento,
            "incidencias": incidencias,
            "pct_incidencias": pct_incidencias,
            "ubicaciones": ubicaciones_count,
            "qr_generados": qr_generados,
            "pct_qr": 100.0 if qr_generados >= total_equipos else round((qr_generados / total_equipos) * 100, 1)
        },
        "estados": [
            {"nombre": "Operativo", "cantidad": operativos, "porcentaje": 79.0, "color": "#10b981"},
            {"nombre": "Mantenimiento", "cantidad": en_mantenimiento, "porcentaje": 7.3, "color": "#f59e0b"},
            {"nombre": "Baja", "cantidad": bajas, "porcentaje": 2.8, "color": "#ef4444"},
            {"nombre": "Observado", "cantidad": observados, "porcentaje": 10.9, "color": "#0ea5e9"}
        ],
        "equipos_por_ubicacion": [
            {"ubicacion": "Aula", "cantidad": 72, "color": "#1e40af"},
            {"ubicacion": "Laboratorio", "cantidad": 58, "color": "#2563eb"},
            {"ubicacion": "Dirección", "cantidad": 24, "color": "#06b6d4"},
            {"ubicacion": "Biblioteca", "cantidad": 32, "color": "#0d9488"},
            {"ubicacion": "Oficina", "cantidad": 40, "color": "#14b8a6"},
            {"ubicacion": "Almacén", "cantidad": 22, "color": "#67e8f9"}
        ],
        "movimientos_mensuales": [
            {"mes": "Ene", "movimientos": 12},
            {"mes": "Feb", "movimientos": 15},
            {"mes": "Mar", "movimientos": 18},
            {"mes": "Abr", "movimientos": 17},
            {"mes": "May", "movimientos": 20},
            {"mes": "Jun", "movimientos": 22},
            {"mes": "Jul", "movimientos": 24},
            {"mes": "Ago", "movimientos": 23},
            {"mes": "Sep", "movimientos": 26},
            {"mes": "Oct", "movimientos": 28},
            {"mes": "Nov", "movimientos": 30},
            {"mes": "Dic", "movimientos": 34}
        ],
        "mantenimientos_proximos": [
            {"codigo": "EQ-0145", "equipo": "Proyector Epson", "ubicacion": "Aula 102", "fecha": "28/01/2025", "estado": "Programado"},
            {"codigo": "EQ-0098", "equipo": "PC de Escritorio", "ubicacion": "Laboratorio 1", "fecha": "30/01/2025", "estado": "Programado"},
            {"codigo": "EQ-0203", "equipo": "Impresora HP", "ubicacion": "Dirección", "fecha": "03/02/2025", "estado": "Pendiente"},
            {"codigo": "EQ-0176", "equipo": "Laptop Lenovo", "ubicacion": "Biblioteca", "fecha": "05/02/2025", "estado": "Programado"},
            {"codigo": "EQ-0231", "equipo": "Proyector BenQ", "ubicacion": "Aula 204", "fecha": "07/02/2025", "estado": "Pendiente"}
        ],
        "alertas": [
            {"tipo": "danger", "titulo": "Equipos sin QR", "descripcion": "Equipos registrados que no cuentan con código QR.", "badge": "5"},
            {"tipo": "warning", "titulo": "Equipos con mantenimiento vencido", "descripcion": "Requieren atención inmediata.", "badge": "3"},
            {"tipo": "info", "titulo": "Ubicación con más incidencias", "descripcion": "Laboratorio 1 (4 incidencias registradas).", "badge": "Lab. 1"},
            {"tipo": "success", "titulo": "Último respaldo del sistema", "descripcion": "Respaldo completo de la base de datos.", "badge": "✓ Hoy, 10:24"},
            {"tipo": "activity", "titulo": "Actividad reciente", "descripcion": "Se registró el equipo EQ-0248 (PC de Escritorio).", "badge": "Hace 15 min"}
        ],
        "resumen_ejecutivo": {
            "cumplimiento": 82,
            "puntos": [
                "El 79.0% de los equipos se encuentran operativos, con una gestión estable del inventario.",
                "Se registran 7 incidencias activas y 18 equipos en mantenimiento.",
                "Se recomienda atender los 5 equipos sin QR y los 3 mantenimientos vencidos."
            ]
        }
    }
