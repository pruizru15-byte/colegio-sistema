# Reglas permanentes — Inventario Tecnológico QR | I. E. Nuestra Señora del Perpetuo Socorro

## Misión y contexto
Desarrollar y mantener el sistema web de inventario tecnológico con códigos QR para la institución educativa, integrándose con la aplicación móvil YA EXISTENTE y con el código/seguimiento YA PRESENTES en este repositorio. Mantener trazabilidad entre objetivos, requerimientos RF01-RF07, RNF01-RNF06, diagramas, código y pruebas.

## Reglas innegociables
1. Antes de programar, INVENTARIAR el repositorio, dependencias, rutas, scripts, migraciones, pruebas, rama activa y estado de Git. No destruir, sustituir, reescribir ni duplicar módulos existentes sin justificación y aprobación cuando implique pérdida de trabajo. Proponer cambios incrementales.
2. Arquitectura: frontend React feature-first; backend PHP monolito modular con Controller–Service–Repository y separación de presentación, aplicación, dominio e infraestructura; MySQL relacional normalizado. Aplicar las skills según la tarea.
3. Desarrollo local dentro de Docker Compose; no exigir Node, PHP, Composer ni MySQL instalados en el host. La producción objetivo es cPanel tradicional: build de React estático, PHP ejecutado en hosting y MySQL propio de cPanel. Nunca asumir que cPanel ofrece Docker, procesos persistentes, SSH o cron sin comprobarlo.
4. Seguridad desde el diseño: nunca almacenar ni exponer credenciales reales en código, Git, URL, QR, frontend, logs o capturas. Validar entradas en servidor, usar consultas preparadas, control de acceso por recurso y por rol, CSRF cuando corresponda, cookies seguras, contraseñas con password_hash, rate limiting y auditoría.
5. Correo: usar un buzón SMTP dedicado y autorizado del dominio administrado en cPanel para enviar mensajes. **NO usar la cuenta ni contraseña de administración de cPanel**. Secretos SMTP solamente en configuración de servidor fuera del directorio público.
6. Cada cambio de esquema MySQL se implementa en migraciones versionadas, documentando entidades, PK, FK, cardinalidades, índices, UNIQUE, ON DELETE/UPDATE y plan de reversión. No usar datos duplicados ni dependencias que violen integridad; no crear tablas de negocio huérfanas. No forzar relaciones artificiales: cada asociación debe ser semánticamente válida.
7. Configuración institucional central: nombre de sistema, logo, nombre de institución, tema global y metadatos de reportes. Los clientes solo consumen la parte pública explícitamente permitida. Los secretos nunca se configuran desde la interfaz pública ni se retornan en API.
8. Diseño visual sobrio, usable, accesible; tres temas (claro, oscuro, combinado), tokens CSS semánticos, CSS Modules por módulo, radios moderados, transiciones suaves y carga progresiva sin retrasos artificiales. Preferencia `prefers-reduced-motion`.
9. QR contiene solo identificador aleatorio opaco o URL que resuelve dicho identificador; nunca expone contraseña, correo, datos sensibles, tokens de autenticación o IDs previsibles. Aplicación móvil existente: inspeccionar interfaz y contratos antes de extenderla.
10. Toda ruta y operación sensible exige autorización backend incluso si el botón está oculto en UI; denegar por defecto. No exponer endpoints internos, backups ni archivos .env en Internet.
11. Pruebas obligatorias de funcionalidad, seguridad, permisos, responsive, accesibilidad, base de datos y build de producción. No declarar funciones terminadas sin pruebas y evidencia comprobable.
12. No inventar datos de la institución ni declarar métricas/resultados no medidos. No cambiar objetivos académicos ni alcance acordado sin registrar la decisión.

## Prioridades y proceso de trabajo
- A. Auditar repositorio y verificar requisitos cPanel (versión PHP, extensiones, MySQL/MariaDB, SSL, SMTP, SSH, cron, document root).
- B. Dibujar y revisar MER/relaciones y contratos API antes de implementar entidades o endpoints.
- C. Desarrollar por vertical funcional (una historia de extremo a extremo) y no por pantallas desconectadas.
- D. Cambios de seguridad y migraciones se revisan primero, se prueban después, se documentan al final.
- E. Informar por cada entrega: archivos afectados, decisiones, migraciones, pruebas realizadas, pendientes y riesgos.

## Skills del proyecto
- `frontend-react-inventario`: UI, temas, CSS Modules, módulos, animaciones.
- `backend-php-modular`: API REST PHP y diseño por módulos.
- `seguridad-auth-recuperacion`: seguridad y recuperación de contraseña por correo.
- `mysql-modelado-relacional`: MER, cardinalidad, integridad, migraciones.
- `docker-desarrollo-local`: entorno aislado local.
- `cpanel-despliegue-seguro`: preflight, build, publicación y hardening.
- `configuracion-multitema`: ajustes, branding, documentos y temas.
- `qr-integracion-mobile`: QR y aplicación móvil existente.
- `qa-pruebas-auditoria`: criterios de aceptación y validaciones.
