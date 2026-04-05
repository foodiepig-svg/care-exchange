import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { CheckCircle, ThumbsUp, CreditCard, Package, X, ChevronLeft, ChevronRight, Search } from 'lucide-react'

const ROLE_COLOURS = {
  participant: 'bg-sky-50 text-sky-600',
  provider: 'bg-violet-50 text-violet-600',
  coordinator: 'bg-amber-50 text-amber-600',
  family: 'bg-emerald-50 text-emerald-600',
  admin: 'bg-slate-100 text-slate-600',
}

const WOULD_USE_LABELS = {
  yes_regaily: 'Yes — regular use',
  yes_sometimes: 'Yes — occasional',
  maybe_not: 'Probably not',
  no: 'No',
}
const WOULD_PAY_LABELS = {
  yes_monthly: 'Yes — monthly sub',
  yes_once: 'Yes — one-time',
  maybe: 'Maybe (if X)',
  no: 'No',
}

function VerdictBadge({ feedback }) {
  if (!feedback) return <span className="text-slate-400 text-xs">—</span>
  const use = feedback.would_use
  const pay = feedback.would_pay
  const isHot = (use === 'yes_regaily' || use === 'yes_sometimes') && (pay !== 'no')
  const isCold = use === 'no' || pay === 'no'
  if (isHot) return <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full"><ThumbsUp size={10} /> Interested</span>
  if (isCold) return <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Low interest</span>
  return <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Conditional</span>
}

function PayBadge({ value }) {
  const map = { yes_monthly: 'Monthly', yes_once: 'One-time', maybe: 'Conditional', no: 'No' }
  const colours = { yes_monthly: 'bg-emerald-50 text-emerald-600', yes_once: 'bg-emerald-50 text-emerald-600', maybe: 'bg-amber-50 text-amber-600', no: 'bg-rose-50 text-rose-600' }
  if (!value) return <span className="text-slate-400 text-xs">—</span>
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colours[value] || ''}`}>{map[value] || value}</span>
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
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
  const [hasFeedback, setHasFeedback] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetchResults() }, [page, hasFeedback])

  const fetchResults = (p = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ page: p, per_page: 20 })
    if (hasFeedback) params.append('has_feedback', hasFeedback)
    if (search.trim()) params.append('search', search.trim())
    api.get(`/feedback/admin?${params}`)
      .then(res => {
        setResults(res.data.results || [])
        setTotal(res.data.total || 0)
        setPages(res.data.pages || 1)
        setLoading(false)
      })
      .catch(() => { setError('Failed to load feedback data'); setLoading(false) })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchResults(1)
  }

  const submitted = results.filter(r => r.feedback).length
  const interested = results.filter(r => {
    const f = r.feedback
    if (!f) return false
    return (f.would_use === 'yes_regaily' || f.would_use === 'yes_sometimes') && f.would_pay !== 'no'
  }).length

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Early Access Feedback</h1>
          <p className="text-sm text-slate-500 mt-1">
            {total} registrations &bull; {submitted} surveys &bull;{' '}
            <span className="text-emerald-600 font-medium">{interested} interested</span>
          </p>
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
          <button type="submit" className="text-sm bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700">Search</button>
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

      {/* Summary cards */}
      {!loading && !error && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-slate-800">{total}</div>
            <div className="text-xs text-slate-500 mt-0.5">Total registrations</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-violet-600">{submitted}</div>
            <div className="text-xs text-slate-500 mt-0.5">Surveys completed</div>
          </div>
          <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4 text-center">
            <div className="text-2xl font-bold text-emerald-700">{interested}</div>
            <div className="text-xs text-emerald-600 mt-0.5">Would use &amp; pay</div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">User</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">Role</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">Registered</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">Survey</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">Would use</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">Would pay</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">Verdict</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-16 text-slate-400">Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan={7} className="text-center py-16 text-rose-500">{error}</td></tr>
            ) : results.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-16 text-slate-400">No results found.</td></tr>
            ) : (
              results.map(({ user, feedback }) => (
                <tr
                  key={user.id}
                  onClick={() => feedback && setSelected({ user, feedback })}
                  className={`border-b border-slate-50 last:border-0 transition-colors ${feedback ? 'cursor-pointer hover:bg-slate-50' : 'opacity-50 cursor-default'}`}
                >
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-slate-800">{user.full_name}</div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full capitalize ${ROLE_COLOURS[user.role] || ''}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">{formatDate(user.created_at)}</td>
                  <td className="px-5 py-3.5">
                    {feedback
                      ? <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle size={12} /> Done</span>
                      : <span className="text-xs text-slate-400">Pending</span>
                    }
                  </td>
                  <td className="px-5 py-3.5">
                    {feedback
                      ? <span className="text-xs text-slate-700">{WOULD_USE_LABELS[feedback.would_use] || feedback.would_use}</span>
                      : <span className="text-slate-400 text-xs">—</span>
                    }
                  </td>
                  <td className="px-5 py-3.5">
                    <PayBadge value={feedback?.would_pay} />
                  </td>
                  <td className="px-5 py-3.5">
                    <VerdictBadge feedback={feedback} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!loading && !error && results.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">Page {page} of {pages} &bull; {total} total</span>
            <div className="flex gap-2">
              <button onClick={() => { const p = page - 1; if (p >= 1) { setPage(p); fetchResults(p) } }} disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 hover:bg-slate-50">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => { const p = page + 1; if (p <= pages) { setPage(p); fetchResults(p) } }} disabled={page >= pages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 hover:bg-slate-50">
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
            <div className="flex items-start justify-between px-6 py-5 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">{selected.user.full_name}</h2>
                <p className="text-sm text-slate-500">{selected.user.email}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Meta */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">Role</p>
                  <p className="text-sm font-medium text-slate-700 capitalize">{selected.user.role}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">Registered</p>
                  <p className="text-sm font-medium text-slate-700">{formatDate(selected.user.created_at)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`rounded-xl p-4 ${selected.feedback.would_use === 'no' || !selected.feedback.would_use ? 'bg-rose-50' : 'bg-emerald-50'}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <ThumbsUp size={13} className="text-slate-400" />
                    <p className="text-xs text-slate-500">Would use?</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    {WOULD_USE_LABELS[selected.feedback.would_use] || selected.feedback.would_use || '—'}
                  </p>
                </div>
                <div className={`rounded-xl p-4 ${selected.feedback.would_pay === 'no' ? 'bg-rose-50' : 'bg-violet-50'}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <CreditCard size={13} className="text-slate-400" />
                    <p className="text-xs text-slate-500">Would pay?</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    {WOULD_PAY_LABELS[selected.feedback.would_pay] || selected.feedback.would_pay || '—'}
                  </p>
                </div>
              </div>

              {selected.feedback.pay_amount && (
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-xs text-amber-700 font-medium mb-1">Amount they'd pay</p>
                  <p className="text-sm text-amber-800">{selected.feedback.pay_amount}</p>
                </div>
              )}

              {selected.feedback.top_feature && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-2">
                    <Package size={11} className="inline mr-1" />
                    What would make it worth it?
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 whitespace-pre-wrap">
                    {selected.feedback.top_feature}
                  </p>
                </div>
              )}

              {selected.feedback.top_frustration && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-2">
                    What would tip them into paying?
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 whitespace-pre-wrap">
                    {selected.feedback.top_frustration}
                  </p>
                </div>
              )}

              {selected.feedback.other_comments && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-2">Other comments</p>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 whitespace-pre-wrap">
                    {selected.feedback.other_comments}
                  </p>
                </div>
              )}

              <div className="text-xs text-slate-400 pt-2 border-t border-slate-100">
                Submitted {formatDatetime(selected.feedback.created_at)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
