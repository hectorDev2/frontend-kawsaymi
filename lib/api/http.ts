/**
 * Cliente HTTP real — apunta al backend cuando NEXT_PUBLIC_USE_MOCK=false.
 * El token se toma de localStorage igual que el mock.
 */

import type {
  ApiContract,
  AuthResponse,
  RegisterPayload,
  LoginPayload,
  CreateMedicationPayload,
  UpdateMedicationPayload,
  MedicationStatus,
  EventsQuery,
  UpdateProfilePayload,
  AdherenceStats,
  KnowledgeAnswerBody,
} from './types'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
// Keep this stable across mock/real so users don't "lose" sessions when switching.
const TOKEN_KEY = 'kw_token'
const LEGACY_TOKEN_KEY = 'kw_mock_token'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY)
}

function saveToken(token: string) {
  if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, token)
}

async function req<T>(
  method: string,
  path: string,
  body?: unknown,
  auth = true
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || err.error || `HTTP ${res.status}`)
  }

  return res.json()
}

export const httpApi: ApiContract = {
  // Auth
  async register(p: RegisterPayload): Promise<AuthResponse> {
    const data = await req<AuthResponse>('POST', '/auth/register', p, false)
    if (data.session?.access_token) saveToken(data.session.access_token)
    return data
  },

  async login(p: LoginPayload): Promise<AuthResponse> {
    const data = await req<AuthResponse>('POST', '/auth/login', p, false)
    if (data.session?.access_token) saveToken(data.session.access_token)
    return data
  },

  async refresh(refreshToken: string) {
    const data = await req<any>('POST', '/auth/refresh', { refreshToken }, false)
    if (data.session?.access_token) saveToken(data.session.access_token)
    return data
  },

  async logout() {
    const data = await req<any>('POST', '/auth/logout')
    localStorage.removeItem(TOKEN_KEY)
    return data
  },

  // Users
  async getMe() {
    return req('GET', '/users/me')
  },
  async updateMe(payload: UpdateProfilePayload) {
    return req('PUT', '/users/me', payload)
  },
  async updateAllergies(allergies: string[]) {
    await req('PUT', '/users/me/allergies', { allergies })
  },
  async updateConditions(conditions: string[]) {
    await req('PUT', '/users/me/conditions', { conditions })
  },
  async deleteMe() {
    return req('DELETE', '/users/me')
  },

  // Medications
  async getMedications() {
    return req('GET', '/medications')
  },
  async getMedication(id: string) {
    return req('GET', `/medications/${id}`)
  },
  async createMedication(payload: CreateMedicationPayload) {
    return req('POST', '/medications', payload)
  },
  async updateMedication(id: string, payload: UpdateMedicationPayload) {
    return req('PUT', `/medications/${id}`, payload)
  },
  async patchMedicationStatus(id: string, status: MedicationStatus) {
    return req('PATCH', `/medications/${id}/status`, { status })
  },
  async deleteMedication(id: string) {
    return req('DELETE', `/medications/${id}`)
  },

  // Events
  async getEvents(query?: EventsQuery) {
    const params = new URLSearchParams()
    if (query?.from) params.set('from', query.from)
    if (query?.to) params.set('to', query.to)
    if (query?.medicationId) params.set('medicationId', query.medicationId)
    if (query?.status) params.set('status', query.status)
    const qs = params.toString()
    return req('GET', `/events${qs ? '?' + qs : ''}`)
  },
  async getTodayEvents() {
    return req('GET', '/events/today')
  },
  async getWeekEvents() {
    return req('GET', '/events/week')
  },
  async markEventTaken(id: string) {
    return req('PATCH', `/events/${id}/mark-taken`)
  },
  async markEventMissed(id: string) {
    return req('PATCH', `/events/${id}/mark-missed`)
  },

  // Adherence
  async getTodayAdherence(): Promise<AdherenceStats> {
    return req('GET', '/adherence/today')
  },
  async getWeekAdherence(): Promise<AdherenceStats> {
    return req('GET', '/adherence/week')
  },
  async getMonthAdherence(): Promise<AdherenceStats> {
    return req('GET', '/adherence/month')
  },
  async getAdherenceStats(): Promise<AdherenceStats> {
    return req('GET', '/adherence/stats')
  },

  // Health
  async getHealthProfile() {
    return req('GET', '/health/profile')
  },
  async updateWeight(weight: number) {
    return req('POST', '/health/weight', { weight })
  },
  async getImc() {
    return req('GET', '/health/imc')
  },
  async getPolypharmacy() {
    return req('GET', '/health/polypharmacy')
  },

  // Knowledge
  async knowledgeSearch(q: string, k?: number) {
    const params = new URLSearchParams()
    params.set('q', q)
    if (typeof k === 'number') params.set('k', String(k))
    return req('GET', `/knowledge/search?${params.toString()}`)
  },
  async knowledgeAnswer(body: KnowledgeAnswerBody) {
    return req('POST', '/knowledge/answer', body)
  },
  async knowledgeIngestDocuments() {
    return req('POST', '/knowledge/documents')
  },
}
