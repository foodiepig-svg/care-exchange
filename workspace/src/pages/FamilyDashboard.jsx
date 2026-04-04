/**
 * FamilyDashboard — Family/Carer view of the participant they support.
 * Shows care team updates, goals at-a-glance, and quick access to Messages / Documents.
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import {
  Users, FileText, MessageSquare, Bell, ShieldCheck,
  ArrowRight, CheckCircle2, Clock, TrendingUp, AlertCircle,
} from 'lucide-react'

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
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

function UpdateCard({ update }) {
  const categoryColors = {
    progress_note: 'bg-blue-50 text-blue-700',
    incident: 'bg-red-50 text-red-700',
    medication: 'bg-amber-50 text-amber-700',
    goal_update: 'bg-green-50 text-green-700',
    general: 'bg-slate-50 text-slate-700',
  }
  const cat = update.category || 'general'
  const colorClass = categoryColors[cat] || categoryColors.general
  const catLabel = cat.replace(/_/g, ' ')

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-start justify-between mb-2">
        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded capitalize ${colorClass}`}>
          {catLabel}
        </span>
        <span className="text-xs text-slate-400">{formatRelativeTime(update.created_at)}</span>
      </div>
      <p className="text-sm text-slate-700 line-clamp-3">{update.content}</p>
      <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
        <Users size={12} />
        <span>{update.provider_name || update.submitted_by_name || 'Provider'}</span>
        {update.participant_name && (
          <>
            <span>·</span>
            <span>{update.participant_name}</span>
          </>
        )}
      </div>
    </div>
  )
}

function GoalCard({ goal }) {
  const progress = goal.progress || 0
  const isCompleted = goal.status === 'completed'
  const statusColors = {
    completed: 'text-green-600',
    active: 'text-blue-600',
    paused: 'text-amber-600',
    discontinued: 'text-slate-500',
  }

  return (
    <div className="bg-white rounded-lg border border-slate-100 p-3">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-slate-700 line-clamp-1">{goal.title}</span>
        {isCompleted && <CheckCircle2 size={12} className="text-green-500 shrink-0" />}
      </div>
      <div className="mb-1.5">
        <div className="w-full bg-slate-100 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${isCompleted ? 'bg-green-400' : 'bg-blue-400'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{progress}%</span>
        {goal.target_date && (
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {new Date(goal.target_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>
    </div>
  )
}

export default function FamilyDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [updates, setUpdates] = useState([])
  const [goals, setGoals] = useState([])
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [threadCount, setThreadCount] = useState(0)
  const [docCount, setDocCount] = useState(0)
  const [participantName, setParticipantName] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [updatesRes, notifsRes, threadsRes, docsRes] = await Promise.allSettled([
          api.get('/updates'),
          api.get('/notifications'),
          api.get('/messages/threads'),
          api.get('/documents'),
        ])

        if (updatesRes.status === 'fulfilled') {
          const all = updatesRes.value.data?.updates || []
          setUpdates(all.slice(0, 6))
        }
        if (notifsRes.status === 'fulfilled') {
          const all = notifsRes.value.data?.notifications || []
          setNotifications(all.slice(0, 5))
          setUnreadCount(all.filter(n => !n.read).length)
        }
        if (threadsRes.status === 'fulfilled') {
          setThreadCount(threadsRes.value.data?.threads?.length || 0)
        }
        if (docsRes.status === 'fulfilled') {
          setDocCount(docsRes.value.data?.documents?.length || 0)
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err)
        setError('Could not load some dashboard data.')
      } finally {
        setLoading(false)
      }
    }

    // Try goals — may fail if family role doesn't have direct goal access
    fetchData()
    api.get('/goals').then(res => {
      setGoals(res.data?.goals?.slice(0, 4) || [])
    }).catch(() => {
      // Family may not have direct goal access — silently skip
    })
  }, [])

  // Resolve participant name from user object or participant record
  useEffect(() => {
    if (user?.full_name) {
      setParticipantName(user.full_name)
    }
  }, [user])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-100 rounded-xl" />
          <div className="h-64 bg-slate-100 rounded-xl" />
        </div>
      </div>
    )
  }

  const stats = [
    {
      icon: FileText,
      label: 'Recent Updates',
      value: updates.length,
      sublabel: 'from care team',
      href: '/updates',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      icon: Bell,
      label: 'Notifications',
      value: unreadCount,
      sublabel: 'unread',
      href: '/notifications',
      color: 'text-amber-600 bg-amber-50',
    },
    {
      icon: MessageSquare,
      label: 'Messages',
      value: threadCount,
      sublabel: 'conversations',
      href: '/messages',
      color: 'text-violet-600 bg-violet-50',
    },
    {
      icon: ShieldCheck,
      label: 'Documents',
      value: docCount,
      sublabel: 'uploaded',
      href: '/documents',
      color: 'text-teal-600 bg-teal-50',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Hello, {user?.full_name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-slate-500 mt-1">
          Here's what's happening with your family member's care.
        </p>
      </div>

      {error && (
        <div role="alert" className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, sublabel, href, color }) => (
          <Link
            key={label}
            to={href}
            className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
              <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500 font-medium">{sublabel}</div>
            <div className="text-sm text-slate-700 font-medium mt-0.5">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent updates from care team */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Care Team Updates</h2>
            <Link to="/updates" className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {updates.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <FileText size={32} className="text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No updates yet</p>
              <p className="text-slate-400 text-xs mt-1">Provider updates will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {updates.map(u => <UpdateCard key={u.id} update={u} />)}
            </div>
          )}
        </div>

        {/* Goals at-a-glance */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Goals</h2>
            <Link to="/goals" className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {goals.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <TrendingUp size={32} className="text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No goals visible</p>
              <p className="text-slate-400 text-xs mt-1">
                {user?.role === 'family'
                  ? 'Goals are managed by the participant and their providers.'
                  : 'No goals have been set yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map(g => <GoalCard key={g.id} goal={g} />)}
            </div>
          )}
        </div>
      </div>

      {/* Recent notifications */}
      {notifications.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Notifications</h2>
            <Link to="/notifications" className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {notifications.map(notif => (
              <div key={notif.id} className="flex items-start gap-3 p-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  notif.type === 'referral_received' ? 'bg-violet-50 text-violet-600' :
                  notif.type === 'message_received' ? 'bg-blue-50 text-blue-600' :
                  notif.type === 'goal_update' ? 'bg-green-50 text-green-600' :
                  'bg-slate-50 text-slate-600'
                }`}>
                  <Bell size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{notif.message || notif.content}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatRelativeTime(notif.created_at)}</p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
