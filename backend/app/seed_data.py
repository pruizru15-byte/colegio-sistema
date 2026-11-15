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

"""
Script de Carga de Datos Oficiales Institucionales para el Colegio UCV.
Puebla el inventario tecnológico escolar con equipos reales, códigos QR, 
órdenes de mantenimiento y préstamos activos/históricos.
"""

from datetime import datetime, date, timedelta
from app.database import SessionLocal
from app.models import EquipoModel, UbicacionModel, CodigoQRModel, MantenimientoModel, PrestamoModel, UsuarioModel
from app.controllers.qr_controller import crear_codigo_qr_para_equipo

def seed_official_data():
    db = SessionLocal()
    print("Iniciando verificación y población de datos oficiales...")

    # 1. Verificar ubicaciones oficiales
    ubicaciones = {u.nombre: u.id for u in db.query(UbicacionModel).all()}
    print(f"Ubicaciones existentes: {list(ubicaciones.keys())}")

    # 2. Catálogo Oficial de Equipos Escolares
    equipos_data = [
        # --- Laboratorio de Cómputo 1 (ID 1) ---
        {
            "codigo_patrimonial": "COL-PC-006",
            "nombre": "Estación Alumno 01 - Core i5",
            "tipo": "computadora",
            "marca": "Dell",
            "modelo": "OptiPlex 7080 SFF",
            "numero_serie": "DL-7080-006",
            "estado": "operativo",
            "observaciones": "Equipo de laboratorio con monitor Dell 24 pulgadas FHD.",
            "ubicacion_nombre": "Laboratorio de Cómputo 1"
        },
        {
            "codigo_patrimonial": "COL-PC-007",
            "nombre": "Estación Alumno 02 - Core i5",
            "tipo": "computadora",
            "marca": "Dell",
            "modelo": "OptiPlex 7080 SFF",
            "numero_serie": "DL-7080-007",
            "estado": "operativo",
            "observaciones": "Equipo de laboratorio con monitor Dell 24 pulgadas FHD.",
            "ubicacion_nombre": "Laboratorio de Cómputo 1"
        },
        {
            "codigo_patrimonial": "COL-PC-008",
            "nombre": "Estación Alumno 03 - Core i5",
            "tipo": "computadora",
            "marca": "Dell",
            "modelo": "OptiPlex 7080 SFF",
            "numero_serie": "DL-7080-008",
            "estado": "operativo",
            "observaciones": "Equipo de laboratorio con monitor Dell 24 pulgadas FHD.",
            "ubicacion_nombre": "Laboratorio de Cómputo 1"
        },
        {
            "codigo_patrimonial": "COL-PC-009",
            "nombre": "Estación Alumno 04 - Core i5",
            "tipo": "computadora",
            "marca": "Dell",
            "modelo": "OptiPlex 7080 SFF",
            "numero_serie": "DL-7080-009",
            "estado": "operativo",
            "observaciones": "Equipo de laboratorio con monitor Dell 24 pulgadas FHD.",
            "ubicacion_nombre": "Laboratorio de Cómputo 1"
        },
        {
            "codigo_patrimonial": "COL-PC-010",
            "nombre": "Estación Alumno 05 - Core i5",
            "tipo": "computadora",
            "marca": "Dell",
            "modelo": "OptiPlex 7080 SFF",
            "numero_serie": "DL-7080-010",
            "estado": "mantenimiento",
            "observaciones": "Fuente de poder con ruido anormal, en revisión técnica preventiva.",
            "ubicacion_nombre": "Laboratorio de Cómputo 1"
        },
        {
            "codigo_patrimonial": "COL-PC-011",
            "nombre": "Estación Alumno 06 - Core i5",
            "tipo": "computadora",
            "marca": "Dell",
            "modelo": "OptiPlex 7080 SFF",
            "numero_serie": "DL-7080-011",
            "estado": "operativo",
            "observaciones": "Equipo de laboratorio con monitor Dell 24 pulgadas FHD.",
            "ubicacion_nombre": "Laboratorio de Cómputo 1"
        },
        {
            "codigo_patrimonial": "COL-PC-012",
            "nombre": "Estación Alumno 07 - Core i5",
            "tipo": "computadora",
            "marca": "Dell",
            "modelo": "OptiPlex 7080 SFF",
            "numero_serie": "DL-7080-012",
            "estado": "operativo",
            "observaciones": "Equipo de laboratorio con monitor Dell 24 pulgadas FHD.",
            "ubicacion_nombre": "Laboratorio de Cómputo 1"
        },
        {
            "codigo_patrimonial": "COL-SW-001",
            "nombre": "Switch Core Administrable 24P",
            "tipo": "otro",
            "marca": "Cisco",
            "modelo": "Catalyst 2960-X",
            "numero_serie": "FCW2145L09",
            "estado": "operativo",
            "observaciones": "Switch principal de distribución de red para Laboratorio 1 y 2.",
            "ubicacion_nombre": "Laboratorio de Cómputo 1"
        },
        {
            "codigo_patrimonial": "COL-PROY-001",
            "nombre": "Proyector Láser Interactivo de Corto Alcance",
            "tipo": "proyector",
            "marca": "Epson",
            "modelo": "BrightLink 735Fi",
            "numero_serie": "EP-BL735-9921",
            "estado": "operativo",
            "observaciones": "Proyector interactivo con lápices táctiles para pizarra acrílica.",
            "ubicacion_nombre": "Laboratorio de Cómputo 1"
        },

        # --- Laboratorio de Cómputo 2 (ID 2) ---
        {
            "codigo_patrimonial": "COL-TAB-005",
            "nombre": "Tablet Educativa Primaria A1",
            "tipo": "tablet",
            "marca": "Samsung",
            "modelo": "Galaxy Tab A8 10.5",
            "numero_serie": "SM-X200-005",
            "estado": "operativo",
            "observaciones": "Funda de alto impacto con protector antigolpes azul.",
            "ubicacion_nombre": "Laboratorio de Cómputo 2"
        },
        {
            "codigo_patrimonial": "COL-TAB-006",
            "nombre": "Tablet Educativa Primaria A2",
            "tipo": "tablet",
            "marca": "Samsung",
            "modelo": "Galaxy Tab A8 10.5",
            "numero_serie": "SM-X200-006",
            "estado": "operativo",
            "observaciones": "Funda de alto impacto con protector antigolpes azul.",
            "ubicacion_nombre": "Laboratorio de Cómputo 2"
        },
        {
            "codigo_patrimonial": "COL-TAB-007",
            "nombre": "Tablet Educativa Primaria A3",
            "tipo": "tablet",
            "marca": "Samsung",
            "modelo": "Galaxy Tab A8 10.5",
            "numero_serie": "SM-X200-007",
            "estado": "prestado",
            "observaciones": "En préstamo para taller de robótica escolar.",
            "ubicacion_nombre": "Laboratorio de Cómputo 2"
        },
        {
            "codigo_patrimonial": "COL-TAB-008",
            "nombre": "Tablet Educativa Primaria A4",
            "tipo": "tablet",
            "marca": "Samsung",
            "modelo": "Galaxy Tab A8 10.5",
            "numero_serie": "SM-X200-008",
            "estado": "desuso",
            "observaciones": "Pantalla trizada por caída. En trámite de baja patrimonial.",
            "ubicacion_nombre": "Laboratorio de Cómputo 2"
        },
        {
            "codigo_patrimonial": "COL-ACC-001",
            "nombre": "Carrito Estación de Carga Móvil 20 Bahías",
            "tipo": "otro",
            "marca": "Bretford",
            "modelo": "PowerSync Pro 20",
            "numero_serie": "BF-PS20-883",
            "estado": "operativo",
            "observaciones": "Cargador con temporizador inteligente y ruedas de seguridad.",
            "ubicacion_nombre": "Laboratorio de Cómputo 2"
        },
        {
            "codigo_patrimonial": "COL-PC-014",
            "nombre": "Servidor Local de Contenidos y Caché",
            "tipo": "computadora",
            "marca": "HP",
            "modelo": "ProLiant ML30 Gen10",
            "numero_serie": "HP-ML30-4491",
            "estado": "operativo",
            "observaciones": "Servidor interno proxy y repositorio de guías educativas.",
            "ubicacion_nombre": "Laboratorio de Cómputo 2"
        },

        # --- Sala de Profesores (ID 3) ---
        {
            "codigo_patrimonial": "COL-LAP-003",
            "nombre": "Laptop Docente Ciencias y Matemáticas",
            "tipo": "laptop",
            "marca": "Lenovo",
            "modelo": "ThinkPad E14 Gen 4",
            "numero_serie": "PF-3K092A",
            "estado": "operativo",
            "observaciones": "Intel Core i5, 16GB RAM, SSD 512GB, Windows 11 Pro.",
            "ubicacion_nombre": "Sala de Profesores"
        },
        {
            "codigo_patrimonial": "COL-LAP-004",
            "nombre": "Laptop Docente Humanidades y Lenguaje",
            "tipo": "laptop",
            "marca": "Lenovo",
            "modelo": "ThinkPad E14 Gen 4",
            "numero_serie": "PF-3K092B",
            "estado": "operativo",
            "observaciones": "Intel Core i5, 16GB RAM, SSD 512GB, Windows 11 Pro.",
            "ubicacion_nombre": "Sala de Profesores"
        },
        {
            "codigo_patrimonial": "COL-LAP-005",
            "nombre": "Laptop Docente Coordinación de Área",
            "tipo": "laptop",
            "marca": "HP",
            "modelo": "ProBook 440 G8",
            "numero_serie": "5CD1490XYZ",
            "estado": "prestado",
            "observaciones": "Asignada a coordinación para evaluaciones censales.",
            "ubicacion_nombre": "Sala de Profesores"
        },
        {
            "codigo_patrimonial": "COL-IMP-006",
            "nombre": "Impresora Multifuncional Departamental EcoTank",
            "tipo": "impresora",
            "marca": "Epson",
            "modelo": "EcoTank L5290",
            "numero_serie": "X892-0921-ET",
            "estado": "operativo",
            "observaciones": "Sistema de tanque de tinta continuo, escáner dúplex con ADF.",
            "ubicacion_nombre": "Sala de Profesores"
        },

        # --- Biblioteca Central (ID 4) ---
        {
            "codigo_patrimonial": "COL-PC-015",
            "nombre": "PC Catálogo Bibliotecario Alumnos 01",
            "tipo": "computadora",
            "marca": "HP",
            "modelo": "ProDesk 400 G6",
            "numero_serie": "HP-PD400-015",
            "estado": "operativo",
            "observaciones": "Terminal de consulta de libros y recursos digitales en sala.",
            "ubicacion_nombre": "Biblioteca Central"
        },
        {
            "codigo_patrimonial": "COL-PC-016",
            "nombre": "PC Catálogo Bibliotecario Alumnos 02",
            "tipo": "computadora",
            "marca": "HP",
            "modelo": "ProDesk 400 G6",
            "numero_serie": "HP-PD400-016",
            "estado": "operativo",
            "observaciones": "Terminal de consulta de libros y recursos digitales en sala.",
            "ubicacion_nombre": "Biblioteca Central"
        },
        {
            "codigo_patrimonial": "COL-ESC-001",
            "nombre": "Escáner Plano de Documentos y Textos",
            "tipo": "otro",
            "marca": "Epson",
            "modelo": "Perfection V39 II",
            "numero_serie": "EP-V39-9941",
            "estado": "operativo",
            "observaciones": "Escáner fotográfico y de documentos 4800 dpi.",
            "ubicacion_nombre": "Biblioteca Central"
        },

        # --- Auditorio Principal (ID 5) ---
        {
            "codigo_patrimonial": "COL-PROY-002",
            "nombre": "Proyector Láser Gran Formato 6500 Lúmenes",
            "tipo": "proyector",
            "marca": "Sony",
            "modelo": "VPL-FHZ75",
            "numero_serie": "SN-VPL-55910",
            "estado": "operativo",
            "observaciones": "Proyector central para ceremonias, conferencias y asambleas.",
            "ubicacion_nombre": "Auditorio Principal"
        },
        {
            "codigo_patrimonial": "COL-AUD-001",
            "nombre": "Consola de Mezcla Digital 32 Canales",
            "tipo": "otro",
            "marca": "Behringer",
            "modelo": "X32 Producer",
            "numero_serie": "BR-X32-1109",
            "estado": "operativo",
            "observaciones": "Consola de audio en cabina de sonido del auditorio central.",
            "ubicacion_nombre": "Auditorio Principal"
        },
        {
            "codigo_patrimonial": "COL-PC-018",
            "nombre": "Workstation Multimedia Cabina Auditorio",
            "tipo": "computadora",
            "marca": "HP",
            "modelo": "Z2 G5 Workstation",
            "numero_serie": "HP-Z2G5-0018",
            "estado": "operativo",
            "observaciones": "Intel Core i7, 32GB RAM, Nvidia RTX 3060 para transmisiones en vivo.",
            "ubicacion_nombre": "Auditorio Principal"
        },

        # --- Dirección Académica (ID 6) ---
        {
            "codigo_patrimonial": "COL-LAP-006",
            "nombre": "Laptop Ejecutiva Dirección General",
            "tipo": "laptop",
            "marca": "Dell",
            "modelo": "Latitude 5420",
            "numero_serie": "DL-5420-DIR",
            "estado": "operativo",
            "observaciones": "Intel Core i7 11va Gen, 16GB RAM, BitLocker activo.",
            "ubicacion_nombre": "Dirección Académica"
        },
        {
            "codigo_patrimonial": "COL-IMP-007",
            "nombre": "Impresora Multifuncional Láser Color Ejecutiva",
            "tipo": "impresora",
            "marca": "HP",
            "modelo": "Color LaserJet Pro MFP 3301fdw",
            "numero_serie": "HP-CLJ-3301",
            "estado": "operativo",
            "observaciones": "Impresión de documentos confidenciales con PIN.",
            "ubicacion_nombre": "Dirección Académica"
        },
        {
            "codigo_patrimonial": "COL-NAS-001",
            "nombre": "Servidor NAS Central de Respaldo Institucional",
            "tipo": "otro",
            "marca": "Synology",
            "modelo": "DiskStation DS920+",
            "numero_serie": "SY-DS920-881",
            "estado": "operativo",
            "observaciones": "Arreglo RAID 5 de 16TB para respaldos diarios automatizados.",
            "ubicacion_nombre": "Dirección Académica"
        }
    ]

    creados_equipos = 0
    for eq in equipos_data:
        ub_id = ubicaciones.get(eq["ubicacion_nombre"])
        existe = db.query(EquipoModel).filter(EquipoModel.codigo_patrimonial == eq["codigo_patrimonial"]).first()
        if not existe:
            nuevo = EquipoModel(
                codigo_patrimonial=eq["codigo_patrimonial"],
                nombre=eq["nombre"],
                tipo=eq["tipo"],
                marca=eq["marca"],
                modelo=eq["modelo"],
                numero_serie=eq["numero_serie"],
                estado=eq["estado"],
                observaciones=eq["observaciones"],
                ubicacion_id=ub_id
            )
            db.add(nuevo)
            db.commit()
            db.refresh(nuevo)
            crear_codigo_qr_para_equipo(nuevo, db)
            creados_equipos += 1
            print(f" + Creado equipo y QR: {nuevo.codigo_patrimonial} ({nuevo.nombre})")

    print(f"Equipos agregados: {creados_equipos}. Total en BD: {db.query(EquipoModel).count()}")

    # 3. Mantenimientos Oficiales Programados y en Curso
    equipos_map = {e.codigo_patrimonial: e for e in db.query(EquipoModel).all()}
    
    mantenimientos_extra = [
        {
            "codigo_orden": "MNT-2026-0004",
            "equipo_codigo": "COL-PC-010",
            "tipo": "correctivo",
            "prioridad": "alta",
            "estado": "en_proceso",
            "fecha_programada": date(2026, 11, 19),
            "tecnico_responsable": "Ing. Roberto Paz",
            "costo_estimado": 120.0,
            "descripcion_problema": "Reemplazo de fuente de poder ATX 500W con capacitores degradados.",
            "diagnostico_solucion": "Desmonte de fuente y pruebas de voltaje en riel de 12V."
        },
        {
            "codigo_orden": "MNT-2026-0005",
            "equipo_codigo": "COL-PROY-001",
            "tipo": "preventivo",
            "prioridad": "media",
            "estado": "programado",
            "fecha_programada": date(2026, 11, 24),
            "tecnico_responsable": "Ing. Roberto Paz",
            "costo_estimado": 80.0,
            "descripcion_problema": "Limpieza de filtros de aire electrostáticos y calibración óptica interactiva.",
            "diagnostico_solucion": None
        },
        {
            "codigo_orden": "MNT-2026-0006",
            "equipo_codigo": "COL-NAS-001",
            "tipo": "preventivo",
            "prioridad": "baja",
            "estado": "programado",
            "fecha_programada": date(2026, 11, 28),
            "tecnico_responsable": "Ing. Roberto Paz",
            "costo_estimado": 50.0,
            "descripcion_problema": "Auditoría de sectores defectuosos SMART y actualización de firmware DSM.",
            "diagnostico_solucion": None
        },
        {
            "codigo_orden": "MNT-2026-0007",
            "equipo_codigo": "COL-PROY-002",
            "tipo": "preventivo",
            "prioridad": "media",
            "estado": "programado",
            "fecha_programada": date(2026, 12, 3),
            "tecnico_responsable": "Ing. Roberto Paz",
            "costo_estimado": 100.0,
            "descripcion_problema": "Mantenimiento semestral del sistema óptico del auditorio.",
            "diagnostico_solucion": None
        }
    ]

    for m in mantenimientos_extra:
        eq = equipos_map.get(m["equipo_codigo"])
        if eq:
            existe_m = db.query(MantenimientoModel).filter(MantenimientoModel.codigo_orden == m["codigo_orden"]).first()
            if not existe_m:
                nuevo_m = MantenimientoModel(
                    codigo_orden=m["codigo_orden"],
                    equipo_id=eq.id,
                    tipo=m["tipo"],
                    prioridad=m["prioridad"],
                    estado=m["estado"],
                    fecha_programada=m["fecha_programada"],
                    tecnico_responsable=m["tecnico_responsable"],
                    costo_estimado=m["costo_estimado"],
                    descripcion_problema=m["descripcion_problema"],
                    diagnostico_solucion=m["diagnostico_solucion"]
                )
                db.add(nuevo_m)
                db.commit()
                print(f" + Creada orden de mantenimiento: {m['codigo_orden']} para {eq.codigo_patrimonial}")

    # 4. Préstamos Extra para generar historial mensual dinámico
    usuarios = db.query(UsuarioModel).all()
    user_docente = next((u for u in usuarios if u.rol == "docente"), usuarios[0])
    
    prestamos_extra = [
        {
            "codigo_prestamo": "PR-2026-004",
            "equipo_codigo": "COL-TAB-007",
            "usuario_id": user_docente.id,
            "ubicacion_id": ubicaciones.get("Laboratorio de Cómputo 2", 2),
            "fecha_prestamo": datetime(2026, 11, 14, 9, 30),
            "fecha_devolucion_esperada": date(2026, 11, 21),
            "estado": "activo",
            "motivo": "Uso en taller pedagógico extracurricular de robótica."
        },
        {
            "codigo_prestamo": "PR-2026-005",
            "equipo_codigo": "COL-LAP-005",
            "usuario_id": user_docente.id,
            "ubicacion_id": ubicaciones.get("Sala de Profesores", 3),
            "fecha_prestamo": datetime(2026, 11, 10, 14, 0),
            "fecha_devolucion_esperada": date(2026, 11, 17),
            "estado": "activo",
            "motivo": "Evaluaciones diagnósticas censales del ministerio."
        },
        # Préstamos históricos completados de meses anteriores para alimentar gráfica mensual
        {
            "codigo_prestamo": "PR-2026-H01",
            "equipo_codigo": "COL-LAP-003",
            "usuario_id": user_docente.id,
            "ubicacion_id": ubicaciones.get("Sala de Profesores", 3),
            "fecha_prestamo": datetime(2026, 3, 15, 10, 0),
            "fecha_devolucion_esperada": date(2026, 3, 22),
            "fecha_devolucion_real": datetime(2026, 3, 21, 16, 0),
            "estado": "devuelto",
            "motivo": "Capacitación de inicio de año escolar."
        },
        {
            "codigo_prestamo": "PR-2026-H02",
            "equipo_codigo": "COL-PROY-001",
            "usuario_id": user_docente.id,
            "ubicacion_id": ubicaciones.get("Laboratorio de Cómputo 1", 1),
            "fecha_prestamo": datetime(2026, 5, 8, 8, 30),
            "fecha_devolucion_esperada": date(2026, 5, 9),
            "fecha_devolucion_real": datetime(2026, 5, 9, 13, 0),
            "estado": "devuelto",
            "motivo": "Presentación de feria escolar."
        },
        {
            "codigo_prestamo": "PR-2026-H03",
            "equipo_codigo": "COL-TAB-006",
            "usuario_id": user_docente.id,
            "ubicacion_id": ubicaciones.get("Laboratorio de Cómputo 2", 2),
            "fecha_prestamo": datetime(2026, 8, 20, 11, 0),
            "fecha_devolucion_esperada": date(2026, 8, 27),
            "fecha_devolucion_real": datetime(2026, 8, 26, 15, 30),
            "estado": "devuelto",
            "motivo": "Evaluación semestral de comprensión lectora."
        },
        {
            "codigo_prestamo": "PR-2026-H04",
            "equipo_codigo": "COL-LAP-004",
            "usuario_id": user_docente.id,
            "ubicacion_id": ubicaciones.get("Sala de Profesores", 3),
            "fecha_prestamo": datetime(2026, 10, 5, 9, 0),
            "fecha_devolucion_esperada": date(2026, 10, 12),
            "fecha_devolucion_real": datetime(2026, 10, 11, 17, 0),
            "estado": "devuelto",
            "motivo": "Jornada de planificación pedagógica institucional."
        }
    ]

    for p in prestamos_extra:
        eq = equipos_map.get(p["equipo_codigo"])
        if eq:
            existe_p = db.query(PrestamoModel).filter(PrestamoModel.codigo_prestamo == p["codigo_prestamo"]).first()
            if not existe_p:
                nuevo_p = PrestamoModel(
                    codigo_prestamo=p["codigo_prestamo"],
                    equipo_id=eq.id,
                    usuario_id=p["usuario_id"],
                    ubicacion_id=p["ubicacion_id"],
                    fecha_prestamo=p["fecha_prestamo"],
                    fecha_devolucion_esperada=p["fecha_devolucion_esperada"],
                    fecha_devolucion_real=p.get("fecha_devolucion_real"),
                    estado=p["estado"],
                    motivo=p["motivo"]
                )
                db.add(nuevo_p)
                db.commit()
                print(f" + Creado registro de préstamo: {p['codigo_prestamo']} para {eq.codigo_patrimonial}")

    db.close()
    print("¡Población de datos oficiales completada exitosamente!")

if __name__ == "__main__":
    seed_official_data()
