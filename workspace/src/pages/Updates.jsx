import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { FileText, Clock, Loader2, Filter } from 'lucide-react'

const CATEGORY_COLORS = {
  progress_note: 'bg-blue-100 text-blue-700',
  incident: 'bg-red-100 text-red-700',
  medication_change: 'bg-amber-100 text-amber-700',
  goal_update: 'bg-green-100 text-green-700',
  general: 'bg-slate-100 text-slate-700',
}

const CATEGORY_LABELS = {
  progress_note: 'Progress Note',
  incident: 'Incident',
  medication_change: 'Medication Change',
  goal_update: 'Goal Update',
  general: 'General',
}

export default function Updates() {
  const { user } = useAuth()
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedReferralId, setSelectedReferralId] = useState('')
  const [referralOptions, setReferralOptions] = useState([])

  const fetchUpdates = async (referralId = '') => {
    try {
      setLoading(true)
      const url = referralId ? `/updates?referral_id=${referralId}` : '/updates'
      const res = await api.get(url)
      const updatesData = res.data.updates || []
      setUpdates(updatesData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
      setError(null)

      if (!referralId) {
        const uniqueReferralIds = [...new Set(updatesData.map(u => u.referral_id))]
        setReferralOptions(uniqueReferralIds)
      }
    } catch (err) {
      setError('Failed to load updates')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUpdates()
  }, [])

  const handleReferralFilterChange = (referralId) => {
    setSelectedReferralId(referralId)
    fetchUpdates(referralId)
  }

  const formatTimeSpent = (minutes) => {
    if (!minutes && minutes !== 0) return null
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Updates</h1>
          <p className="text-slate-500 mt-1">Structured updates from your care providers.</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 size={24} className="text-primary animate-spin mb-2" />
            <p className="text-slate-500 text-sm">Loading updates...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Updates</h1>
        <p className="text-slate-500 mt-1">Structured updates from your care providers.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {referralOptions.length > 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <Filter size={16} className="text-slate-400" />
            <span className="text-sm text-slate-600">Filter by referral:</span>
            <select
              value={selectedReferralId}
              onChange={(e) => handleReferralFilterChange(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">All Referrals</option>
              {referralOptions.map(id => (
                <option key={id} value={id}>Referral #{id}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {updates.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <FileText size={20} className="text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">No updates yet</p>
            <p className="text-slate-400 text-xs mt-1">Updates from providers will appear here</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <div key={update.id} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[update.category] || CATEGORY_COLORS.general}`}>
                    {CATEGORY_LABELS[update.category] || update.category}
                  </span>
                  <span className="text-sm text-slate-600">by {update.author_name || `User #${update.author_id}`}</span>
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
  )
}
