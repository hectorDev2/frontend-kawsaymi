const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'An error occurred',
      }
    }

    return {
      success: true,
      data: data.data || data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  signup: (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    role: 'patient' | 'caregiver'
  }) =>
    request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),
  getCurrentUser: () => request('/auth/me'),

  // Patient
  getPatientDashboard: () => request('/patient/dashboard'),
  getMedications: () => request('/patient/medications'),
  addMedication: (data: any) =>
    request('/patient/medications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateMedication: (id: string, data: any) =>
    request(`/patient/medications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  logAdherence: (medicationId: string, taken: boolean) =>
    request('/patient/adherence', {
      method: 'POST',
      body: JSON.stringify({ medicationId, taken }),
    }),
  getCaregivers: () => request('/patient/caregivers'),
  inviteCaregiver: (email: string) =>
    request('/patient/caregivers/invite', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // Caregiver
  getCaregiverDashboard: () => request('/caregiver/dashboard'),
  getPatientsList: () => request('/caregiver/patients'),
  getPatientDetail: (patientId: string) =>
    request(`/caregiver/patients/${patientId}`),
  getAlerts: () => request('/caregiver/alerts'),
  updateAlertStatus: (alertId: string, status: string) =>
    request(`/caregiver/alerts/${alertId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
}
