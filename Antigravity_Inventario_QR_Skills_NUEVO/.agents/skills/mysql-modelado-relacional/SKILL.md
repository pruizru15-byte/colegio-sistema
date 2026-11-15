---
name: mysql-modelado-relacional
description: Construye MER y modelos lógicos/físicos MySQL con cardinalidades, PK/FK, normalización, consistencia, migraciones versionadas y trazabilidad. Usar al cambiar tablas, integridad, relaciones, búsquedas e historial del inventario QR.
---

# Skill: MySQL — diseño estrictamente relacional

## Principio: primero MER, después SQL
Antes de crear o modificar una tabla: documentar qué entidad representa, por qué existe, PK, FKs, cardinalidades (1:1, 1:N, N:M con tabla puente), opcionalidad, atributos, índices, restricciones y políticas ON DELETE/UPDATE. Generar MER, modelo lógico y físico coherentes; contrastarlos contra migraciones reales. Evitar tablas de negocio sin relaciones de pertenencia o referencia, sin imponer FKs artificiales que desvirtúen el dominio.

## Modelo conceptual de partida (validar frente al sistema existente)
- `instituciones` 1:N `usuarios`, 1:N `equipos`, 1:N `ubicaciones`, 1:1 `configuraciones`.
- `roles` 1:N `usuarios`; `roles` N:M `permisos` a través de `roles_permisos`. Si hay roles por institución, incorporar el ámbito institucional de forma consistente.
- `tipos_equipo` 1:N `equipos`; `estados_equipo` 1:N `equipos`; `ubicaciones` 1:N `equipos` (ubicación actual).
- `usuarios` 1:N `equipos` como responsable cuando corresponda (nullable), y `usuarios` 1:N `equipos` como creador.
- `equipos` 1:1 `codigos_qr` para QR activo, `codigos_qr.id_equipo` UNIQUE, token público opaco UNIQUE. Si se necesita versionado/historial de QR, sustituir por 1:N y garantizar una sola versión activa mediante diseño consistente.
- `equipos` 1:N `movimientos_equipo` para historial; cada movimiento referencia origen, destino y autor. La actualización del equipo y la inserción del movimiento se hacen **en una transacción**.
- `equipos` 1:N `mantenimientos` solo si el módulo se confirma en el alcance; FK al equipo, usuario responsable y fechas pertinentes.
- `usuarios` 1:N `recuperaciones_password` (hash del código, expiración, intentos, uso); `usuarios` 1:N `dispositivos` (vinculación y revocación).
- `instituciones` 1:N `auditoria_eventos` y referencia al usuario actor cuando exista; `instituciones` 1:N `respaldos` con autor, metadatos y ubicación protegida. Eventos del sistema sin actor se modelan explícitamente, no con referencias falsas.
- Configuración global: `configuraciones.id_institucion` PK + FK a `instituciones`; `nombre_sistema`, `logo_path`, `tema_predeterminado` restringido a `light|dark|combined`, `updated_by` FK. Preferencia por usuario solo si se implementa, con FK a `usuarios`.

## Reglas MySQL obligatorias
- InnoDB y charset `utf8mb4`, collation compatible con cPanel. FK `NOT NULL` donde asociación es obligatoria; nullable cuando sea opcional. `UNIQUE` sobre correo según ámbito, código institucional según institución, QR opaco, etc.
- Formas normales (mínimo 3FN salvo justificación medida): no repetir nombre/ubicación/estado/responsable como texto independiente en varias tablas cuando exista FK. Catálogos referenciados por IDs; un único origen de verdad.
- Evitar `ON DELETE CASCADE` para borrar accidentalmente usuarios/equipos/ubicaciones con historia; preferir `RESTRICT` o borrado lógico y documentar excepciones. No usar cascadas en logs/auditoría con impacto forense.
- Transacciones ACID y bloqueo/versión optimista para cambios concurrentes. No confiar exclusivamente en validación frontend: constraints en DB y traducción de errores en API.
- Contratos de migración up/down, rollback seguro, índices en FKs y columnas de búsqueda, evitar columnas JSON para relaciones fundamentales.
- Las tablas auxiliares deben estar relacionadas semánticamente. No sacrificar integridad para cumplir artificialmente la consigna "ninguna tabla libre"; documentar entidades de catálogo global necesarias.
- Preparar compatibilidad con la **versión real MySQL o MariaDB de cPanel**, no asumir que coincide con contenedor local.

## Entregables por modificación
MER con crow's foot/cardinalidades + lista relaciones; migraciones SQL/PHP; diccionario de datos; justificación de claves/índices; test de integridad (FK huérfana, duplicado, movimiento concurrente) y revisión de datos reales.
