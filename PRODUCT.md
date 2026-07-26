# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary:** Cuidador familiar — persona que gestiona la salud de un adulto mayor o familiar dependiente, usualmente sin formación médica, que necesita asegurarse de que el paciente tome sus medicamentos correctamente y detectar problemas a tiempo.

**Secondary:** Paciente adulto mayor con condiciones crónicas (hipertensión, diabetes, etc.) que usa la app directamente o recibe la información a través del cuidador.

## Product Purpose

Kawsaymi Care permite a cuidadores familiares gestionar el tratamiento farmacológico de sus pacientes de forma inteligente: registra medicamentos, programa horarios, mide adherencia, y detecta automáticamente riesgos clínicos como polifarmacia e interacciones medicamento-condición.

## Positioning

A diferencia de un simple recordatorio de pastillas, Kawsaymi Care funciona como un **motor inteligente de reglas clínicas** que cruza cada medicamento con el historial clínico del paciente para generar alertas personalizadas, detectar polifarmacia y ofrecer recomendaciones educativas con fuentes oficiales (MINSA, OMS, MedlinePlus, Mayo Clinic).

## Operating Context

- El cuidador accede desde su propio dispositivo (web mobile-first) y gestiona a uno o varios pacientes.
- El paciente puede o no tener su propio dispositivo; si lo tiene, recibe notificaciones y puede marcar tomas.
- La app se usa en contextos domésticos, no clínicos. No reemplaza la consulta médica.
- El idioma principal es español (Perú).

## Capabilities and Constraints

**Capacidades actuales:**
- Registro de medicamentos con nombre, dosis, frecuencia, vía, horarios, duración
- Schedule automático de eventos (dosis × días)
- Marcado de tomas (tomado/perdido)
- Dashboard con progreso diario, próxima toma, adherencia
- Detección de polifarmacia (BAJO/MODERADO/ALTO)
- Reglas clínicas: interacciones medicamento-condición con severidad
- Tarjetas educativas con fuente oficial para medicamentos comunes
- Sugerencias IA contextuales (vía Groq en rutas /api/ai-*)
- Sistema de alertas clínicas
- Historial clínico, vacunas, datos de salud, hábitos
- Notificaciones browser
- Entrada por voz (Speech-to-Text) y lectura en voz alta (Text-to-Speech)
- Modo offline/mock con localStorage

**Restricciones técnicas:**
- Backend real en Render para autenticación y datos funcionales
- Toda la lógica de IA/sugerencias se maneja desde el frontend mediante rutas /api/ai-*
- El sistema no da diagnósticos ni sugiere cambios de dosis
- Las fuentes de información de salud deben ser exclusivamente oficiales (MINSA, OMS, MedlinePlus, Mayo Clinic)

## Brand Commitments

- Nombre: Kawsaymi Care
- Idioma: español (Perú)
- Identidad visual existente implementada en Tailwind con diseño card-elevated y gradient-brand
- Tono: cálido, claro, accesible para adultos mayores

## Evidence on Hand

- README.md con documentación del proyecto
- Aplicación funcional con 10+ rutas implementadas
- Mock API interna con localStorage para desarrollo offline
- Base de conocimiento de 18 medicamentos comunes con información educativa
- 8 reglas de interacción medicamento-condición

## Product Principles

1. **La seguridad clínica es lo primero.** Ninguna funcionalidad debe sugerir cambios de dosis, reemplazar una consulta médica o usar fuentes no oficiales.
2. **El cuidador es el usuario principal.** Las decisiones de UX deben priorizar a quien supervisa, no solo a quien toma el medicamento.
3. **La adherencia se mide, no se asume.** Cada interacción debe generar datos que permitan evaluar el cumplimiento del tratamiento.
4. **La inteligencia está en las reglas, no en la IA.** El motor de reglas clínicas es el núcleo; la IA es un complemento para sugerencias contextuales.

## Accessibility & Inclusion

- Soporte de voz (STT/TTS) para usuarios con baja alfabetización digital o discapacidad visual
- Texto claro, tamaños de fuente grandes, contraste suficiente
- Diseño mobile-first para acceso desde cualquier dispositivo
