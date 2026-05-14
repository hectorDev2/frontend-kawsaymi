# Kawsaymi Care — Medication Adherence App

Aplicación Next.js para adherencia a medicamentos con flujo completo: crear tratamiento → schedule automático → marcar tomas → próxima dosis → notificaciones.

## Features

### Para Pacientes
- **Gestión de Medicamentos**: Crear medicación con nombre, dosis, frecuencia y **duración del tratamiento**
- **Schedule Automático**: Al crear una medicación se generan todos los eventos del tratamiento (N días × frecuencias/día)
- **Dashboard**: Progreso del día, próxima toma con countdown, lista de tomas ordenadas por hora
- **Adherencia**: Vista dedicada con círculo de progreso y resumen tomado/pendiente/perdido
- **Notificaciones**: Browser Notification al acercarse la hora de una dosis + toast in-app
- **Badge de Próximas Dosis**: Indicador visual en la navegación con cantidad de tomas próximas (2h)
- **Datos de Salud**: Registro de peso, altura, hábitos y plan de mejora
- **Tips IA**: Sugerencias generadas con IA sobre cada medicamento (fuentes MINSA/OMS)
- **Chat de Conocimiento**: RAG asistido por IA para consultas médicas

### Para Cuidadores
- **Monitoreo de Pacientes**: Dashboard con lista de pacientes y su estado
- **Alertas**: Sistema de notificaciones para dosis perdidas y baja adherencia
- **Historial Clínico**: Acceso a antecedentes y evolución

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS 4
- **UI**: shadcn/ui + Radix primitives
- **State Management**: Zustand (adherencia) + React Context (auth, providers)
- **Gráficos**: Recharts
- **Iconos**: Lucide React
- **Mock API**: Mock interno con localStorage (sin backend necesario para desarrollo)
- **Notificaciones**: Browser Notification API + sonner toasts

## Project Structure

```
├── app/
│   ├── (app)/                       # Rutas protegidas (requieren auth)
│   │   ├── dashboard/page.tsx       # Dashboard con progreso + próxima toma
│   │   ├── medications/             # Lista y creación de medicamentos
│   │   ├── adherence/               # Vista de adherencia del día
│   │   ├── health-data/             # Métricas de salud
│   │   ├── alerts/                  # Centro de alertas (caregiver)
│   │   ├── settings/                # Configuración del perfil
│   │   └── layout.tsx               # Layout protegido + dose notifier
│   ├── auth/
│   │   ├── login/                   # Inicio de sesión
│   │   └── signup/                  # Registro
│   ├── api/                         # API routes (Next.js, tips IA)
│   ├── layout.tsx                   # Root layout con providers + Toaster
│   └── page.tsx                     # Landing page
├── components/
│   ├── ui/                          # shadcn/ui + componentes base
│   ├── navigation.tsx               # Sidebar desktop + bottom nav mobile + badge
│   ├── medication-card.tsx          # Card de medicamento para lista
│   ├── medication-card-skeleton.tsx # Skeleton loading
│   ├── adherence-chart.tsx          # Gráfico de adherencia
│   ├── patient-status-card.tsx      # Card de paciente (caregiver)
│   └── empty-state.tsx              # Estado vacío reutilizable
├── hooks/
│   ├── use-toast.ts                 # Hook de toast (sonner)
│   ├── use-mobile.ts                # Detección de mobile
│   └── use-dose-notifier.ts         # Notificador de dosis cada 30s
├── lib/
│   ├── api/                         # API client (mock + HTTP)
│   │   ├── types.ts                 # Interfaces compartidas (ApiContract, etc.)
│   │   ├── mock.ts                  # Mock API con localStorage
│   │   ├── http.ts                  # HTTP client para backend real
│   │   └── index.ts                 # Feature flag mock/real
│   ├── stores/
│   │   └── adherence-store.ts       # Zustand store (eventos, nextDose)
│   ├── auth-context.tsx             # Auth provider (React Context)
│   ├── user-data-context.tsx        # Datos de usuario + medicamentos
│   ├── health-context.tsx           # Contexto de salud para tips IA
│   ├── ai-tip-cache.ts             # Cache de tips en localStorage
│   ├── data-events.ts               # Event bus CustomEvent
│   └── utils.ts                     # cn() utility
└── public/                          # Assets estáticos
```

## State Management

| Capa | Tecnología | Responsabilidad |
|------|-----------|-----------------|
| **Adherencia** | Zustand | todayEvents, weekEvents, nextDose, markTaken/markMissed, loadToday |
| **Auth** | React Context | user, login, logout, isAuthenticated |
| **User Data** | React Context | medications (lista), healthProfile, polypharmacy |
| **Health Context** | React Context | String contextual para tips IA |

### Zustand Adherence Store

```typescript
useAdherenceStore.getState()
// {
//   todayEvents: MedicationEvent[]
//   weekEvents: MedicationEvent[]
//   nextDose: MedicationEvent | null     // próximo evento PENDING
//   todayAdherence: AdherenceStats | null
//   isLoading: boolean
//   markTaken: (eventId) => Promise<void> // optimistic update
//   markMissed: (eventId) => Promise<void> // optimistic update
//   subscribeToEvents: () => () => void    // escucha data-events
// }
```

Los selectores por slice evitan re-renders innecesarios:
```tsx
const events = useAdherenceStore((s) => s.todayEvents)
const nextDose = useAdherenceStore((s) => s.nextDose)
```

## Getting Started

### Prerrequisitos
- Node.js 18+
- npm / pnpm

### Instalación

```bash
npm install
```

### Entorno

```env
# Modo mock (sin backend, datos precargados)
NEXT_PUBLIC_USE_MOCK=true

# Modo real (apunta al backend)
NEXT_PUBLIC_API_URL=https://kawsaymi-care-backend.onrender.com
NEXT_PUBLIC_USE_MOCK=false
```

### Desarrollo

```bash
npm run dev
# → http://localhost:3000
```

## Flujo de Adherencia

```
1. /medications/new
   ├── Nombre + Dosis + Frecuencia + Duración + Fecha inicio
   └── buildSchedule() → ISO[] (N días × M veces/día)

2. POST /medications
   ├── Backend persiste medicación + eventos PENDING
   └── Response: { medication: { ...events } }

3. /dashboard
   ├── "Próxima toma" widget (primer PENDING ordenado)
   ├── Countdown + barra de progreso
   └── Botón "Tomar" → optimistic update

4. Notificador (cada 30s)
   ├── Busca eventos PENDING en ventana de 5 min
   ├── Browser Notification
   └── Toast sonner (arriba derecha)

5. Badge en nav
   ├── Eventos PENDING dentro de 2h
   └── Link directo a /adherence
```

## API Contract

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/register` | Registro |
| POST | `/auth/login` | Login → JWT |
| POST | `/auth/refresh` | Refresh token |
| POST | `/auth/logout` | Logout |

### Medicamentos
| Método | Endpoint | Body | Descripción |
|--------|----------|------|-------------|
| GET | `/medications` | — | Lista |
| GET | `/medications/:id` | — | Detalle |
| POST | `/medications` | `{ name, dose, frequency, intervalHours, startDate, endDate, schedule }` | **Crea medicación + eventos** |
| PUT | `/medications/:id` | `{ schedule, ... }` | Reemplaza schedule + regenera eventos |
| PATCH | `/medications/:id/status` | `{ status }` | Cambia estado |
| DELETE | `/medications/:id` | — | Elimina medicación + eventos |

### Eventos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/events` | Filtrados por query params |
| GET | `/events/today` | Eventos del día |
| GET | `/events/week` | Eventos de la semana |
| PATCH | `/events/:id/mark-taken` | Marcar como tomado |
| PATCH | `/events/:id/mark-missed` | Marcar como perdido |

### Adherencia
| GET | `/adherence/today` | Stats del día |
| GET | `/adherence/week` | Stats de la semana |
| GET | `/adherence/month` | Stats del mes |
| GET | `/adherence/stats` | Stats completas |

### Salud
| GET | `/health/profile` | Perfil de salud |
| POST | `/health/weight` | Actualizar peso |
| GET | `/health/imc` | IMC calculado |
| GET | `/health/polypharmacy` | Info de polifarmacia |

### Conocimiento (RAG)
| GET | `/knowledge/search` | Búsqueda semántica |
| POST | `/knowledge/answer` | Pregunta con respuesta |
| POST | `/knowledge/documents` | (Admin) Ingestar documentos |

## Modo Mock vs Real

| Variable | Mock | Real |
|----------|------|------|
| `NEXT_PUBLIC_USE_MOCK=true` | Usa `lib/api/mock.ts` | — |
| `NEXT_PUBLIC_USE_MOCK=false` | — | Usa `lib/api/http.ts` |
| `NEXT_PUBLIC_API_URL` | Opcional | URL del backend |

El mock persiste en localStorage. Ideal para desarrollo offline o demo.

## Arquitectura de Notificaciones

```
useDoseNotifier() ← app/(app)/layout.tsx
  │
  ├── setInterval 30s
  │
  ├── useAdherenceStore.getState().todayEvents + weekEvents
  │
  ├── ¿evento PENDING en ventana 5 min?
  │   ├── Sí → Browser Notification + toast sonner
  │   └── No → espera próxima iteración
  │
  └── notifiedRef (Set<eventId>) evita duplicados
```

## Despliegue

### Vercel
```bash
npm run build
vercel deploy
```

### Variables de entorno requeridas en producción
```env
NEXT_PUBLIC_API_URL=https://tu-backend.com
NEXT_PUBLIC_USE_MOCK=false
```
