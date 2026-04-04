import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { X, MessageSquare, AlertCircle, Lightbulb, ChevronDown } from 'lucide-react'

const STATUS_CONFIG = {
  open:       { label: 'Open',        color: 'bg-slate-100 text-slate-700' },
  triaged:    { label: 'Triaged',     color: 'bg-amber-100 text-amber-700' },
  in_progress:{ label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  resolved:   { label: 'Resolved',   color: 'bg-emerald-100 text-emerald-700' },
  closed:     { label: 'Closed',     color: 'bg-slate-100 text-slate-500' },
}

const PRIORITY_CONFIG = {
  low:    { label: 'Low',    color: 'bg-slate-100 text-slate-500' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700' },
  high:   { label: 'High',   color: 'bg-rose-100 text-rose-700' },
}

const TYPE_CONFIG = {
  issue:  { label: 'Bug',    color: 'bg-rose-50 text-rose-600' },
  feature:{ label: 'Feature', color: 'bg-violet-50 text-violet-600' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.open
  return <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
}

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low
  return <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
}

function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.issue
  const Icon = type === 'feature' ? Lightbulb : AlertCircle
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
      <Icon size={12} /> {cfg.label}
    </span>
  )
}

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDatetime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminTickets() {
  const [tickets, setTickets] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  // Selected ticket
  const [selected, setSelected] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [patchLoading, setPatchLoading] = useState(false)

  const fetchTickets = (p = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ page: p, per_page: 20 })
    if (typeFilter) params.append('type', typeFilter)
    if (statusFilter) params.append('status', statusFilter)
    if (priorityFilter) params.append('priority', priorityFilter)

    api.get(`/admin/tickets?${params}`)
      .then(res => {
        setTickets(res.data.tickets)
        setTotal(res.data.total)
        setPages(res.data.pages)
        setPage(res.data.page)
        setLoading(false)
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load tickets')
        setLoading(false)
      })
  }

  useEffect(() => { fetchTickets(1) }, [typeFilter, statusFilter, priorityFilter])

  const openTicket = (ticket) => {
    setDetailLoading(true)
    setSelected(ticket)
    setCommentText('')
    api.get(`/admin/tickets/${ticket.id}`)
      .then(res => {
        setSelected(res.data.ticket)
        setDetailLoading(false)
      })
      .catch(() => {
        setDetailLoading(false)
      })
  }

  const handleStatusChange = async (newStatus) => {
    if (!selected) return
    setPatchLoading(true)
    try {
      const res = await api.patch(`/admin/tickets/${selected.id}`, { status: newStatus })
      setSelected(prev => ({ ...prev, ...res.data.ticket }))
      // Update in list too
      setTickets(prev => prev.map(t => t.id === selected.id ? { ...t, ...res.data.ticket } : t))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status')
    } finally {
      setPatchLoading(false)
    }
  }

  const handlePriorityChange = async (newPriority) => {
    if (!selected) return
    setPatchLoading(true)
    try {
      const res = await api.patch(`/admin/tickets/${selected.id}`, { priority: newPriority })
      setSelected(prev => ({ ...prev, ...res.data.ticket }))
      setTickets(prev => prev.map(t => t.id === selected.id ? { ...t, ...res.data.ticket } : t))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update priority')
    } finally {
      setPatchLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!commentText.trim() || !selected) return
    setSubmittingComment(true)
    try {
      const res = await api.post(`/admin/tickets/${selected.id}/comments`, { comment: commentText })
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

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Support Tickets</h1>
            <p className="text-sm text-slate-500 mt-1">{total} ticket{total !== 1 ? 's' : ''} total</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Types</option>
            <option value="issue">Bug</option>
            <option value="feature">Feature</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="triaged">Triaged</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => { setPriorityFilter(e.target.value); setPage(1) }}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          {(typeFilter || statusFilter || priorityFilter) && (
            <button
              onClick={() => { setTypeFilter(''); setStatusFilter(''); setPriorityFilter(''); setPage(1) }}
              className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-400">
              <div className="animate-pulse">Loading tickets...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-48 text-rose-500">{error}</div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <MessageSquare size={32} className="mb-3 opacity-40" />
              <p className="text-sm">No tickets found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left font-semibold text-slate-600 px-4 py-3">Title</th>
                  <th className="text-left font-semibold text-slate-600 px-4 py-3">Type</th>
                  <th className="text-left font-semibold text-slate-600 px-4 py-3">Status</th>
                  <th className="text-left font-semibold text-slate-600 px-4 py-3">Priority</th>
                  <th className="text-left font-semibold text-slate-600 px-4 py-3">Submitted by</th>
                  <th className="text-left font-semibold text-slate-600 px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr
                    key={ticket.id}
                    onClick={() => openTicket(ticket)}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-slate-800 max-w-xs truncate">{ticket.title}</td>
                    <td className="px-4 py-3"><TypeBadge type={ticket.type} /></td>
                    <td className="px-4 py-3"><StatusBadge status={ticket.status} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={ticket.priority} /></td>
                    <td className="px-4 py-3">
                      <span className="text-slate-600">{ticket.user_role}</span>
                      <span className="text-slate-400 ml-1">{ticket.user_name || `#${ticket.user_id}`}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(ticket.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => fetchTickets(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
            >
              Previous
            </button>
            <span className="text-sm text-slate-500">Page {page} of {pages}</span>
            <button
              onClick={() => fetchTickets(page + 1)}
              disabled={page >= pages}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Slide-over panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/20" onClick={() => setSelected(null)} />
          <div className="ml-auto w-full max-w-xl bg-white shadow-xl flex flex-col overflow-hidden">
            {/* Panel header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-slate-200">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <TypeBadge type={selected.type} />
                  <StatusBadge status={selected.status} />
                  <PriorityBadge priority={selected.priority} />
                </div>
                <h2 className="text-lg font-semibold text-slate-800 leading-snug">{selected.title}</h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            {/* Panel body */}
            {detailLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-pulse text-slate-400">Loading...</div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {/* Meta */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Submitted by</p>
                    <p className="font-medium text-slate-700">{selected.user_name || '—'} <span className="text-slate-400 font-normal">({selected.user_role})</span></p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Date</p>
                    <p className="font-medium text-slate-700">{formatDatetime(selected.created_at)}</p>
                  </div>
                  {selected.resolved_at && (
                    <div>
                      <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Resolved at</p>
                      <p className="font-medium text-emerald-700">{formatDatetime(selected.resolved_at)}</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Description</p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selected.description}</p>
                </div>

                {/* Status controls */}
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => handleStatusChange(key)}
                        disabled={patchLoading || selected.status === key}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                          selected.status === key
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                        } disabled:opacity-60`}
                      >
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority controls */}
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Update Priority</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => handlePriorityChange(key)}
                        disabled={patchLoading || selected.priority === key}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                          selected.priority === key
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                        } disabled:opacity-60`}
                      >
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide mb-3">
                    Comments {selected.comments?.length > 0 && `(${selected.comments.length})`}
                  </p>
                  <div className="space-y-4">
                    {selected.comments?.length === 0 && (
                      <p className="text-sm text-slate-400 italic">No comments yet.</p>
                    )}
                    {selected.comments?.map(comment => (
                      <div key={comment.id} className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">
                            {comment.author_name || `User #${comment.author_id}`}
                          </span>
                          <span className="text-xs text-slate-400">{formatDatetime(comment.created_at)}</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{comment.comment}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add comment form */}
                  <div className="mt-4 flex gap-2">
                    <textarea
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      rows={3}
                      className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>
                  <button
                    onClick={handleAddComment}
                    disabled={submittingComment || !commentText.trim()}
                    className="mt-2 text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-emerald-700 transition-colors"
                  >
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}