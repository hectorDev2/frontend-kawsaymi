---
target: dashboard
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 4
timestamp: 2026-07-24T05-20-54Z
slug: app-app-dashboard
---
# Design Critique: Dashboard

**Method:** dual-agent (A: general · B: general)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Sin toast/feedback post-acción; rollback silencioso en fallo de API |
| 2 | Match System / Real World | 4 | Español natural, vocabulario cuidador, formato hora con "hs" |
| 3 | User Control and Freedom | 1 | Sin undo para marcar tomas; sin confirmación antes de "No pude tomar" |
| 4 | Consistency and Standards | 2 | Raw `<button>` mezclado con `<Button>` component; inconsistent |
| 5 | Error Prevention | 2 | Sin confirmación antes de marcar perdida; cache de tips puede servir stale data |
| 6 | Recognition Rather Than Recall | 3 | Todo visible; countdown bar excelente; progreso numérico + visual |
| 7 | Flexibility and Efficiency of Use | 1 | Sin shortcuts, sin batch, caregiver dashboard con solo 2 targets |
| 8 | Aesthetic and Minimalist Design | 3 | Banner gradient-brand bien; acciones duplicadas en cards de eventos |
| 9 | Error Recovery | 2 | Errores de AI tip visibles; rollback silencioso en markTaken/Missed |
| 10 | Help and Documentation | 1 | Sin ayuda, sin onboarding, sin FAQ ni support link |
| **Total** | | **22/40** | **Acceptable** |

## Design Specificity

La página NO es intercambiable con cualquier categoría — la lista de eventos con badges de estado, countdown de próxima toma y banner de adherencia con gradient-brand señalan claramente una app de salud. Pero la estructura (progreso → lista → enlaces rápidos) es un esqueleto de dashboard genérico. Lo que falta: señales emocionales específicas del cuidador (foto/nombre del paciente visible, contexto de relación). El modo cuidador está dramáticamente subespecificado — 2 cards de stats y 2 links, sin adherencia por paciente.

**Detector:** 0 findings — el dashboard está limpio tras el polish previo.

## Overall Impression

El dashboard de paciente es sólido: el banner de progreso es un gran ancla emocional, las cards de eventos son escaneables, y los estados vacíos están bien manejados. Pero el dashboard de cuidador es casi un placeholder. Los problemas más graves son la falta de confirmación antes de marcar una dosis como perdida (P0 — integridad de datos médicos) y el rollback silencioso en fallos de API (P0 — el cuidador cree que registró algo que no se registró). Score 22/40 refleja una base sólida con agujeros críticos.

## Priority Issues

### P0 — Marcar "No pude tomar" sin confirmación
- **Qué:** Cualquier tap en "No pude tomar" ejecuta inmediatamente sin diálogo de confirmación
- **Por qué:** Un tap accidental reporta datos falsos de dosis perdida. Integridad de datos médicos.
- **Fix:** Agregar confirmación con el nombre del medicamento y contextual reassurance
- **Suggested command:** `/impeccable add confirmation for missed dose`

### P0 — Rollback silencioso en fallo de API
- **Qué:** markTaken/markMissed falla silenciosamente — el usuario ve el revert pero no sabe por qué
- **Por qué:** Cuidador cree que registró la dosis y se va. Datos perdidos sin notificación.
- **Fix:** Toast o inline error cuando el rollback ocurre
- **Suggested command:** `/impeccable add error toast on mark action failure`

### P1 — Dashboard de cuidador subespecificado
- **Qué:** Solo 2 stats + 2 links de navegación. Sin adherencia por paciente.
- **Por qué:** La tarea principal del cuidador es monitorear múltiples pacientes — no puede hacerlo desde home.
- **Fix:** Mini-cards de adherencia por paciente con nombre, %, dosis pendientes
- **Suggested command:** `/impeccable redesign caregiver dashboard`

### P1 — Acciones duplicadas en cards de eventos
- **Qué:** Botón "Tomar ahora" + fila inferior "Marcar como tomado" para la misma acción
- **Por qué:** Hesitación ("¿ya lo marqué?"), potencial doble tap
- **Fix:** Unificar en un solo path de acción por card
- **Suggested command:** `/impeccable deduplicate event card actions`

### P1 — Saludo fijo "Buenos días"
- **Qué:** Línea 314 hardcodea "Buenos días 👋" siempre
- **Por qué:** A las 10 PM saluda "Buenos días" — rompe naturalidad
- **Fix:** Helper de 3 líneas: buenos días/tardes/noches según hora

### P2 — Raw buttons mezclados con Button component
- **Qué:** Líneas 502-504 y 518-531 usan `<button>` raw en vez de `<Button>`
- **Por qué:** Rompe abstracción del design system
- **Fix:** Reemplazar con `<Button variant="ghost" size="sm">`

## Minor Observations
- Caregiver dashboard hardcodea "4 pacientes" y "2 alertas" como strings literales
- DEMO badge visible si NEXT_PUBLIC_USE_MOCK está seteado en producción
- Sparkles icon button tiene 32×32px — debajo del mínimo 44×44pt para touch targets
- SVG de CircularProgress sin role="progressbar" ni aria-valuenow
- Sin `prefers-reduced-motion` para animación de 700ms
