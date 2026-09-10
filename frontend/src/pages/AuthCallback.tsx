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
    // Check both searchParams (?key=val) and hash (#key=val)
    const hash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : ''
    const hashParams = new URLSearchParams(hash)

    const token = searchParams.get('token') || hashParams.get('token')
    const idToken = hashParams.get('id_token') || searchParams.get('id_token')
    const accessToken = hashParams.get('access_token')
    const error = searchParams.get('error') || hashParams.get('error')
    const message = searchParams.get('message') || hashParams.get('error_description')
    const code = searchParams.get('code')

    if (error) {
      const errorMsg = message ? `${error}: ${message}` : error
      setStatus(`Login failed: ${errorMsg}`)
      notify.error('Authentication Failed', message || error)
      setTimeout(() => navigate('/login?error=' + encodeURIComponent(error) + (message ? '&message=' + encodeURIComponent(message) : '')), 1500)
      return
    }

    // Direct Google/Apple OIDC id_token flow
    if (idToken) {
      try {
        const payloadPart = idToken.split('.')[1]
        const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
        const padding = 4 - (normalized.length % 4)
        const padded = padding < 4 ? normalized + '='.repeat(padding) : normalized
        const payload = JSON.parse(atob(padded))

        const email = payload.email || `google_user_${Date.now()}@gmail.com`
        const fullName = payload.name || payload.given_name || email.split('@')[0]
        const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_')

        const userObj = {
          id: payload.sub || `usr_${Date.now()}`,
          username: username,
          email: email,
          full_name: fullName,
          avatar_url: payload.picture,
          total_xp: 500,
          current_level: 1,
          streak_days: 1,
          country: 'US',
          provider: 'google',
          auth_provider: 'google',
          created_at: new Date().toISOString()
        }

        const jwtToken = accessToken || idToken
        localStorage.setItem('csl_token', jwtToken)
        localStorage.setItem('token', jwtToken)
        localStorage.setItem('csl_user', JSON.stringify(userObj))
        localStorage.setItem('cloudsec_user', JSON.stringify(userObj))
        login(jwtToken, userObj)
        notify.success('Signed In with Google', `Welcome back, ${userObj.full_name}!`)
        setStatus('Login successful! Redirecting...')
        navigate('/dashboard')
        return
      } catch (e) {}
    }

    if (token) {
      // Token received directly — store and redirect to dashboard
      localStorage.setItem('csl_token', token)
      localStorage.setItem('token', token)
      try {
        const payloadPart = token.split('.')[1]
        const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
        const padding = 4 - (normalized.length % 4)
        const padded = padding < 4 ? normalized + '='.repeat(padding) : normalized
        const payload = JSON.parse(atob(padded))
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

      const backendBase = import.meta.env.VITE_API_URL || window.location.origin
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

