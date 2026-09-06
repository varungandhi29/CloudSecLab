import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, ArrowRight, AlertCircle, Mail, Sparkles } from 'lucide-react'
import { api } from '../services/api'
import { useAuthStore } from '../store/authStore'

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
        full_name: 'Google Security Operator',
      })
      login(res.data.access_token, res.data.user)
      navigate('/dashboard')
    } catch (err: any) {
      setError('Google Sign-In failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleAppleSignIn = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/apple', {
        email: `operator_${Math.floor(Math.random() * 1000)}@privaterelay.appleid.com`,
        full_name: 'Apple Security Member',
      })
      login(res.data.access_token, res.data.user)
      navigate('/dashboard')
    } catch (err: any) {
      setError('Apple Sign-In failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 mb-2">
            <Shield className="w-8 h-8" />
          </Link>
          <h2 className="text-2xl font-extrabold text-white">Sign In to CloudSecLab</h2>
          <p className="text-xs text-gray-400 font-mono">100 hands-on cloud security labs</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-mono flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* SSO Social Sign-In Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-100 text-gray-900 font-bold py-2.5 px-4 rounded-xl transition-all shadow-md text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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

          <button
            type="button"
            onClick={handleAppleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 bg-black hover:bg-gray-900 text-white border border-gray-700 font-bold py-2.5 px-4 rounded-xl transition-all shadow-md text-sm"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.14-1.9-14.4-6.08-3.32-2.64-7.23-7.3-11.74-13.97-6.53-9.6-11.66-20.2-15.39-31.8-3.73-11.6-5.6-22.95-5.6-34.05 0-14.52 3.69-26.68 11.06-36.48 7.37-9.8 16.73-14.77 28.09-14.9 4.71 0 9.87 1.18 15.48 3.55 5.61 2.37 9.49 3.55 11.64 3.55 1.76 0 5.64-1.18 11.64-3.55 6-2.37 10.86-3.5 14.59-3.4 10.19.4 18.84 4.3 25.96 11.7-9.2 5.56-13.68 13.34-13.43 23.36.26 10.02 4.41 18.06 12.46 24.12 4.12 3.12 8.63 5.37 13.52 6.75-2.64 7.64-6.17 15.22-10.59 22.76zM119.22 31.07c0-6.79 2.45-13.34 7.35-19.65 4.9-6.31 11.04-10.37 18.42-12.18.53 1.06.8 2.18.8 3.37 0 6.66-2.45 13.18-7.35 19.55-4.9 6.37-11.09 10.47-18.57 12.3-.13-.93-.65-2.06-.65-3.39z" />
            </svg>
            <span>Continue with Apple</span>
          </button>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-800"></div>
          <span className="flex-shrink mx-4 text-xs font-mono text-gray-500 uppercase">Or continue with</span>
          <div className="flex-grow border-t border-gray-800"></div>
        </div>

        {/* Tab Toggle for Password vs Magic Link */}
        <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-800 text-xs font-mono font-semibold">
          <button
            type="button"
            onClick={() => setUseMagicLink(false)}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              !useMagicLink ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-white'
            }`}
          >
            Password Sign-In
          </button>
          <button
            type="button"
            onClick={() => setUseMagicLink(true)}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1 ${
              useMagicLink ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Magic Link</span>
          </button>
        </div>

        {!useMagicLink ? (
          /* Standard Password Form */
          <form onSubmit={handleStandardSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-gray-300 block mb-1.5">USERNAME OR EMAIL</label>
              <input
                type="text"
                required
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-cyan-500 font-mono"
                placeholder="operator@cloudseclab.io"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-gray-300 block mb-1.5">PASSWORD</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-cyan-500 font-mono"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center space-x-2 text-sm"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In with Password'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Magic Link Form */
          <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-gray-300 block mb-1.5">EMAIL ADDRESS</label>
              <input
                type="email"
                required
                value={magicEmail}
                onChange={(e) => setMagicEmail(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-cyan-500 font-mono"
                placeholder="operator@cloudseclab.io"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center space-x-2 text-sm"
            >
              <Mail className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Instant Magic Link Login'}</span>
            </button>
          </form>
        )}

        <p className="text-center text-xs text-gray-400 pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-400 hover:underline font-semibold">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  )
}
export default Login
