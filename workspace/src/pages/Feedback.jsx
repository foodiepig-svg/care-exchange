import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { CheckCircle, Star, ThumbsUp, Frown, Meh, Smile, MessageSquare } from 'lucide-react'

const NPS_LABELS = ['Not at all likely', 'Extremely likely']
const FEATURES = [
  'Provider Directory',
  'Sending Referrals',
  'Care Team View',
  'Goal Tracking',
  'Care Plans',
  'Messaging',
  'Document Upload',
  'Notifications',
]

function StarRating({ value, onChange, max = 5 }) {
  return (
    <div className="flex gap-2" role="group" aria-label="Rating">
      {Array.from({ length: max }, (_, i) => i + 1).map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} star${n !== 1 ? 's' : ''}`}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={32}
            className={n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
          />
        </button>
      ))}
    </div>
  )
}

function NPSScale({ value, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-slate-400" aria-hidden="true">
        <span>Not likely</span>
        <span>Extremely likely</span>
      </div>
      <div className="flex gap-1.5" role="group" aria-label="Net Promoter Score">
        {Array.from({ length: 11 }, (_, i) => i).map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 h-9 rounded-lg text-sm font-medium transition-colors ${
              value === n
                ? 'bg-violet-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            aria-label={`Score ${n}`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Feedback() {
  const { user } = useAuth()

  const [submitted, setSubmitted] = useState(false)
  const [already, setAlready] = useState(false)
  const [loading, setLoading] = useState(true)

  // Form state
  const [rating, setRating] = useState(0)
  const [nps, setNps] = useState(null)
  const [triedFeatures, setTriedFeatures] = useState([])
  const [confusing, setConfusing] = useState('')
  const [brokenMissing, setBrokenMissing] = useState('')
  const [otherComments, setOtherComments] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/feedback/me')
      .then(res => {
        if (res.data.submitted) {
          setAlready(true)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const toggleFeature = (f) => {
    setTriedFeatures(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await api.post('/feedback', {
        rating,
        nps,
        tried_features: triedFeatures,
        confusing,
        broken_missing: brokenMissing,
        other_comments: otherComments,
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
            You've already shared your thoughts on the early access experience. Thank you — your input helps shape Care Exchange.
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
          <h2 className="text-xl font-semibold text-emerald-800 mb-2">Thank you for your feedback!</h2>
          <p className="text-emerald-700 text-sm max-w-sm">
            Your response has been recorded. We read every submission and your ideas will help make Care Exchange better for everyone.
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
            <h1 className="text-2xl font-bold text-slate-800">Early Access Feedback</h1>
            <p className="text-sm text-slate-500">Help us improve Care Exchange for everyone</p>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-3">
          Hi {user?.full_name?.split(' ')[0]}, we've been working hard on Care Exchange and we'd love to hear about your experience so far. This should take about 3 minutes.
        </p>
      </div>

      {error && (
        <div role="alert" className="mb-6 bg-rose-50 text-rose-700 text-sm px-4 py-3 rounded-xl border border-rose-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ── Section 1: Star Rating ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-1">
            <Frown size={18} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Overall Experience</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">How would you rate your experience with Care Exchange so far?</p>
          <StarRating value={rating} onChange={setRating} />
          <p className="text-xs text-slate-400 mt-2 text-center">
            {rating === 0 ? 'Tap a star to rate' :
             rating <= 2 ? 'Sorry to hear that — tell us more below' :
             rating <= 4 ? 'Good — keep going!' : 'Fantastic!'}
          </p>
        </div>

        {/* ── Section 2: NPS ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-1">
            <ThumbsUp size={18} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Recommendation</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">How likely are you to recommend Care Exchange to someone in a similar situation?</p>
          <NPSScale value={nps} onChange={setNps} />
          {nps !== null && (
            <p className="text-xs text-slate-400 mt-2 text-center">
              {nps <= 6 ? 'Thanks — we want to do better.' : nps <= 8 ? 'Great to hear!' : 'Wow, thank you!'}
            </p>
          )}
        </div>

        {/* ── Section 3: Features Tried ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-1">
            <CheckCircle size={18} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Features You've Tried</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">Select everything you've used so far</p>
          <div className="flex flex-wrap gap-2">
            {FEATURES.map(f => (
              <button
                key={f}
                type="button"
                onClick={() => toggleFeature(f)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                  triedFeatures.includes(f)
                    ? 'bg-violet-50 border-violet-200 text-violet-700'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {triedFeatures.includes(f) && (
                  <CheckCircle size={12} className="inline mr-1" />
                )}
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Section 4: What was confusing ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-1">
            <Meh size={18} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-700">What was confusing?</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">Anything that was hard to understand or find?</p>
          <textarea
            value={confusing}
            onChange={e => setConfusing(e.target.value)}
            placeholder="e.g. I couldn't figure out how to accept a referral..."
            rows={3}
            maxLength={500}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
          <p className="text-xs text-slate-400 mt-1.5 text-right">{confusing.length}/500</p>
        </div>

        {/* ── Section 5: What was broken or missing ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-1">
            <Frown size={18} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-700">What wasn't working or is missing?</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">Any bugs, errors, or features you expected but couldn't find?</p>
          <textarea
            value={brokenMissing}
            onChange={e => setBrokenMissing(e.target.value)}
            placeholder="e.g. The notifications didn't arrive, or I wish I could export my care plan..."
            rows={3}
            maxLength={500}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
          <p className="text-xs text-slate-400 mt-1.5 text-right">{brokenMissing.length}/500</p>
        </div>

        {/* ── Section 6: Anything else ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-1">
            <MessageSquare size={18} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Anything else?</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">Any other thoughts, questions, or ideas?</p>
          <textarea
            value={otherComments}
            onChange={e => setOtherComments(e.target.value)}
            placeholder="Your ideas, questions, or anything else..."
            rows={3}
            maxLength={500}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
          <p className="text-xs text-slate-400 mt-1.5 text-right">{otherComments.length}/500</p>
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
