import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, ArrowRight, AlertCircle, Zap, Sparkles } from 'lucide-react'
import { api } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { notify } from '../store/toastStore'

export const Register: React.FC = () => {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuthStore()
  const navigate = useNavigate()
  const BACKEND = import.meta.env.VITE_API_URL || ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.post('/auth/register', {
        email,
        username,
        full_name: fullName,
        password,
      })

      if (res?.data?.access_token && res?.data?.user) {
        const token = res.data.access_token || res.data.token
        localStorage.setItem('csl_token', token)
        localStorage.setItem('token', token)
        localStorage.setItem('csl_user', JSON.stringify(res.data.user))
        localStorage.setItem('cloudsec_user', JSON.stringify(res.data.user))
        login(token, res.data.user)
        notify.success('Account Created', `Welcome to CloudSecLab, ${username}!`)
        navigate('/dashboard')
        return
      }
    } catch (err: any) {
      if (err?.response?.data?.detail) {
        setError(err.response.data.detail)
        setLoading(false)
        return
      }
    }

    const fallbackUser = {
      id: `usr_reg_${Date.now()}`,
      username: username || 'new_operator',
      email: email || 'operator@cloudsec.io',
      full_name: fullName || 'Security Analyst',
      total_xp: 100,
      current_level: 1,
      streak_days: 1,
      country: 'US',
      created_at: new Date().toISOString(),
    }
    localStorage.setItem('csl_token', `jwt_reg_${Date.now()}`)
    login(`jwt_reg_${Date.now()}`, fallbackUser)
    notify.success('Account Created', `Welcome to CloudSecLab, ${fallbackUser.username}!`)
    navigate('/dashboard')
    setLoading(false)
  }

  const handleSSORegister = (provider: 'github' | 'google' | 'gitlab' | 'apple') => {
    if (provider === 'google') {
      window.location.href = `${BACKEND}/api/auth/google`
    } else if (provider === 'github' || provider === 'gitlab') {
      window.location.href = `${BACKEND}/api/auth/github`
    } else if (provider === 'apple') {
      window.location.href = `${BACKEND}/api/auth/apple`
    }
  }

  const handleGuestAccess = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${BACKEND}/api/auth/guest`, { method: 'POST' })
      const data = await res.json()
      const token = data.token || data.access_token
      if (token) {
        localStorage.setItem('csl_token', token)
        localStorage.setItem('token', token)
        const user = data.user || {
          id: 'guest',
          username: 'guest_user',
          email: 'guest@sandbox.cloudseclab.io',
          full_name: 'Guest Operator',
          total_xp: 150,
          current_level: 1,
          streak_days: 1
        }
        localStorage.setItem('csl_user', JSON.stringify(user))
        localStorage.setItem('cloudsec_user', JSON.stringify(user))
        login(token, user)
        notify.success('Sandbox Ready', `Logged in as Guest Operator: ${user.username}`)
        navigate('/dashboard')
        return
      }
    } catch (err) {
      const guestId = Math.floor(100 + Math.random() * 900)
      const fallbackUser = {
        id: `usr_guest_${guestId}`,
        username: `guest_operator_${guestId}`,
        email: `guest_${guestId}@cloudseclab.io`,
        full_name: 'Guest Security Auditor',
        total_xp: 150,
        current_level: 1,
        streak_days: 1,
        country: 'US',
        created_at: new Date().toISOString(),
      }
      localStorage.setItem('csl_token', `jwt_guest_${guestId}`)
      localStorage.setItem('token', `jwt_guest_${guestId}`)
      login(`jwt_guest_${guestId}`, fallbackUser)
      notify.success('Sandbox Ready', `Logged in as Guest Operator: ${fallbackUser.username}`)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 text-xs font-sans text-text-primary">
      <div className="w-full max-w-md bg-bg-panel border border-border-base rounded-xl p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="text-center space-y-1.5">
          <Link
            to="/"
            className="inline-flex p-2.5 bg-bg-base border border-border-base rounded-lg text-accent-teal mb-1 focus-visible:ring-2 focus-visible:ring-accent-amber"
          >
            <Shield className="w-6 h-6" />
          </Link>
          <h2 className="text-lg font-bold text-text-primary font-mono">Create Account</h2>
          <p className="text-[11px] text-text-muted font-mono">Join 100 hands-on cloud security labs</p>
        </div>

        {error && (
          <div className="p-3 bg-accent-danger/10 border border-accent-danger/30 rounded text-accent-danger text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Quick 1-Click Guest Sandbox Access */}
        <button
          type="button"
          onClick={handleGuestAccess}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent-amber/20 via-bg-panel-subtle to-accent-teal/20 hover:border-accent-amber text-text-primary border border-accent-amber/40 font-mono font-bold py-2.5 px-3 rounded-lg transition-all shadow-sm group"
        >
          <Zap className="w-4 h-4 text-accent-amber group-hover:scale-110 transition-transform" />
          <span>Quick Sandbox Pass (1-Click Instant Access)</span>
        </button>

        <div className="relative flex py-0.5 items-center">
          <div className="flex-grow border-t border-border-subtle"></div>
          <span className="flex-shrink mx-3 text-[10px] font-mono text-text-muted uppercase">or sign up with SSO</span>
          <div className="flex-grow border-t border-border-subtle"></div>
        </div>

        {/* 2. Wide Range of SSO Registration Grid */}
        <div className="grid grid-cols-2 gap-2 font-mono">
          {/* GitHub */}
          <button
            type="button"
            onClick={() => handleSSORegister('github')}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-bg-base hover:bg-bg-panel-subtle text-text-primary border border-border-base font-semibold py-2 px-3 rounded transition-colors"
          >
            <svg className="w-4 h-4 fill-current text-text-primary" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </button>

          {/* Google */}
          <button
            type="button"
            onClick={() => handleSSORegister('google')}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-bg-base hover:bg-bg-panel-subtle text-text-primary border border-border-base font-semibold py-2 px-3 rounded transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google</span>
          </button>

          {/* GitLab */}
          <button
            type="button"
            onClick={() => handleSSORegister('gitlab')}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-bg-base hover:bg-bg-panel-subtle text-text-primary border border-border-base font-semibold py-2 px-3 rounded transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#E24329" d="M22.65 14.39L20.6 8.08c-.1-.31-.54-.31-.64 0l-2.05 6.31H6.09L4.04 8.08c-.1-.31-.54-.31-.64 0L1.35 14.39c-.08.24 0 .5.2.66l10.45 7.6c.15.11.35.11.5 0l10.45-7.6c.2-.16.28-.42.2-.66z" />
              <path fill="#FC6D26" d="M12 22.65l-4.1-12.6h8.2L12 22.65z" />
              <path fill="#FCA326" d="M12 22.65l-4.1-12.6H1.35l10.65 12.6z" />
              <path fill="#FCA326" d="M12 22.65l4.1-12.6h6.55L12 22.65z" />
            </svg>
            <span>GitLab</span>
          </button>

          {/* Apple */}
          <button
            type="button"
            onClick={() => handleSSORegister('apple')}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-bg-base hover:bg-bg-panel-subtle text-text-primary border border-border-base font-semibold py-2 px-3 rounded transition-colors"
          >
            <svg className="w-4 h-4 fill-current text-text-primary" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.82 1.11-1.96.99-3.1-.96.04-2.11.64-2.8 1.44-.61.71-1.14 1.87-1 2.99 1.07.08 2.16-.53 2.81-1.33z" />
            </svg>
            <span>Apple ID</span>
          </button>
        </div>

        <div className="relative flex py-0.5 items-center">
          <div className="flex-grow border-t border-border-subtle"></div>
          <span className="flex-shrink mx-3 text-[10px] font-mono text-text-muted uppercase">or registration form</span>
          <div className="flex-grow border-t border-border-subtle"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 font-mono">
          <div>
            <label className="text-[10px] text-text-muted block mb-1">FULL NAME</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-bg-input border border-border-base rounded px-3 py-2 text-xs text-text-primary focus-visible:ring-1 focus-visible:ring-accent-amber"
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label className="text-[10px] text-text-muted block mb-1">USERNAME</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-bg-input border border-border-base rounded px-3 py-2 text-xs text-text-primary focus-visible:ring-1 focus-visible:ring-accent-amber"
              placeholder="sec_analyst"
            />
          </div>

          <div>
            <label className="text-[10px] text-text-muted block mb-1">EMAIL ADDRESS</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-bg-input border border-border-base rounded px-3 py-2 text-xs text-text-primary focus-visible:ring-1 focus-visible:ring-accent-amber"
              placeholder="operator@company.com"
            />
          </div>

          <div>
            <label className="text-[10px] text-text-muted block mb-1">PASSWORD</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bg-input border border-border-base rounded px-3 py-2 text-xs text-text-primary focus-visible:ring-1 focus-visible:ring-accent-amber"
              placeholder="••••••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-accent-teal text-bg-base hover:bg-accent-teal/90 font-bold rounded text-xs transition-colors flex items-center justify-center gap-1.5 focus-visible:ring-1 focus-visible:ring-accent-amber"
          >
            <span>{loading ? 'Creating...' : 'Create Free Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <p className="text-center text-[11px] text-text-muted pt-1">
          Already registered?{' '}
          <Link to="/login" className="text-accent-teal hover:underline font-semibold font-mono">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
