import { useState, useEffect } from 'react'
import { api } from '../services/api'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchUsers = (p = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ page: p })
    if (search) params.append('search', search)
    if (roleFilter) params.append('role', roleFilter)
    if (activeFilter) params.append('is_active', activeFilter)

    api.get(`/admin/users?${params}`)
      .then(res => {
        setUsers(res.data.users)
        setTotal(res.data.total)
        setPages(res.data.pages)
        setPage(res.data.page)
        setLoading(false)
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load users')
        setLoading(false)
      })
  }

  useEffect(() => { fetchUsers() }, [roleFilter, activeFilter])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchUsers(1)
  }

  const handleSuspend = async (user) => {
    if (!confirm(`Suspend ${user.full_name || user.email}?`)) return
    setActionLoading(true)
    try {
      await api.put(`/admin/users/${user.id}/status`, { is_active: false })
      fetchUsers(page)
      setSelectedUser(null)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user')
    } finally {
      setActionLoading(false)
    }
  }

  const handleActivate = async (user) => {
    setActionLoading(true)
    try {
      await api.put(`/admin/users/${user.id}/status`, { is_active: true })
      fetchUsers(page)
      setSelectedUser(null)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user')
    } finally {
      setActionLoading(false)
    }
  }

  const handleChangeRole = async (user, newRole) => {
    if (!confirm(`Change ${user.full_name || user.email} role to "${newRole}"?`)) return
    setActionLoading(true)
    try {
      await api.put(`/admin/users/${user.id}/role`, { role: newRole })
      fetchUsers(page)
      setSelectedUser(null)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update role')
    } finally {
      setActionLoading(false)
    }
  }

  const roles = ['participant', 'family', 'provider', 'coordinator', 'admin']

  const roleBadgeColor = (role) => {
    const colors = {
      participant: 'bg-teal-50 text-teal-700',
      family: 'bg-blue-50 text-blue-700',
      provider: 'bg-violet-50 text-violet-700',
      coordinator: 'bg-amber-50 text-amber-700',
      admin: 'bg-red-50 text-red-700',
    }
    return colors[role] || 'bg-slate-100 text-slate-600'
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="text-sm text-slate-500 mt-1">{total} total users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button type="submit" className="bg-teal-600 text-white px-3 py-1.5 rounded text-sm hover:bg-teal-700">
            Search
          </button>
        </form>

        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
          className="border border-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">All Roles</option>
          {roles.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
        </select>

        <select
          value={activeFilter}
          onChange={e => { setActiveFilter(e.target.value); setPage(1) }}
          className="border border-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs text-slate-500 uppercase">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{user.full_name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${roleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.verified ? (
                        <span className="inline-flex items-center text-xs text-green-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-1.5"></span>Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-teal-600 hover:text-teal-800 text-xs font-medium"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-400">No users found.</td></tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {pages > 1 && (
              <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-sm">
                <span className="text-slate-500">Page {page} of {pages}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setPage(p => Math.max(1, p - 1)); fetchUsers(page - 1) }}
                    disabled={page <= 1}
                    className="px-3 py-1 border rounded text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => { setPage(p => Math.min(pages, p + 1)); fetchUsers(page + 1) }}
                    disabled={page >= pages}
                    className="px-3 py-1 border rounded text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User detail modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{selectedUser.full_name || '—'}</h3>
                <p className="text-sm text-slate-500">{selectedUser.email}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>

            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between">
                <span className="text-slate-500">Role</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${roleBadgeColor(selectedUser.role)}`}>
                  {selectedUser.role}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verified</span>
                <span className="text-slate-900">{selectedUser.verified ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Joined</span>
                <span className="text-slate-900">{new Date(selectedUser.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-500 font-medium uppercase mb-2">Change Role</p>
              <div className="flex flex-wrap gap-2">
                {roles.filter(r => r !== selectedUser.role).map(r => (
                  <button
                    key={r}
                    onClick={() => handleChangeRole(selectedUser, r)}
                    disabled={actionLoading}
                    className="px-3 py-1.5 border border-slate-200 rounded text-xs capitalize hover:bg-slate-50 disabled:opacity-50"
                  >
                    Make {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              {selectedUser.verified ? (
                <button
                  onClick={() => handleSuspend(selectedUser)}
                  disabled={actionLoading}
                  className="w-full bg-red-50 text-red-600 border border-red-200 rounded-lg py-2 text-sm font-medium hover:bg-red-100 disabled:opacity-50"
                >
                  Suspend User
                </button>
              ) : (
                <button
                  onClick={() => handleActivate(selectedUser)}
                  disabled={actionLoading}
                  className="w-full bg-teal-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
                >
                  Activate User
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
