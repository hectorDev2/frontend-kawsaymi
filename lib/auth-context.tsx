'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { api } from './api'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'patient' | 'caregiver'
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (data: any) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.getCurrentUser()
      if (response.success && response.data) {
        setUser(response.data as User)
      } else {
        setUser(null)
      }
    } catch (error) {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false))
  }, [refreshUser])

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await api.login(email, password)
      if (!response.success) {
        throw new Error(response.error || 'Login failed')
      }
      await refreshUser()
    },
    [refreshUser]
  )

  const signup = useCallback(
    async (data: any) => {
      const response = await api.signup(data)
      if (!response.success) {
        throw new Error(response.error || 'Signup failed')
      }
      await refreshUser()
    },
    [refreshUser]
  )

  const logout = useCallback(async () => {
    await api.logout()
    setUser(null)
  }, [])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
