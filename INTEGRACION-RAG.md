# 🤖 Integración RAG - Frontend Kawsaymi Care

## ✅ Cambios Realizados

### 1. Tipos TypeScript Actualizados

**Archivo**: `lib/api/types.ts`

Se agregaron los campos `category` y `tags` a las interfaces:

```typescript
export interface KnowledgeMatch {
  // ... campos existentes
  category: string | null  // ← NUEVO
  tags: string[] | null    // ← NUEVO
}

export interface KnowledgeAnswerSource {
  // ... campos existentes
  category?: string | null  // ← NUEVO
  tags?: string[] | null    // ← NUEVO
}
```

### 2. URL del Backend Actualizada

**Archivo**: `lib/api/http.ts`

Se actualizó el puerto default de `3000` a `3001`:

```typescript
const DEFAULT_BASE =
  process.env.NODE_ENV === 'production'
    ? 'https://kawsaymi-care-backend.onrender.com'
    : 'http://localhost:3001'  // ← Puerto correcto
```

### 3. Nueva Página de Chat RAG

**Archivo**: `app/(app)/knowledge/chat/page.tsx`

Componente completo con:
- ✅ Input de preguntas
- ✅ Loading states
- ✅ Mostrar respuesta con formato
- ✅ Citas de fuentes con categorías
- ✅ Advertencia médica
- ✅ Preguntas de ejemplo

### 4. Navegación Actualizada

**Archivo**: `components/navigation.tsx`

Se agregó el ítem "Asistente IA" en el menú:
- ✅ Ícono `Brain` de lucide-react
- ✅ Link a `/knowledge/chat`
- ✅ Visible en sidebar desktop
- ✅ Visible en bottom nav mobile (top 5)

---

## 🚀 Cómo Usar

### 1. Iniciar el Frontend

```bash
cd /Users/hector/Desktop/2026/frontend-kawsaymi
npm run dev
```

El frontend correrá en `http://localhost:3000`

### 2. Asegurate que el Backend esté Corriendo

```bash
cd /Users/hector/Desktop/2026/kawsaymi-care-backend
npm run start:dev
```

El backend correrá en `http://localhost:3001`

### 3. Acceder al Asistente IA

1. Logueate en `http://localhost:3000/auth/login`
2. En el menú lateral, hacé click en **"Asistente IA"**
3. Hacé una pregunta, por ejemplo:
   - "¿Qué medicamentos hay para hipertensión?"
   - "¿Cuáles son las enfermedades cardiovasculares más comunes?"
   - "¿Qué tratamiento hay para diabetes tipo 2?"

---

## 📊 Ejemplo de Uso en Código

### Desde un Componente

```tsx
'use client'

import { api } from '@/lib/api'

export function MiComponente() {
  const handleConsultar = async () => {
    try {
      const response = await api.knowledgeAnswer({
        q: 'medicamentos para hipertensión',
        k: 6,
        scoreMin: 0.5
      })

      console.log(response.answer)
      // "Los medicamentos para hipertensión incluyen..."

      console.log(response.sources)
      // [{ id: 'S1', title: 'BASE DE DATOS.pdf', page: 3, category: 'medicamentos' }]
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return <button onClick={handleConsultar}>Consultar</button>
}
```

### Búsqueda Semántica

```tsx
import { api } from '@/lib/api'

const results = await api.knowledgeSearch('diabetes', 5)

console.log(results.matches)
// [
//   {
//     content: 'Diabetes mellitus tipo 2...',
//     category: 'metabolica',
//     tags: ['diabetes-t2'],
//     score: 0.55,
//     page: 5
//   }
// ]
```

---

## 🎨 Características de la UI

### Respuesta
- ✅ Formato markdown (negritas, listas)
- ✅ Fuentes citadas ([S1], [S2], ...)
- ✅ Advertencia médica al final

### Fuentes
- ✅ ID de la fuente ([S1], [S2], ...)
- ✅ Nombre del documento
- ✅ Número de página
- ✅ Categoría (badge de color)
- ✅ Score de relevancia

### Loading States
- ✅ Spinner mientras consulta
- ✅ Botón deshabilitado durante carga
- ✅ Skeleton cuando no hay resultados

### Errores
- ✅ Mensajes de error claros
- ✅ UI informativa cuando no hay respuesta

---

## 🔧 Configuración de Variables de Entorno

En `.env` del frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

O dejá que use el default (ya está configurado en `lib/api/http.ts`).

---

## 📱 Responsive

- **Desktop**: Sidebar izquierdo con todos los ítems
- **Mobile**: Bottom nav con los 5 primeros ítems (incluye Asistente IA)

---

## 🎯 Scores Recomendados

| scoreMin | Uso |
|----------|-----|
| 0.5 | Bases pequeñas (< 50 chunks) ✅ TU BASE ACTUAL |
| 0.6-0.7 | Bases medianas (50-500 chunks) |
| 0.8 | Bases grandes (> 500 chunks) |

**Importante**: Tu base actual tiene 17 chunks, usá `scoreMin: 0.5` para mejores resultados.

---

## 🐛 Troubleshooting

### "401 Unauthorized"
- El token expiró. Volvé a loguearte.

### "k must not be greater than 10"
- Usá `k <= 10` en `knowledgeSearch()`

### "No tengo información suficiente"
- El score mínimo es muy alto. Bajá `scoreMin` a 0.5

### La respuesta no muestra categorías
- Verificá que los tipos en `lib/api/types.ts` estén actualizados
- Verificá que el backend tenga los últimos cambios

---

## ✅ Checklist de Verificación

- [x] Tipos TypeScript actualizados (`category`, `tags`)
- [x] URL del backend actualizada (puerto 3001)
- [x] Página `/knowledge/chat` creada
- [x] Navegación actualizada (ítem "Asistente IA")
- [x] Build exitoso
- [x] Ruta registrada en Next.js

---

## 📁 Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `lib/api/types.ts` | + `category`, `tags` en interfaces |
| `lib/api/http.ts` | Puerto default: 3001 |
| `components/navigation.tsx` | + Ítem "Asistente IA" |
| `app/(app)/knowledge/chat/page.tsx` | ← NUEVO (componente de chat) |

---

## 🎉 ¡Listo!

El Asistente Médico IA está completamente integrado en tu frontend.

**Próximos pasos opcionales**:
- Agregar historial de preguntas frecuentes
- Implementar favoritos de respuestas
- Agregar feedback (thumbs up/down)
- Streaming de respuesta (Server-Sent Events)

---

**Fecha**: 2026-05-01  
**Estado**: ✅ COMPLETADO  
**Build**: ✅ Exitoso
