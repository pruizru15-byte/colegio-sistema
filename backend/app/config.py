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

import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Sistema de Inventario Tecnológico con Códigos QR"
    DB_USER: str = os.getenv("DB_USER", "colegio_user")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "colegio_secure_pass_2026")
    DB_HOST: str = os.getenv("DB_HOST", "db")
    DB_PORT: str = os.getenv("DB_PORT", "3306")
    DB_NAME: str = os.getenv("DB_NAME", "colegio_inventario")
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "colegio_jwt_secret_key_super_segura_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 12

    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    @property
    def DATABASE_URL(self) -> str:
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"

settings = Settings()
