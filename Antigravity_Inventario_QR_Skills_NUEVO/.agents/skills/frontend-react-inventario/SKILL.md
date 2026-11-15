---
name: frontend-react-inventario
description: Diseña y desarrolla UI React modular feature-first, CSS Modules, diseño sobrio, accesibilidad, carga, animaciones suaves y estados responsivos del inventario QR. Utiliza esta skill al crear o modificar pantallas, componentes, estilos, rutas o hooks.
---

# Skill: frontend React modular y diseño de interfaz

## Principio arquitectónico
Usar **Feature-First / organización por funcionalidad** más **componentes presentacionales, hooks de estado y servicios para comunicación**. No mezclar fetch/axios, CSS, validaciones y reglas de negocio en un único componente. Preservar el stack existente y comprobar bibliotecas ya instaladas antes de añadir otras.

## Estructura propuesta (adaptar al repositorio existente)
```text
frontend/src/
  app/{router,providers,layouts}/
  modules/
    auth/{pages,components,hooks,services,styles,types}/
    inventory/{pages,components,hooks,services,styles,types}/
    locations/{pages,components,hooks,services,styles,types}/
    qr/{pages,components,hooks,services,styles,types}/
    devices/{pages,components,hooks,services,styles,types}/
    settings/{pages,components,hooks,services,styles,types}/
  shared/{ui,components,hooks,lib,api,types,styles}/
  shared/styles/{tokens.css,theme-light.css,theme-dark.css,theme-combined.css,global.css}
```
Cada componente tiene una responsabilidad y archivo propio: `EquipmentCard.tsx`, `EquipmentCard.module.css`; estilos locales por CSS Modules. Cambios comunes exclusivamente mediante design tokens semánticos o API del componente compartido. Prohibir selectores globales invasivos y estilos inline hardcodeados para colores de tema.

## Diseño visual obligatorio
- Profesional e institucional, sin efecto glassmorphism excesivo ni degradados llamativos. Máximo ancho de contenido razonable (p.ej. 1280-1440px), márgenes horizontales 16px móvil y 24-32px escritorio.
- Espaciado consistente a escala 4/8px; tipografía legible 14-16px y títulos proporcionados; jerarquía, contraste y focos visibles.
- Radius: controles aprox. 6-8px, tarjetas 8-12px, modales 12px; evitar botones tipo cápsula por defecto y bordes 50% salvo avatares e iconos circulares.
- Botones con estados hover, focus-visible, disabled, loading. Formularios etiquetados, mensajes de error junto al campo, navegación por teclado.
- Transiciones discretas de 150-250 ms para color, opacidad, transformaciones suaves. Skeletons semánticos para cargas significativas, progreso en operaciones largas, feedback de éxito/error y estados vacíos claros. Nunca simular carga con retrasos artificiales.
- Animaciones no deben bloquear interacción. Desactivar o minimizar movimiento cuando `prefers-reduced-motion: reduce`.
- Responsive real en Chrome y Edge; tablas con comportamiento móvil adecuado (scroll horizontal o tarjetas con mismo acceso), no ocultar acciones esenciales.

## Gestión de estado y API
- Estado de servidor en servicios/hooks con caché, invalidación y cancelación según herramientas ya existentes (si se adopta TanStack Query, justificarlo). Formularios con validación cliente para experiencia; el backend vuelve a validar siempre.
- Contrato HTTP común `/api/v1`, errores tipados, gestión unificada de 401/403, manejo de timeout y reintento seguro solo para métodos idempotentes.
- Nunca incluir secretos en `VITE_*` ni en bundles: toda variable Vite es potencialmente visible públicamente. `.env.example` solo URLs/configuración pública; SMTP y BD en backend.
- La UI no confía en permisos propios como control de seguridad; rutas y botones se filtran para experiencia, backend autoriza.

## Pantallas mínimas
Login; solicitar código; verificar y definir contraseña; dashboard; lista y filtro de equipos; alta/edición; ficha con QR; ubicaciones; estados; historial si está en alcance; configuración; dispositivos; acceso denegado/404/errores. Cada módulo comunica los mismos estados y estilos globales.

## Checklist de aceptación
- [ ] Módulo aislado, componentes/hooks/servicios/estilos en carpetas coherentes.
- [ ] Tema claro/oscuro/combinado correcto sin fugas de CSS.
- [ ] Navegación de teclado, foco, mensajes accesibles, modo reducido de movimiento.
- [ ] Skeleton, vacío, error, retry, confirmación y carga verificados.
- [ ] Formulario no expone contraseñas, tokens SMTP ni datos de otros usuarios.
- [ ] `npm run build` y pruebas pertinentes dentro de Docker sin errores.
