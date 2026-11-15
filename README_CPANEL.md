# 🚀 Guía de Despliegue en cPanel: popydev.com/sistema-colegio

Esta guía detalla los pasos para poner en producción el **Sistema Web de Inventario Tecnológico con Códigos QR** en el servidor cPanel `popydev.com`.

---

## 📌 Datos de la Instalación

- **URL Pública:** `https://popydev.com/sistema-colegio`
- **Ruta en Servidor cPanel:** `/storage/popydev/public_html/sistema-colegio`
- **Repositorio GitHub:** `https://github.com/pruizru15-byte/colegio-sistema.git`
- **Base de Datos Exportada:** `colegio_inventario_oficial.sql` (33 bienes institucionales, historial y usuarios precargados)

---

## 🛠️ Opción A: Despliegue Automático mediante cPanel Git Version Control (Recomendado)

Si tienes configurado **Git Version Control** en tu cPanel:

1. Ve a **cPanel** > **Git™ Version Control**.
2. Selecciona el repositorio vinculado a `https://github.com/pruizru15-byte/colegio-sistema.git` (o crea uno nuevo con branch `main` y directorio `/storage/popydev/repositories/colegio-sistema`).
3. Haz clic en **Manage** > pestaña **Pull or Deploy**.
4. Haz clic en **Update from Remote** (Git Pull).
5. Haz clic en **Deploy HEAD Commit**.
   - El archivo `.cpanel.yml` copiará automáticamente el frontend compilado a `/storage/popydev/public_html/sistema-colegio/` con su `.htaccess` y permisos correspondientes.

---

## 📦 Opción B: Subida Directa mediante Administrador de Archivos (File Manager)

1. En cPanel, ingresa al **Administrador de Archivos (File Manager)**.
2. Navega a `public_html/` y crea la carpeta `sistema-colegio` si no existe.
3. Sube y descomprime el contenido de `frontend/dist/` directamente dentro de `public_html/sistema-colegio/`:
   - `index.html`
   - Carpeta `assets/`
   - `.htaccess` (Asegúrate de tener activa la opción "Mostrar archivos ocultos" en cPanel).

---

## 🗄️ Paso 2: Importar Base de Datos MySQL en phpMyAdmin

1. En cPanel, ve a **Bases de datos MySQL®**:
   - Crea una base de datos (ejemplo: `popydev_colegio`).
   - Crea un usuario MySQL con contraseña segura y asígnalo a la base de datos con **Todos los Privilegios (ALL PRIVILEGES)**.
2. Abre **phpMyAdmin**:
   - Selecciona la base de datos creada (`popydev_colegio`).
   - Ve a la pestaña **Importar**.
   - Selecciona el archivo `colegio_inventario_oficial.sql`.
   - Haz clic en **Continuar / Importar**.

---

## 🐍 Paso 3: Configurar Backend en cPanel (Setup Python App)

1. En cPanel, dirígete a la sección **Software** > **Setup Python App**.
2. Haz clic en **Create Application**:
   - **Python version:** `3.10` o `3.11`.
   - **Application root:** `/storage/popydev/public_html/sistema-colegio/backend` (o la ruta donde coloques la carpeta `backend`).
   - **Application URL:** `popydev.com/sistema-colegio/api`
   - **Application startup file:** `passenger_wsgi.py`
   - **Application Entry point:** `application`
3. Guarda la configuración y haz clic en **Run Pip Install** o sube `requirements.txt`.
4. En **Environment Variables**, configura:
   - `DB_HOST`: `localhost`
   - `DB_USER`: tu usuario de MySQL creado en cPanel
   - `DB_PASSWORD`: tu contraseña de MySQL
   - `DB_NAME`: nombre de la base de datos en cPanel
   - `FRONTEND_URL`: `https://popydev.com/sistema-colegio`
   - `SECRET_KEY`: clave JWT segura para el colegio
5. Reinicia la aplicación con el botón **Restart Application**.

---

## 👤 Credenciales de Acceso Oficiales

- **Administrador:** `admin@colegio.edu.pe` / `admin123`
- **Docente:** `docente@colegio.edu.pe` / `docente123`
- **Soporte TI:** `soporte@colegio.edu.pe` / `soporte123`
