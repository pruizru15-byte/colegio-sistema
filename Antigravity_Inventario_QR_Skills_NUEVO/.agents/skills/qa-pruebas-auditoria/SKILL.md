---
name: qa-pruebas-auditoria
description: Revisa criterios de aceptación, calidad y seguridad de módulos React/PHP/MySQL/QR, pruebas unitarias, integración, e2e, vulnerabilidades, performance y evidencias reales para informe PPP1. Activar antes de declarar un módulo terminado o desplegar.
---

# Skill: QA, validación y evidencia

## Matriz de trazabilidad
Mantener matriz: objetivo específico -> RF -> RNF -> componentes -> endpoints -> tablas/MER -> pruebas -> evidencia. Verificar RF01 login, RF02 registro, RF03 búsqueda, RF04 cambio estado/ubicación, RF05 QR, RF06 consulta, RF07 persistencia; RNF accesibilidad/usabilidad, Chrome/Edge, responsive, autenticación/permisos, integridad y tiempo objetivo de <=5 segundos en condiciones normales **medidas y definidas**. No escribir "cumplido" sin ejecución observada.

## Capas de test
- Backend unit: validación, servicios, permisos, expiración de código, caso de error, concurrencia.
- Integración: PDO/MySQL transacciones, UNIQUE, FKs, migraciones, registros de movimiento, restore DB.
- API: contratos, 401,403,404,409,422,429 y sanitización de salida.
- Frontend: render y estados de carga/error/vacío, formularios, navegación, tema, responsive, impresión.
- End-to-end Docker: login->inventario->equipo->QR->consulta->actualización; reset->email Mailpit->código->contraseña->logout; settings->branding y export; dispositivos pairing/revoke.
- Seguridad: OWASP check-list, rate limit, enumeration, fuerza bruta, sesiones/cookies/CSRF, SQLi/XSS/IDOR, cargas de archivos, path traversal, disclosure `.env`, backups públicos, CORS/CSP.
- Operación: reconstruir imagen, limpiar cache, restaurar backup, producción build y pruebas cPanel antes del lanzamiento.

## Resultados y evidencias
Conservar fecha, comando, resultado, logs depurados, captura sin secretos, ambiente, número de versión Git, dataset de prueba autorizado y tiempos reales con contexto (p.ej. 1000 equipos/red y carga acordadas). Separar evidencia de mockups: "prototipo" no equivale a "función en producción". Si fallan pruebas, reportar causa y corrección; no maquillar.

## Listo para entregar
Cero fallos bloqueantes; pruebas de autorizaciones y recuperación; rutas públicas privadas comprobadas; backups recuperables; MER/migraciones consistentes; calidad accesible; documentación de limitaciones y checklist firmado de despliegue.
