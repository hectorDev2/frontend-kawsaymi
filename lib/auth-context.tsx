'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { api } from './api'
import type { AuthUser, UserProfile } from './api'

interface AuthContextType {
  user: (AuthUser & Partial<UserProfile>) | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (data: {
    email: string
    password: string
    name: string
    role: 'PATIENT' | 'CAREGIVER'
  }) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const CURRENT_USER_KEY = 'kw_mock_current_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      // Intenta obtener el perfil del usuario actual
      const { user: profile } = await api.getMe()
      setUser(profile as any)
    } catch {
      // Si falla (no hay token), limpia el estado
      setUser(null)
    }
  }, [])

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false))
  }, [refreshUser])

  const login = useCallback(async (email: string, password: string) => {
    const { user: authUser } = await api.login({ email, password })
    setUser(authUser as any)
  }, [])

  const signup = useCallback(
    async (data: { email: string; password: string; name: string; role: 'PATIENT' | 'CAREGIVER' }) => {
      const { user: authUser } = await api.register(data)
      setUser(authUser as any)
    },
    []
  )

  const logout = useCallback(async () => {
    await api.logout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
