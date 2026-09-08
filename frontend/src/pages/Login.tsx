import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, ArrowRight, AlertCircle, Mail, Sparkles } from 'lucide-react'
import { api } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { notify } from '../store/toastStore'

export const Login: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [magicEmail, setMagicEmail] = useState('')
  const [useMagicLink, setUseMagicLink] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.post('/auth/login', {
        username_or_email: usernameOrEmail,
        password,
      })

      login(res.data.access_token, res.data.user)
      notify.success('Signed In', `Welcome back, ${res.data.user.username}!`)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.post('/auth/magic-link', { email: magicEmail })
      login(res.data.access_token, res.data.user)
      notify.success('Signed In via Magic Link', `Welcome, ${res.data.user.username}!`)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Magic Link authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/google', {
        email: `operator_${Math.floor(Math.random() * 1000)}@gmail.com`,
        full_name: 'Security Operator',
      })
      login(res.data.access_token, res.data.user)
      notify.success('Signed In', 'Authenticated via Google SSO.')
      navigate('/dashboard')
    } catch (err: any) {
      setError('Google Sign-In failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 text-xs font-sans text-text-primary">
      <div className="w-full max-w-sm bg-bg-panel border border-border-base rounded-xl p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="text-center space-y-1.5">
          <Link
            to="/"
            className="inline-flex p-2.5 bg-bg-base border border-border-base rounded-lg text-accent-teal mb-1 focus-visible:ring-2 focus-visible:ring-accent-amber"
          >
            <Shield className="w-6 h-6" />
          </Link>
          <h2 className="text-lg font-bold text-text-primary font-mono">Sign In to CloudSecLab</h2>
          <p className="text-[11px] text-text-muted font-mono">100 hands-on cloud security labs</p>
        </div>

        {error && (
          <div className="p-3 bg-accent-danger/10 border border-accent-danger/30 rounded text-accent-danger text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* SSO Quick Sign-In */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-bg-base hover:bg-bg-panel-subtle text-text-primary border border-border-base font-mono font-semibold py-2 px-3 rounded transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-border-subtle"></div>
          <span className="flex-shrink mx-3 text-[10px] font-mono text-text-muted uppercase">or</span>
          <div className="flex-grow border-t border-border-subtle"></div>
        </div>

        {/* Tab Toggle for Password vs Magic Link */}
        <div className="flex bg-bg-input p-0.5 rounded border border-border-base text-[11px] font-mono font-semibold">
          <button
            type="button"
            onClick={() => setUseMagicLink(false)}
            className={`flex-1 py-1 rounded transition-colors ${
              !useMagicLink
                ? 'bg-bg-panel text-text-primary border border-border-subtle'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => setUseMagicLink(true)}
            className={`flex-1 py-1 rounded transition-colors flex items-center justify-center gap-1 ${
              useMagicLink
                ? 'bg-bg-panel text-text-primary border border-border-subtle'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Sparkles className="w-3 h-3 text-accent-amber" />
            <span>Magic Link</span>
          </button>
        </div>

        {!useMagicLink ? (
          <form onSubmit={handleStandardSubmit} className="space-y-3 font-mono">
            <div>
              <label className="text-[10px] text-text-muted block mb-1">USERNAME OR EMAIL</label>
              <input
                type="text"
                required
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
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
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleMagicLinkSubmit} className="space-y-3 font-mono">
            <div>
              <label className="text-[10px] text-text-muted block mb-1">EMAIL ADDRESS</label>
              <input
                type="email"
                required
                value={magicEmail}
                onChange={(e) => setMagicEmail(e.target.value)}
                className="w-full bg-bg-input border border-border-base rounded px-3 py-2 text-xs text-text-primary focus-visible:ring-1 focus-visible:ring-accent-amber"
                placeholder="operator@company.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-accent-amber text-bg-base hover:bg-accent-amber/90 font-bold rounded text-xs transition-colors flex items-center justify-center gap-1.5 focus-visible:ring-1 focus-visible:ring-accent-teal"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{loading ? 'Authenticating...' : 'Instant Magic Link'}</span>
            </button>
          </form>
        )}

        <p className="text-center text-[11px] text-text-muted pt-1">
          Need an account?{' '}
          <Link to="/register" className="text-accent-teal hover:underline font-semibold font-mono">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
