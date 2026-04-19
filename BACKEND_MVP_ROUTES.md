# Backend — Rutas requeridas / faltantes (MVP Paciente) — frontend-kawsaymi

## Alcance (Opción A)
Implementar en el backend **solo**:
- Todas las rutas que el frontend ya consume en `lib/api/http.ts`
- **+ 1 ruta nueva** necesaria: `PUT /health/profile` (para guardar altura y recalcular IMC)

Fuera de alcance en esta entrega:
- Caregiver: `patients/alerts/caregivers`
- `vaccines`
- historial clínico completo (más allá de `PUT /users/me/conditions`)

---

## Fuentes del contrato (frontend)
- Tipos: `lib/api/types.ts`
- Cliente HTTP real: `lib/api/http.ts`

> Nota: Las rutas `/api/ai-*` son de Next.js (frontend) y NO pertenecen al backend.

---

## Convenciones

### Auth
- Header: `Authorization: Bearer <access_token>`

### Errores
El cliente intenta leer JSON y usa `message` o `error`.
Recomendado:

```json
{ "message": "Detalle del error" }
```

---

## Endpoints requeridos (ya usados por el frontend)

### 1) Auth

#### POST /auth/register
Body:

```json
{ "email": "a@b.com", "password": "********", "name": "Nombre", "role": "PATIENT" }
```

Response (200):

```json
{
  "user": { "id": "u1", "email": "a@b.com", "name": "Nombre", "role": "PATIENT" },
  "session": { "access_token": "jwt", "refresh_token": "rjwt", "expires_in": 3600 }
}
```

#### POST /auth/login
Body:

```json
{ "email": "a@b.com", "password": "********" }
```

Response: igual a register.

#### POST /auth/refresh
Body:

```json
{ "refreshToken": "rjwt" }
```

Response:

```json
{ "session": { "access_token": "jwt2", "refresh_token": "rjwt2", "expires_in": 3600 } }
```

#### POST /auth/logout
Response:

```json
{ "success": true }
```

---

### 2) Usuario

#### GET /users/me
Response:

```json
{
  "user": {
    "id": "u1",
    "email": "a@b.com",
    "name": "Nombre",
    "role": "PATIENT",
    "dateOfBirth": "1990-01-01",
    "location": "Lima, Perú",
    "language": "es",
    "timezone": "America/Lima",
    "allergies": ["Penicilina"],
    "conditions": ["Diabetes"]
  }
}
```

#### PUT /users/me
Body (partial):

```json
{ "name": "Nuevo", "dateOfBirth": "1990-01-01", "location": "Lima", "language": "es", "timezone": "America/Lima" }
```

Response: `{ "user": ... }`

#### PUT /users/me/allergies
Body:

```json
{ "allergies": ["Penicilina", "Ibuprofeno"] }
```

Response: 200 OK

#### PUT /users/me/conditions
Body:

```json
{ "conditions": ["Diabetes", "Hipertensión"] }
```

Response: 200 OK

#### DELETE /users/me
Response:

```json
{ "success": true }
```

---

### 3) Medicamentos

#### GET /medications
Response:

```json
{
  "medications": [
    {
      "id": "med-1",
      "name": "Metformina",
      "dose": "500mg",
      "frequency": 2,
      "intervalHours": 12,
      "instructions": "Tomar con comida",
      "startDate": "2026-04-18",
      "endDate": null,
      "schedule": ["2026-04-18T08:00:00.000Z", "2026-04-18T20:00:00.000Z"],
      "status": "ACTIVE"
    }
  ]
}
```

#### GET /medications/:id
Response:

```json
{ "medication": { "...": "..." } }
```

#### POST /medications
Body:

```json
{
  "name": "Metformina",
  "dose": "500mg",
  "frequency": 2,
  "intervalHours": 12,
  "instructions": "Tomar con comida",
  "startDate": "2026-04-18",
  "endDate": null,
  "schedule": ["2026-04-18T08:00:00.000Z", "2026-04-18T20:00:00.000Z"]
}
```

Response:

```json
{ "medication": { "...": "..." } }
```

#### PUT /medications/:id
Body (partial):

```json
{ "instructions": "Tomar con comida" }
```

Response: `{ "medication": ... }`

#### PATCH /medications/:id/status
Body:

```json
{ "status": "SUSPENDED" }
```

Response: `{ "medication": ... }`

#### DELETE /medications/:id
Response:

```json
{ "success": true }
```

---

### 4) Eventos (tomas)

#### GET /events
Query opcional: `from`, `to`, `medicationId`, `status` (`PENDING|TAKEN|MISSED`)
Response:

```json
{
  "events": [
    {
      "id": "evt-1",
      "medicationId": "med-1",
      "medicationName": "Metformina",
      "medicationDose": "500mg",
      "dateTimeScheduled": "2026-04-18T08:00:00.000Z",
      "status": "PENDING"
    }
  ]
}
```

#### GET /events/today
Response: `{ "events": [...] }`

#### GET /events/week
Response: `{ "events": [...] }`

#### PATCH /events/:id/mark-taken
Response:

```json
{ "event": { "id": "evt-1", "status": "TAKEN", "...": "..." } }
```

#### PATCH /events/:id/mark-missed
Response:

```json
{ "event": { "id": "evt-1", "status": "MISSED", "...": "..." } }
```

**Regla clave (confirmada): generación ON-DEMAND**
- Los eventos se materializan cuando el frontend pide `/events/today` o `/events/week` (y/o `/events` con rango).
- IMPORTANTE: IDs de eventos deben ser **estables** para que `mark-taken/missed` no rompa por regeneración/duplicados.

---

### 5) Adherencia

#### GET /adherence/today | /week | /month | /stats
Response (ejemplo):

```json
{ "taken": 2, "missed": 0, "pending": 1, "total": 3, "adherenceRate": 0.6667, "activeMedications": 2 }
```

> `adherenceRate` es 0..1 (el frontend lo convierte a %).

---

### 6) Salud

#### GET /health/profile
Response:

```json
{ "health": { "userId": "u1", "weight": 70.5, "height": 170, "imc": 24.4 } }
```

#### POST /health/weight  *(ya existe en el cliente hoy; puede mantenerse por compatibilidad)*
Body:

```json
{ "weight": 70.5 }
```

Response:

```json
{ "health": { "userId": "u1", "weight": 70.5, "height": 170, "imc": 24.4 } }
```

#### GET /health/imc
Response:

```json
{ "imc": 24.4 }
```

#### GET /health/polypharmacy
Response:

```json
{ "activeMedications": 5, "polypharmacy": true }
```

---

## Endpoint NUEVO (faltante / bloqueante para MVP)

### PUT /health/profile  ✅ (decidido)
Motivo: la UI permite editar peso+altura; hoy solo se persiste peso.

Body (parcial):

```json
{ "weight": 70.5, "height": 170 }
```

Response:

```json
{ "health": { "userId": "u1", "weight": 70.5, "height": 170, "imc": 24.4 } }
```

Reglas:
- Guardar `weight` y/o `height`.
- Recalcular `imc` cuando ambos existan y sean > 0.
- Retornar siempre el `health` completo actualizado.

---

## Checklist de entrega (backend)
- [ ] Auth: register/login/refresh/logout
- [ ] Users: me/update + allergies + conditions + delete
- [ ] Medications: CRUD + patch status
- [ ] Events: list + today + week + mark taken/missed
- [ ] Adherence: today/week/month/stats
- [ ] Health: profile + imc + polypharmacy
- [ ] Health: **PUT /health/profile** (nuevo)
- [ ] Events: generación **on-demand** con IDs estables
