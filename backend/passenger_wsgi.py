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

# Phusion Passenger WSGI adapter for cPanel Python Application
import sys
import os

# Agregar directorio del backend al path de ejecución de Python
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

# Cargar variables de entorno si existe .env local
env_path = os.path.join(CURRENT_DIR, '.env')
if os.path.exists(env_path):
    try:
        from dotenv import load_dotenv
        load_dotenv(env_path)
    except Exception:
        pass

os.environ.setdefault("FRONTEND_URL", "https://popydev.com/sistema-colegio")

from app.main import app
from a2wsgi import ASGIMiddleware

# Phusion Passenger en cPanel ejecuta este objeto 'application'
application = ASGIMiddleware(app)
