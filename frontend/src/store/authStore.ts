import { create } from 'zustand'
import { User } from '../types'
import { api } from '../services/api'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  login: (token: string, user: User) => void
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: true,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
    set({ token, isAuthenticated: !!token })
  },

  login: (token, user) => {
    localStorage.setItem('token', token)
    set({ token, user, isAuthenticated: true, isLoading: false })
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch (e) {}
    localStorage.removeItem('token')
    set({ token: null, user: null, isAuthenticated: false, isLoading: false })
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null })
      return
    }
    try {
      const res = await api.get('/auth/me')
      set({ user: res.data, isAuthenticated: true, isLoading: false })
    } catch (err) {
      localStorage.removeItem('token')
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
