---
name: cpanel-despliegue-seguro
description: Prepara publicación segura en alojamiento cPanel convencional: build estático React, PHP API, MySQL, HTTPS, SMTP, archivos privados, permisos, backup y rollback. Usar al preparar producción, configurar dominio o revisar seguridad de servidor.
---

# Skill: despliegue cPanel seguro y verificable

## Antes de elegir técnica
Crear una matriz real de compatibilidad del cPanel objetivo: tipo hosting (compartido/VPS), PHP y extensiones disponibles, versión MySQL/MariaDB, acceso SSH/Composer, cron, límite de archivos, memoria/tiempo de ejecución, política de correo, puertos SMTP permitidos, SSL, dominio y subdominios, permisos de `document root` y backups. **No afirmar que un alojamiento cPanel tradicional admite Docker**. Nunca desplegar sin autorización expresa y respaldo verificable.

## Topología de producción preferida
- React/Vite: compilar dentro de Docker con `npm ci && npm run build`. Publicar únicamente contenido de `dist/` bajo document root del dominio elegido.
- PHP API: document root del subdominio API apuntando a `api/public/` si cPanel lo permite. Si no, diseñar layout equivalente con solo `index.php` y archivos públicos en webroot, código `src/`, `vendor/`, `storage/` y config fuera de webroot; documentar ruta de inclusión segura. Nunca depender de la mera ocultación por .htaccess como defensa primaria.
- Base de datos: crear BD y usuario MySQL desde cPanel con permisos mínimos; ejecutar migraciones versionadas tras respaldo. No subir volcados, claves ni copias a carpeta pública.
- SMTP: cuenta dedicada `notificaciones@dominio` o equivalente **ejemplo, no crear sin datos reales**. Usar servidor y puerto autenticado que indique cPanel (SSL/TLS/STARTTLS según soporte), con contraseña del buzón y secretos privados del backend. No usar contraseña de administración de cPanel.

## Lista previa de seguridad
1. Certificado SSL válido y redirección HTTP→HTTPS en todos los hosts; cookies Secure; verificar dominio y cadena de certificado.
2. Configurar `.htaccess` y reescrituras del SPA **sin** interferir con `/api`, archivos reales, cabeceras de seguridad ni rutas del servidor; comprobar 404 API correctos.
3. Desactivar display_errors y modo debug; errores hacia logs privados con rotación, sin tokens, passwords o datos sensibles.
4. CSP adaptada a recursos reales, X-Content-Type-Options, Referrer-Policy, frame-ancestors, HSTS cuando HTTPS esté correctamente establecido y seguro para subdominios; no forzar políticas incompatibles sin ensayo.
5. Secretos fuera del webroot y con permisos de archivo mínimos; listar/verificar que `.env`, `.git`, `composer.json`, `vendor`, logs, respaldos, migraciones y documentación interna no son accesibles vía URL pública.
6. Usuario de BD limitado, sentencias parametrizadas, throttling/rate limit, sesión/CSRF/permiso RBAC, headers CORS limitados, no cachear respuestas con datos sensibles.
7. Backup DB y archivos subidos en almacenamiento privado, cifrados y con retención; prueba de restauración. Rollback de código y migraciones con evaluación de compatibilidad.
8. Revisar dependencias de producción, reproducibilidad de builds, `composer install --no-dev --classmap-authoritative` si compatible y pruebas de versiones/extensions.
9. Verificar email SMTP real y SPF/DKIM/DMARC cuando aplique; fallos de entrega sin filtrar usuarios.
10. Tests smoke: login/logout, recuperación, inventario, QR, permisos, impresión, exportación y dispositivos sobre HTTPS antes de habilitar uso real.

## Procedimiento de entrega
A. Preflight con evidencias y brechas; B. backup; C. build desde contenedores; D. despliegue controlado; E. migraciones y bootstrap admin por canal seguro; F. pruebas funcionales/seguridad; G. monitoreo y plan de reversión.

## Documentar siempre
Rutas públicas y privadas, versiones reales, responsables de rotación de secretos, fecha, checklist firmado, pruebas de restauración, rollback, dominios, cabeceras y permisos. Si un requisito no es soportado en hosting, explicitarlo y no simular cumplimiento.
