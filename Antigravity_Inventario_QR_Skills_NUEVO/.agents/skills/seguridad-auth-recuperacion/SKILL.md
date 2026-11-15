---
name: seguridad-auth-recuperacion
description: Protege autenticación, sesiones, recuperación de contraseña por código email enviado con SMTP de cPanel, autorizaciones y controles OWASP. Activar para login, usuarios, correo, roles, privacidad, controles antia-buso y revisión de seguridad.
---

# Skill: seguridad de la información, autenticación y recuperación

## Invariantes
No existe garantía de "cero hackeos". Aplicar defensa en profundidad, mínimo privilegio, auditoría y pruebas. Las credenciales administrativas de cPanel **nunca** se usan para autenticar usuarios del sistema ni como credenciales SMTP. El remitente será un **buzón dedicado del dominio** configurado desde cPanel, autorizado para SMTP, y su contraseña estará en variables de entorno del backend fuera de la carpeta pública.

## Login y sesión web
1. Usuario de aplicación mediante email/identificador + contraseña propia. Registrar `password_hash` mediante `password_hash()` con Argon2id si hosting lo soporta; bcrypt como alternativa evaluada. Verificar con `password_verify()` y rehash al actualizar parámetros.
2. Sesión preferida en web: cookie HttpOnly, Secure, SameSite=Lax/Strict según flujo, tiempo de expiración y regeneración de ID después de autenticación. No usar localStorage para tokens de sesión de alto privilegio.
3. En operaciones con cookies, protección CSRF (token validado en backend y/o estrategia apropiada de origen); restringir CORS a orígenes expresamente autorizados. HTTPS obligatorio.
4. Rate limiting distribuido/per cuenta e IP, fallos con respuesta genérica, límites razonables, sin filtración de existencia de cuenta. Control de sesión revocable, logout real.
5. Policies server-side por rol y recurso: administrador puede modificar; personal autorizado solo lectura de lo asignado. Comprobar IDOR incluso si un recurso es accesible por su URL.

## Recuperación por código al correo de la persona
**Flujo obligatorio:**
A. Vista "Olvidé mi contraseña" pide email de usuario existente. Responder siempre: "Si existe una cuenta asociada, enviaremos instrucciones al correo registrado" (con tiempos de respuesta comparables).
B. Backend genera un código **numérico aleatorio criptográficamente seguro de 8 dígitos**, preferiblemente con `random_int`/CSPRNG. TTL <=10 min, uso único, <=5 intentos por emisión, reenvío espaciado (p.ej. 60 s) y máximos por usuario e IP (configurables). Invalidar códigos antiguos al emitir uno nuevo.
C. Guardar solo una verificación irreversible basada en **HMAC con clave secreta del servidor** separada de la BD, ligada al identificador del reto y usuario; nunca guardar el código en claro ni en logs. `hash_equals` para comparación constante. El tamaño corto del código exige secreto fuera de la BD y rate limiting; no usar SHA-256 simple como sustituto.
D. Enviar código solo al email previamente verificado asociado a la cuenta. SMTP con TLS, host, puerto, usuario y contraseña del **buzón remitente cPanel**. Nunca enviar el código a un nuevo correo suministrado por quien solicita el reseteo.
E. Formulario valida código y nueva contraseña. Backend verifica challenge, vigencia, intentos y estado; aplica nueva contraseña hasheada, consume/invalida challenge, revoca sesiones anteriores cuando corresponda y envía aviso de cambio. No iniciar sesión automáticamente por verificar el código.
F. Registrar solicitud, consumo y error sin código ni contraseña. Pruebas contra fuerza bruta, enumeración, replay, concurrentes y caducidad. No resetear ni bloquear cuenta hasta verificar código válido.

### Variables privadas ejemplificativas (solo backend)
`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_ENCRYPTION`, `SMTP_FROM_EMAIL`, `APP_SECRET`, `PASSWORD_RESET_HMAC_KEY`, `DB_*`. No escribir secretos en `VITE_*` ni datos públicos. En local sustituir el envío real por Mailpit con credenciales ficticias; no usar buzón real en test.

## Protecciones complementarias
PDO parametrizado contra SQLi; escape contextual contra XSS, CSP compatible con React, validación/allowlist de tipos de archivo, CSRF, clickjacking mitigado por frame-ancestors, seguridad de cabeceras, errores sin trazas, logs mínimos y rotados. Revisar permisos de carpetas y backup/cifrado/rotación. En producción configurar SSL certificado, sin redirección a HTTP, claves distintas por entorno. Gestionar actualizaciones de dependencias, secretos y permisos de BD.

## Pruebas de seguridad mínimas
- Usuario inexistente / existente: mismo mensaje y tiempo comparable.
- Código expirado, errado, ya usado, concurrente, reenvíos y múltiples intentos.
- Usuario sin permiso intenta `PATCH`, `DELETE`, `export` o consulta ajena: 403/404 adecuada.
- Cookies Secure/HttpOnly/SameSite y CSRF; CORS sin wildcard con credenciales.
- Dependencias auditadas; fuentes públicas no exponen `.env`, SMTP, respaldos, DB ni trazas.

## Referencia de criterio
OWASP Forgot Password, Authentication, Password Storage, Session Management y ASVS. El flujo basado en código es una exigencia del proyecto; controles de un solo uso, caducidad, respuesta uniforme y seguridad criptográfica se consideran imprescindibles.
