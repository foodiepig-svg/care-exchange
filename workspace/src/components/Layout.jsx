import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  Bell,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Paperclip,
  Search,
  Settings,
  BarChart3,
  HelpCircle,
  LifeBuoy,
} from 'lucide-react'
import { api } from '../services/api'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/providers', icon: Search, label: 'Find Providers', roles: ['participant'] },
  { to: '/referrals', icon: FileText, label: 'Referrals', roles: ['participant', 'coordinator', 'provider'] },
  { to: '/care-record', icon: ShieldCheck, label: 'Care Record', roles: ['participant', 'family'] },
  { to: '/care-team', icon: Users, label: 'Care Team', roles: ['participant', 'family'] },
  { to: '/updates', icon: FileText, label: 'Updates', roles: ['provider', 'coordinator'] },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/documents', icon: Paperclip, label: 'Documents', roles: ['participant', 'family'] },
  { to: '/consent', icon: ShieldCheck, label: 'Consent', roles: ['participant', 'family'] },
  { to: '/app/support', icon: LifeBuoy, label: 'Help & Support', roles: ['participant', 'family', 'provider', 'coordinator'] },
  { to: '/app/help/participant', icon: HelpCircle, label: 'Help', roles: ['participant'] },
  { to: '/app/help/provider', icon: HelpCircle, label: 'Help', roles: ['provider'] },
  { to: '/app/help/coordinator', icon: HelpCircle, label: 'Help', roles: ['coordinator'] },
  { to: '/app/help/family', icon: HelpCircle, label: 'Help', roles: ['family'] },
]

const adminNavItems = [
  { to: '/admin', icon: BarChart3, label: 'Overview', adminOnly: true },
  { to: '/admin/users', icon: Users, label: 'Users', adminOnly: true },
  { to: '/admin/tickets', icon: MessageSquare, label: 'Tickets', adminOnly: true },
  { to: '/admin/settings', icon: Settings, label: 'Settings', adminOnly: true },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/notifications/unread-count')
      .then(res => setNotifCount(res.data.unread_count || 0))
      .catch(() => {})
  }, [])

  const filteredNav = navItems.filter(item =>
    !item.roles || item.roles.includes(user?.role)
  )

  const isAdmin = user?.role === 'admin'
  const allAdminNav = isAdmin ? [...adminNavItems] : []

  return (
    <div className="min-h-screen flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 text-sm">Care Exchange</div>
              <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
            </div>
            <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {filteredNav.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
            {isAdmin && (
              <>
                <div className="pt-4 pb-1 px-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin</span>
                </div>
                {allAdminNav.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/admin'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    <Icon size={18} />
                    {label}
                  </NavLink>
                ))}
              </>
            )}
          </nav>

          {/* User */}
          <div className="px-4 py-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                {user?.full_name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">{user?.full_name}</div>
                <div className="text-xs text-slate-500 truncate">{user?.email}</div>
              </div>
              <button onClick={logout} className="p-1.5 text-slate-400 hover:text-slate-600">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200 px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button className="lg:hidden p-2 text-slate-500" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="hidden lg:block" />
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/notifications')}
                className="relative p-2 text-slate-500 hover:text-slate-700"
              >
                <Bell size={20} />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
