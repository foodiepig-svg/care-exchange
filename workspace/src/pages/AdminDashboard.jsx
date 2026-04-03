import { useState, useEffect } from 'react'
import { api } from '../services/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => { setStats(res.data); setLoading(false) })
      .catch(err => { setError(err.response?.data?.error || 'Failed to load stats'); setLoading(false) })
  }, [])

  if (loading) return <div className="p-6 text-slate-500">Loading...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!stats) return null

  const cards = [
    { label: 'Total Users', value: stats.total_users, color: 'border-teal-500' },
    { label: 'New This Week', value: stats.new_users_week, color: 'border-violet-500' },
    { label: 'Active Referrals', value: stats.active_referrals, color: 'border-amber-500' },
    { label: 'Total Updates', value: stats.total_updates, color: 'border-slate-400' },
  ]

  const roleLabels = { participant: 'Participants', family: 'Families', provider: 'Providers', coordinator: 'Coordinators', admin: 'Admins' }
  const statusLabels = {
    draft: 'Draft', sent: 'Sent', viewed: 'Viewed',
    accepted: 'Accepted', declined: 'Declined', active: 'Active',
    on_hold: 'On Hold', completed: 'Completed'
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Care Exchange Admin</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className={`bg-white rounded-lg border-l-4 ${c.color} border border-slate-200 p-4 shadow-sm`}>
            <div className="text-3xl font-bold text-slate-900">{c.value}</div>
            <div className="text-sm text-slate-500 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by role */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Users by Role</h2>
          <div className="space-y-3">
            {Object.entries(stats.users_by_role).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{roleLabels[role] || role}</span>
                <span className="text-sm font-medium text-slate-900">{count}</span>
              </div>
            ))}
            {Object.keys(stats.users_by_role).length === 0 && (
              <p className="text-sm text-slate-400">No users yet.</p>
            )}
          </div>
        </div>

        {/* Referrals by status */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Referrals by Status</h2>
          <div className="space-y-3">
            {Object.entries(stats.referrals_by_status).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{statusLabels[status] || status}</span>
                <span className="text-sm font-medium text-slate-900">{count}</span>
              </div>
            ))}
            {Object.keys(stats.referrals_by_status).length === 0 && (
              <p className="text-sm text-slate-400">No referrals yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent signups */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Recent Signups</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 uppercase border-b border-slate-100">
              <th className="pb-2">Name</th>
              <th className="pb-2">Email</th>
              <th className="pb-2">Role</th>
              <th className="pb-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {stats.recent_signups.map(u => (
              <tr key={u.id} className="border-b border-slate-50 last:border-0">
                <td className="py-2 text-slate-900 font-medium">{u.full_name || '—'}</td>
                <td className="py-2 text-slate-600">{u.email}</td>
                <td className="py-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-700 capitalize">
                    {u.role}
                  </span>
                </td>
                <td className="py-2 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {stats.recent_signups.length === 0 && (
              <tr><td colSpan="4" className="py-4 text-center text-slate-400">No signups yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
