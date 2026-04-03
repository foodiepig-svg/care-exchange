import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import {
  FileText, Clock, Loader2, User, CheckCircle2, XCircle,
  AlertCircle, Inbox, Calendar, ChevronRight, X, ArrowRight
} from 'lucide-react'

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  expired: 'bg-slate-100 text-slate-600',
}

const STATUS_LABELS = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
  expired: 'Expired',
}

const CARE_CATEGORY_COLORS = {
  'mental_health': 'bg-violet-100 text-violet-700',
  'physical_therapy': 'bg-blue-100 text-blue-700',
  'general_health': 'bg-teal-100 text-teal-700',
  'specialist': 'bg-orange-100 text-orange-700',
  'other': 'bg-slate-100 text-slate-600',
}

function ReferralDetailPanel({ referral, onClose, onStatusUpdate }) {
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    if (referral) {
      fetchReferralDetail()
    }
  }, [referral])

  const fetchReferralDetail = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/referrals/${referral.id}`)
      setDetail(res.data.referral || res.data)
    } catch (err) {
      console.error('Failed to fetch referral detail', err)
    } finally {
      setLoading(false)
    }
  }

  if (!referral) return null

  const participant = detail?.participant || referral.participant
  const canRespond = referral.status === 'pending'

  const handleAccept = async () => {
    await onStatusUpdate(referral.id, 'accepted')
  }

  const handleDecline = async () => {
    await onStatusUpdate(referral.id, 'declined')
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Referral Details</h2>
            <p className="text-sm text-slate-500">#{referral.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 size={24} className="text-primary animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status & Category */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[referral.status]}`}>
                  {STATUS_LABELS[referral.status] || referral.status}
                </span>
                {referral.care_category && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${CARE_CATEGORY_COLORS[referral.care_category] || 'bg-slate-100 text-slate-600'}`}>
                    {referral.care_category.replace('_', ' ')}
                  </span>
                )}
              </div>

              {/* Participant Info */}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <User size={18} className="text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Referred By (Participant)</p>
                    <p className="font-medium text-slate-900">
                      {participant?.full_name || `Participant #${referral.participant_id}`}
                    </p>
                    {participant?.email && (
                      <p className="text-sm text-slate-500">{participant.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Key Dates */}
              <div className="grid grid-cols-2 gap-4">
                {referral.created_at && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Received</p>
                    <p className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {referral.responded_at && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Responded</p>
                    <p className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" />
                      {new Date(referral.responded_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Referral Reason */}
              {referral.referral_reason && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Referral Reason</h4>
                  <p className="text-slate-600">{referral.referral_reason}</p>
                </div>
              )}

              {/* Urgency */}
              {referral.urgency && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Urgency</h4>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    referral.urgency === 'urgent' ? 'bg-red-100 text-red-700' :
                    referral.urgency === 'high' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    <AlertCircle size={14} />
                    {referral.urgency.charAt(0).toUpperCase() + referral.urgency.slice(1)}
                  </span>
                </div>
              )}

              {/* Referral Link */}
              {referral.status === 'accepted' && referral.referral_link_token && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <ArrowRight size={16} className="text-green-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-green-600 uppercase tracking-wide">Referral Link</p>
                    <p className="text-sm text-green-700 font-mono truncate">{referral.referral_link_token}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons - Provider can Accept/Decline pending referrals */}
              {canRespond && (
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Your Response</h4>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleAccept}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle2 size={16} />
                      Accept Referral
                    </button>
                    <button
                      onClick={handleDecline}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      <XCircle size={16} />
                      Decline Referral
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function ProviderReceivedReferrals() {
  const { user } = useAuth()
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedReferral, setSelectedReferral] = useState(null)
  const [updating, setUpdating] = useState(null)

  const fetchReferrals = async () => {
    try {
      setLoading(true)
      const res = await api.get('/referrals')
      // Backend returns referrals - filter to those sent TO this provider
      // (for provider role, these are incoming referrals)
      const allReferrals = res.data.referrals || res.data || []
      // Provider sees referrals where they are the target provider
      const incomingReferrals = allReferrals.filter(r => 
        r.provider_id === user?.id || r.provider?.id === user?.id
      )
      setReferrals(incomingReferrals)
      setError(null)
    } catch (err) {
      setError('Failed to load referrals')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchReferrals()
    }
  }, [user])

  const handleStatusUpdate = async (referralId, newStatus) => {
    try {
      setUpdating(referralId)
      await api.put(`/referrals/${referralId}/status`, { status: newStatus })
      
      // Update local state
      setReferrals(prev => 
        prev.map(r => 
          r.id === referralId 
            ? { ...r, status: newStatus, responded_at: new Date().toISOString() }
            : r
        )
      )
      
      // Close panel if on detail view and status is no longer pending
      if (newStatus !== 'pending') {
        setSelectedReferral(null)
      }
    } catch (err) {
      alert('Failed to update referral status')
      console.error(err)
    } finally {
      setUpdating(null)
    }
  }

  const handleReferralClick = (referral) => {
    setSelectedReferral(referral)
  }

  const filteredReferrals = referrals.filter(r => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'pending') return r.status === 'pending'
    if (activeFilter === 'accepted') return r.status === 'accepted'
    if (activeFilter === 'declined') return r.status === 'declined'
    return true
  })

  const filterTabs = [
    { key: 'all', label: 'All', count: referrals.length },
    { key: 'pending', label: 'Pending', count: referrals.filter(r => r.status === 'pending').length },
    { key: 'accepted', label: 'Accepted', count: referrals.filter(r => r.status === 'accepted').length },
    { key: 'declined', label: 'Declined', count: referrals.filter(r => r.status === 'declined').length },
  ]

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Received Referrals</h1>
          <p className="text-slate-500 mt-1">Manage referrals sent to your practice.</p>
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Received Referrals</h1>
        <p className="text-slate-500 mt-1">Manage referrals sent to your practice.</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-1 inline-flex">
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeFilter === tab.key
                ? 'bg-primary text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeFilter === tab.key
                  ? 'bg-white/20'
                  : 'bg-slate-100'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Referral List */}
      {filteredReferrals.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Inbox size={20} className="text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">
              {activeFilter === 'all' 
                ? 'No referrals received yet'
                : `No ${activeFilter} referrals`}
            </p>
            <p className="text-slate-400 text-xs mt-1">
              {activeFilter === 'all' 
                ? 'When participants refer you, they will appear here'
                : `You have no ${activeFilter} referrals at this time`}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {filteredReferrals.map((referral) => (
            <div
              key={referral.id}
              onClick={() => handleReferralClick(referral)}
              className="p-5 hover:bg-slate-50 cursor-pointer transition-colors flex items-center gap-4"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-secondary" />
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-slate-900">
                    {referral.participant?.full_name || `Participant #${referral.participant_id}`}
                  </p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[referral.status]}`}>
                    {STATUS_LABELS[referral.status] || referral.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 flex-wrap">
                  {referral.care_category && (
                    <span className="capitalize">{referral.care_category.replace('_', ' ')}</span>
                  )}
                  {referral.created_at && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(referral.created_at).toLocaleDateString()}
                      </span>
                    </>
                  )}
                  {referral.urgency && referral.urgency !== 'normal' && (
                    <>
                      <span>·</span>
                      <span className={`flex items-center gap-1 ${
                        referral.urgency === 'urgent' ? 'text-red-600' :
                        referral.urgency === 'high' ? 'text-amber-600' : 'text-blue-600'
                      }`}>
                        <AlertCircle size={12} />
                        {referral.urgency}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight size={18} className="text-slate-300 flex-shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Detail Panel */}
      {selectedReferral && (
        <ReferralDetailPanel
          referral={selectedReferral}
          onClose={() => setSelectedReferral(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  )
}