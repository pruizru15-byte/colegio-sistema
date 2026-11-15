---
name: backend-php-modular
description: Implementa backend PHP API REST del inventario QR mediante monolito modular, capas Controller-Service-Repository, PSR-4, servicios aislados y contratos claros. Usar para endpoints, lógica de negocio, controladores, servicios, repositorios y refactorizaciones PHP.
---

# Skill: backend PHP — monolito modular

## Patrón seleccionado
**Monolito modular** con **Controller–Service–Repository** y separación de capas inspirada en Clean Architecture. Motivo: permite desplegar una sola aplicación PHP en cPanel, mantener el código por dominio y probar cada unidad sin introducir microservicios o procesos permanentes innecesarios.

- `Controller`: HTTP, request, validación estructural, autenticación y respuesta; sin SQL ni lógica extensa.
- `Service` o `UseCase`: reglas del negocio, coordinación transaccional, autorizaciones explícitas, resultados; sin dependencia directa de HTML/UI.
- `Repository`: persistencia mediante PDO, consultas parametrizadas, FKs y transacciones. Contrato en el dominio y adaptador de infraestructura si complejidad justifica.
- `Policy`: autorización por rol y por recurso; denegación por defecto.
- `DTO`/`Request`: entrada normalizada, validaciones con errores tipados y salida filtrada.

## Estructura de carpetas (orientativa)
```text
api/
  public/{index.php,.htaccess}
  src/
    Modules/
      Auth/{Controllers,Services,Repositories,DTO,Policies}/
      Users/{Controllers,Services,Repositories,DTO,Policies}/
      Inventory/{Controllers,Services,Repositories,DTO,Policies}/
      Locations/{Controllers,Services,Repositories,DTO,Policies}/
      QR/{Controllers,Services,Repositories,DTO,Policies}/
      Devices/{Controllers,Services,Repositories,DTO,Policies}/
      Settings/{Controllers,Services,Repositories,DTO,Policies}/
      Reports/{Controllers,Services,Repositories,DTO,Policies}/
    Shared/{Http,Middleware,Database,Security,Mail,Exceptions,Logging}
  database/{migrations,seeders}
  tests/{Unit,Feature,Security}
  storage/{logs,backups,tmp}
  composer.json
```
Una clase PHP por archivo, namespace PSR-4 `App\...`, nombres consistentes, dependencias por constructor, interfaces donde realmente desacoplan comportamientos. Evitar Service Locator global y llamadas directas a DB desde componentes de presentación.

## API y rutas
Prefijo `/api/v1/` y JSON con `Content-Type` correcto. Versionar contratos; usar método HTTP correcto, códigos 200/201/204/400/401/403/404/409/422/429/500; evitar devolver stack traces en producción. Ejemplos a adaptar al repositorio:
- `POST /auth/login`, `POST /auth/logout`, `POST /auth/password-reset/request`, `POST /auth/password-reset/confirm`.
- `GET /equipments`, `POST /equipments`, `GET /equipments/{id}`, `PATCH /equipments/{id}`.
- `GET /qr/{publicToken}` (solo vista permitida), `POST /equipments/{id}/qr`, `GET /equipments/{id}/qr/download`.
- `GET /settings`, `PATCH /settings` (solo admin), `GET /public/branding` (subset inocuo).
- `POST /devices/pair`, `GET /devices`, `DELETE /devices/{id}` (revocación).

## Integridad y seguridad por defecto
- PDO con sentencias preparadas; jamás concatenar SQL con entrada usuario para columnas/orden sin whitelist.
- Transacciones para equipo+QR, movimientos/ubicación, cambios de credenciales, etc. Conservar semántica con rollback ante error.
- Validar todos los campos en servidor, normalizar fechas y estados, límites de paginación y búsqueda.
- Autorización backend antes de acción y al leer recursos; respuestas sin password_hash, código de recuperación, secretos ni rutas privadas.
- Correo de salida por servicio de mail con SMTP TLS y secretos server-only; no emplear `mail()` si no se verificó entregabilidad.
- Evitar procesos residentes, colas externas o websockets como requisito para despliegue en cPanel compartido. Para tareas diferidas, verificar disponibilidad de cron o diseñar una alternativa síncrona acotada.

## Ejecución
- Analizar la implementación actual; no migrar a un framework diferente si ya existe uno útil sin justificación.
- Implementar por módulos con controladores delgados, servicios testeables y repositorios acotados.
- `composer.lock` en repositorio, autoload optimizado para producción, versiones compatibles con PHP de hosting.
- Ejecutar tests de unidad, API y autorización, además de análisis de dependencias.

## Definición de listo
Pruebas del caso feliz y errores; migraciones repetibles; validación servidor; política de acceso; logs seguros; contrato versionado y documentación de cambios.
