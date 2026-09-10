import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { notify } from '../store/toastStore'

const BACKEND = import.meta.env.VITE_API_URL || window.location.origin

type Step = 'register' | 'verify_otp' | 'success'

export const Register: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [step, setStep] = useState<Step>('register')
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', full_name: '' })
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const handleRegister = async () => {
    setError('')
    if (!form.full_name.trim()) {
      setError('Please enter your full name')
      return
    }
    if (!form.email.trim()) {
      setError('Please enter your email address')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          full_name: form.full_name.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.detail || data.message || 'Registration failed')
        return
      }
      setEmail(form.email.trim())
      setStep('verify_otp')
      notify.info('Code Sent', `Verification code sent to ${form.email.trim()}`)
    } catch {
      setError('Connection error — try again')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    setError('')
    if (otp.length !== 6) {
      setError('Enter the 6-digit code from your email')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.detail || data.message || 'Verification failed')
        return
      }

      const token = data.token || data.access_token
      localStorage.setItem('csl_token', token)
      localStorage.setItem('token', token)
      localStorage.setItem('csl_user', JSON.stringify(data.user))
      localStorage.setItem('cloudsec_user', JSON.stringify(data.user))
      login(token, data.user)

      setStep('success')
      notify.success('Account Verified', `Welcome to CloudSecLab, ${data.user?.full_name || 'Operator'}!`)
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch {
      setError('Connection error — try again')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setResending(true)
    setError('')
    try {
      const res = await fetch(`${BACKEND}/api/auth/resend-otp?email=${encodeURIComponent(email)}`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        notify.success('Code Resent', 'A new verification code has been sent to your email')
      } else {
        setError(data.detail || 'Failed to resend verification code')
      }
    } catch {
      setError('Connection error — failed to resend code')
    } finally {
      setResending(false)
    }
  }

  // STEP 1: REGISTRATION FORM
  if (step === 'register') {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ background: '#111827', border: '1px solid #1E2D45', borderRadius: '16px', padding: '36px', width: '100%', maxWidth: '420px', boxSizing: 'border-box' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛡️</div>
            <h1 style={{ color: '#F1F5F9', fontSize: '22px', fontWeight: 700, margin: 0, fontFamily: 'Inter, sans-serif' }}>Create Account</h1>
            <p style={{ color: '#94A3B8', fontSize: '13px', margin: '6px 0 0', fontFamily: 'Inter, monospace' }}>Join 100 hands-on cloud security labs</p>
          </div>

          {/* OAuth options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {[
              { label: 'Continue with Google', icon: '🔵', fn: () => (window.location.href = `${BACKEND}/api/auth/google`) },
              { label: 'Continue with GitHub', icon: '⚫', fn: () => (window.location.href = `${BACKEND}/api/auth/github`) },
            ].map((btn) => (
              <button
                key={btn.label}
                type="button"
                onClick={btn.fn}
                style={{
                  padding: '11px',
                  background: '#1A2235',
                  border: '1px solid #1E2D45',
                  borderRadius: '8px',
                  color: '#F1F5F9',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background 0.2s',
                }}
              >
                <span>{btn.icon}</span>
                {btn.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: '#1E2D45' }} />
            <span style={{ color: '#475569', fontSize: '12px' }}>or create with email</span>
            <div style={{ flex: 1, height: '1px', background: '#1E2D45' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Full Name', key: 'full_name', type: 'text', placeholder: 'John Smith' },
              { label: 'Email Address', key: 'email', type: 'email', placeholder: 'john@example.com' },
              { label: 'Password', key: 'password', type: 'password', placeholder: 'At least 8 characters' },
              { label: 'Confirm Password', key: 'confirmPassword', type: 'password', placeholder: 'Repeat password' },
            ].map((f) => (
              <div key={f.key}>
                <label style={{ color: '#94A3B8', fontSize: '12px', display: 'block', marginBottom: '5px' }}>{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    background: '#0A0E1A',
                    border: '1px solid #1E2D45',
                    borderRadius: '8px',
                    color: '#F1F5F9',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3B82F6')}
                  onBlur={(e) => (e.target.style.borderColor = '#1E2D45')}
                />
              </div>
            ))}

            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '8px',
                  color: '#EF4444',
                  fontSize: '12px',
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleRegister}
              disabled={loading || !form.email || !form.password || !form.full_name}
              style={{
                padding: '12px',
                background: 'linear-gradient(135deg,#3B82F6,#06B6D4)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                opacity: loading || !form.email || !form.password || !form.full_name ? 0.6 : 1,
                marginTop: '4px',
              }}
            >
              {loading ? 'Sending verification code...' : 'Create Account →'}
            </button>
          </div>

          <p style={{ color: '#475569', fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#3B82F6', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // STEP 2: OTP VERIFICATION SCREEN
  if (step === 'verify_otp') {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ background: '#111827', border: '1px solid #1E2D45', borderRadius: '16px', padding: '36px', width: '100%', maxWidth: '420px', textAlign: 'center', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
          <h2 style={{ color: '#F1F5F9', fontSize: '22px', fontWeight: 700, margin: '0 0 8px', fontFamily: 'Inter, sans-serif' }}>Check your email</h2>
          <p style={{ color: '#94A3B8', fontSize: '14px', margin: '0 0 4px' }}>We sent a 6-digit code to</p>
          <p style={{ color: '#06B6D4', fontSize: '14px', fontWeight: 600, margin: '0 0 28px', fontFamily: 'JetBrains Mono, monospace' }}>{email}</p>

          {/* OTP Input */}
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            autoFocus
            style={{
              width: '100%',
              padding: '16px',
              background: '#0A0E1A',
              border: '2px solid #1E2D45',
              borderRadius: '10px',
              color: '#F1F5F9',
              fontSize: '28px',
              fontFamily: 'JetBrains Mono, monospace',
              textAlign: 'center',
              letterSpacing: '12px',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: '16px',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#06B6D4')}
            onBlur={(e) => (e.target.style.borderColor = '#1E2D45')}
            onKeyDown={(e) => e.key === 'Enter' && handleVerifyOTP()}
          />

          {error && (
            <div
              style={{
                padding: '10px 14px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px',
                color: '#EF4444',
                fontSize: '12px',
                marginBottom: '16px',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleVerifyOTP}
            disabled={loading || otp.length !== 6}
            style={{
              width: '100%',
              padding: '13px',
              background: 'linear-gradient(135deg,#3B82F6,#06B6D4)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '14px',
              opacity: loading || otp.length !== 6 ? 0.6 : 1,
            }}
          >
            {loading ? 'Verifying...' : 'Verify & Create Account'}
          </button>

          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resending}
            style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '13px', cursor: 'pointer', display: 'block', margin: '0 auto 8px' }}
          >
            {resending ? 'Sending...' : "Didn't receive it? Resend code"}
          </button>

          <button
            type="button"
            onClick={() => setStep('register')}
            style={{ display: 'block', background: 'none', border: 'none', color: '#475569', fontSize: '12px', cursor: 'pointer', margin: '8px auto 0' }}
          >
            ← Use different email
          </button>
        </div>
      </div>
    )
  }

  // STEP 3: SUCCESS SCREEN
  return (
    <div style={{ minHeight: '100vh', background: '#0A0E1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
        <h2 style={{ color: '#22C55E', fontSize: '24px', fontWeight: 700, margin: '0 0 8px', fontFamily: 'Inter, sans-serif' }}>Account Created!</h2>
        <p style={{ color: '#94A3B8', fontSize: '14px' }}>Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}

export default Register
