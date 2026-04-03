import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShieldCheck, Mail, Lock, User, CheckCircle } from 'lucide-react'

const ROLES = [
  { value: 'participant', label: 'Participant', desc: 'I have an NDIS plan' },
  { value: 'provider', label: 'Provider', desc: 'I represent a service provider' },
  { value: 'coordinator', label: 'Support Coordinator', desc: 'I coordinate supports for participants' },
]

export default function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: '', organisation: '', abn: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.role) return setError('Please select a role')
    setLoading(true)
    try {
      await register(form)
      // After successful registration, show verification message
      // Don't auto-login - user must verify email first
      setRegisteredEmail(form.email)
      setRegistered(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setError('')
    setLoading(true)
    try {
      const { api } = await import('../services/api')
      await api.post('/auth/resend-verification', { email: registeredEmail })
      setError('')
      alert('Verification email sent! Please check your inbox.')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend verification email')
    } finally {
      setLoading(false)
    }
  }

  // Show success state after registration
  if (registered) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-100 mb-4">
              <CheckCircle size={28} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Check Your Email</h1>
            <p className="text-slate-500 mt-1">We've sent a verification link to</p>
            <p className="text-primary font-medium mt-1">{registeredEmail}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="text-center space-y-4">
              <p className="text-sm text-slate-600">
                Please click the link in your email to verify your account. The link expires in 24 hours.
              </p>
              
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <button
                onClick={handleResendVerification}
                disabled={loading}
                className="w-full py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </button>

              <p className="text-sm text-slate-500 pt-4">
                Already verified?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-slate-500 mt-1">Join Care Exchange</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={form.full_name} onChange={e => set('full_name', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Jane Smith" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Min. 8 characters" required minLength={8} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">I am a...</label>
              <div className="space-y-2">
                {ROLES.map(r => (
                  <label key={r.value} className={`
                    flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all
                    ${form.role === r.value ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}
                  `}>
                    <input type="radio" name="role" value={r.value} checked={form.role === r.value}
                      onChange={e => set('role', e.target.value)}
                      className="mt-0.5 accent-primary" />
                    <div>
                      <div className="text-sm font-medium text-slate-900">{r.label}</div>
                      <div className="text-xs text-slate-500">{r.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {form.role === 'provider' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Organisation Name</label>
                  <input value={form.organisation} onChange={e => set('organisation', e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Bright Support Services" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">ABN (optional)</label>
                  <input value={form.abn} onChange={e => set('abn', e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="12 345 678 901" />
                </div>
              </>
            )}

            {form.role === 'coordinator' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Organisation</label>
                <input value={form.organisation} onChange={e => set('organisation', e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="My Coordination Services" />
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
