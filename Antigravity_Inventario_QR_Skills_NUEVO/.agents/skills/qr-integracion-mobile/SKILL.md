---
name: qr-integracion-mobile
description: Diseña QR único seguro y la integración con aplicación móvil ya existente, emparejamiento y revocación de dispositivos, escaneo y ficha digital del inventario. Usar en funcionalidad QR, cámara, sincronización o conexión mobile.
---

# Skill: integración QR y aplicación móvil existente

## Antes de implementar
El usuario indica que **ya existe una app móvil en GitHub y seguimiento en Antigravity**. Buscar y leer el código/contratos existentes en el workspace; documentar framework, autenticación, build, rutas API y estados. No crear una segunda app, no borrar historial, no cambiar identificadores de endpoints usados por mobile sin versionado y compatibilidad.

## Diseño QR
Cada equipo tiene QR único que apunta a URL HTTPS como `https://DOMINIO/e/q/TOKEN_OPACO`. `TOKEN_OPACO` es aleatorio criptográficamente seguro (>=128 bits de entropía), UNIQUE y no incremental. Nunca codificar nombre de usuario, número de serie sensible, credenciales, JWT, datos del inventario o URL administrativa en QR. Resolver token en backend y autorizar consulta según política; ficha pública con datos mínimos o autenticación previa dependiendo del rol y naturaleza de datos. Un QR físico **no equivale** a credencial.

## Ciclo de vida
Crear equipo -> persistir transacción -> generar/ligar token QR -> descargar/etiquetar/visualizar -> escanear desde web o app móvil -> validar token y sesión/permisos -> mostrar ficha. Si se reemplaza etiqueta, prever rotación y revocación del QR anterior; documentar reglas de estabilidad.

## Vincular dispositivos
Interpretar "conectar dispositivos" como vinculación segura de móviles autorizados, NO acceso automático a hardware del usuario. Flujo recomendado: usuario autenticado solicita vinculación, backend emite desafío aleatorio y temporal (1-5 minutos), la app existente lo confirma, el servidor registra dispositivo, usuario, institución, permisos y fechas; el administrador puede consultar y revocar. No almacenar tokens móviles en claro; si se necesita acceso persistente, usar credenciales de dispositivo con rotación/revocación y almacenamiento seguro del SO. Contemplar cierre de sesión, móvil robado y cambio de usuario.

## Integración y compatibilidad
- Mantener `/api/v1` versionada y contrato documentado, respuesta JSON estable, paginación/timeout/error estándar.
- Escáner en app usa permiso de cámara solo cuando el usuario lo solicita; mensaje si permiso denegado; nunca subir fotogramas completos si basta decodificar localmente.
- Modalidad offline SOLO si la app existente la soporta y hay reglas de conflicto/sincronización; no agregar sincronización insegura por supuesto.
- Actualización de ubicación/equipo solo desde roles autorizados; todas las modificaciones dejan registro de autor y fecha.

## Pruebas
Duplicados de QR, QR rotado, QR sin permiso, cámara sin acceso, móvil no autorizado, dispositivo revocado, API 401/403/404, tokens expirados, reintentos, datos de otros usuarios, QR físico alterado y compatibilidad con aplicación GitHub existente.
