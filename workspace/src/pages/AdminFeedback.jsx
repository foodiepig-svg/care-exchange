import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { CheckCircle, Star, ThumbsUp, X, ChevronLeft, ChevronRight, Search } from 'lucide-react'

const ROLE_COLOURS = {
  participant: 'bg-sky-50 text-sky-600',
  provider: 'bg-violet-50 text-violet-600',
  coordinator: 'bg-amber-50 text-amber-600',
  family: 'bg-emerald-50 text-emerald-600',
  admin: 'bg-slate-100 text-slate-600',
}

function StarDisplay({ value }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => i + 1).map(n => (
        <Star
          key={n}
          size={14}
          className={n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
        />
      ))}
    </div>
  )
}

function NPSBadge({ value }) {
  if (value === null || value === undefined) return <span className="text-slate-400 text-xs">—</span>
  const colour = value >= 9 ? 'text-emerald-600 bg-emerald-50' : value >= 7 ? 'text-violet-600 bg-violet-50' : 'text-rose-600 bg-rose-50'
  return <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${colour}`}>{value}/10</span>
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

export default function AdminFeedback() {
  const [results, setResults] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [search, setSearch] = useState('')
  const [hasFeedback, setHasFeedback] = useState('')

  // Detail panel
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetchResults() }, [page, hasFeedback])

  const fetchResults = (p = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ page: p, per_page: 20 })
    if (hasFeedback) params.append('has_feedback', hasFeedback)
    api.get(`/feedback/admin?${params}`)
      .then(res => {
        setResults(res.data.results || [])
        setTotal(res.data.total || 0)
        setPages(res.data.pages || 1)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load feedback data')
        setLoading(false)
      })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setResults([]) // clear while loading
    fetchResults(1)
    setPage(1)
  }

  const openUser = (result) => {
    if (!result.feedback) return
    setSelected(result)
  }

  const totalSubmitted = results.filter(r => r.feedback).length

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Early Access Feedback</h1>
          <p className="text-sm text-slate-500 mt-1">{total} registrations &bull; {totalSubmitted} surveys submitted</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 w-64"
            />
          </div>
          <button
            type="submit"
            className="text-sm bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700"
          >
            Search
          </button>
        </form>

        <div className="flex gap-2 items-center">
          <span className="text-xs text-slate-500">Show:</span>
          {[{ v: '', l: 'All' }, { v: 'true', l: 'Submitted' }, { v: 'false', l: 'Not submitted' }].map(opt => (
            <button
              key={opt.v}
              onClick={() => { setHasFeedback(opt.v); setPage(1); fetchResults(1) }}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                hasFeedback === opt.v
                  ? 'bg-violet-50 border-violet-200 text-violet-700 font-medium'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">User</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">Role</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">Registered</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">Survey</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">Rating</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">NPS</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-slate-400">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-rose-500">{error}</td>
              </tr>
            ) : results.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-slate-400">No results found.</td>
              </tr>
            ) : (
              results.map(result => {
                const { user, feedback } = result
                return (
                  <tr
                    key={user.id}
                    onClick={() => openUser(result)}
                    className={`border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50 transition-colors ${!feedback ? 'opacity-50' : ''}`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-800">{user.full_name}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLOURS[user.role] || ROLE_COLOURS.admin}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{formatDate(user.created_at)}</td>
                    <td className="px-5 py-3.5">
                      {feedback
                        ? <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle size={12} /> Submitted</span>
                        : <span className="text-xs text-slate-400">Not submitted</span>
                      }
                    </td>
                    <td className="px-5 py-3.5">
                      {feedback?.rating ? <StarDisplay value={feedback.rating} /> : <span className="text-slate-400 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <NPSBadge value={feedback?.nps} />
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {feedback ? formatDatetime(feedback.created_at) : '—'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!loading && !error && results.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              Page {page} of {pages} &bull; {total} total
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => { const p = page - 1; if (p >= 1) { setPage(p); fetchResults(p) } }}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 hover:bg-slate-50"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => { const p = page + 1; if (p <= pages) { setPage(p); fetchResults(p) } }}
                disabled={page >= pages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 hover:bg-slate-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail slide-over */}
      {selected && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/20" onClick={() => setSelected(null)} aria-hidden="true" />
          <div className="ml-auto w-full max-w-lg bg-white shadow-xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">{selected.user.full_name}</h2>
                <p className="text-sm text-slate-500">{selected.user.email}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Meta */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">Role</p>
                  <p className="text-sm font-medium text-slate-700 capitalize">{selected.user.role}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">Registered</p>
                  <p className="text-sm font-medium text-slate-700">{formatDate(selected.user.created_at)}</p>
                </div>
              </div>

              {selected.feedback ? (
                <>
                  {/* Scores */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-amber-50 rounded-xl p-4">
                      <p className="text-xs text-amber-600 mb-1 font-medium">Rating</p>
                      <StarDisplay value={selected.feedback.rating} />
                    </div>
                    <div className="bg-violet-50 rounded-xl p-4">
                      <p className="text-xs text-violet-600 mb-1 font-medium">NPS Score</p>
                      <NPSBadge value={selected.feedback.nps} />
                    </div>
                  </div>

                  {/* Features tried */}
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-2">Features Tried</p>
                    {selected.feedback.tried_features?.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selected.feedback.tried_features.map(f => (
                          <span key={f} className="text-xs bg-violet-50 text-violet-600 border border-violet-100 px-2 py-1 rounded-full">{f}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic">None reported</p>
                    )}
                  </div>

                  {/* Confusing */}
                  {selected.feedback.confusing && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-2">What was confusing?</p>
                      <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 whitespace-pre-wrap">{selected.feedback.confusing}</p>
                    </div>
                  )}

                  {/* Broken/Missing */}
                  {selected.feedback.broken_missing && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-2">What wasn't working or is missing?</p>
                      <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 whitespace-pre-wrap">{selected.feedback.broken_missing}</p>
                    </div>
                  )}

                  {/* Other */}
                  {selected.feedback.other_comments && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-2">Other comments</p>
                      <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 whitespace-pre-wrap">{selected.feedback.other_comments}</p>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="text-xs text-slate-400">
                    Submitted {formatDatetime(selected.feedback.created_at)}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <p className="text-sm font-medium mb-1">No feedback submitted</p>
                  <p className="text-xs">This user hasn't completed the early access survey yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
