---
name: docker-desarrollo-local
description: Prepara y mantiene desarrollo local íntegro en contenedores Docker Compose para React, PHP, MySQL y correo de prueba, sin instalar toolchains en Windows/host. Usar al iniciar entorno, depurar contenedores, ejecutar migraciones y hacer builds.
---

# Skill: Docker Compose — desarrollo local reproducible

## Propósito
En computadora local basta Docker Engine/Desktop y el repositorio. Node, PHP, Composer, Apache, MySQL y utilidades se ejecutan en **imágenes/containers**. No se replica un contenedor Docker necesariamente en cPanel; el artefacto de producción debe ser portable sin daemon Docker.

## Servicios mínimos
- `frontend`: imagen Node LTS fijada a versión compatible con repositorio, Vite dev server; expuesto solo en localhost (p.ej. `127.0.0.1:5173`).
- `api`: imagen PHP+Apache de versión y extensiones equiparables a hosting; `pdo_mysql`, extensiones requeridas; puerto local (p.ej. `127.0.0.1:8080`).
- `db`: MySQL versión elegida tras inspeccionar hosting; volumen persistente, healthcheck, red interna y puerto host solo si se necesita (localhost, nunca `0.0.0.0` por defecto).
- `mailpit`: bandeja SMTP falsa local, visor web `127.0.0.1:8025`; desactivar SMTP real en tests.
- `adminer`/cliente DB: solo perfil de desarrollo opcional, nunca en producción ni expuesto fuera de localhost.

## Reglas de configuración
- `compose.yaml`, Dockerfile de `frontend` y `api`, `.dockerignore`, `.env.example`, perfiles dev/test, healthchecks, volúmenes separados, políticas de reinicio razonables.
- El frontend llama a API con proxy de desarrollo o `VITE_API_BASE_URL` público no secreto. Internamente servicios por nombre DNS `db`, `api`, `mailpit`; nunca `localhost` entre contenedores.
- Secretos fuera de Git en `.env` local, secretos diferentes por ambiente y documentados. No meter credenciales en imagen, `ARG` público o archivos de frontend. No usar `container_name` rígido salvo necesidad.
- Fijar versiones compatibles, lockfiles `package-lock.json` y `composer.lock`; evitar `latest` sin control. Imágenes base mantenidas y rebuild por vulnerabilidades.
- Solo publicar puertos locales necesarios; DB y SMTP interno preferentemente sin exposición. Al iniciar, comprobar que no haya procesos host ocupando puertos ni dependencias de apps nativas.

## Comandos esperados (adaptar a compose real)
```bash
docker compose up -d --build
docker compose ps
docker compose logs -f api
docker compose exec api composer install
docker compose exec frontend npm ci
docker compose exec frontend npm run build
docker compose exec api php vendor/bin/phpunit
```
Todos los comandos de toolchains se ejecutan dentro de contenedores. Definir scripts para ejecutar migraciones, tests, lint y build sin depender de versión local del host. Asegurar que reinstalar containers no elimine volumen DB salvo acción expresa y backup.

## Pruebas de paridad y producción
- Simular aplicación compilada desde Vite y backend con dependencias `--no-dev`; evitar dependencias que solo existen en servidor de desarrollo.
- Comparar extensiones PHP y versión SQL con cPanel; generar `REPORTE_COMPATIBILIDAD.md`.
- Exportar backup y restaurarlo en DB de test; ejecutar validaciones después de restauración.
- Documentar comandos de limpieza segura y proteger volumen de datos.
