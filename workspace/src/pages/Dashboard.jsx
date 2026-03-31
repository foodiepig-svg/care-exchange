import { useAuth } from '../context/AuthContext'
import { FileText, Users, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

const roleStats = {
  participant: [
    { label: 'Active Referrals', value: '0', icon: FileText, color: 'text-primary' },
    { label: 'Care Team', value: '0', icon: Users, color: 'text-secondary' },
    { label: 'Goals Progress', value: '0%', icon: TrendingUp, color: 'text-green-600' },
    { label: 'Recent Updates', value: '0', icon: Clock, color: 'text-amber-600' },
  ],
  provider: [
    { label: 'Pending Referrals', value: '0', icon: AlertCircle, color: 'text-amber-600' },
    { label: 'Active Participants', value: '0', icon: Users, color: 'text-primary' },
    { label: 'Updates Sent', value: '0', icon: FileText, color: 'text-secondary' },
    { label: 'This Month', value: '0h', icon: Clock, color: 'text-slate-500' },
  ],
  coordinator: [
    { label: 'My Participants', value: '0', icon: Users, color: 'text-primary' },
    { label: 'Active Referrals', value: '0', icon: FileText, color: 'text-secondary' },
    { label: 'Completed', value: '0', icon: CheckCircle2, color: 'text-green-600' },
    { label: 'Pending Actions', value: '0', icon: Clock, color: 'text-amber-600' },
  ],
}

export default function Dashboard() {
  const { user } = useAuth()
  const stats = roleStats[user?.role] || roleStats.participant

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.full_name?.split(' ')[0]}
        </h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your care today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className={`${color}`}><Icon size={20} /></span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-sm text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Activity feed placeholder */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Recent Activity</h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <Clock size={20} className="text-slate-400" />
          </div>
          <p className="text-slate-500 text-sm">No recent activity</p>
          <p className="text-slate-400 text-xs mt-1">Activity will appear here as your care team collaborates</p>
        </div>
      </div>
    </div>
  )
}
