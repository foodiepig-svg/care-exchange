import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { FileText, Loader2, Clock, Users, MessageSquare, ArrowRight, Send, Search } from 'lucide-react'

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

export default function ProviderDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [referrals, setReferrals] = useState([])
  const [updates, setUpdates] = useState([])
  const [threads, setThreads] = useState([])
  const [stats, setStats] = useState({
    activeReferrals: 0,
    pendingUpdates: 0,
    unreadMessages: 0,
    monthlyParticipants: 0
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [referralsRes, updatesRes, threadsRes] = await Promise.all([
          api.get('/referrals'),
          api.get('/updates'),
          api.get('/messages/threads')
        ])

        const referralsData = referralsRes.data?.referrals || []
        const updatesData = updatesRes.data?.updates || []
        const threadsData = threadsRes.data?.threads || []

        setReferrals(referralsData)
        setUpdates(updatesData)
        setThreads(threadsData)

        // Calculate stats
        const activeReferrals = referralsData.filter(r =>
          ['sent', 'accepted', 'active'].includes(r.status)
        ).length

        const pendingUpdates = updatesData.filter(u =>
          ['draft', 'pending', 'submitted'].includes(u.status)
        ).length

        const unreadMessages = threadsData.reduce((count, thread) =>
          count + (thread.unread_count || 0), 0
        )

        // This month participants - unique participants from accepted/active referrals
        const thisMonth = new Date()
        const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1)
        const monthlyParticipants = [...new Set(
          referralsData
            .filter(r => r.status === 'accepted' && new Date(r.created_at) >= monthStart)
            .map(r => r.participant_id)
        )].length

        setStats({
          activeReferrals,
          pendingUpdates,
          unreadMessages,
          monthlyParticipants
        })
      } catch (err) {
        console.error('Failed to fetch provider dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Recent activity: combine referrals and updates
  const recentActivity = [
    ...referrals.map(r => ({ ...r, type: 'referral', sortDate: r.created_at || r.updated_at })),
    ...updates.map(u => ({ ...u, type: 'update', sortDate: u.created_at }))
  ]
    .filter(item => item.sortDate)
    .sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate))
    .slice(0, 5)

  const getActivityDescription = (item) => {
    if (item.type === 'referral') {
      return `Referral ${item.status}: ${item.reason || 'No reason provided'}`
    }
    return item.content || 'Update submitted'
  }

  const getActivityIcon = (item) => {
    if (item.type === 'referral') return FileText
    return Send
  }

  const statCards = [
    { label: 'Active Referrals', value: stats.activeReferrals, icon: FileText, color: 'text-primary' },
    { label: 'Pending Updates', value: stats.pendingUpdates, icon: Clock, color: 'text-amber-600' },
    { label: 'Unread Messages', value: stats.unreadMessages, icon: MessageSquare, color: 'text-secondary' },
    { label: "This Month's Participants", value: stats.monthlyParticipants, icon: Users, color: 'text-green-600' }
  ]

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Provider Portal</h1>
          <p className="text-slate-500 mt-1">Loading your dashboard...</p>
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
          Provider Portal
        </h1>
        <p className="text-slate-500 mt-1">Manage your referrals and care updates.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
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
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => navigate('/provider/referrals/received')}
            className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <FileText size={18} />
            View Received Referrals
          </button>
          <button
            onClick={() => navigate('/provider-send-updates')}
            className="flex items-center justify-center gap-2 bg-secondary text-white px-4 py-3 rounded-lg hover:bg-secondary/90 transition-colors"
          >
            <Send size={18} />
            Submit Update
          </button>
          <button
            onClick={() => navigate('/provider/participant/lookup')}
            className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-3 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Search size={18} />
            Lookup Participant
          </button>
        </div>
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
            <p className="text-slate-400 text-xs mt-1">Your referrals and updates will appear here</p>
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
