import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { CheckCircle, ThumbsUp, Search, MessageSquare, Star, AlertCircle } from 'lucide-react'

// ─── Reusable components ───────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-2.5 mb-1">
      <Icon size={16} className="text-slate-400" />
      <span className="text-sm font-medium text-slate-700">{title}</span>
      {subtitle && <span className="text-xs text-slate-400">— {subtitle}</span>}
    </div>
  )
}

function PillGroup({ options, value, onChange, columns = false }) {
  const cls = columns ? 'grid grid-cols-2 gap-2' : 'flex flex-wrap gap-2'
  return (
    <div className={cls}>
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`text-sm px-4 py-2.5 rounded-xl border text-left transition-colors ${
            value === opt.value
              ? 'bg-violet-50 border-violet-200 text-violet-700 font-medium'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function Textarea({ value, onChange, placeholder, maxLength = 300, rows = 3 }) {
  return (
    <div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
      />
      <p className="text-xs text-slate-400 mt-1 text-right">{value.length}/{maxLength}</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const USE_CASE_OPTIONS = [
  { value: 'referrals', label: 'Sending and receiving referrals' },
  { value: 'care_team', label: 'Coordinating the care team' },
  { value: 'goals_tracking', label: 'Tracking participant goals' },
  { value: 'compliance', label: 'Compliance and consent management' },
  { value: 'not_sure', label: "Honestly, I'm not sure yet" },
  { value: 'other', label: 'Other' },
]

export default function Feedback() {
  const { user } = useAuth()

  const [submitted, setSubmitted] = useState(false)
  const [already, setAlready] = useState(false)
  const [loading, setLoading] = useState(true)

  // Form state
  const [use_case, setUseCase] = useState(null)
  const [use_case_other, setUseCaseOther] = useState('')
  const [recommend_condition, setRecommendCondition] = useState('')
  const [most_useful, setMostUseful] = useState('')
  const [waste_of_time, setWasteOfTime] = useState('')
  const [trust_first, setTrustFirst] = useState('')
  const [comparison, setComparison] = useState('')
  const [other_comments, setOtherComments] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/feedback/me')
      .then(res => { if (res.data.submitted) setAlready(true); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!use_case) {
      setError('Please select what you would use Care Exchange for.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await api.post('/feedback', {
        use_case,
        use_case_other: use_case_other.trim() || null,
        recommend_condition: recommend_condition.trim() || null,
        most_useful: most_useful.trim() || null,
        waste_of_time: waste_of_time.trim() || null,
        trust_first: trust_first.trim() || null,
        comparison: comparison.trim() || null,
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
          <CheckCircle size={48} className="text-emerald-500 mb-4" />
          <h2 className="text-xl font-semibold text-emerald-800 mb-2">Feedback already submitted</h2>
          <p className="text-emerald-700 text-sm max-w-sm">
            Thanks — your responses have been recorded and will help shape what we build next.
          </p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-10 flex flex-col items-center text-center">
          <CheckCircle size={48} className="text-emerald-500 mb-4" />
          <h2 className="text-xl font-semibold text-emerald-800 mb-2">Thanks — this is exactly what we needed.</h2>
          <p className="text-emerald-700 text-sm max-w-sm">
            Your answers tell us whether we're building the right thing. We'll use them to decide what to focus on next.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <ThumbsUp size={20} className="text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Platform Feedback</h1>
            <p className="text-sm text-slate-500">Help us understand what to focus on</p>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 mt-4">
          <p className="text-sm text-slate-600">
            This is a test environment — we're not asking you to pretend it's perfect. We want to know what you'd actually use, what confused you, and what would need to be true for this to replace something you're already doing.
          </p>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-6 bg-rose-50 text-rose-700 text-sm px-4 py-3 rounded-xl border border-rose-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-7">

        {/* ── Q1: What would you use it for? ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <SectionHeader
            icon={Search}
            title="Based on what you've seen, what would you actually use Care Exchange for?"
            subtitle="Select the one that fits best."
          />
          <div className="mt-4">
            <PillGroup options={USE_CASE_OPTIONS} value={use_case} onChange={setUseCase} columns />
          </div>
          {use_case === 'other' && (
            <div className="mt-3">
              <input
                type="text"
                value={use_case_other}
                onChange={e => setUseCaseOther(e.target.value)}
                placeholder="Tell us what..."
                maxLength={255}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          )}
        </div>

        {/* ── Q2: Most useful thing ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <SectionHeader
            icon={Star}
            title="What was the most genuinely useful thing you found?"
            subtitle="Not your favourite — the one you'd actually come back for."
          />
          <div className="mt-4">
            <Textarea
              value={most_useful}
              onChange={setMostUseful}
              placeholder="e.g. Being able to see all messages from a participant's family and providers in one place..."
              maxLength={300}
              rows={3}
            />
          </div>
        </div>

        {/* ── Q3: Waste of time ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <SectionHeader
            icon={AlertCircle}
            title="What was a waste of your time, or felt unnecessary?"
            subtitle="No wrong answer — vague features count."
          />
          <div className="mt-4">
            <Textarea
              value={waste_of_time}
              onChange={setWasteOfTime}
              placeholder="e.g. I skipped the Goals section entirely — it felt like extra work for something I do in a spreadsheet..."
              maxLength={300}
              rows={3}
            />
          </div>
        </div>

        {/* ── Q4: Trust first ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <SectionHeader
            icon={CheckCircle}
            title="What would you trust enough to put real participant data into first?"
            subtitle="If it contained your actual clients — what would you use first?"
          />
          <div className="mt-4">
            <Textarea
              value={trust_first}
              onChange={setTrustFirst}
              placeholder="e.g. I'd probably start with the referral inbox — to see if my colleagues were already using it..."
              maxLength={300}
              rows={3}
            />
          </div>
        </div>

        {/* ── Q5: Comparison ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <SectionHeader
            icon={ThumbsUp}
            title="How does Care Exchange compare to how you currently handle this?"
            subtitle="Referrals, coordination, notes — whatever is relevant to you."
          />
          <div className="mt-4">
            <Textarea
              value={comparison}
              onChange={setComparison}
              placeholder="e.g. We currently use email chains and a shared spreadsheet for referrals — this is cleaner but I need to know my colleagues are on it..."
              maxLength={300}
              rows={3}
            />
          </div>
        </div>

        {/* ── Q6: What would need to be true to recommend ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <SectionHeader
            icon={MessageSquare}
            title="What would need to be true for you to recommend Care Exchange to a colleague?"
            subtitle="The real answer — not the polite one."
          />
          <div className="mt-4">
            <Textarea
              value={recommend_condition}
              onChange={setRecommendCondition}
              placeholder="e.g. If at least two coordinators I work with were already on it, and it saved me time on consent..."
              maxLength={300}
              rows={3}
            />
          </div>
        </div>

        {/* ── Q7: Anything else ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <SectionHeader
            icon={MessageSquare}
            title="Anything else?"
            subtitle="Optional — questions, concerns, ideas."
          />
          <div className="mt-4">
            <Textarea
              value={other_comments}
              onChange={setOtherComments}
              placeholder="Anything else you want us to know..."
              maxLength={300}
              rows={3}
            />
          </div>
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
