---
name: configuracion-multitema
description: Implementa configuración institucional centralizada, branding dinámico del sistema, tres temas claro/oscuro/combinado, impresión, exportaciones y parámetros visuales sin afectar módulos adyacentes. Usar para ajustes y personalización.
---

# Skill: configuración central, branding y temas

## Alcance
Un administrador autorizado ajusta nombre visible del sistema, nombre de institución, logo, imagen de login (si aplica), texto institucional permitido y tema predeterminado. La información pública se refleja sin duplicados en login, panel, encabezados, etiquetas QR/impresión, reportes/exportaciones y nombre/metadatos de backups (sin incorporar secretos ni datos privados en nombre del archivo).

## Fuente única de verdad
`configuraciones` está ligada por FK a `instituciones`; propiedad `tema_predeterminado` restringida a `light|dark|combined`. Preferencia de tema individual por usuario opcional; definir precedencia: preferencia explícita del usuario > configuración institucional > fallback light. Cambios a branding se transmiten mediante endpoint público con allowlist (`/api/v1/public/branding`) y endpoint administrativo protegido (`GET/PATCH /api/v1/settings`). No exponer credenciales SMTP, DB, secretos internos, backups o nombres de rutas privadas en respuesta pública.

## Diseño de temas
- **Claro:** fondos claros, texto oscuro, bordes discretos.
- **Oscuro:** superficies oscuras, texto claro y contrastes accesibles.
- **Combinado:** sidebar / barra de navegación oscuros, contenido principal claro (no mezcla arbitraria a nivel de módulo).
- Tokens globales semánticos en CSS: `--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-border`, `--color-primary`, `--color-focus`, `--color-danger`, `--radius-control`, `--radius-card`, `--space-*`, `--motion-fast`.
- Selección por atributo `data-theme` en raíz; CSS Modules por funcionalidad consumen tokens, sin cascada global accidental. Variaciones locales permitidas solo mediante tokens del módulo dentro de su namespace, manteniendo contraste y accesibilidad.
- Cambiar de tema sin recargar sesión; persistir de forma segura y rehidratar sin flash de tema incorrecto cuando sea posible. Evitar cualquier transición que dificulte interacción o accesibilidad.

## Branding en todos los formatos
Una misma función/servicio de configuración alimenta `document.title`, logotipo, encabezados, PDFs/reportes **que efectivamente se implementen**, plantillas imprimibles, etiqueta de código QR, imagen/exportación y nombre lógico de respaldo. Usar snapshots de configuración para documentos históricos si es necesario mantener trazabilidad; documentar decisión.

## Validaciones
- Nombre de sistema longitud y caracteres seguros; prevenir XSS con escape de salida.
- Logo: validar MIME real, tamaño, dimensiones, almacenar fuera de lugares ejecutables, servir como asset seguro; eliminar/retirar versiones huérfanas.
- Guardado solo admin, con auditoría: quién cambió qué y cuándo (sin registrar secretos).
- Prueba cruzada: cambiar nombre y tema, revisar login, vistas, impresión, export, QR, respaldo y mobile donde corresponda.
- No permitir configuración de SMTP, claves privadas o conexión DB desde endpoints públicos; si se habilita panel de infraestructura futuro, requerir controles administrativos especiales y secretos no recuperables.
