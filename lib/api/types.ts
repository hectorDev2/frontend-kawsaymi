// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'PATIENT' | 'CAREGIVER'
}

export interface Session {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface AuthResponse {
  user: AuthUser
  session: Session
}

export interface RegisterPayload {
  email: string
  password: string
  name: string
  role: 'PATIENT' | 'CAREGIVER'
}

export interface LoginPayload {
  email: string
  password: string
}

// ─── User profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  email: string
  name: string
  dateOfBirth?: string
  location?: string
  language?: string
  timezone?: string
  allergies?: string[]
  conditions?: string[]
}

export interface UpdateProfilePayload {
  name?: string
  dateOfBirth?: string
  location?: string
  language?: string
  timezone?: string
}

// ─── Medications ──────────────────────────────────────────────────────────────

export type MedicationStatus = 'ACTIVE' | 'COMPLETED' | 'SUSPENDED'

export interface Medication {
  id: string
  name: string
  dose: string
  frequency: number
  intervalHours: number
  instructions?: string
  startDate: string
  endDate?: string
  schedule: string[]   // ISO datetimes
  status: MedicationStatus
}

export interface CreateMedicationPayload {
  name: string
  dose: string
  frequency: number
  intervalHours: number
  instructions?: string
  startDate: string
  endDate?: string
  schedule: string[]
}

export interface UpdateMedicationPayload {
  name?: string
  dose?: string
  frequency?: number
  intervalHours?: number
  instructions?: string
  startDate?: string
  endDate?: string
  schedule?: string[]
}

// ─── Events ───────────────────────────────────────────────────────────────────

export type EventStatus = 'PENDING' | 'TAKEN' | 'MISSED'

export interface MedicationEvent {
  id: string
  medicationId: string
  medicationName?: string
  medicationDose?: string
  dateTimeScheduled: string
  status: EventStatus
}

export interface EventsQuery {
  from?: string
  to?: string
  medicationId?: string
  status?: EventStatus
}

// ─── Adherence ────────────────────────────────────────────────────────────────

export interface AdherenceStats {
  taken: number
  missed: number
  pending: number
  total: number
  adherenceRate: number        // 0–1
  activeMedications?: number
}

// ─── Health ───────────────────────────────────────────────────────────────────

export interface HealthProfile {
  userId: string
  weight: number | null
  height: number | null
  imc: number | null
}

export interface PolypharmacyInfo {
  activeMedications: number
  polypharmacy: boolean
}

// ─── API contract ─────────────────────────────────────────────────────────────

export interface ApiContract {
  // Auth
  register: (payload: RegisterPayload) => Promise<AuthResponse>
  login: (payload: LoginPayload) => Promise<AuthResponse>
  refresh: (refreshToken: string) => Promise<{ session: Session }>
  logout: () => Promise<{ success: boolean }>

  // Users
  getMe: () => Promise<{ user: UserProfile }>
  updateMe: (payload: UpdateProfilePayload) => Promise<{ user: UserProfile }>
  updateAllergies: (allergies: string[]) => Promise<void>
  updateConditions: (conditions: string[]) => Promise<void>
  deleteMe: () => Promise<{ success: boolean }>

  // Medications
  getMedications: () => Promise<{ medications: Medication[] }>
  getMedication: (id: string) => Promise<{ medication: Medication }>
  createMedication: (payload: CreateMedicationPayload) => Promise<{ medication: Medication }>
  updateMedication: (id: string, payload: UpdateMedicationPayload) => Promise<{ medication: Medication }>
  patchMedicationStatus: (id: string, status: MedicationStatus) => Promise<{ medication: Medication }>
  deleteMedication: (id: string) => Promise<{ success: boolean }>

  // Events
  getEvents: (query?: EventsQuery) => Promise<{ events: MedicationEvent[] }>
  getTodayEvents: () => Promise<{ events: MedicationEvent[] }>
  getWeekEvents: () => Promise<{ events: MedicationEvent[] }>
  markEventTaken: (id: string) => Promise<{ event: MedicationEvent }>
  markEventMissed: (id: string) => Promise<{ event: MedicationEvent }>

  // Adherence
  getTodayAdherence: () => Promise<AdherenceStats>
  getWeekAdherence: () => Promise<AdherenceStats>
  getMonthAdherence: () => Promise<AdherenceStats>
  getAdherenceStats: () => Promise<AdherenceStats>

  // Health
  getHealthProfile: () => Promise<{ health: HealthProfile }>
  updateWeight: (weight: number) => Promise<{ health: HealthProfile }>
  getImc: () => Promise<{ imc: number | null }>
  getPolypharmacy: () => Promise<PolypharmacyInfo>
}
