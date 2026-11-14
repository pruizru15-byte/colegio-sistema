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

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.controllers.auth_controller import router as auth_router
from app.controllers.equipo_controller import router as equipo_router
from app.controllers.qr_controller import router as qr_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API REST para el Sistema Web de Inventario Tecnológico con Códigos QR",
    version="1.0.0"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite peticiones desde React y dispositivos móviles
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro de controladores / routers
app.include_router(auth_router, prefix="/api")
app.include_router(equipo_router, prefix="/api")
app.include_router(qr_router, prefix="/api")

@app.get("/health", tags=["Salud del Sistema"])
def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Bienvenido a la API del Sistema de Inventario Escolar con QR",
        "docs": "/docs",
        "version": "1.0.0"
    }
