import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { FileText, Users, TrendingUp, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'

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

export default function Dashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [referrals, setReferrals] = useState([])
  const [updates, setUpdates] = useState([])
  const [goals, setGoals] = useState([])
  const [participantsCount, setParticipantsCount] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [referralsRes, updatesRes, goalsRes] = await Promise.all([
          api.get('/referrals'),
          api.get('/updates'),
          user?.role === 'participant' ? api.get('/goals') : Promise.resolve({ data: { goals: [] } }),
        ])
        setReferrals(referralsRes.data?.referrals || [])
        setUpdates(updatesRes.data?.updates || [])
        setGoals(goalsRes.data?.goals || [])
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Fetch participants count for coordinator role
  useEffect(() => {
    if (user?.role === 'coordinator') {
      // Try the dedicated count endpoint first, fall back to list endpoint
      api.get('/participants/me/count')
        .then(r => setParticipantsCount(r.data?.count || 0))
        .catch(() => {
          api.get('/participants')
            .then(r => setParticipantsCount(r.data?.participants?.length || 0))
            .catch(() => setParticipantsCount(0))
        })
    }
  }, [user?.role])

  const activeStatuses = ['sent', 'accepted', 'active']
  const pendingStatuses = ['sent', 'viewed']

  const activeReferrals = referrals.filter(r => activeStatuses.includes(r.status))
  const pendingReferrals = referrals.filter(r => pendingStatuses.includes(r.status))
  const completedReferrals = referrals.filter(r => r.status === 'completed')
  const acceptedReferrals = referrals.filter(r => r.status === 'accepted')

  const uniqueProviderIds = new Set(acceptedReferrals.map(r => r.provider_id))
  const careTeamCount = uniqueProviderIds.size

  // Compute goals progress for participant role
  const totalGoals = goals.length
  const completedGoals = goals.filter(g => g.status === 'completed').length
  const avgProgress = totalGoals > 0 ? Math.round(completedGoals / totalGoals * 100) : 0
  const goalsProgress = totalGoals > 0 ? `${avgProgress}%` : 'No goals'

  const statsConfig = {
    participant: [
      { label: 'Active Referrals', value: activeReferrals.length, icon: FileText, color: 'text-primary' },
      { label: 'Care Team', value: careTeamCount, icon: Users, color: 'text-secondary' },
      { label: 'Goals Progress', value: goalsProgress, icon: TrendingUp, color: 'text-green-600' },
      { label: 'Recent Updates', value: updates.length, icon: Clock, color: 'text-amber-600' },
    ],
    provider: [
      { label: 'Pending Referrals', value: pendingReferrals.length, icon: AlertCircle, color: 'text-amber-600' },
      { label: 'Active Participants', value: activeReferrals.length, icon: Users, color: 'text-primary' },
      { label: 'Updates Sent', value: updates.length, icon: FileText, color: 'text-secondary' },
      { label: 'This Month', value: '0h', icon: Clock, color: 'text-slate-500' }, // TODO: hours tracking requires time_entries table
    ],
    coordinator: [
      { label: 'My Participants', value: participantsCount, icon: Users, color: 'text-primary' },
      { label: 'Active Referrals', value: activeReferrals.length, icon: FileText, color: 'text-secondary' },
      { label: 'Completed', value: completedReferrals.length, icon: CheckCircle2, color: 'text-green-600' },
      { label: 'Pending Actions', value: pendingReferrals.length, icon: Clock, color: 'text-amber-600' },
    ],
  }

  const stats = statsConfig[user?.role] || statsConfig.participant

  const recentReferrals = [...referrals]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3)

  const recentUpdates = [...updates]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3)

  const recentActivity = [
    ...recentReferrals.map(r => ({ ...r, type: 'referral', sortDate: r.created_at })),
    ...recentUpdates.map(u => ({ ...u, type: 'update', sortDate: u.created_at }))
  ]
    .filter(item => item.sortDate)
    .sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate))
    .slice(0, 5)

  const getActivityDescription = (item) => {
    if (item.type === 'referral') {
      return `Referral ${item.status}: ${item.reason || 'No reason provided'}`
    }
    return item.content || 'Update'
  }

  const getActivityIcon = (item) => {
    if (item.type === 'referral') return FileText
    return Clock
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-slate-500 mt-1">Loading your dashboard...</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-20 mb-3"></div>
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
        <p className="text-slate-500 mt-1">Here's what's happening with your care today.</p>
      </div>

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

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Clock size={20} className="text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">No recent activity</p>
            <p className="text-slate-400 text-xs mt-1">Activity will appear here as your care team collaborates</p>
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
