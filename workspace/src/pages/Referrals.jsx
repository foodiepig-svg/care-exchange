import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { FileText, Send, Clock, Plus, Check, X, Loader2, Link } from 'lucide-react'

const STATUS_COLORS = {
  draft: 'bg-slate-100 text-slate-700',
  sent: 'bg-blue-100 text-blue-700',
  viewed: 'bg-amber-100 text-amber-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  active: 'bg-green-100 text-green-700',
  on_hold: 'bg-amber-100 text-amber-700',
  completed: 'bg-slate-100 text-slate-700',
}

const URGENCY_COLORS = {
  low: 'bg-slate-100 text-slate-600',
  normal: 'bg-blue-100 text-blue-600',
  high: 'bg-amber-100 text-amber-600',
  urgent: 'bg-red-100 text-red-600',
}

export default function Referrals() {
  const { user } = useAuth()
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [providers, setProviders] = useState([])
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(null)

  const [formData, setFormData] = useState({
    provider_id: '',
    referral_reason: '',
    urgency: 'normal',
  })

  const fetchReferrals = async () => {
    try {
      setLoading(true)
      const res = await api.get('/referrals')
      setReferrals(res.data.referrals || [])
      setError(null)
    } catch (err) {
      setError('Failed to load referrals')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchProviders = async () => {
    try {
      const res = await api.get('/providers')
      setProviders(res.data.providers || [])
    } catch (err) {
      console.error('Failed to load providers', err)
    }
  }

  useEffect(() => {
    fetchReferrals()
    if (user?.role === 'participant') {
      fetchProviders()
    }
  }, [user])

  const handleCreateReferral = async (e) => {
    e.preventDefault()
    if (!formData.provider_id || !formData.referral_reason) return

    try {
      setCreating(true)
      const res = await api.post('/referrals', formData)
      setReferrals(prev => [res.data.referral, ...prev])
      setFormData({ provider_id: '', referral_reason: '', urgency: 'normal' })
      setShowCreateForm(false)
    } catch (err) {
      alert('Failed to create referral')
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setUpdating(id)
      const res = await api.put(`/referrals/${id}/status`, { status: newStatus })
      setReferrals(prev =>
        prev.map(r => r.id === id ? res.data.referral : r)
      )
    } catch (err) {
      alert('Failed to update status')
      console.error(err)
    } finally {
      setUpdating(null)
    }
  }

  const userReferrals = user?.role === 'participant'
    ? referrals.filter(r => r.participant_id === user.id)
    : referrals.filter(r => r.provider_id === user.id)

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Referrals</h1>
          <p className="text-slate-500 mt-1">Send and manage secure referral links to providers.</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 size={24} className="text-primary animate-spin mb-2" />
            <p className="text-slate-500 text-sm">Loading referrals...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Referrals</h1>
          <p className="text-slate-500 mt-1">Send and manage secure referral links to providers.</p>
        </div>
        {user?.role === 'participant' && !showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} />
            Create Referral
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Create New Referral</h2>
          <form onSubmit={handleCreateReferral} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Provider</label>
              <select
                value={formData.provider_id}
                onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              >
                <option value="">Select a provider...</option>
                {providers.map(p => (
                  <option key={p.id} value={p.id}>{p.organisation_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Referral Reason</label>
              <textarea
                value={formData.referral_reason}
                onChange={(e) => setFormData({ ...formData, referral_reason: e.target.value })}
                placeholder="Describe the reason for this referral..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Urgency</label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {creating ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {creating ? 'Sending...' : 'Send Referral'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setFormData({ provider_id: '', referral_reason: '', urgency: 'normal' })
                }}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {userReferrals.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <FileText size={20} className="text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">
              {user?.role === 'participant'
                ? 'You haven\'t sent any referrals yet'
                : 'No referrals have been sent to you yet'}
            </p>
            <p className="text-slate-400 text-xs mt-1">
              {user?.role === 'participant'
                ? 'Create a referral to connect participants with providers'
                : 'Referrals from participants will appear here'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {userReferrals.map((referral) => (
            <div key={referral.id} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-900">
                      {user?.role === 'participant'
                        ? referral.provider?.organisation_name || `Provider #${referral.provider_id}`
                        : referral.participant?.full_name || `Participant #${referral.participant_id}`}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[referral.status] || STATUS_COLORS.draft}`}>
                      {referral.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${URGENCY_COLORS[referral.urgency] || URGENCY_COLORS.normal}`}>
                      {referral.urgency}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mb-3">{referral.referral_reason}</p>

                  {referral.status === 'accepted' && referral.referral_link_token && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3">
                      <Link size={14} className="text-green-600" />
                      <span className="text-sm text-green-700 font-mono">{referral.referral_link_token}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    {referral.sent_at && (
                      <span className="flex items-center gap-1">
                        <Send size={12} />
                        Sent {new Date(referral.sent_at).toLocaleDateString()}
                      </span>
                    )}
                    {referral.responded_at && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        Responded {new Date(referral.responded_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {user?.role === 'provider' && referral.status === 'viewed' && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleStatusUpdate(referral.id, 'accepted')}
                      disabled={updating === referral.id}
                      className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      {updating === referral.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(referral.id, 'declined')}
                      disabled={updating === referral.id}
                      className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      {updating === referral.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                      Decline
                    </button>
                  </div>
                )}

                {user?.role === 'provider' && referral.status === 'sent' && (
                  <button
                    onClick={() => handleStatusUpdate(referral.id, 'viewed')}
                    disabled={updating === referral.id}
                    className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 ml-4"
                  >
                    {updating === referral.id ? 'Updating...' : 'Mark as Viewed'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
