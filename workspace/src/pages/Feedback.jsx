import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { CheckCircle, ThumbsUp, CreditCard, Package, MessageSquare } from 'lucide-react'

// ─── Section helpers ─────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-1">
      <Icon size={18} className="text-slate-400" />
      <span className="text-sm font-medium text-slate-700">{title}</span>
      {subtitle && <span className="text-xs text-slate-400"> — {subtitle}</span>}
    </div>
  )
}

function PillGroup({ options, value, onChange, renderLabel }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`text-sm px-4 py-2 rounded-full border transition-colors ${
            value === opt.value
              ? 'bg-violet-50 border-violet-200 text-violet-700 font-medium'
              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
          }`}
        >
          {renderLabel ? renderLabel(opt) : opt.label}
        </button>
      ))}
    </div>
  )
}

function Textarea({ value, onChange, placeholder, maxLength = 500, rows = 3 }) {
  return (
    <>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
      />
      <p className="text-xs text-slate-400 mt-1.5 text-right">{value.length}/{maxLength}</p>
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Feedback() {
  const { user } = useAuth()

  const [submitted, setSubmitted] = useState(false)
  const [already, setAlready] = useState(false)
  const [loading, setLoading] = useState(true)

  // Form state
  const [would_use, setWouldUse] = useState(null)
  const [would_pay, setWouldPay] = useState(null)
  const [pay_amount, setPayAmount] = useState('')
  const [top_frustration, setTopFrustration] = useState('')
  const [top_feature, setTopFeature] = useState('')
  const [other_comments, setOtherComments] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/feedback/me')
      .then(res => {
        if (res.data.submitted) setAlready(true)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (would_use === null || would_pay === null) {
      setError('Please answer both the "would you use" and "would you pay" questions before submitting.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await api.post('/feedback', {
        would_use,
        would_pay,
        pay_amount: pay_amount.trim() || null,
        top_frustration: top_frustration.trim() || null,
        top_feature: top_feature.trim() || null,
        other_comments: other_comments.trim() || null,
      })
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 flex items-center justify-center text-slate-400">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  if (already && !submitted) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-10 flex flex-col items-center text-center">
          <CheckCircle size={52} className="text-emerald-500 mb-4" />
          <h2 className="text-xl font-semibold text-emerald-800 mb-2">Feedback already submitted</h2>
          <p className="text-emerald-700 text-sm max-w-sm">
            You've already shared your thoughts on Care Exchange. Thank you — your input shapes what gets built next.
          </p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-10 flex flex-col items-center text-center">
          <CheckCircle size={52} className="text-emerald-500 mb-4" />
          <h2 className="text-xl font-semibold text-emerald-800 mb-2">Thank you — this is genuinely helpful.</h2>
          <p className="text-emerald-700 text-sm max-w-sm">
            Your answers tell us whether Care Exchange is worth investing in. We'll use what you've told us to decide what happens next.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <ThumbsUp size={20} className="text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Quick Feedback</h1>
            <p className="text-sm text-slate-500">Help us decide what happens with Care Exchange</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mt-4">
          <p className="text-sm text-amber-800">
            <strong>Here's why we're asking:</strong> We need to know if Care Exchange is something people would actually use and pay for before we invest more in it. This takes about 2 minutes.
          </p>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-6 bg-rose-50 text-rose-700 text-sm px-4 py-3 rounded-xl border border-rose-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ── Q1: Would you use it? ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <SectionHeader
            icon={ThumbsUp}
            title="Would you actually use Care Exchange?"
            subtitle="Be honest — this is not a test."
          />
          <p className="text-xs text-slate-400 mb-4 ml-7">Select the option that best describes you.</p>
          <PillGroup
            value={would_use}
            onChange={setWouldUse}
            options={[
              { value: 'yes_regaily', label: 'Yes — I\'d use it regularly' },
              { value: 'yes_sometimes', label: 'Maybe — occasionally' },
              { value: 'maybe_not', label: 'Probably not' },
              { value: 'no', label: 'No' },
            ]}
          />
          {would_use === 'no' && (
            <p className="mt-3 text-sm text-rose-600 ml-7">No problem — please still answer the remaining questions.</p>
          )}
        </div>

        {/* ── Q2: Would you pay? ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <SectionHeader
            icon={CreditCard}
            title="Would you pay for Care Exchange?"
            subtitle="As it is today, or in a future version."
          />
          <p className="text-xs text-slate-400 mb-4 ml-7">Select the option that best describes you.</p>
          <PillGroup
            value={would_pay}
            onChange={setWouldPay}
            options={[
              { value: 'yes_monthly', label: 'Yes — monthly subscription' },
              { value: 'yes_once', label: 'Yes — one-time payment' },
              { value: 'maybe', label: 'Maybe, if it had X' },
              { value: 'no', label: 'No' },
            ]}
          />
          {(would_pay === 'yes_monthly' || would_pay === 'yes_once') && (
            <div className="mt-4 ml-7">
              <p className="text-xs text-slate-500 mb-2">Rough idea of what you'd pay (optional)?</p>
              <input
                type="text"
                value={pay_amount}
                onChange={e => setPayAmount(e.target.value)}
                placeholder="e.g. $20/month, $200 once"
                maxLength={80}
                className="w-full max-w-xs text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          )}
          {would_pay === 'maybe' && (
            <div className="mt-4 ml-7">
              <p className="text-xs text-slate-500 mb-2">What feature or change would make you willing to pay?</p>
              <textarea
                value={top_frustration}
                onChange={e => setTopFrustration(e.target.value)}
                placeholder="e.g. If it integrated with my NDIS plan manager, or if my provider was already on it..."
                rows={2}
                maxLength={300}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
              <p className="text-xs text-slate-400 mt-1 text-right">{top_frustration.length}/300</p>
            </div>
          )}
        </div>

        {/* ── Q3: What would make it worth it? ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <SectionHeader
            icon={Package}
            title="What's the one thing Care Exchange is missing that would make it worth using?"
            subtitle="Not a bug report — the big picture thing."
          />
          <p className="text-xs text-slate-400 mb-4 ml-7">If it had this one thing, it would be worth your time.</p>
          <textarea
            value={top_feature}
            onChange={e => setTopFeature(e.target.value)}
            placeholder="e.g. If my support coordinator could see everything in one place, or if providers had to respond within 48 hours..."
            rows={3}
            maxLength={500}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
          <p className="text-xs text-slate-400 mt-1.5 text-right">{top_feature.length}/500</p>
        </div>

        {/* ── Q4: Anything else ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <SectionHeader
            icon={MessageSquare}
            title="Anything else you want us to know?"
            subtitle="Optional"
          />
          <textarea
            value={other_comments}
            onChange={e => setOtherComments(e.target.value)}
            placeholder="Ideas, concerns, questions — anything at all."
            rows={3}
            maxLength={500}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
          <p className="text-xs text-slate-400 mt-1.5 text-right">{other_comments.length}/500</p>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-violet-600 text-white px-8 py-3 rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  )
}
