---
target: medications
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 4
timestamp: 2026-07-24T04-48-04Z
slug: app-app-medications
---
# Design Critique: Módulo de Medicamentos

**Method:** dual-agent (A: general · B: general)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Sin feedback tras guardar; `handleMark` sin manejo de error |
| 2 | Match System / Real World | 3 | Buen español y tono empático, pero "Inactivos" agrupa Suspendido+Finalizado |
| 3 | User Control and Freedom | 2 | Cambios de estado sin confirmación; sin undo |
| 4 | Consistency and Standards | 1 | Filtros rotos (filtran por nombre, no por estado); h-13/h-14 fuera de ramp |
| 5 | Error Prevention | 1 | `events.find()!` crash runtime; sin validación endDate vs startDate |
| 6 | Recognition Rather Than Recall | 2 | Polifarmacia mezcla `level` y `risk`; alertas sin acción sugerida |
| 7 | Flexibility and Efficiency of Use | 3 | STT + IA suggestions, sin shortcuts ni batch |
| 8 | Aesthetic and Minimalist Design | 1 | 12 cards en editar; 11 elementos por card en listado |
| 9 | Error Recovery | 2 | Errores uno a la vez; sin validación inline |
| 10 | Help and Documentation | 3 | HelpTooltips excelentes; TTS en educativas |
| **Total** | | **20/40** | **Acceptable** |

## Design Specificity Verdict

**LLM assessment:** El módulo está claramente anclado en su dominio — polifarmacia, barras de adherencia, reglas de interacción clínica, tarjetas educativas con TTS, y STT son características específicas para cuidadores de adultos mayores. Sin embargo, la estructura cardinal (stats → search → filtros → lista) es intercambiable con cualquier app de inventario. Los filtros y cards no comunican visualmente "cuidado de adultos mayores" — podrían ser una lista de compras sin cambiar una línea.

**Deterministic scan:** 0 hallazgos. El detector no encontró antipatrones tras el polish previo.

## Overall Impression

El módulo de medicamentos tiene una base sólida con características innovadoras (tarjetas educativas con fuente oficial, STT, motor de reglas clínicas) pero sufre de **sobrecarga visual** y **falta de refinamiento en la interacción**. El mayor problema es que los filtros por estado están rotos (P0), seguido de un crash potencial por non-null assertion. La experiencia emocional tiene picos bien diseñados ("¡Perfecto!") pero valles profundos sin contrapeso (polifarmacia en rojo sin explicación, redirección silenciosa tras guardar). El score 20/40 refleja una base aceptable con problemas significativos.

## What's Working

1. **Tarjetas educativas con TTS** — genuinamente innovador. Información con fuente MINSA/MedlinePlus/Mayo Clinic disponible en un solo tap con lectura en voz alta. Esto es específico del contexto cuidador.
2. **STT para entrada de medicamentos** — reduce la fricción para cuidadores con baja alfabetización digital. Estados de escucha/soporte/error claros.
3. **HelpTooltips en cada campo** — cada tooltip explica QUÉ datos ingresar y POR QUÉ importan. Pedagógicamente excelente.

## Priority Issues

### P0 — Filtros por estado rotos
- **Qué:** `page.tsx:93-95` filtra por `m.name`, pero los tabs (línea 175-186) setean `search` a 'Activos'/'Suspendidos'/'Finalizados'. Ningún nombre de medicamento contiene estos strings, así que TODOS los tabs no-"Todos" muestran vacío.
- **Por qué:** El mecanismo principal de descubrimiento para cuidadores está completamente roto.
- **Fix:** Separar `search` de `statusFilter`: agregar estado `statusFilter`, filtrar por `m.status` cuando esté seteado.
- **Suggested command:** `/impeccable fix filter tabs`

### P0 — Crash potencial en handleMark
- **Qué:** `page.tsx:313,319` usa `events.find(...)!` — si no hay evento PENDING por race condition, crashea en runtime.
- **Por qué:** White-screen crash sin error boundary. Bloquea toda interacción.
- **Fix:** `const pending = events.find(e => e.status === 'PENDING'); if (!pending) return null;`
- **Suggested command:** `/impeccable fix handleMark non-null assertion`

### P1 — 12 cards en pantalla de editar
- **Qué:** `[id]/page.tsx:204-472` — cada campo envuelto en su propio `card-elevated`. 12 contenedores para ~12 campos.
- **Por qué:** Viola "El Refugio Tranquilo". Ruido visual que impide escaneo rápido.
- **Fix:** Agrupar en 4-5 cards: (1) nombre+dosis+vía, (2) frecuencia+horarios, (3) fechas+permanencia, (4) instrucciones+estado.
- **Suggested command:** `/impeccable consolidate edit page cards`

### P1 — Sin feedback tras guardar
- **Qué:** `new/page.tsx:156`, `[id]/page.tsx:163` — redirección silenciosa al listado sin toast ni confirmación.
- **Por qué:** El usuario termina preguntándose "¿se guardó?". Erosión de confianza.
- **Fix:** Toast "Medicamento guardado correctamente" con auto-dismiss 2s antes de redirigir.
- **Suggested command:** `/impeccable add success toast`

### P1 — Polifarmacia mezcla level y risk
- **Qué:** `page.tsx:152-157` — label lee de `polyInfo.level` pero color de `polyInfo.risk`. Si divergen, "BAJO" podría mostrar rojo "Alto".
- **Por qué:** Bug visual latente que causa pánico innecesario en cuidadores.
- **Fix:** Usar una sola fuente de verdad (`risk`) para ambos label y color.

### P2 — Cambios de estado sin confirmación
- **Qué:** `page.tsx:260-267`, `[id]/page.tsx:211-221` — un tap cambia ACTIVE→COMPLETED sin undo.
- **Por qué:** Cuidador puede marcar accidentalmente un medicamento crítico como finalizado.
- **Fix:** Diálogo de confirmación para ACTIVE→COMPLETED/SUSPENDED.
- **Suggested command:** `/impeccable add confirmation dialog for status changes`

## Persona Red Flags

**Alex (Power User):** Filtros rotos = no puede encontrar rápido. 12 cards = escaneo lento. Sin batch operations.

**Jordan (First-Timer):** Validación secuencial frustrante (fix→save→fix→save). Banner de polifarmacia sin explicación. Micrófono STT sin label visible.

**Sam (Accesibilidad):** "No pude tomar" sin confirmación previa. Alertas clínicas sin acción sugerida ("¿Llamo al médico?"). Redirección silenciosa post-guardado sin confirmación audible.

**Casey (Mobile):** Polifarmacia sin tendencia (¿mejorando o empeorando?). Sin vista semanal/mensual de adherencia.

## Minor Observations
- h-13/h-14 fuera del ramp del design system
- max-w-lg (32rem) en forms vs 42rem del design system
- 🕐 emoji mezclado con Lucide icons
- Constantes duplicadas entre new/[id] pages
- Sin `aria-live` para anuncios de errores a screen readers

## Questions to Consider
- Si "El Refugio Tranquilo" es calma, ¿por qué cada card de medicamento tiene 11 elementos compitiendo?
- El banner de polifarmacia dice riesgo ALTO — ¿y ahora qué hago? ¿Dónde está el "¿Qué hago?" que conecta datos con acción?
- ¿Por qué las tarjetas educativas solo aparecen en editar y no en el listado, donde el cuidador descubre medicamentos que no conoce?
- Cada campo tiene HelpTooltip — ¿por qué POLIFARMACIA, el concepto más complejo, no tiene ninguno?
