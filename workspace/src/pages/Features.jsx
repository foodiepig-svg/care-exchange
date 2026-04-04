import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import {
  ThumbsUp, Plus, Loader2, X, ChevronDown, ChevronUp,
  Trash2, CheckCircle2, Clock, BarChart2, TrendingUp, Flag
} from 'lucide-react'

const CATEGORIES = [
  { value: 'participant', label: 'Participant' },
  { value: 'provider', label: 'Provider' },
  { value: 'coordinator', label: 'Coordinator' },
  { value: 'family', label: 'Family' },
  { value: 'admin', label: 'Admin' },
  { value: 'other', label: 'Other' },
]

const STATUS_CONFIG = {
  open:        { label: 'Open',        icon: Flag,         cls: 'bg-slate-100 text-slate-600' },
  planned:     { label: 'Planned',     icon: CheckCircle2, cls: 'bg-blue-50 text-blue-600' },
  in_progress: { label: 'In Progress', icon: Clock,         cls: 'bg-amber-50 text-amber-600' },
  completed:   { label: 'Completed',   icon: CheckCircle2, cls: 'bg-green-50 text-green-600' },
  declined:    { label: 'Declined',    icon: Flag,         cls: 'bg-red-50 text-red-400' },
}

const STATUS_OPTIONS = Object.keys(STATUS_CONFIG)

function timeAgo(dateString) {
  if (!dateString) return ''
  const diff = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 2) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hrs < 24) return `${hrs}h ago`
  if (days < 30) return `${days}d ago`
  return new Date(dateString).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

function RequestCard({ req, currentUser, onVote, onDelete, onStatus, isAdmin }) {
  const [voting, setVoting] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleVote = async () => {
    if (voting) return
    setVoting(true)
    try {
      await onVote(req.id)
    } finally {
      setVoting(false)
    }
  }

  const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.open

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Vote button */}
        <button
          onClick={handleVote}
          disabled={voting}
          className={`flex flex-col items-center gap-0.5 shrink-0 px-2 py-1.5 rounded-lg border transition-colors ${
            req.has_voted
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
          }`}
          aria-label={req.has_voted ? 'Remove vote' : 'Vote for this feature'}
        >
          <ThumbsUp size={14} className={req.has_voted ? 'fill-current' : ''} />
          <span className="text-xs font-semibold">{req.vote_count}</span>
        </button>

        <div className="flex-1 min-w-0">
          {/* Title + status badge */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 leading-snug">{req.title}</h3>
            <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusCfg.cls}`}>
              <statusCfg.icon size={11} />
              {statusCfg.label}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500 mb-2">
            <span>{req.user_name}</span>
            <span>·</span>
            <span>{timeAgo(req.created_at)}</span>
            <span>·</span>
            <span className="capitalize">{req.category}</span>
            {req.status === 'open' && req.vote_count >= 3 && (
              <>
                <span>·</span>
                <span className="flex items-center gap-0.5 text-amber-600 font-medium">
                  <TrendingUp size={10} /> Trending
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className={`text-sm text-slate-600 ${!expanded && req.description.length > 160 ? 'line-clamp-2' : ''}`}>
            {req.description}
          </p>
          {req.description.length > 160 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-primary hover:text-primary/80 mt-1 flex items-center gap-0.5"
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      </div>

      {/* Admin controls */}
      {isAdmin && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3">
          <select
            value={req.status}
            onChange={e => onStatus(req.id, e.target.value)}
            className="text-xs border border-slate-200 rounded px-2 py-1 text-slate-600 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary/50"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
            ))}
          </select>
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => onDelete(req.id)}
              className="ml-auto flex items-center gap-1 text-xs text-red-400 hover:text-red-600"
            >
              <Trash2 size={12} />
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function Features() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: 'participant' })
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [filter, setFilter] = useState('all') // all | open | planned | in_progress | completed | declined

  const fetchRequests = async () => {
    try {
      const res = await api.get('/feature-requests')
      setRequests(res.data?.requests || [])
    } catch (err) {
      setError('Failed to load feature requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRequests() }, [])

  const handleVote = async (id) => {
    const res = await api.post(`/feature-requests/${id}/vote`)
    setRequests(prev => prev.map(r =>
      r.id === id
        ? { ...r, vote_count: res.data.vote_count, has_voted: res.data.has_voted }
        : r
    ))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    if (!form.title.trim() || !form.description.trim()) {
      setFormError('Title and description are required.')
      return
    }
    setSubmitting(true)
    try {
      const res = await api.post('/feature-requests', form)
      setRequests(prev => [res.data.request, ...prev])
      setForm({ title: '', description: '', category: 'participant' })
      setShowForm(false)
    } catch (err) {
      setFormError('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatus = async (id, status) => {
    try {
      const res = await api.put(`/feature-requests/${id}/status`, { status })
      setRequests(prev => prev.map(r => r.id === id ? res.data.request : r))
    } catch (err) {
      console.error('Failed to update status', err)
    }
  }

  const handleDelete = async (id) => {
    setConfirmDelete(id)
  }

  const confirmDeleteRequest = async () => {
    if (!confirmDelete) return
    try {
      await api.delete(`/feature-requests/${confirmDelete}`)
      setRequests(prev => prev.filter(r => r.id !== confirmDelete))
    } catch (err) {
      console.error('Failed to delete', err)
    } finally {
      setConfirmDelete(null)
    }
  }

  const filtered = requests
    .slice()
    .sort((a, b) => b.vote_count - a.vote_count)
    .filter(r => filter === 'all' ? true : r.status === filter)

  const filterTabs = [
    { value: 'all', label: 'All' },
    { value: 'open', label: 'Open' },
    { value: 'planned', label: 'Planned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'declined', label: 'Declined' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Feature Requests</h1>
          <p className="text-slate-500 mt-1 text-sm">Vote for features you'd like to see, or suggest new ones.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'Suggest a Feature'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Suggest a Feature</h2>
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{formError}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                maxLength={200}
                placeholder="Brief description of the feature"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description <span className="text-red-500">*</span></label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={4}
                placeholder="Explain what this feature should do and why it would be useful..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm font-medium"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormError(null) }}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {filterTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === tab.value
                ? 'bg-primary/10 text-primary'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            {tab.label}
            {tab.value !== 'all' && (
              <span className="ml-1 text-xs opacity-60">
                {requests.filter(r => r.status === tab.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Request list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <BarChart2 size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">
            {filter === 'all'
              ? 'No feature requests yet. Be the first to suggest something!'
              : `No ${filter.replace('_', ' ')} requests yet.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => (
            <RequestCard
              key={req.id}
              req={req}
              currentUser={user}
              onVote={handleVote}
              onDelete={handleDelete}
              onStatus={handleStatus}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Inline delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-2">Delete request?</h3>
            <p className="text-sm text-slate-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteRequest}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
