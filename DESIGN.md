---
name: Kawsaymi Care
description: Gestión inteligente de medicamentos para cuidadores familiares
colors:
  primary: "oklch(0.40 0.08 210)"
  primary-foreground: "oklch(0.99 0 0)"
  secondary: "oklch(0.78 0.09 205)"
  secondary-foreground: "oklch(0.13 0.025 210)"
  background: "oklch(0.97 0.005 210)"
  foreground: "oklch(0.13 0.025 210)"
  card: "oklch(1 0 0)"
  card-foreground: "oklch(0.13 0.025 210)"
  muted: "oklch(0.93 0.008 210)"
  muted-foreground: "oklch(0.48 0.03 210)"
  accent: "oklch(0.93 0.020 205)"
  accent-foreground: "oklch(0.40 0.08 210)"
  destructive: "oklch(0.56 0.23 27)"
  destructive-foreground: "oklch(0.99 0 0)"
  brand-green: "oklch(0.73 0.10 154)"
  brand-blue: "oklch(0.84 0.06 216)"
typography:
  display:
    fontFamily: "'Geist', 'Geist Fallback', system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "'Geist', 'Geist Fallback', system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 2.5vw, 1.5rem)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "'Geist', 'Geist Fallback', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "'Geist', 'Geist Fallback', system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "0.01em"
  mono:
    fontFamily: "'Geist Mono', 'Geist Mono Fallback', monospace"
    fontSize: "0.875rem"
rounded:
  sm: "0.5rem"
  md: "0.875rem"
  lg: "1rem"
  xl: "1.5rem"
  full: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  2xl: "2.5rem"
components:
  button-default:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    size: "h-9"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    size: "h-9"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    size: "h-9"
  card-default:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.xl}"
    padding: "1.5rem"
  badge-default:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
  badge-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.md}"
---

# Design System: Kawsaymi Care

## Overview

**Creative North Star: "El Refugio Tranquilo"**

Kawsaymi Care es un espacio visual sereno y acogedor, diseñado para cuidadores familiares que gestionan la salud de adultos mayores. La interfaz prioriza la claridad sobre la decoración, los espacios generosos sobre la densidad, y la calidez sobre la frialdad clínica.

Cada pantalla se siente como un refugio donde la información compleja se presenta de forma simple y tranquilizadora. Los colores suaves con acentos en teal profundo transmiten confianza sin resultar institucionales. Las tarjetas elevadas con bordes redondeados y sombras sutiles crean una jerarquía visual clara y táctil.

**Key Characteristics:**
- Espacios amplios y tarjetas generosas (rounded-xl, shadow-sm)
- Paleta fría con acentos en teal y cyan — médica pero cálida
- Tipografía Geist limpia con tracking-tight en títulos
- Gradientes sutiles como detalle de personalidad, no como fondo
- Sin ruido visual: el contenido es el protagonista

## Colors

La paleta gira en torno a dos polos: un teal profundo que ancla los elementos interactivos y un cyan claro que aporta frescura y personalidad. Los neutros son frescos con un matiz azulado apenas perceptible.

### Primary
- **Teal Profundo** (`oklch(0.40 0.08 210)`): Color de acción principal. Botones, enlaces, elementos interactivos, encabezados del dashboard. Comunica confianza y profesionalismo.
- **Teal Profundo — Texto** (`oklch(0.99 0 0)`): Blanco puro sobre fondos primary. Contraste óptimo.

### Secondary
- **Brisa de Mar** (`oklch(0.78 0.09 205)`): Acento secundario. Badges de estado completado, elementos decorativos, fondos de iconos en tarjetas de progreso. Aporta frescura sin competir con primary.

### Neutral
- **Cielo Claro** (`oklch(0.97 0.005 210)`): Fondo de página. Base fría y limpia que no compite con el contenido.
- **Blanco Nube** (`oklch(1 0 0)`): Fondos de tarjetas, modales, popovers.
- **Niebla Suave** (`oklch(0.93 0.008 210)`): Fondos secundarios, estados hover sutiles, placeholders de skeleton.
- **Gris Sereno** (`oklch(0.48 0.03 210)`): Texto secundario, metadatos, descripciones, breadcrumbs.
- **Profundidad** (`oklch(0.13 0.025 210)`): Texto principal, títulos. Casi negro con un matiz azul frío.

### Accent
- **Espuma de Mar** (`oklch(0.93 0.020 205)`): Fondos hover, acentos secundarios no interactivos. Aparece en fondos de elementos seleccionados y variantes ghost.

### Destructive
- **Alerta** (`oklch(0.56 0.23 27)`): Estados de error, acciones destructivas, medicamentos perdidos, alertas de alta severidad. Rojo anaranjado con saturación controlada para no alarmar en exceso.

### Brand Extras
- **Verde Costa** (`oklch(0.73 0.10 154)`): Charts, datos positivos, indicadores de éxito. Verde suave que complementa la paleta fría.
- **Azul Horizonte** (`oklch(0.84 0.06 216)`): Charts secundarios, acentos decorativos. Azul celeste que extiende la gama teal.

### Surface Colors
- **Orilla** (`oklch(0.90 0.010 210)`): Bordes de tarjetas, separadores, inputs default.
- **Superficie** (`oklch(0.97 0.005 210)`): Fondo de inputs, campos de formulario. Idéntico al fondo de página — los inputs se definen por su borde, no por su fondo.
- **Anillo Teal** (`oklch(0.40 0.08 210)`): Focus rings, bordes de inputs en foco. Mismo valor que primary — el foco siempre usa el color de acción.

### The One Voice Rule
**La Regla de Una Voz.** El acento primary (Teal Profundo) se usa en no más del 10% de cualquier pantalla. Su rareza es el punto: cuando aparece, el usuario sabe que es una acción o información importante.

## Typography

**Display Font:** Geist (con Geist Fallback, system-ui, sans-serif)
**Mono Font:** Geist Mono (con Geist Mono Fallback, monospace)

**Carácter:** Geist es una sans-serif geométrica pero cálida, con curvas generosas en las letras que evitan la rigidez de las grotescas tradicionales. La combinación con tracking-tight en títulos y leading generoso en cuerpo (1.7) crea un ritmo de lectura pausado y claro, apropiado para usuarios que pueden tener dificultades visuales.

### Hierarchy
- **Display** (700, clamp(1.75rem, 4vw, 2.5rem), 1.15, -0.02em): Títulos de página (h1) en dashboard, listados, pantallas principales. Aparece pocas veces — su peso y tamaño lo hacen inconfundible.
- **Title** (600, clamp(1.125rem, 2.5vw, 1.5rem), 1.25, -0.01em): Títulos de tarjetas, nombres de medicamentos, encabezados de sección. El nivel de jerarquía más usado.
- **Body** (400, 1rem, 1.7): Texto de lectura, descripciones, contenido de tarjetas, párrafos. Leading generoso (1.7) para legibilidad en móvil.
- **Label** (500, 0.875rem, 1.25, 0.01em): Labels de formularios, metadatos, badges de tiempo, texto secundario en navegación.
- **Mono** (400, 0.875rem): Números de dosis, identificadores, horas en formato 24h. Solo para datos estructurados.

### La Regla de Escala

**La Regla de Escala Constante.** Body nunca baja de 16px. En móvil, display se reduce hasta 28px pero body se mantiene en 16px. La legibilidad para adultos mayores no se negocia por densidad de información.

## Layout

El sistema usa un layout de una sola columna centrado con un ancho máximo de 42rem (672px) en pantallas de contenido (formularios, detalle) y hasta 48rem (768px) en páginas de listado. Las tarjetas (card-elevated) son el contenedor universal:填an el ancho disponible con padding interior de 1.25rem-1.5rem.

La cuadrícula se limita a 2-3 columnas iguales para métricas y accesos rápidos. No hay layouts complejos ni rejillas densas. El espaciado entre tarjetas es consistente: 1rem (gap-4) en vertical, 0.75rem (gap-3) en grids.

En móvil (< 640px), todo apila a una columna. El padding lateral de la página es 1rem, y sube a 2rem en desktop.

### La Regla de Contenido Centrado

**La Regla de Respiración.** Ningún bloque de contenido ocupa más del 85% del ancho de la ventana en desktop. El contenido siempre tiene aire a los lados.

## Elevation & Depth

El sistema usa un modelo híbrido: sombras sutiles sobre fondo plano. Las tarjetas en reposo tienen `shadow-sm` (0 1px 3px 0 rgba(0,0,0,0.06)) que las separa ligeramente del fondo Cielo Claro. En hover, las tarjetas elevan a `shadow-md`.

No hay superposición de capas. Modales y popovers usan la elevación estándar de Radix con sombras más pronunciadas. Los elementos interactivos (botones) no tienen sombra en reposo — la profundidad es propiedad de los contenedores, no de los componentes de acción.

### Shadow Vocabulary
- **Tarjeta reposo** (`0 1px 3px 0 oklch(0 0 0 / 0.06)`): Todas las tarjetas en estado default.
- **Tarjeta hover** (`0 4px 12px oklch(0 0 0 / 0.08)`): Tarjetas al hacer hover, indicando interactividad.
- **Modal/Popover** (`0 8px 24px oklch(0 0 0 / 0.12)`): Capas superpuestas, diálogos, dropdowns.

### La Regla Plano-por-Defecto

**La Regla de Superficie Plana.** Las superficies son planas en reposo. Las sombras aparecen solo como respuesta a estado (hover, elevación, foco). Un diseño donde las tarjetas siempre tienen sombra visible es incorrecto.

## Shapes

El lenguaje formal es de bordes generosamente redondeados con un radio base de 0.875rem (14px). Este radio grande es la firma visual del sistema: tarjetas, modales, inputs y botones comparten esta curva amable que suaviza la interfaz.

- **Tarjetas**: rounded-xl (1.5rem / 24px) — el radio más grande, dándoles presencia táctil.
- **Botones**: rounded-md (0.875rem) — consistente con el radio base.
- **Inputs**: rounded-xl (1.5rem) — igual que tarjetas, creando coherencia horizontal.
- **Badges/Chips**: rounded-md (0.875rem) o rounded-full para estados.
- **Iconos en contenedores**: rounded-xl (1.5rem) — los iconos funcionales dentro de tarjetas usan cuadrados con el mismo radio.

No hay bordes afilados en ninguna parte del sistema. Incluso los separadores son líneas finas con color Orilla.

### Shapes Scale
- **sm** (0.5rem / 8px): Componentes muy pequeños (kbd, avatares pequeños)
- **md** (0.875rem / 14px): Radio base — botones, badges, contenedores de iconos
- **lg** (1rem / 16px): Elementos que necesitan un poco más de curva
- **xl** (1.5rem / 24px): Tarjetas, modales, inputs, drawers
- **full** (9999px): Píldoras, switches, avatares

### La Regla de Curva Constante

**La Regla Sin Esquinas.** Ningún elemento interactivo o contenedor tiene un radio menor a 0.5rem. La ausencia de esquinas afiladas es una decisión consciente de accesibilidad y calidez visual.

## Components

### Buttons

Los botones son el elemento de acción principal. Tienen forma rectangular con rounded-md (0.875rem), texto en semibold (500) y transiciones suaves en todos los estados.

- **Shape:** Rectangular, rounded-md (0.875rem), sin sombra en reposo.
- **Primary (Default):** Fondo Teal Profundo (`--primary`), texto blanco. Hover: `opacity-90`. La variante por defecto para todas las acciones principales.
- **Secondary:** Fondo Brisa de Mar (`--secondary`), texto Profundidad. Usado para acciones alternativas en contextos donde primary sería excesivo.
- **Outline:** Borde Orilla, fondo transparente, texto heredado. Hover: fondo Espuma de Mar. Usado para acciones secundarias y botones de cancelar.
- **Ghost:** Sin borde ni fondo en reposo. Hover: fondo Espuma de Mar. Usado para iconos, acciones en tablas, menús contextuales.
- **Destructive:** Fondo Alerta, texto blanco. Solo para confirmar eliminación o acciones irreversibles.
- **Link:** Sin bordes ni fondo. Texto Teal Profundo con underline-offset-4. Para navegación inline.
- **Sizes:** sm (h-8), default (h-9), lg (h-10), icon (w-9 h-9), icon-sm (w-8 h-8), icon-lg (w-10 h-10).
- **Hover / Focus:** Transición de 150ms. Focus-visible con anillo de 3px en color Ring. Disabled: opacidad 50%, sin eventos de puntero.

### Cards

Las tarjetas son el contenedor universal del sistema. Toda la información se organiza en tarjetas.

- **Corner Style:** rounded-xl (1.5rem).
- **Background:** Blanco Nube (`--card`).
- **Shadow Strategy:** shadow-sm en reposo, shadow-md en hover (ver Elevation).
- **Border:** 1px solid Orilla (`--border`).
- **Internal Padding:** 1.25rem–1.5rem (p-5).
- **Variante elevada (card-elevated):** La misma card con borde visible. Clase utilitaria global.

### Badges / Chips

Indicadores de estado compactos.

- **Style:** rounded-md, padding horizontal 0.5rem, vertical 0.125rem, texto 0.75rem font-medium.
- **Default:** Fondo Teal Profundo, texto blanco. Estados positivos (Activo, Completado, Tomado).
- **Secondary:** Fondo Brisa de Mar, texto Profundidad. Estados informativos.
- **Destructive:** Fondo Alerta, texto blanco. Estados de error (Perdido, Alta severidad).
- **Outline:** Borde Orilla, texto heredado. Estados neutros.
- **Variantes ad-hoc:** Usan clases de utilidad Tailwind directamente (bg-amber-100 text-amber-700 para precaución, bg-destructive/10 text-destructive para alertas).

### Inputs

Campos de formulario con estilo consistente.

- **Style:** rounded-xl (1.5rem), borde 1px Orilla, fondo Superficie (idéntico al fondo de página), texto Profundidad.
- **Focus:** Anillo de 3px en color Ring, borde Teal Profundo. Placeholder: Gris Sereno.
- **Error:** Borde Alerta con anillo `ring-destructive/20`.
- **Disabled:** Opacidad 60%, cursor not-allowed.
- **Height:** 3rem (h-12) como estándar para inputs de texto. Inputs de tipo date/time también usan h-12.
- **Textareas:** Mismo estilo visual pero con resize vertical.

### Navigation

- **Bottom tab bar (mobile):** Iconos + etiqueta, indicador activo con color Teal Profundo. Badge de notificación (tomas próximas) en posición superior derecha del icono.
- **Sidebar (desktop):** Panel lateral con iconos + texto, item activo con fondo Espuma de Mar. No implementado en la iteración actual — la navegación es exclusivamente bottom tabs.
- **Header:** Logo + título de página + acciones contextuales (botón de agregar, búsqueda). El header no tiene fondo propio — se integra con el flujo de contenido.

### Tooltips

Información contextual breve.

- **Style:** rounded-md, fondo Profundidad, texto blanco, padding 0.5rem 0.75rem, max-width 16rem.
- **Trigger:** Icono `CircleHelp` de Lucide, 16px (w-4 h-4), color Gris Sereno, hover a Profundidad.
- **Placement:** Top por defecto, con align start.

### Dialog / Alert

Modales para confirmación.

- **Style:** Fondo Blanco Nube, rounded-xl (1.5rem), sombra Modal (ver Elevation), overlay con fondo negro al 50%.
- **Padding:** 1.5rem (p-6).
- **Título:** font-semibold, texto Profundidad.
- **Descripción:** text-sm, Gris Sereno.
- **Acciones:** Dos botones en fila (cancelar + confirmar). El botón de confirmar usa la variante que corresponda a la gravedad de la acción.

## Do's and Don'ts

### Do:
- **Do** usar tarjetas (card-elevated) para agrupar información relacionada. Una tarjeta por concepto.
- **Do** mantener los formularios en una sola columna. Máximo dos columnas solo para selectores complementarios (frecuencia + horarios).
- **Do** usar HelpTooltip con icono ❓ (CircleHelp) en cada label de formulario para educación contextual.
- **Do** usar gradientes solo como detalle decorativo en el banner del dashboard (clase `.gradient-brand`).
- **Do** mantener el espaciado generoso (gap-4 entre tarjetas, p-5 dentro de tarjetas).

### Don't:
- **Don't** usar sombras en botones. Las sombras son solo para contenedores.
- **Don't** mezclar rounded-md con rounded-sm en una misma tarjeta o sección. Consistencia de radio por bloque.
- **Don't** usar el primary Teal Profundo para fondos de página o áreas grandes. Solo para elementos interactivos y acentos.
- **Don't** superponer más de dos niveles de profundidad (fondo → tarjeta → modal es el máximo).
- **Don't** usar iconos sin etiqueta textual en la navegación principal. La accesibilidad para adultos mayores requiere texto + icono.
