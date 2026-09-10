import axios from 'axios'
import { handleMockRequest } from './mockBackend'

export const API_URL = import.meta.env.VITE_API_URL || window.location.origin

export const isOAuthConfigured = () => {
  return API_URL !== '' && !API_URL.includes('localhost')
}

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const clean = envUrl.trim().replace(/\/+$/, '')
    return clean.endsWith('/api') ? clean : `${clean}/api`
  }
  return '/api'
}

export const API_BASE_URL = getApiBaseUrl()

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = 'Bearer ' + token
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    // If response is HTML (Vercel SPA fallback for unmatched /api routes), route through mock backend
    if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE html>')) {
      const mock = handleMockRequest(response.config.url || '', response.config.method || 'GET', response.config.data)
      return {
        ...response,
        status: mock.status,
        data: mock.data,
      }
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config
    if (!originalRequest) {
      return Promise.reject(error)
    }

    // Refresh token handling if real backend sent 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshRes = await axios.post(API_BASE_URL + '/auth/refresh', {}, { withCredentials: true })
        const newToken = refreshRes.data.access_token
        localStorage.setItem('token', newToken)
        originalRequest.headers.Authorization = 'Bearer ' + newToken
        return api(originalRequest)
      } catch (err) {
        // Fallback or ignore
      }
    }

    // If backend is unavailable (404, 502, 503, Network Error, CORS, timeout), transparently fall back to mock backend
    try {
      let reqData = originalRequest.data
      if (typeof reqData === 'string') {
        try {
          reqData = JSON.parse(reqData)
        } catch (e) {}
      }
      const mock = handleMockRequest(originalRequest.url || '', originalRequest.method || 'GET', reqData)
      return Promise.resolve({
        data: mock.data,
        status: mock.status,
        statusText: 'OK',
        headers: {},
        config: originalRequest,
      })
    } catch (mockErr) {
      return Promise.reject(error)
    }
  }
)
