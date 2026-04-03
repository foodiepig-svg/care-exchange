import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { FileText, Clock, Loader2, Send, AlertCircle, CheckCircle } from 'lucide-react'

const CATEGORIES = [
  { value: 'progress_note', label: 'Progress Note' },
  { value: 'incident', label: 'Incident' },
  { value: 'report', label: 'Report' },
  { value: 'other', label: 'Other' },
]

const CATEGORY_COLORS = {
  progress_note: 'bg-blue-100 text-blue-700',
  incident: 'bg-red-100 text-red-700',
  report: 'bg-purple-100 text-purple-700',
  other: 'bg-slate-100 text-slate-700',
}

export default function ProviderSendUpdates() {
  const { user } = useAuth()
  const [referrals, setReferrals] = useState([])
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [formData, setFormData] = useState({
    referral_id: '',
    category: 'progress_note',
    summary: '',
    observations: '',
    recommendations: '',
    time_spent_minutes: '',
  })

  const [formErrors, setFormErrors] = useState({})

  const fetchAcceptedReferrals = async () => {
    try {
      const res = await api.get('/referrals?status=accepted')
      setReferrals(res.data.referrals || [])
    } catch (err) {
      console.error('Failed to load accepted referrals', err)
    }
  }

  const fetchProviderUpdates = async () => {
    try {
      setLoading(true)
      const res = await api.get('/updates')
      const updatesData = res.data.updates || []
      // Filter to only show updates authored by this provider
      const myUpdates = updatesData.filter(u => u.author_id === user?.id)
      setUpdates(myUpdates.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
      setError(null)
    } catch (err) {
      setError('Failed to load updates')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAcceptedReferrals()
    fetchProviderUpdates()
  }, [user])

  const validateForm = () => {
    const errors = {}
    if (!formData.referral_id) errors.referral_id = 'Referral is required'
    if (!formData.category) errors.category = 'Category is required'
    if (!formData.summary || formData.summary.trim().length < 5) {
      errors.summary = 'Summary is required (minimum 5 characters)'
    }
    if (formData.time_spent_minutes && formData.time_spent_minutes < 0) {
      errors.time_spent_minutes = 'Time spent cannot be negative'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setSubmitting(true)
      setError(null)
      setSuccess(null)

      const payload = {
        ...formData,
        time_spent_minutes: formData.time_spent_minutes ? parseInt(formData.time_spent_minutes, 10) : null,
      }

      const res = await api.post('/updates', payload)
      
      // Add the new update to the list
      if (res.data.update) {
        setUpdates(prev => [res.data.update, ...prev])
      }

      // Reset form
      setFormData({
        referral_id: '',
        category: 'progress_note',
        summary: '',
        observations: '',
        recommendations: '',
        time_spent_minutes: '',
      })
      setFormErrors({})
      setSuccess('Update submitted successfully')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit update')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const formatTimeSpent = (minutes) => {
    if (!minutes && minutes !== 0) return null
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const getReferralLabel = (referral) => {
    const participantName = referral.participant?.full_name || `Participant #${referral.participant_id}`
    return `${participantName} - ${referral.service_type || 'General'}`
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Send Updates</h1>
          <p className="text-slate-500 mt-1">Submit structured updates to participants.</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 size={24} className="text-primary animate-spin mb-2" />
            <p className="text-slate-500 text-sm">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Send Updates</h1>
        <p className="text-slate-500 mt-1">Submit structured updates to participants.</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-3">
          <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Success</p>
            <p className="text-sm">{success}</p>
          </div>
        </div>
      )}

      {/* Update Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Send size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Submit New Update</h2>
            <p className="text-sm text-slate-500">Send a structured update to a participant</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Referral Dropdown */}
          <div>
            <label htmlFor="referral_id" className="block text-sm font-medium text-slate-700 mb-1.5">
              Referral <span className="text-red-500">*</span>
            </label>
            <select
              id="referral_id"
              name="referral_id"
              value={formData.referral_id}
              onChange={handleChange}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                formErrors.referral_id ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}
            >
              <option value="">Select an accepted referral...</option>
              {referrals.map(referral => (
                <option key={referral.id} value={referral.id}>
                  {getReferralLabel(referral)}
                </option>
              ))}
            </select>
            {formErrors.referral_id && (
              <p className="mt-1 text-xs text-red-600">{formErrors.referral_id}</p>
            )}
            {referrals.length === 0 && (
              <p className="mt-1 text-xs text-slate-500">No accepted referrals available</p>
            )}
          </div>

          {/* Category Dropdown */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                formErrors.category ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {formErrors.category && (
              <p className="mt-1 text-xs text-red-600">{formErrors.category}</p>
            )}
          </div>

          {/* Summary */}
          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-slate-700 mb-1.5">
              Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              rows={3}
              placeholder="Brief summary of the update..."
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none ${
                formErrors.summary ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}
            />
            {formErrors.summary && (
              <p className="mt-1 text-xs text-red-600">{formErrors.summary}</p>
            )}
          </div>

          {/* Observations */}
          <div>
            <label htmlFor="observations" className="block text-sm font-medium text-slate-700 mb-1.5">
              Observations
            </label>
            <textarea
              id="observations"
              name="observations"
              value={formData.observations}
              onChange={handleChange}
              rows={3}
              placeholder="Detailed observations from the session..."
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          {/* Recommendations */}
          <div>
            <label htmlFor="recommendations" className="block text-sm font-medium text-slate-700 mb-1.5">
              Recommendations
            </label>
            <textarea
              id="recommendations"
              name="recommendations"
              value={formData.recommendations}
              onChange={handleChange}
              rows={3}
              placeholder="Any recommendations or next steps..."
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          {/* Time Spent */}
          <div>
            <label htmlFor="time_spent_minutes" className="block text-sm font-medium text-slate-700 mb-1.5">
              Time Spent (minutes)
            </label>
            <input
              type="number"
              id="time_spent_minutes"
              name="time_spent_minutes"
              value={formData.time_spent_minutes}
              onChange={handleChange}
              min="0"
              placeholder="e.g., 45"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                formErrors.time_spent_minutes ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}
            />
            {formErrors.time_spent_minutes && (
              <p className="mt-1 text-xs text-red-600">{formErrors.time_spent_minutes}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || referrals.length === 0}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors flex items-center justify-center gap-2 ${
                submitting || referrals.length === 0
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit Update
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Past Updates */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <FileText size={18} className="text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900">Your Submitted Updates</h2>
        </div>

        {updates.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <FileText size={20} className="text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm">No updates submitted yet</p>
              <p className="text-slate-400 text-xs mt-1">Updates you submit will appear here</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((update) => (
              <div key={update.id} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[update.category] || CATEGORY_COLORS.other}`}>
                      {CATEGORIES.find(c => c.value === update.category)?.label || update.category}
                    </span>
                    <span className="text-sm text-slate-500">
                      Referral #{update.referral_id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock size={12} />
                    {new Date(update.created_at).toLocaleDateString()} at{' '}
                    {new Date(update.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <h3 className="font-semibold text-slate-900 mb-2">{update.summary}</h3>

                {update.observations && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-slate-700 mb-1">Observations</p>
                    <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{update.observations}</p>
                  </div>
                )}

                {update.recommendations && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-slate-700 mb-1">Recommendations</p>
                    <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{update.recommendations}</p>
                  </div>
                )}

                {update.time_spent_minutes > 0 && (
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                    <Clock size={12} />
                    Time spent: {formatTimeSpent(update.time_spent_minutes)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
