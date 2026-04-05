import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { CheckCircle, ThumbsUp, Search, X, ChevronLeft, ChevronRight } from 'lucide-react'

const ROLE_COLOURS = {
  participant: 'bg-sky-50 text-sky-600',
  provider: 'bg-violet-50 text-violet-600',
  coordinator: 'bg-amber-50 text-amber-600',
  family: 'bg-emerald-50 text-emerald-600',
  admin: 'bg-slate-100 text-slate-600',
}

const USE_CASE_LABELS = {
  referrals: 'Referrals',
  care_team: 'Care Team',
  goals_tracking: 'Goals Tracking',
  compliance: 'Compliance',
  not_sure: 'Not sure',
  other: 'Other',
}

function TestBadge({ testAccount }) {
  if (!testAccount) return null
  return (
    <span className="inline-flex items-center text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full ml-2">
      TEST
    </span>
  )
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
  const [testAccounts, setTestAccounts] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetchResults() }, [page, hasFeedback, testAccounts])

  const fetchResults = (p = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ page: p, per_page: 20 })
    if (hasFeedback) params.append('has_feedback', hasFeedback)
    if (testAccounts) params.append('test_accounts', testAccounts)
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
  const testCount = results.filter(r => r.feedback?.test_account).length

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Platform Feedback</h1>
          <p className="text-sm text-slate-500 mt-1">
            {total} registrations &bull; {submitted} surveys submitted
            {testCount > 0 && <span className="text-amber-600"> &bull; {testCount} test accounts</span>}
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
          <span className="text-xs text-slate-500">Surveys:</span>
          {[{ v: '', l: 'All' }, { v: 'true', l: 'Submitted' }, { v: 'false', l: 'Pending' }].map(opt => (
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

        <div className="flex gap-2 items-center">
          <span className="text-xs text-slate-500">Accounts:</span>
          {[{ v: '', l: 'All' }, { v: 'true', l: 'Test' }, { v: 'false', l: 'Real' }].map(opt => (
            <button
              key={opt.v}
              onClick={() => { setTestAccounts(opt.v); setPage(1); fetchResults(1) }}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                testAccounts === opt.v
                  ? 'bg-amber-50 border-amber-200 text-amber-700 font-medium'
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
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">Use case</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-16 text-slate-400">Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan={5} className="text-center py-16 text-rose-500">{error}</td></tr>
            ) : results.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-16 text-slate-400">No results found.</td></tr>
            ) : (
              results.map(({ user, feedback }) => (
                <tr
                  key={user.id}
                  onClick={() => feedback && setSelected({ user, feedback })}
                  className={`border-b border-slate-50 last:border-0 transition-colors ${feedback ? 'cursor-pointer hover:bg-slate-50' : 'opacity-50 cursor-default'}`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">{user.full_name}</span>
                      {feedback?.test_account && <TestBadge />}
                    </div>
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
                      ? <span className="text-xs text-slate-700">{USE_CASE_LABELS[feedback.use_case] || feedback.use_case}</span>
                      : <span className="text-slate-400 text-xs">—</span>
                    }
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
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-800">{selected.user.full_name}</h2>
                {selected.feedback.test_account && <TestBadge />}
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={18} />
              </button>
            </div>
            <p className="px-6 text-sm text-slate-500 -mt-3">{selected.user.email}</p>

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

              {/* Q1: Use case */}
              <div className="bg-violet-50 rounded-xl p-4">
                <p className="text-xs text-violet-600 font-semibold mb-1">Would use Care Exchange for</p>
                <p className="text-sm font-semibold text-slate-800">
                  {USE_CASE_LABELS[selected.feedback.use_case] || selected.feedback.use_case}
                  {selected.feedback.use_case === 'other' && selected.feedback.use_case_other && (
                    <span className="text-slate-600 font-normal ml-1">— {selected.feedback.use_case_other}</span>
                  )}
                </p>
              </div>

              {/* Q2: Most useful */}
              {selected.feedback.most_useful && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-2">Most useful thing</p>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 whitespace-pre-wrap">
                    {selected.feedback.most_useful}
                  </p>
                </div>
              )}

              {/* Q3: Waste of time */}
              {selected.feedback.waste_of_time && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-2">Waste of time / unnecessary</p>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 whitespace-pre-wrap">
                    {selected.feedback.waste_of_time}
                  </p>
                </div>
              )}

              {/* Q4: Trust first */}
              {selected.feedback.trust_first && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-2">What they'd trust with real data first</p>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 whitespace-pre-wrap">
                    {selected.feedback.trust_first}
                  </p>
                </div>
              )}

              {/* Q5: Comparison */}
              {selected.feedback.comparison && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-2">Comparison to current way</p>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 whitespace-pre-wrap">
                    {selected.feedback.comparison}
                  </p>
                </div>
              )}

              {/* Q6: Recommend conditions */}
              {selected.feedback.recommend_condition && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-2">What would need to be true to recommend</p>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 whitespace-pre-wrap">
                    {selected.feedback.recommend_condition}
                  </p>
                </div>
              )}

              {/* Q7: Other comments */}
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
                {selected.feedback.test_account && ' · Test account'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
