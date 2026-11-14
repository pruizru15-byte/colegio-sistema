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
from app.models import UsuarioModel
from app.schemas import UsuarioCreate, UsuarioUpdate, UsuarioResponse
from app.auth import get_password_hash, get_current_user, require_admin

router = APIRouter(prefix="/usuarios", tags=["Gestión de Usuarios"])

@router.get("", response_model=List[UsuarioResponse])
def listar_usuarios(
    busqueda: Optional[str] = Query(None, description="Buscar por nombre o correo"),
    rol: Optional[str] = Query(None, description="Filtrar por rol institucional"),
    db: Session = Depends(get_db),
    admin: UsuarioModel = Depends(require_admin)
):
    """
    Lista todos los usuarios del sistema escolar con opción de búsqueda y filtros.
    """
    query = db.query(UsuarioModel)
    if busqueda:
        term = f"%{busqueda}%"
        query = query.filter(
            (UsuarioModel.nombre.ilike(term)) |
            (UsuarioModel.email.ilike(term))
        )
    if rol:
        query = query.filter(UsuarioModel.rol == rol.lower())

    return query.order_by(UsuarioModel.id.asc()).all()

@router.post("", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def crear_usuario(
    usuario_in: UsuarioCreate,
    db: Session = Depends(get_db),
    admin: UsuarioModel = Depends(require_admin)
):
    """
    Registra un nuevo usuario con contraseña hasheada y asignación de rol.
    """
    existe = db.query(UsuarioModel).filter(UsuarioModel.email == usuario_in.email).first()
    if existe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El correo '{usuario_in.email}' ya se encuentra registrado."
        )

    hashed_pw = get_password_hash(usuario_in.password)
    nuevo_usuario = UsuarioModel(
        nombre=usuario_in.nombre,
        email=usuario_in.email,
        password_hash=hashed_pw,
        rol=usuario_in.rol.lower() if usuario_in.rol else "consulta"
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario

@router.get("/{user_id}", response_model=UsuarioResponse)
def detalle_usuario(
    user_id: int,
    db: Session = Depends(get_db),
    admin: UsuarioModel = Depends(require_admin)
):
    usuario = db.query(UsuarioModel).filter(UsuarioModel.id == user_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario

@router.put("/{user_id}", response_model=UsuarioResponse)
def actualizar_usuario(
    user_id: int,
    usuario_update: UsuarioUpdate,
    db: Session = Depends(get_db),
    admin: UsuarioModel = Depends(require_admin)
):
    """
    Actualiza datos de usuario (nombre, rol, correo y/o contraseña).
    """
    usuario = db.query(UsuarioModel).filter(UsuarioModel.id == user_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if usuario_update.email and usuario_update.email != usuario.email:
        correo_en_uso = db.query(UsuarioModel).filter(UsuarioModel.email == usuario_update.email).first()
        if correo_en_uso:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El correo '{usuario_update.email}' ya pertenece a otro usuario."
            )
        usuario.email = usuario_update.email

    if usuario_update.nombre:
        usuario.nombre = usuario_update.nombre

    if usuario_update.rol:
        usuario.rol = usuario_update.rol.lower()

    if usuario_update.password and usuario_update.password.strip():
        usuario.password_hash = get_password_hash(usuario_update.password)

    db.commit()
    db.refresh(usuario)
    return usuario

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_usuario(
    user_id: int,
    db: Session = Depends(get_db),
    admin: UsuarioModel = Depends(require_admin)
):
    """
    Elimina un usuario del sistema (impide que el admin se borre a sí mismo).
    """
    if admin.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Por seguridad, no puedes eliminar tu propia cuenta activa de Administrador."
        )

    usuario = db.query(UsuarioModel).filter(UsuarioModel.id == user_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    db.delete(usuario)
    db.commit()
    return None
