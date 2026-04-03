import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { Users, FileText, Clock, Mail, UserPlus, ArrowRight, Plus, List } from 'lucide-react'

function formatRelativeTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export default function CoordinatorDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [participants, setParticipants] = useState([])
  const [referrals, setReferrals] = useState([])
  const [updates, setUpdates] = useState([])
  const [threads, setThreads] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [participantsRes, referralsRes, updatesRes, threadsRes] = await Promise.all([
          api.get('/participants'),
          api.get('/referrals'),
          api.get('/updates'),
          api.get('/messages/threads')
        ])
        setParticipants(participantsRes.data?.participants || [])
        setReferrals(referralsRes.data?.referrals || [])
        setUpdates(updatesRes.data?.updates || [])
        setThreads(threadsRes.data?.threads || [])
      } catch (err) {
        console.error('Failed to fetch coordinator dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Stats calculations
  const activeReferrals = referrals.filter(r => ['sent', 'accepted', 'active'].includes(r.status))
  const pendingUpdates = updates.filter(u => u.status === 'pending' || u.status === 'draft')
  const unreadMessages = threads.filter(t => t.unread_count > 0 || t.is_unread)

  const stats = [
    { label: 'Total Participants', value: participants.length, icon: Users, color: 'text-primary' },
    { label: 'Active Referrals', value: activeReferrals.length, icon: FileText, color: 'text-secondary' },
    { label: 'Pending Updates', value: pendingUpdates.length, icon: Clock, color: 'text-amber-600' },
    { label: 'Unread Messages', value: unreadMessages.length, icon: Mail, color: 'text-rose-600' },
  ]

  // Build recent activity from all sources
  const recentReferrals = [...referrals]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3)

  const recentUpdates = [...updates]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3)

  const recentMessages = [...(threads || [])]
    .sort((a, b) => new Date(b.last_message_at || b.updated_at) - new Date(a.last_message_at || a.updated_at))
    .slice(0, 3)

  const recentActivity = [
    ...recentReferrals.map(r => ({ ...r, type: 'referral', sortDate: r.created_at })),
    ...recentUpdates.map(u => ({ ...u, type: 'update', sortDate: u.created_at })),
    ...recentMessages.map(t => ({ ...t, type: 'message', sortDate: t.last_message_at || t.updated_at }))
  ]
    .filter(item => item.sortDate)
    .sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate))
    .slice(0, 6)

  const getActivityDescription = (item) => {
    if (item.type === 'referral') {
      return `Referral ${item.status}: ${item.reason || 'No reason provided'}`
    }
    if (item.type === 'update') {
      return item.content || 'Status update'
    }
    if (item.type === 'message') {
      return `Message from ${item.participant_name || item.sender_name || 'Unknown'}: ${item.last_message || 'New message'}`
    }
    return 'Activity'
  }

  const getActivityIcon = (item) => {
    if (item.type === 'referral') return FileText
    if (item.type === 'update') return Clock
    return Mail
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Coordinator Dashboard</h1>
          <p className="text-slate-500 mt-1">Loading your caseload overview...</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-24 mb-3"></div>
              <div className="h-8 bg-slate-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.full_name?.split(' ')[0]}
        </h1>
        <p className="text-slate-500 mt-1">Here's your caseload overview.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className={color}><Icon size={20} /></span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-sm text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <a
          href="/app/participants/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          <UserPlus size={16} />
          Add Participant
        </a>
        <a
          href="/app/referrals/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          Create Referral
        </a>
        <a
          href="/app/participants"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
        >
          <List size={16} />
          View All Participants
        </a>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Clock size={20} className="text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">No recent activity</p>
            <p className="text-slate-400 text-xs mt-1">Activity will appear here as your participants receive care</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((item, idx) => {
              const Icon = getActivityIcon(item)
              return (
                <div key={`${item.type}-${item.id}-${idx}`} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 truncate">{getActivityDescription(item)}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{formatRelativeTime(item.sortDate)}</p>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 flex-shrink-0 mt-2" />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
