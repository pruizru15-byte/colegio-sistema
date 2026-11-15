# Paquete de skills para Antigravity IDE — Inventario QR

Este paquete contiene **9 skills** listas para usarse en el repositorio del proyecto y un `AGENTS.md` de reglas permanentes.

## Cómo instalar sin sobrescribir avances
1. Respaldar o crear una rama Git con el estado actual del proyecto.
2. Extraer y copiar **el contenido** de este paquete al directorio raíz del repositorio que Antigravity tenga abierto.
3. Si el proyecto ya contiene `AGENTS.md` o skills del mismo nombre, revisar y fusionar el contenido en vez de sobrescribirlo.
4. Verificar que los archivos queden en `<raíz>/.agents/skills/<nombre>/SKILL.md`.
5. En Antigravity IDE abrir **Customizations** para verificar skills o iniciar una conversación nueva. Puede referirse explícitamente a cada skill por su nombre.
6. Copiar el texto de `PROMPT_INICIAL_ANTIGRAVITY.md` en Antigravity para iniciar una auditoría del repositorio e implementación incremental.

Estas skills son **instrucciones de implementación**, no significan que el sistema ya esté programado ni que el cPanel sea compatible con cada requisito. La auditoría previa verifica ambos puntos.

## Requisitos derivados del proyecto
- React + API PHP + MySQL + cPanel + Docker Compose local.
- RF01 autenticación; RF02 registro; RF03 consulta; RF04 actualización; RF05 generación QR; RF06 consulta QR; RF07 persistencia.
- RNF: facilidad de uso, compatibilidad Chrome/Edge, responsive, seguridad, respuesta objetivo <=5 s en condiciones definidas, integridad de datos.
- Objetivos: identificar datos; registrar estado/ubicación; interfaz de consulta; vincular equipo con ficha digital QR.

## Orden recomendado de ejecución
1. Auditoría de repositorio y entorno cPanel; matriz de compatibilidad.
2. MER y migraciones, roles/permisos y API contracts.
3. Docker local + testing mail sandbox.
4. Backend auth y usuarios, frontend auth y configuración visual.
5. Inventario, ubicación, estados, consultas, QR y puente mobile.
6. Configuración institucional, personalización y exportaciones.
7. QA de regresión y hardening.
8. Empaquetado y publicación controlada en cPanel.

## Referencias de estándares
- Antigravity skills: https://antigravity.google/docs/skills
- Antigravity reglas: https://antigravity.google/docs/commands/learn
- OWASP Forgot Password: https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html
- OWASP Password Storage: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- cPanel PHP: https://docs.cpanel.net/ea4/php/about-php/
- cPanel Force HTTPS: https://docs.cpanel.net/cpanel/domains/domains/
- cPanel SMTP: https://docs.cpanel.net/cpanel/email/set-up-mail-client/
