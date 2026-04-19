/**
 * Mock API — misma interfaz que el cliente real.
 * Usa localStorage para persistir datos entre recargas.
 * Cambiar NEXT_PUBLIC_USE_MOCK=false para apuntar al backend real.
 */

import type {
  ApiContract,
  AuthResponse,
  AuthUser,
  Medication,
  MedicationEvent,
  AdherenceStats,
  HealthProfile,
  UserProfile,
  RegisterPayload,
  LoginPayload,
  CreateMedicationPayload,
  UpdateMedicationPayload,
  MedicationStatus,
  EventsQuery,
  Session,
} from './types'

// ─── Storage helpers ──────────────────────────────────────────────────────────

const KEYS = {
  users: 'kw_mock_users',
  currentUser: 'kw_mock_current_user',
  // Keep this stable across mock/real so users don't "lose" sessions when switching.
  token: 'kw_token',
  medications: 'kw_mock_medications',
  events: 'kw_mock_events',
  health: 'kw_mock_health',
}

const LEGACY_TOKEN_KEY = 'kw_mock_token'

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms))
}

// ─── Seed data ────────────────────────────────────────────────────────────────

interface StoredUser extends AuthUser {
  password: string
  dateOfBirth?: string
  location?: string
  language?: string
  timezone?: string
  allergies?: string[]
  conditions?: string[]
}

const SEED_USERS: StoredUser[] = [
  {
    id: 'u-patient-1',
    email: 'paciente@demo.com',
    password: '12345678',
    name: 'Elena González',
    role: 'PATIENT',
    timezone: 'America/Lima',
    language: 'es',
    allergies: ['penicillin'],
    conditions: ['hypertension', 'diabetes'],
  },
  {
    id: 'u-caregiver-1',
    email: 'cuidador@demo.com',
    password: '12345678',
    name: 'Carlos Médina',
    role: 'CAREGIVER',
    timezone: 'America/Lima',
    language: 'es',
  },
]

// ISO datetime helpers
function todayAt(hour: number, minute = 0): string {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

const SEED_MEDICATIONS: Medication[] = [
  {
    id: 'med-1',
    name: 'Metformina',
    dose: '500mg',
    frequency: 2,
    intervalHours: 12,
    instructions: 'Tomar con comida',
    startDate: new Date(Date.now() - 7 * 86400000).toISOString(),
    schedule: [todayAt(8), todayAt(20)],
    status: 'ACTIVE',
  },
  {
    id: 'med-2',
    name: 'Lisinopril',
    dose: '10mg',
    frequency: 1,
    intervalHours: 24,
    instructions: 'Tomar por la mañana',
    startDate: new Date(Date.now() - 14 * 86400000).toISOString(),
    schedule: [todayAt(8)],
    status: 'ACTIVE',
  },
  {
    id: 'med-3',
    name: 'Atorvastatin',
    dose: '20mg',
    frequency: 1,
    intervalHours: 24,
    instructions: 'Tomar por la noche',
    startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
    schedule: [todayAt(20)],
    status: 'ACTIVE',
  },
]

const SEED_EVENTS: MedicationEvent[] = [
  {
    id: 'evt-1',
    medicationId: 'med-2',
    medicationName: 'Lisinopril',
    medicationDose: '10mg',
    dateTimeScheduled: todayAt(8),
    status: 'TAKEN',
  },
  {
    id: 'evt-2',
    medicationId: 'med-1',
    medicationName: 'Metformina',
    medicationDose: '500mg',
    dateTimeScheduled: todayAt(8),
    status: 'TAKEN',
  },
  {
    id: 'evt-3',
    medicationId: 'med-1',
    medicationName: 'Metformina',
    medicationDose: '500mg',
    dateTimeScheduled: todayAt(13),
    status: 'PENDING',
  },
  {
    id: 'evt-4',
    medicationId: 'med-3',
    medicationName: 'Atorvastatin',
    medicationDose: '20mg',
    dateTimeScheduled: todayAt(20),
    status: 'PENDING',
  },
]

// ─── Init storage with seeds if empty ────────────────────────────────────────

function ensureSeeded() {
  const users = load<StoredUser[]>(KEYS.users, [])
  if (users.length === 0) {
    save(KEYS.users, SEED_USERS)
  }
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────

function makeSession(userId: string): Session {
  return {
    access_token: `mock_token_${userId}_${Date.now()}`,
    refresh_token: `mock_refresh_${userId}_${Date.now()}`,
    expires_in: 3600,
  }
}

function requireAuth(): StoredUser {
  const token = load<string | null>(KEYS.token, null) || load<string | null>(LEGACY_TOKEN_KEY, null)
  const user = load<StoredUser | null>(KEYS.currentUser, null)
  if (!token || !user) throw new Error('No autenticado')
  return user
}

function userToProfile(u: StoredUser): UserProfile {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    dateOfBirth: u.dateOfBirth,
    location: u.location,
    language: u.language,
    timezone: u.timezone,
    allergies: u.allergies,
    conditions: u.conditions,
  }
}

// ─── Event generation (simula la lógica del backend) ─────────────────────────

function getOrCreateEvents(userId: string): MedicationEvent[] {
  const stored = load<Record<string, MedicationEvent[]>>(KEYS.events, {})
  if (stored[userId]) return stored[userId]
  // Seed events for patient
  const initial = userId === 'u-patient-1' ? [...SEED_EVENTS] : []
  stored[userId] = initial
  save(KEYS.events, stored)
  return initial
}

function saveEvents(userId: string, events: MedicationEvent[]) {
  const stored = load<Record<string, MedicationEvent[]>>(KEYS.events, {})
  stored[userId] = events
  save(KEYS.events, stored)
}

function getMedicationsForUser(userId: string): Medication[] {
  const stored = load<Record<string, Medication[]>>(KEYS.medications, {})
  if (stored[userId]) return stored[userId]
  const initial = userId === 'u-patient-1' ? [...SEED_MEDICATIONS] : []
  stored[userId] = initial
  save(KEYS.medications, stored)
  return initial
}

function saveMedicationsForUser(userId: string, meds: Medication[]) {
  const stored = load<Record<string, Medication[]>>(KEYS.medications, {})
  stored[userId] = meds
  save(KEYS.medications, stored)
}

function getHealthForUser(userId: string): HealthProfile {
  const stored = load<Record<string, HealthProfile>>(KEYS.health, {})
  return stored[userId] ?? { userId, weight: null, height: null, imc: null }
}

function saveHealthForUser(userId: string, health: HealthProfile) {
  const stored = load<Record<string, HealthProfile>>(KEYS.health, {})
  stored[userId] = health
  save(KEYS.health, stored)
}

function calcAdherence(events: MedicationEvent[]): AdherenceStats {
  const taken = events.filter((e) => e.status === 'TAKEN').length
  const missed = events.filter((e) => e.status === 'MISSED').length
  const pending = events.filter((e) => e.status === 'PENDING').length
  const total = taken + missed + pending
  return {
    taken,
    missed,
    pending,
    total,
    adherenceRate: total > 0 ? taken / total : 0,
  }
}

// ─── Mock API implementation ──────────────────────────────────────────────────

export const mockApi: ApiContract = {
  // ── Auth ──────────────────────────────────────────────────────────────────

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    await delay()
    ensureSeeded()
    const users = load<StoredUser[]>(KEYS.users, [])
    if (users.find((u) => u.email.toLowerCase() === payload.email.toLowerCase())) {
      throw new Error('El correo ya está registrado')
    }
    const newUser: StoredUser = {
      id: uid(),
      email: payload.email,
      password: payload.password,
      name: payload.name,
      role: payload.role,
      language: 'es',
      timezone: 'America/Lima',
    }
    users.push(newUser)
    save(KEYS.users, users)
    const session = makeSession(newUser.id)
    save(KEYS.token, session.access_token)
    save(KEYS.currentUser, newUser)
    const { password: _, ...authUser } = newUser
    return { user: authUser, session }
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    await delay()
    ensureSeeded()
    const users = load<StoredUser[]>(KEYS.users, [])
    const found = users.find(
      (u) =>
        u.email.toLowerCase() === payload.email.toLowerCase() &&
        u.password === payload.password
    )
    if (!found) throw new Error('Correo electrónico o contraseña incorrectos')
    const session = makeSession(found.id)
    save(KEYS.token, session.access_token)
    save(KEYS.currentUser, found)
    const { password: _, ...authUser } = found
    return { user: authUser, session }
  },

  async refresh(refreshToken: string) {
    await delay()
    const user = load<StoredUser | null>(KEYS.currentUser, null)
    if (!user) throw new Error('Sesión expirada')
    const session = makeSession(user.id)
    save(KEYS.token, session.access_token)
    return { session }
  },

  async logout() {
    await delay(100)
    localStorage.removeItem(KEYS.token)
    localStorage.removeItem(KEYS.currentUser)
    return { success: true }
  },

  // ── Users ──────────────────────────────────────────────────────────────────

  async getMe() {
    await delay()
    const user = requireAuth()
    return { user: userToProfile(user) }
  },

  async updateMe(payload) {
    await delay()
    const user = requireAuth()
    const users = load<StoredUser[]>(KEYS.users, [])
    const idx = users.findIndex((u) => u.id === user.id)
    if (idx === -1) throw new Error('Usuario no encontrado')
    Object.assign(users[idx], payload)
    save(KEYS.users, users)
    save(KEYS.currentUser, users[idx])
    return { user: userToProfile(users[idx]) }
  },

  async updateAllergies(allergies) {
    await delay()
    const user = requireAuth()
    const users = load<StoredUser[]>(KEYS.users, [])
    const idx = users.findIndex((u) => u.id === user.id)
    if (idx !== -1) {
      users[idx].allergies = allergies
      save(KEYS.users, users)
      save(KEYS.currentUser, users[idx])
    }
  },

  async updateConditions(conditions) {
    await delay()
    const user = requireAuth()
    const users = load<StoredUser[]>(KEYS.users, [])
    const idx = users.findIndex((u) => u.id === user.id)
    if (idx !== -1) {
      users[idx].conditions = conditions
      save(KEYS.users, users)
      save(KEYS.currentUser, users[idx])
    }
  },

  async deleteMe() {
    await delay()
    const user = requireAuth()
    const users = load<StoredUser[]>(KEYS.users, [])
    save(KEYS.users, users.filter((u) => u.id !== user.id))
    localStorage.removeItem(KEYS.token)
    localStorage.removeItem(KEYS.currentUser)
    return { success: true }
  },

  // ── Medications ────────────────────────────────────────────────────────────

  async getMedications() {
    await delay()
    const user = requireAuth()
    const medications = getMedicationsForUser(user.id).filter(
      (m) => m.status === 'ACTIVE'
    )
    return { medications }
  },

  async getMedication(id) {
    await delay()
    const user = requireAuth()
    const medication = getMedicationsForUser(user.id).find((m) => m.id === id)
    if (!medication) throw new Error('Medicamento no encontrado')
    return { medication }
  },

  async createMedication(payload: CreateMedicationPayload) {
    await delay()
    const user = requireAuth()
    const newMed: Medication = { ...payload, id: uid(), status: 'ACTIVE' }
    const meds = getMedicationsForUser(user.id)
    meds.push(newMed)
    saveMedicationsForUser(user.id, meds)
    return { medication: newMed }
  },

  async updateMedication(id, payload: UpdateMedicationPayload) {
    await delay()
    const user = requireAuth()
    const meds = getMedicationsForUser(user.id)
    const idx = meds.findIndex((m) => m.id === id)
    if (idx === -1) throw new Error('Medicamento no encontrado')
    Object.assign(meds[idx], payload)
    saveMedicationsForUser(user.id, meds)
    return { medication: meds[idx] }
  },

  async patchMedicationStatus(id, status: MedicationStatus) {
    await delay()
    const user = requireAuth()
    const meds = getMedicationsForUser(user.id)
    const idx = meds.findIndex((m) => m.id === id)
    if (idx === -1) throw new Error('Medicamento no encontrado')
    meds[idx].status = status
    saveMedicationsForUser(user.id, meds)
    return { medication: meds[idx] }
  },

  async deleteMedication(id) {
    await delay()
    const user = requireAuth()
    const meds = getMedicationsForUser(user.id)
    saveMedicationsForUser(user.id, meds.filter((m) => m.id !== id))
    return { success: true }
  },

  // ── Events ─────────────────────────────────────────────────────────────────

  async getEvents(query?: EventsQuery) {
    await delay()
    const user = requireAuth()
    let events = getOrCreateEvents(user.id)
    if (query?.medicationId) {
      events = events.filter((e) => e.medicationId === query.medicationId)
    }
    if (query?.status) {
      events = events.filter((e) => e.status === query.status)
    }
    if (query?.from) {
      events = events.filter(
        (e) => new Date(e.dateTimeScheduled) >= new Date(query.from!)
      )
    }
    if (query?.to) {
      events = events.filter(
        (e) => new Date(e.dateTimeScheduled) <= new Date(query.to!)
      )
    }
    return { events }
  },

  async getTodayEvents() {
    await delay()
    const user = requireAuth()
    const now = new Date()
    const start = new Date(now); start.setHours(0, 0, 0, 0)
    const end = new Date(now); end.setHours(23, 59, 59, 999)
    const events = getOrCreateEvents(user.id).filter(
      (e) =>
        new Date(e.dateTimeScheduled) >= start &&
        new Date(e.dateTimeScheduled) <= end
    )
    return { events }
  },

  async getWeekEvents() {
    await delay()
    const user = requireAuth()
    const now = new Date()
    const start = new Date(now); start.setDate(now.getDate() - now.getDay())
    start.setHours(0, 0, 0, 0)
    const end = new Date(start); end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    const events = getOrCreateEvents(user.id).filter(
      (e) =>
        new Date(e.dateTimeScheduled) >= start &&
        new Date(e.dateTimeScheduled) <= end
    )
    return { events }
  },

  async markEventTaken(id) {
    await delay()
    const user = requireAuth()
    const events = getOrCreateEvents(user.id)
    const idx = events.findIndex((e) => e.id === id)
    if (idx === -1) throw new Error('Evento no encontrado')
    events[idx].status = 'TAKEN'
    saveEvents(user.id, events)
    return { event: events[idx] }
  },

  async markEventMissed(id) {
    await delay()
    const user = requireAuth()
    const events = getOrCreateEvents(user.id)
    const idx = events.findIndex((e) => e.id === id)
    if (idx === -1) throw new Error('Evento no encontrado')
    events[idx].status = 'MISSED'
    saveEvents(user.id, events)
    return { event: events[idx] }
  },

  // ── Adherence ──────────────────────────────────────────────────────────────

  async getTodayAdherence() {
    await delay()
    const user = requireAuth()
    const now = new Date()
    const start = new Date(now); start.setHours(0, 0, 0, 0)
    const end = new Date(now); end.setHours(23, 59, 59, 999)
    const events = getOrCreateEvents(user.id).filter(
      (e) =>
        new Date(e.dateTimeScheduled) >= start &&
        new Date(e.dateTimeScheduled) <= end
    )
    return calcAdherence(events)
  },

  async getWeekAdherence() {
    await delay()
    const user = requireAuth()
    const now = new Date()
    const start = new Date(now); start.setDate(now.getDate() - 6); start.setHours(0, 0, 0, 0)
    const events = getOrCreateEvents(user.id).filter(
      (e) => new Date(e.dateTimeScheduled) >= start
    )
    return calcAdherence(events)
  },

  async getMonthAdherence() {
    await delay()
    const user = requireAuth()
    const now = new Date()
    const start = new Date(now); start.setDate(1); start.setHours(0, 0, 0, 0)
    const events = getOrCreateEvents(user.id).filter(
      (e) => new Date(e.dateTimeScheduled) >= start
    )
    return calcAdherence(events)
  },

  async getAdherenceStats() {
    await delay()
    const user = requireAuth()
    const meds = getMedicationsForUser(user.id)
    const events = getOrCreateEvents(user.id)
    const stats = calcAdherence(events)
    return { ...stats, activeMedications: meds.filter((m) => m.status === 'ACTIVE').length }
  },

  // ── Health ─────────────────────────────────────────────────────────────────

  async getHealthProfile() {
    await delay()
    const user = requireAuth()
    return { health: getHealthForUser(user.id) }
  },

  async updateWeight(weight) {
    await delay()
    const user = requireAuth()
    const health = getHealthForUser(user.id)
    health.weight = weight
    if (health.height) {
      const h = health.height / 100
      health.imc = Math.round((weight / (h * h)) * 10) / 10
    }
    saveHealthForUser(user.id, health)
    return { health }
  },

  async getImc() {
    await delay()
    const user = requireAuth()
    const health = getHealthForUser(user.id)
    return { imc: health.imc }
  },

  async getPolypharmacy() {
    await delay()
    const user = requireAuth()
    const meds = getMedicationsForUser(user.id)
    const activeMedications = meds.filter((m) => m.status === 'ACTIVE').length
    return { activeMedications, polypharmacy: activeMedications >= 5 }
  },

  // ── Knowledge (no mock implementation) ─────────────────────────────────────
  async knowledgeSearch() {
    await delay(100)
    throw new Error('Knowledge no disponible en modo demo')
  },
  async knowledgeAnswer() {
    await delay(100)
    throw new Error('Knowledge no disponible en modo demo')
  },
  async knowledgeIngestDocuments() {
    await delay(100)
    throw new Error('Solo ADMIN: Knowledge no disponible en modo demo')
  },
}
