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

const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem('cloudsec_user')
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,

  setUser: (user) => {
    if (user) localStorage.setItem('cloudsec_user', JSON.stringify(user))
    else localStorage.removeItem('cloudsec_user')
    set({ user })
  },

  setToken: (token) => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
    set({ token, isAuthenticated: !!token })
  },

  login: (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('cloudsec_user', JSON.stringify(user))
    set({ token, user, isAuthenticated: true, isLoading: false })
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch (e) {}
    localStorage.removeItem('token')
    localStorage.removeItem('cloudsec_user')
    set({ token: null, user: null, isAuthenticated: false, isLoading: false })
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token')
    const storedUser = getStoredUser()

    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null })
      return
    }

    try {
      const res = await api.get('/auth/me')
      if (res.data) {
        localStorage.setItem('cloudsec_user', JSON.stringify(res.data))
        set({ user: res.data, isAuthenticated: true, isLoading: false })
        return
      }
    } catch (err) {
      if (storedUser) {
        set({ user: storedUser, isAuthenticated: true, isLoading: false })
        return
      }
    }

    if (storedUser) {
      set({ user: storedUser, isAuthenticated: true, isLoading: false })
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('cloudsec_user')
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
