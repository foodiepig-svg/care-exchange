import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Lightbulb, Plus, X, MessageSquare } from 'lucide-react'

const STATUS_CONFIG = {
  open:        { label: 'Open',        color: 'bg-slate-100 text-slate-700' },
  triaged:     { label: 'Triaged',     color: 'bg-amber-100 text-amber-700' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  resolved:    { label: 'Resolved',    color: 'bg-emerald-100 text-emerald-700' },
  closed:      { label: 'Closed',     color: 'bg-slate-100 text-slate-400' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.open
  return <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function Support() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState('issue')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  // Detail modal
  const [selected, setSelected] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => { fetchTickets() }, [])

  const fetchTickets = () => {
    setLoading(true)
    api.get('/tickets/tickets')
      .then(res => {
        setTickets(res.data.tickets || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load tickets')
        setLoading(false)
      })
  }

  const openTicket = (ticket) => {
    setDetailLoading(true)
    setSelected(ticket)
    setCommentText('')
    api.get(`/tickets/tickets/${ticket.id}`)
      .then(res => {
        setSelected(res.data.ticket)
        setDetailLoading(false)
      })
      .catch(() => setDetailLoading(false))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      setFormError('Title and description are required.')
      return
    }
    setSubmitting(true)
    setFormError(null)
    try {
      const res = await api.post('/tickets/tickets', {
        title: title.trim(),
        description: description.trim(),
        type,
      })
      setTickets(prev => [res.data.ticket, ...prev])
      setSubmitted(true)
      setTitle('')
      setDescription('')
      setType('issue')
      setTimeout(() => {
        setShowForm(false)
        setSubmitted(false)
      }, 2000)
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to submit ticket.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddComment = async () => {
    if (!commentText.trim() || !selected) return
    setSubmittingComment(true)
    try {
      const res = await api.post(`/tickets/tickets/${selected.id}/comments`, { comment: commentText })
      setSelected(prev => ({
        ...prev,
        comments: [...(prev.comments || []), res.data.comment],
      }))
      setCommentText('')
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add comment')
    } finally {
      setSubmittingComment(false)
    }
  }

  const helpGuideTitle = user?.role === 'provider' ? 'Provider Help' :
                         user?.role === 'coordinator' ? 'Coordinator Help' :
                         user?.role === 'family' ? 'Family Help' : 'Help Centre'

  const helpGuidePath = `/app/help/${user?.role === 'family' ? 'family' : user?.role === 'coordinator' ? 'coordinator' : user?.role === 'provider' ? 'provider' : 'participant'}`

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Help & Support</h1>
          <p className="text-sm text-slate-500 mt-1">Submit a bug report or feature request</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(helpGuidePath)}
            className="text-sm text-slate-500 hover:text-slate-700 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            View Help Guide
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> New Ticket
          </button>
        </div>
      </div>

      {/* Submit form — inline, not a modal */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Submit a Ticket</h2>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
              <X size={18} />
            </button>
          </div>

          {submitted && (
            <div className="mb-4 bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-lg border border-emerald-200">
              Ticket submitted! We'll get back to you soon.
            </div>
          )}

          {formError && (
            <div className="mb-4 bg-rose-50 text-rose-700 text-sm px-4 py-3 rounded-lg border border-rose-200">{formError}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
              <div className="flex gap-3">
                {[
                  { value: 'issue', label: 'Bug Report', icon: AlertCircle, color: 'text-rose-600 bg-rose-50 border-rose-200' },
                  { value: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'text-violet-600 bg-violet-50 border-violet-200' },
                ].map(opt => {
                  const Icon = opt.icon
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setType(opt.value)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                        type === opt.value ? opt.color : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <Icon size={16} /> {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={type === 'issue' ? "Brief description of the issue..." : "What would you like to see?"}
                maxLength={200}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-slate-400 mt-1 text-right">{title.length}/200</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={type === 'issue'
                  ? "Describe what happened, what you expected, and any steps to reproduce..."
                  : "Describe the feature and why it would be useful..."}
                rows={5}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-sm text-slate-500 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="text-sm bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* My Tickets */}
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-4">My Tickets</h2>

        {loading ? (
          <div className="flex items-center justify-center h-40 text-slate-400">
            <div className="animate-pulse">Loading your tickets...</div>
          </div>
        ) : error ? (
          <div className="text-rose-500 text-center py-8 text-sm">{error}</div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center py-16 text-slate-400">
            <MessageSquare size={36} className="mb-3 opacity-40" />
            <p className="text-sm font-medium mb-1">No tickets yet</p>
            <p className="text-xs">Submit a bug report or feature request above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map(ticket => (
              <div
                key={ticket.id}
                onClick={() => openTicket(ticket)}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        ticket.type === 'feature' ? 'bg-violet-50 text-violet-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {ticket.type === 'feature' ? <Lightbulb size={11} /> : <AlertCircle size={11} />}
                        {ticket.type === 'feature' ? 'Feature' : 'Bug'}
                      </span>
                      <StatusBadge status={ticket.status} />
                    </div>
                    <p className="font-medium text-slate-800 text-sm leading-snug">{ticket.title}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {ticket.comment_count || 0} comment{ticket.comment_count !== 1 ? 's' : ''} &bull; Submitted {formatDate(ticket.created_at)}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket detail slide-over */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/20" onClick={() => setSelected(null)} />
          <div className="ml-auto w-full max-w-xl bg-white shadow-xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-slate-200">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                    selected.type === 'feature' ? 'bg-violet-50 text-violet-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {selected.type === 'feature' ? <Lightbulb size={12} /> : <AlertCircle size={12} />}
                    {selected.type === 'feature' ? 'Feature Request' : 'Bug Report'}
                  </span>
                  <StatusBadge status={selected.status} />
                </div>
                <h2 className="text-lg font-semibold text-slate-800 leading-snug">{selected.title}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            {detailLoading ? (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="animate-pulse">Loading...</div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {/* Meta */}
                <div className="text-sm text-slate-500">
                  Submitted {formatTime(selected.created_at)}
                  {selected.resolved_at && <span className="ml-3 text-emerald-600">Resolved {formatDate(selected.resolved_at)}</span>}
                </div>

                {/* Description */}
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-2">Description</p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selected.description}</p>
                </div>

                {/* Comments */}
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-3">
                    Comments {selected.comments?.length > 0 && `(${selected.comments.length})`}
                  </p>
                  <div className="space-y-4">
                    {selected.comments?.length === 0 && (
                      <p className="text-sm text-slate-400 italic">No comments yet.</p>
                    )}
                    {selected.comments?.map(comment => (
                      <div key={comment.id} className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">{comment.author_name || 'You'}</span>
                          <span className="text-xs text-slate-400">{formatTime(comment.created_at)}</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{comment.comment}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add comment */}
                  <div className="mt-4">
                    <textarea
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      rows={3}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={submittingComment || !commentText.trim()}
                      className="mt-2 text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-emerald-700 transition-colors"
                    >
                      {submittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}