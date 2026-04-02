import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import {
  FileText, Send, Clock, Plus, Check, X, Loader2, Link,
  ChevronRight, MessageSquare, History, User, Building2,
  AlertCircle, Calendar, ArrowRight, XCircle, CheckCircle2,
  Eye, Mail, Bell
} from 'lucide-react'

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

const STATUS_LABELS = {
  draft: 'Draft',
  sent: 'Sent',
  viewed: 'Viewed',
  accepted: 'Accepted',
  declined: 'Declined',
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
}

const URGENCY_COLORS = {
  low: 'bg-slate-100 text-slate-600',
  normal: 'bg-blue-100 text-blue-600',
  high: 'bg-amber-100 text-amber-600',
  urgent: 'bg-red-100 text-red-600',
}

const STATUS_TRANSITIONS = {
  sent: ['viewed'],
  viewed: ['accepted', 'declined'],
  accepted: ['active', 'completed'],
  active: ['completed', 'on_hold'],
  on_hold: ['active'],
}

function TimelineItem({ status, timestamp, label, description, isFirst, isLast }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full border-2 ${STATUS_COLORS[status] || 'bg-slate-100 border-slate-300'}`} />
        {!isLast && <div className="w-0.5 flex-1 bg-slate-200 my-1" />}
      </div>
      <div className="pb-6 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] || 'bg-slate-100 text-slate-700'}`}>
            {STATUS_LABELS[status] || status}
          </span>
          {timestamp && (
            <span className="text-xs text-slate-500">
              {new Date(timestamp).toLocaleString()}
            </span>
          )}
        </div>
        {label && <p className="text-sm font-medium text-slate-900 mt-1">{label}</p>}
        {description && <p className="text-sm text-slate-600 mt-0.5">{description}</p>}
      </div>
    </div>
  )
}

function SlideOverPanel({ isOpen, onClose, referral, onStatusUpdate }) {
  const [timeline, setTimeline] = useState([])
  const [messages, setMessages] = useState([])
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const { user } = useAuth()

  useEffect(() => {
    if (isOpen && referral) {
      fetchReferralDetails()
    }
  }, [isOpen, referral])

  const fetchReferralDetails = async () => {
    if (!referral) return
    setLoading(true)
    try {
      const [timelineRes, messagesRes, updatesRes] = await Promise.allSettled([
        api.get(`/referrals/${referral.id}/timeline`),
        api.get(`/referrals/${referral.id}/messages`),
        api.get(`/referrals/${referral.id}/updates`),
      ])

      if (timelineRes.status === 'fulfilled') {
        setTimeline(timelineRes.value.data.timeline || [])
      }
      if (messagesRes.status === 'fulfilled') {
        setMessages(messagesRes.value.data.messages || [])
      }
      if (updatesRes.status === 'fulfilled') {
        setUpdates(updatesRes.value.data.updates || [])
      }
    } catch (err) {
      console.error('Failed to fetch referral details', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !referral) return null

  const otherParty = user?.role === 'participant'
    ? referral.provider
    : referral.participant

  const availableTransitions = STATUS_TRANSITIONS[referral.status] || []

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

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <History size={14} />
            Timeline
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'messages'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <MessageSquare size={14} />
            Messages
            {messages.length > 0 && (
              <span className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">
                {messages.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('updates')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'updates'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Bell size={14} />
            Updates
            {updates.length > 0 && (
              <span className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">
                {updates.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 size={24} className="text-primary animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === 'details' && (
                <div className="p-6 space-y-6">
                  {/* Status & Urgency */}
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[referral.status]}`}>
                      {STATUS_LABELS[referral.status] || referral.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${URGENCY_COLORS[referral.urgency]}`}>
                      {referral.urgency}
                    </span>
                  </div>

                  {/* Other Party Info */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {user?.role === 'participant' ? (
                          <Building2 size={18} className="text-primary" />
                        ) : (
                          <User size={18} className="text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                          {user?.role === 'participant' ? 'Referred To' : 'Referred By'}
                        </p>
                        <p className="font-medium text-slate-900">
                          {user?.role === 'participant'
                            ? referral.provider?.organisation_name || `Provider #${referral.provider_id}`
                            : referral.participant?.full_name || `Participant #${referral.participant_id}`}
                        </p>
                        {otherParty?.email && (
                          <p className="text-sm text-slate-500">{otherParty.email}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Referral Reason */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Referral Reason</h4>
                    <p className="text-slate-600">{referral.referral_reason}</p>
                  </div>

                  {/* Key Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    {referral.sent_at && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Sent</p>
                        <p className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                          <Send size={14} className="text-slate-400" />
                          {new Date(referral.sent_at).toLocaleDateString()}
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
                    {referral.viewed_at && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Viewed</p>
                        <p className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                          <Eye size={14} className="text-slate-400" />
                          {new Date(referral.viewed_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Referral Link */}
                  {referral.status === 'accepted' && referral.referral_link_token && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                      <Link size={16} className="text-green-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-green-600 uppercase tracking-wide">Referral Link</p>
                        <p className="text-sm text-green-700 font-mono truncate">{referral.referral_link_token}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {availableTransitions.length > 0 && (
                    <div className="border-t border-slate-200 pt-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-3">Actions</h4>
                      <div className="flex flex-wrap gap-2">
                        {availableTransitions.map(status => (
                          <button
                            key={status}
                            onClick={() => onStatusUpdate(referral.id, status)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              status === 'accepted'
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : status === 'declined'
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : status === 'viewed'
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : status === 'completed'
                                ? 'bg-slate-600 text-white hover:bg-slate-700'
                                : 'bg-primary text-white hover:bg-primary/90'
                            }`}
                          >
                            {status === 'accepted' && <CheckCircle2 size={16} />}
                            {status === 'declined' && <XCircle size={16} />}
                            {status === 'viewed' && <Eye size={16} />}
                            {status === 'completed' && <Check size={16} />}
                            {status === 'active' && <ArrowRight size={16} />}
                            {status === 'on_hold' && <AlertCircle size={16} />}
                            Mark as {STATUS_LABELS[status] || status}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="p-6">
                  {timeline.length === 0 ? (
                    <div className="text-center py-12">
                      <History size={32} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">No timeline events yet</p>
                    </div>
                  ) : (
                    <div className="relative">
                      {timeline.map((event, index) => (
                        <TimelineItem
                          key={event.id || index}
                          status={event.status}
                          timestamp={event.created_at}
                          label={event.label}
                          description={event.description}
                          isFirst={index === 0}
                          isLast={index === timeline.length - 1}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="p-6">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare size={32} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">No messages yet</p>
                      <p className="text-slate-400 text-xs mt-1">Messages associated with this referral will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-4 rounded-xl ${
                            message.sender_id === user?.id
                              ? 'bg-primary/10 ml-8'
                              : 'bg-slate-100 mr-8'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-slate-900">
                              {message.sender_name || `User #${message.sender_id}`}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(message.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700">{message.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'updates' && (
                <div className="p-6">
                  {updates.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell size={32} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">No updates yet</p>
                      <p className="text-slate-400 text-xs mt-1">Status changes and updates will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {updates.map((update) => (
                        <div
                          key={update.id}
                          className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                        >
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            update.type === 'status_change' ? 'bg-blue-500' :
                            update.type === 'message' ? 'bg-green-500' :
                            'bg-slate-400'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-900">
                                {update.title || update.type?.replace('_', ' ')}
                              </span>
                              <span className="text-xs text-slate-500">
                                {new Date(update.created_at).toLocaleString()}
                              </span>
                            </div>
                            {update.description && (
                              <p className="text-sm text-slate-600 mt-0.5">{update.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
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
  const [selectedReferral, setSelectedReferral] = useState(null)
  const [showSlideOver, setShowSlideOver] = useState(false)

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
      // Update selected referral if it's the one being updated
      if (selectedReferral?.id === id) {
        setSelectedReferral(res.data.referral)
      }
    } catch (err) {
      alert('Failed to update status')
      console.error(err)
    } finally {
      setUpdating(null)
    }
  }

  const handleCardClick = (referral) => {
    setSelectedReferral(referral)
    setShowSlideOver(true)
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
            <div
              key={referral.id}
              onClick={() => handleCardClick(referral)}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-900">
                      {user?.role === 'participant'
                        ? referral.provider?.organisation_name || `Provider #${referral.provider_id}`
                        : referral.participant?.full_name || `Participant #${referral.participant_id}`}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[referral.status] || STATUS_COLORS.draft}`}>
                      {STATUS_LABELS[referral.status] || referral.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${URGENCY_COLORS[referral.urgency] || URGENCY_COLORS.normal}`}>
                      {referral.urgency}
                    </span>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-colors ml-auto" />
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
              </div>

              {/* Quick Action Buttons - shown on hover for provider role */}
              {user?.role === 'provider' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  {referral.status === 'viewed' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStatusUpdate(referral.id, 'accepted')
                        }}
                        disabled={updating === referral.id}
                        className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                      >
                        {updating === referral.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        Accept
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStatusUpdate(referral.id, 'declined')
                        }}
                        disabled={updating === referral.id}
                        className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
                      >
                        {updating === referral.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                        Decline
                      </button>
                    </>
                  )}

                  {referral.status === 'sent' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStatusUpdate(referral.id, 'viewed')
                      }}
                      disabled={updating === referral.id}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 disabled:opacity-50 text-sm"
                    >
                      {updating === referral.id ? 'Updating...' : 'Mark as Viewed'}
                    </button>
                  )}

                  {['accepted', 'active', 'viewed', 'completed', 'on_hold'].includes(referral.status) && (
                    <span className="text-xs text-slate-400 self-center ml-auto">
                      Click card for details
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Slide-over Panel */}
      <SlideOverPanel
        isOpen={showSlideOver}
        onClose={() => {
          setShowSlideOver(false)
          setSelectedReferral(null)
        }}
        referral={selectedReferral}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  )
}
