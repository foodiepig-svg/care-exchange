import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import {
  FileText,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  Target,
  Paperclip,
  Bell
} from 'lucide-react'

const typeIcons = {
  referral_received: { icon: FileText, color: 'text-teal-600 bg-teal-50' },
  referral_accepted: { icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
  update_received: { icon: FileText, color: 'text-blue-600 bg-blue-50' },
  message_received: { icon: MessageSquare, color: 'text-violet-600 bg-violet-50' },
  consent_request: { icon: ShieldCheck, color: 'text-amber-600 bg-amber-50' },
  goal_approaching: { icon: Target, color: 'text-amber-600 bg-amber-50' },
  document_shared: { icon: Paperclip, color: 'text-slate-600 bg-slate-50' }
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function Notifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
  }, [])

  async function loadNotifications() {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data.notifications || [])
      setUnreadCount(res.data.unread_count || 0)
    } catch (err) {
      console.error('Failed to load notifications', err)
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(id, link) {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      if (link) navigate(link)
    } catch (err) {
      console.error('Failed to mark as read', err)
    }
  }

  async function markAllRead() {
    try {
      await api.post('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all as read', err)
    }
  }

  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-lg w-fit">
        {['all', 'unread'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filter === f
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {f === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Bell size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(notif => {
            const { icon: Icon, color } = typeIcons[notif.type] || { icon: Bell, color: 'text-slate-600 bg-slate-50' }
            return (
              <div
                key={notif.id}
                onClick={() => !notif.read && markAsRead(notif.id, notif.link)}
                className={`bg-white rounded-xl border border-slate-200 p-4 cursor-pointer transition-all hover:shadow-sm ${
                  !notif.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
                }`}
              >
                <div className="flex gap-3">
                  <div className={`p-2 rounded-lg ${color} flex-shrink-0`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-sm font-medium ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {timeAgo(notif.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{notif.body}</p>
                    {!notif.read && (
                      <span className="inline-block mt-2 text-xs text-primary font-medium">
                        Click to mark as read
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
