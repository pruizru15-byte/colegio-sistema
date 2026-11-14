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

import io
import uuid
import base64
import qrcode
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models import EquipoModel, CodigoQRModel
from app.schemas import FichaEquipoQRResponse

router = APIRouter(prefix="/qr", tags=["Códigos QR"])

def render_qr_bytes(url_data: str) -> bytes:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(url_data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return buffer.getvalue()

def crear_codigo_qr_para_equipo(equipo: EquipoModel, db: Session) -> CodigoQRModel:
    codigo_hash = str(uuid.uuid4())[:12].upper()
    url_destino = f"{settings.FRONTEND_URL}/ficha/{codigo_hash}"
    
    qr_record = CodigoQRModel(
        codigo_hash=codigo_hash,
        equipo_id=equipo.id,
        url_destino=url_destino,
        ruta_imagen=f"/api/qr/imagen/{codigo_hash}"
    )
    db.add(qr_record)
    db.commit()
    db.refresh(qr_record)
    return qr_record

@router.get("/consultar/{codigo_hash}", response_model=FichaEquipoQRResponse)
def consultar_ficha_por_qr(codigo_hash: str, db: Session = Depends(get_db)):
    """
    4. Visualizar ficha del equipo mediante QR (Diagrama de secuencia):
    Público para cualquier usuario que escanee el código QR.
    """
    qr_record = db.query(CodigoQRModel).filter(CodigoQRModel.codigo_hash == codigo_hash).first()
    if not qr_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Código QR '{codigo_hash}' no encontrado o no está asignado a ningún equipo."
        )
    
    equipo = db.query(EquipoModel).filter(EquipoModel.id == qr_record.equipo_id).first()
    if not equipo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El equipo vinculado a este código QR no existe."
        )

    # Generar Base64 para visualización directa en frontend
    img_bytes = render_qr_bytes(qr_record.url_destino)
    b64_str = base64.b64encode(img_bytes).decode("utf-8")

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
        "ubicacion": equipo.ubicacion,
        "codigo_hash": qr_record.codigo_hash,
        "qr_imagen_base64": f"data:image/png;base64,{b64_str}"
    }

@router.get("/imagen/{codigo_hash}")
def descargar_imagen_qr(codigo_hash: str, db: Session = Depends(get_db)):
    """
    Retorna directamente la imagen PNG del código QR para imprimir o guardar.
    """
    qr_record = db.query(CodigoQRModel).filter(CodigoQRModel.codigo_hash == codigo_hash).first()
    if not qr_record:
        raise HTTPException(status_code=404, detail="Código QR no encontrado")
    
    img_bytes = render_qr_bytes(qr_record.url_destino)
    return Response(content=img_bytes, media_type="image/png")
