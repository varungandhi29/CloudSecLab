// This page handles the redirect back from Google/GitHub/Apple
// URL: /auth/success?token=xxx or /auth/callback/google?code=xxx
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { notify } from '../store/toastStore'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('Processing authentication...')
  const { login } = useAuthStore()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')
    const message = searchParams.get('message')
    const code = searchParams.get('code')

    if (error) {
      const errorMsg = message ? `${error}: ${message}` : error
      setStatus(`Login failed: ${errorMsg}`)
      notify.error('Authentication Failed', message || error)
      setTimeout(() => navigate('/login?error=' + encodeURIComponent(error) + (message ? '&message=' + encodeURIComponent(message) : '')), 1500)
      return
    }

    if (token) {
      // Token received directly — store and redirect to dashboard
      localStorage.setItem('csl_token', token)
      localStorage.setItem('token', token)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        localStorage.setItem('csl_user', JSON.stringify(payload))
        localStorage.setItem('cloudsec_user', JSON.stringify(payload))
        login(token, payload)
        notify.success('Signed In', `Welcome, ${payload.username || payload.full_name || 'Operator'}!`)
      } catch (e) {
        const fallbackUser = {
          id: `usr_${Date.now()}`,
          username: 'operator',
          email: 'operator@cloudseclab.io',
          full_name: 'Cloud Operator',
          total_xp: 100,
          current_level: 1,
          streak_days: 1
        }
        localStorage.setItem('csl_user', JSON.stringify(fallbackUser))
        localStorage.setItem('cloudsec_user', JSON.stringify(fallbackUser))
        login(token, fallbackUser)
      }
      setStatus('Login successful! Redirecting...')
      navigate('/dashboard')
      return
    }

    if (code) {
      // Code received — determine provider from URL path and call backend
      const path = window.location.pathname
      let provider = 'google'
      if (path.includes('github')) provider = 'github'
      if (path.includes('apple')) provider = 'apple'
      setStatus(`Completing ${provider.toUpperCase()} login...`)

      const backendBase = import.meta.env.VITE_API_URL || ''
      fetch(`${backendBase}/api/auth/${provider}/callback?code=${encodeURIComponent(code)}`)
        .then((r) => {
          if (r.redirected) {
            window.location.href = r.url
            return null
          }
          return r.json()
        })
        .then((data) => {
          if (!data) return
          const jwtToken = data.token || data.access_token
          if (jwtToken) {
            localStorage.setItem('csl_token', jwtToken)
            localStorage.setItem('token', jwtToken)
            let userObj = data.user
            if (!userObj) {
              try {
                userObj = JSON.parse(atob(jwtToken.split('.')[1]))
              } catch {
                userObj = {
                  id: `usr_${Date.now()}`,
                  username: `${provider}_user`,
                  email: `${provider}@cloudseclab.io`,
                  full_name: `${provider.toUpperCase()} Operator`,
                  total_xp: 100,
                  current_level: 1,
                  streak_days: 1
                }
              }
            }
            localStorage.setItem('csl_user', JSON.stringify(userObj))
            localStorage.setItem('cloudsec_user', JSON.stringify(userObj))
            login(jwtToken, userObj)
            notify.success('Signed In', `Welcome, ${userObj.username || 'Operator'}!`)
            setStatus('Login successful! Redirecting...')
            navigate('/dashboard')
          } else {
            notify.error('Authentication Error', data.error || 'Failed to complete OAuth callback')
            navigate('/login?error=callback_failed')
          }
        })
        .catch(() => {
          notify.error('Network Error', 'Could not communicate with authentication server')
          navigate('/login?error=network_error')
        })
    }
  }, [searchParams, navigate, login])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0E1A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid #06B6D4',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <p style={{ color: '#94A3B8', fontSize: '14px', fontFamily: 'Inter, monospace' }}>{status}</p>
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
    </div>
  )
}

