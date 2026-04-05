import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import {
  FileText, Users, TrendingUp, Clock, CheckCircle2, AlertCircle, ArrowRight,
  Target, Plus, X, Check, Calendar, Edit2, Trash2, ChevronDown, ChevronUp,
  AlertTriangle
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

function formatDate(dateString) {
  if (!dateString) return null
  return new Date(dateString).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ─── Goals ──────────────────────────────────────────────────────────────────────

const GOAL_STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  paused: 'bg-amber-100 text-amber-700',
  discontinued: 'bg-slate-100 text-slate-700',
}

const GOAL_CATEGORIES = [
  { value: 'daily_living', label: 'Daily Living' },
  { value: 'social', label: 'Social' },
  { value: 'health', label: 'Health' },
  { value: 'employment', label: 'Employment' },
  { value: 'education', label: 'Education' },
  { value: 'transport', label: 'Transport' },
  { value: 'other', label: 'Other' },
]

const GOAL_STATUSES = ['active', 'completed', 'paused', 'discontinued']

// ─── Care Plans ─────────────────────────────────────────────────────────────────

const CARE_PLAN_STATUS_COLORS = {
  draft: 'bg-slate-100 text-slate-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  on_hold: 'bg-amber-100 text-amber-700',
}

const CARE_PLAN_STATUS_LABELS = {
  draft: 'Draft',
  active: 'Active',
  completed: 'Completed',
  on_hold: 'On Hold',
}

const CARE_PLAN_CATEGORIES = [
  { value: 'medical', label: 'Medical' },
  { value: 'therapy', label: 'Therapy' },
  { value: 'home_care', label: 'Home Care' },
  { value: 'transport', label: 'Transport' },
  { value: 'social', label: 'Social' },
  { value: 'other', label: 'Other' },
]

const CARE_PLAN_STATUSES = ['draft', 'active', 'completed', 'on_hold']
const EMPTY_SUPPORT = { category: 'other', description: '', frequency: '', provider_id: '' }

// ─── Main Dashboard ─────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  // Referral / activity state
  const [referrals, setReferrals] = useState([])
  const [updates, setUpdates] = useState([])

  // Goals state
  const [goals, setGoals] = useState([])
  const [goalStats, setGoalStats] = useState({ total: 0, active: 0, completed: 0, overallProgress: 0 })
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editingGoalId, setEditingGoalId] = useState(null)
  const [goalForm, setGoalForm] = useState({ title: '', description: '', category: 'daily_living', target_date: '' })
  const [goalProgressUpdate, setGoalProgressUpdate] = useState({})
  const [deletingGoalId, setDeletingGoalId] = useState(null)
  const [goalHistory, setGoalHistory] = useState({})
  const [historyLoading, setHistoryLoading] = useState({})
  const [historyOpen, setHistoryOpen] = useState({})
  const [goalFormError, setGoalFormError] = useState(null)

  // Care Plans state
  const [carePlans, setCarePlans] = useState([])
  const [planFilter, setPlanFilter] = useState('all')
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [editingPlanId, setEditingPlanId] = useState(null)
  const [planForm, setPlanForm] = useState({ title: '', description: '', start_date: '', end_date: '', status: 'draft', supports: [], review_notes: '' })
  const [planFormError, setPlanFormError] = useState(null)
  const [planSubmitting, setPlanSubmitting] = useState(false)
  const [deletePlanId, setDeletePlanId] = useState(null)
  const [expandedPlanId, setExpandedPlanId] = useState(null)

  // Shared alert
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [refsRes, updatesRes, goalsRes, plansRes] = await Promise.all([
        api.get('/referrals'),
        api.get('/updates'),
        api.get('/goals'),
        api.get('/care_plans'),
      ])
      setReferrals(refsRes.data?.referrals || [])
      setUpdates(updatesRes.data?.updates || [])
      setGoals(goalsRes.data?.goals || [])
      setGoalStats(computeGoalStats(goalsRes.data?.goals || []))
      setCarePlans(plansRes.data?.care_plans || [])
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const computeGoalStats = (goalList) => ({
    total: goalList.length,
    active: goalList.filter(g => g.status === 'active').length,
    completed: goalList.filter(g => g.status === 'completed').length,
    overallProgress: goalList.length > 0
      ? Math.round(goalList.reduce((sum, g) => sum + (g.progress || 0), 0) / goalList.length)
      : 0,
  })

  // ── Goals handlers ──────────────────────────────────────────────────────────

  const handleGoalSubmit = async (e) => {
    e.preventDefault()
    setGoalFormError(null)
    if (!goalForm.title.trim()) { setGoalFormError('Title is required'); return }
    try {
      if (editingGoalId) {
        const res = await api.put(`/goals/${editingGoalId}`, goalForm)
        setGoals(goals.map(g => g.id === editingGoalId ? res.data.goal : g))
        setGoalStats(computeGoalStats(goals.map(g => g.id === editingGoalId ? res.data.goal : g)))
        setEditingGoalId(null)
      } else {
        const res = await api.post('/goals', goalForm)
        setGoals([res.data.goal, ...goals])
        setGoalStats(computeGoalStats([res.data.goal, ...goals]))
        setShowGoalForm(false)
      }
      setGoalForm({ title: '', description: '', category: 'daily_living', target_date: '' })
    } catch (err) {
      console.error('Failed to save goal:', err)
      setGoalFormError('Failed to save goal. Please try again.')
    }
  }

  const handleGoalEdit = (goal) => {
    setGoalForm({ title: goal.title, description: goal.description || '', category: goal.category || 'daily_living', target_date: goal.target_date || '' })
    setEditingGoalId(goal.id)
    setShowGoalForm(true)
  }

  const handleGoalProgressUpdate = async (goalId, progress) => {
    try {
      const res = await api.patch(`/goals/${goalId}/progress`, { progress: Number(progress) })
      const updated = goals.map(g => g.id === goalId ? res.data.goal : g)
      setGoals(updated)
      setGoalStats(computeGoalStats(updated))
      setGoalProgressUpdate({ ...goalProgressUpdate, [goalId]: false })
    } catch (err) {
      console.error('Failed to update progress:', err)
    }
  }

  const handleGoalDelete = async (goalId) => {
    try {
      await api.delete(`/goals/${goalId}`)
      const updated = goals.filter(g => g.id !== goalId)
      setGoals(updated)
      setGoalStats(computeGoalStats(updated))
      setDeletingGoalId(null)
    } catch (err) {
      console.error('Failed to delete goal:', err)
    }
  }

  const cancelGoalEdit = () => {
    setEditingGoalId(null)
    setGoalForm({ title: '', description: '', category: 'daily_living', target_date: '' })
    setShowGoalForm(false)
    setGoalFormError(null)
  }

  const fetchGoalHistory = async (goalId) => {
    if (historyOpen[goalId]) {
      setHistoryOpen({ ...historyOpen, [goalId]: false })
      return
    }
    if (goalHistory[goalId]) {
      setHistoryOpen({ ...historyOpen, [goalId]: true })
      return
    }
    setHistoryLoading({ ...historyLoading, [goalId]: true })
    setHistoryOpen({ ...historyOpen, [goalId]: true })
    try {
      const res = await api.get(`/goals/${goalId}/history`)
      setGoalHistory({ ...goalHistory, [goalId]: res.data.history || [] })
    } catch (err) {
      console.error('Failed to fetch history:', err)
      setGoalHistory({ ...goalHistory, [goalId]: [] })
    } finally {
      setHistoryLoading({ ...historyLoading, [goalId]: false })
    }
  }

  // ── Care Plan handlers ───────────────────────────────────────────────────────

  const openCreatePlan = () => {
    setPlanForm({ title: '', description: '', start_date: '', end_date: '', status: 'draft', supports: [], review_notes: '' })
    setEditingPlanId(null)
    setPlanFormError(null)
    setShowPlanModal(true)
  }

  const openEditPlan = (plan) => {
    setPlanForm({
      title: plan.title || '', description: plan.description || '',
      start_date: plan.start_date || '', end_date: plan.end_date || '',
      status: plan.status || 'draft',
      supports: plan.supports?.map(s => ({ category: s.category || 'other', description: s.description || '', frequency: s.frequency || '', provider_id: s.provider_id || '' })) || [],
      review_notes: plan.review_notes || '',
    })
    setEditingPlanId(plan.id)
    setPlanFormError(null)
    setShowPlanModal(true)
  }

  const closePlanModal = () => {
    setShowPlanModal(false)
    setEditingPlanId(null)
    setPlanFormError(null)
    setPlanForm({ title: '', description: '', start_date: '', end_date: '', status: 'draft', supports: [], review_notes: '' })
  }

  const handlePlanSubmit = async (e) => {
    e.preventDefault()
    setPlanFormError(null)
    if (!planForm.title.trim()) { setPlanFormError('Title is required'); return }
    setPlanSubmitting(true)
    try {
      const payload = { ...planForm, supports: planForm.supports.filter(s => s.description.trim() || s.frequency.trim()) }
      if (editingPlanId) {
        const res = await api.put(`/care_plans/${editingPlanId}`, payload)
        setCarePlans(carePlans.map(p => p.id === editingPlanId ? res.data.care_plan : p))
        closePlanModal()
      } else {
        const res = await api.post('/care_plans', payload)
        setCarePlans([res.data.care_plan, ...carePlans])
        closePlanModal()
      }
    } catch (err) {
      console.error('Failed to save care plan:', err)
      setPlanFormError(err.response?.data?.error || 'Failed to save care plan.')
    } finally {
      setPlanSubmitting(false)
    }
  }

  const handleDeletePlan = async (planId) => {
    try {
      await api.delete(`/care_plans/${planId}`)
      setCarePlans(carePlans.filter(p => p.id !== planId))
      setDeletePlanId(null)
      if (expandedPlanId === planId) setExpandedPlanId(null)
    } catch (err) {
      console.error('Failed to delete care plan:', err)
    }
  }

  const filteredPlans = planFilter === 'all' ? carePlans : carePlans.filter(p => p.status === planFilter)

  // ── Activity feed ────────────────────────────────────────────────────────────

  const activeStatuses = ['sent', 'accepted', 'active']
  const acceptedReferrals = referrals.filter(r => r.status === 'accepted')
  const careTeamCount = new Set(acceptedReferrals.map(r => r.provider_id)).size

  const recentReferrals = [...referrals].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3)
  const recentUpdates = [...updates].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3)
  const recentActivity = [
    ...recentReferrals.map(r => ({ ...r, type: 'referral', sortDate: r.created_at })),
    ...recentUpdates.map(u => ({ ...u, type: 'update', sortDate: u.created_at })),
  ].filter(item => item.sortDate).sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate)).slice(0, 5)

  const goalsProgress = goalStats.total > 0 ? `${goalStats.overallProgress}%` : 'No goals'

  const stats = [
    { label: 'Active Referrals', value: referrals.filter(r => activeStatuses.includes(r.status)).length, icon: FileText, color: 'text-primary' },
    { label: 'Care Team', value: careTeamCount, icon: Users, color: 'text-secondary' },
    { label: 'Goals Progress', value: goalsProgress, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Recent Updates', value: updates.length, icon: Clock, color: 'text-amber-600' },
  ]

  if (loading) {
    return (
      <div className="space-y-8">
        <div><h1 className="text-2xl font-bold text-slate-900">Loading...</h1></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse"><div className="h-4 bg-slate-200 rounded w-20 mb-3" /><div className="h-8 bg-slate-200 rounded w-12" /></div>)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.full_name?.split(' ')[0]}</h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your care.</p>
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${alert.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
          {alert.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          <span className="text-sm">{alert.message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'goals', label: `Goals${goalStats.total > 0 ? ` (${goalStats.total})` : ''}` },
            { key: 'care-plans', label: `Care Plans${carePlans.length > 0 ? ` (${carePlans.length})` : ''}` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Overview Tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats */}
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

          {/* Goals summary */}
          {goalStats.total > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2"><Target size={16} /> Goals</h2>
                <button onClick={() => setActiveTab('goals')} className="text-sm text-primary hover:underline flex items-center gap-1">
                  View all <ArrowRight size={13} />
                </button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-xl font-bold text-slate-800">{goalStats.total}</div>
                  <div className="text-xs text-slate-500">Total</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">{goalStats.active}</div>
                  <div className="text-xs text-slate-500">Active</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">{goalStats.completed}</div>
                  <div className="text-xs text-slate-500">Completed</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-xl font-bold text-slate-800">{goalStats.overallProgress}%</div>
                  <div className="text-xs text-slate-500">Progress</div>
                </div>
              </div>
              <div className="space-y-2">
                {goals.slice(0, 3).map(goal => (
                  <div key={goal.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${goal.status === 'active' ? 'bg-green-500' : goal.status === 'completed' ? 'bg-blue-500' : 'bg-slate-300'}`} />
                      <span className="text-sm text-slate-700 truncate max-w-[200px]">{goal.title}</span>
                    </div>
                    <span className="text-xs text-slate-500">{goal.progress || 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity feed */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Recent Activity</h2>
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <Clock size={20} className="text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm">No recent activity</p>
                <p className="text-slate-400 text-xs mt-1">Activity will appear here as your care team collaborates</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((item, idx) => {
                  const Icon = item.type === 'referral' ? FileText : Clock
                  return (
                    <div key={`${item.type}-${item.id}-${idx}`} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon size={14} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900 truncate">
                          {item.type === 'referral' ? `Referral ${item.status}: ${item.reason || 'No reason provided'}` : item.content || 'Update'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{formatRelativeTime(item.sortDate)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Goals Tab ─────────────────────────────────────────────────────────── */}
      {activeTab === 'goals' && (
        <div className="space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Goals', value: goalStats.total, color: 'text-slate-800' },
              { label: 'Active', value: goalStats.active, color: 'text-blue-600' },
              { label: 'Completed', value: goalStats.completed, color: 'text-green-600' },
              { label: 'Overall Progress', value: `${goalStats.overallProgress}%`, color: 'text-slate-800' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-xl font-bold mb-0.5" style={{ color }}>{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>

          {/* Add/Edit goal form */}
          {showGoalForm || editingGoalId ? (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">{editingGoalId ? 'Edit Goal' : 'New Goal'}</h3>
                <button onClick={cancelGoalEdit} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>
              {goalFormError && <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{goalFormError}</div>}
              <form onSubmit={handleGoalSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
                  <input type="text" value={goalForm.title} onChange={e => setGoalForm({ ...goalForm, title: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g., Learn to use public transport independently" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea value={goalForm.description} onChange={e => setGoalForm({ ...goalForm, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" placeholder="Describe what you want to achieve..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select value={goalForm.category} onChange={e => setGoalForm({ ...goalForm, category: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      {GOAL_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Target Date</label>
                    <input type="date" value={goalForm.target_date} onChange={e => setGoalForm({ ...goalForm, target_date: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={cancelGoalEdit} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
                  <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90">
                    <Check size={14} />{editingGoalId ? 'Update Goal' : 'Create Goal'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button onClick={() => setShowGoalForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90">
              <Plus size={16} /> Add Goal
            </button>
          )}

          {/* Goals list */}
          {goals.length === 0 && !showGoalForm ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <Target size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Every big journey starts with a goal. Create your first one above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map(goal => (
                <div key={goal.id} className="bg-white rounded-xl border border-slate-200 p-5">
                  {editingGoalId === goal.id ? (
                    <form onSubmit={handleGoalSubmit} className="space-y-4">
                      <div><label className="block text-sm font-medium text-slate-700 mb-1">Title *</label><input type="text" value={goalForm.title} onChange={e => setGoalForm({ ...goalForm, title: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" required /></div>
                      <div><label className="block text-sm font-medium text-slate-700 mb-1">Description</label><textarea value={goalForm.description} onChange={e => setGoalForm({ ...goalForm, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Category</label><select value={goalForm.category} onChange={e => setGoalForm({ ...goalForm, category: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">{GOAL_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Target Date</label><input type="date" value={goalForm.target_date} onChange={e => setGoalForm({ ...goalForm, target_date: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" /></div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={cancelGoalEdit} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
                        <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90"><Check size={14} /> Update Goal</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className="font-semibold text-slate-900">{goal.title}</h3>
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{GOAL_CATEGORIES.find(c => c.value === goal.category)?.label || goal.category}</span>
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${GOAL_STATUS_COLORS[goal.status] || 'bg-slate-100 text-slate-700'}`}>{goal.status || 'active'}</span>
                          </div>
                          {goal.description && <p className="text-sm text-slate-600 mb-2">{goal.description}</p>}
                          {goal.target_date && <p className="text-xs text-slate-500 flex items-center gap-1 mb-2"><Calendar size={11} /> Target: {formatDate(goal.target_date)}</p>}
                          {goal.created_by_name && <p className="text-xs text-slate-400">Created by {goal.created_by_name}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => fetchGoalHistory(goal.id)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100">
                            {historyOpen[goal.id] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}History
                          </button>
                          <button onClick={() => handleGoalEdit(goal)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"><Edit2 size={13} /></button>
                          {deletingGoalId === goal.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleGoalDelete(goal.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Check size={13} /></button>
                              <button onClick={() => setDeletingGoalId(null)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"><X size={13} /></button>
                            </div>
                          ) : (
                            <button onClick={() => setDeletingGoalId(goal.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
                          )}
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-slate-500">Progress</span>
                          <span className="text-xs font-medium text-slate-700">{goal.progress || 0}%</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setGoalProgressUpdate({ ...goalProgressUpdate, [goal.id]: true })}
                          className="w-full bg-slate-100 rounded-full h-2 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                          aria-label={`Update progress for ${goal.title}`}
                        >
                          <div className="bg-green-500 rounded-full h-2 transition-all" style={{ width: `${goal.progress || 0}%` }} />
                        </button>
                        {goalProgressUpdate[goal.id] && (
                          <div className="mt-3 flex items-center gap-3">
                            <input type="range" min="0" max="100" value={goal._tempProgress ?? goal.progress ?? 0}
                              onChange={e => setGoals(goals.map(g => g.id === goal.id ? { ...g, _tempProgress: parseInt(e.target.value) } : g))}
                              className="flex-1" />
                            <input type="number" min="0" max="100" value={goal._tempProgress ?? goal.progress ?? 0}
                              onChange={e => setGoals(goals.map(g => g.id === goal.id ? { ...g, _tempProgress: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) } : g))}
                              className="w-14 px-2 py-1 border border-slate-200 rounded text-center text-sm" />
                            <button onClick={() => handleGoalProgressUpdate(goal.id, goal._tempProgress ?? goal.progress ?? 0)} className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary/90">Update</button>
                            <button onClick={() => { setGoalProgressUpdate({ ...goalProgressUpdate, [goal.id]: false }); setGoals(goals.map(g => g.id === goal.id ? { ...g, _tempProgress: undefined } : g)) }} className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-sm hover:bg-slate-200">Cancel</button>
                          </div>
                        )}
                        {!goalProgressUpdate[goal.id] && (
                          <button onClick={() => setGoalProgressUpdate({ ...goalProgressUpdate, [goal.id]: true })} className="mt-2 text-xs text-primary hover:underline">Update Progress</button>
                        )}
                      </div>

                      {/* History */}
                      {historyOpen[goal.id] && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <h4 className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">History</h4>
                          {historyLoading[goal.id] ? (
                            <p className="text-sm text-slate-500">Loading...</p>
                          ) : goalHistory[goal.id]?.length > 0 ? (
                            <div className="space-y-2">
                              {goalHistory[goal.id].map((entry, idx) => (
                                <div key={entry.id || idx} className="flex items-start gap-3 text-sm">
                                  <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                                  <div className="flex-1">
                                    <span className="font-medium text-slate-700">{entry.action || 'Updated'}</span>
                                    {entry.field_changed && <span className="text-slate-500"> · {entry.field_changed}</span>}
                                    {entry.old_value !== undefined && entry.new_value !== undefined && <div className="text-xs text-slate-400">{entry.old_value} → {entry.new_value}</div>}
                                    <div className="text-xs text-slate-400 mt-0.5">{formatDateTime(entry.created_at)}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">No history available.</p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Care Plans Tab ───────────────────────────────────────────────────── */}
      {activeTab === 'care-plans' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-slate-400" />
              <span className="text-sm text-slate-500">{carePlans.length} plan{carePlans.length !== 1 ? 's' : ''}</span>
            </div>
            <button onClick={openCreatePlan} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90">
              <Plus size={15} /> Create Care Plan
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 border-b border-slate-200">
            <button onClick={() => setPlanFilter('all')} className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${planFilter === 'all' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>All</button>
            {CARE_PLAN_STATUSES.map(s => (
              <button key={s} onClick={() => setPlanFilter(s)} className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${planFilter === s ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{CARE_PLAN_STATUS_LABELS[s]}</button>
            ))}
          </div>

          {/* Plans list */}
          {filteredPlans.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <FileText size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">{planFilter === 'all' ? 'No care plans yet. Create your first one above.' : `No ${CARE_PLAN_STATUS_LABELS[planFilter]} care plans.`}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPlans.map(plan => (
                <div key={plan.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-slate-900">{plan.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${CARE_PLAN_STATUS_COLORS[plan.status] || 'bg-slate-100 text-slate-700'}`}>{CARE_PLAN_STATUS_LABELS[plan.status] || plan.status}</span>
                        </div>
                        {plan.description && <p className="text-sm text-slate-600 mb-2 line-clamp-2">{plan.description}</p>}
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {plan.start_date && <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(plan.start_date)}</span>}
                          {plan.start_date && plan.end_date && <span>—</span>}
                          {plan.end_date && <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(plan.end_date)}</span>}
                        </div>
                        {plan.supports?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {plan.supports.slice(0, 3).map((s, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 text-xs bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-100">
                                <span className="text-slate-400">{CARE_PLAN_CATEGORIES.find(c => c.value === s.category)?.label || s.category}</span>
                                {s.description && <span className="max-w-[100px] truncate">{s.description}</span>}
                              </span>
                            ))}
                            {plan.supports.length > 3 && <span className="text-xs text-slate-400">+{plan.supports.length - 3} more</span>}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditPlan(plan)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={14} /></button>
                        <button onClick={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">{expandedPlanId === plan.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
                        {deletePlanId === plan.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDeletePlan(plan.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Check size={14} /></button>
                            <button onClick={() => setDeletePlanId(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"><X size={14} /></button>
                          </div>
                        ) : (
                          <button onClick={() => setDeletePlanId(plan.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {expandedPlanId === plan.id && (
                    <div className="px-5 pb-5 pt-0 border-t border-slate-100">
                      <div className="pt-4 space-y-3">
                        {plan.description && <div><p className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-1">Description</p><p className="text-sm text-slate-700 whitespace-pre-wrap">{plan.description}</p></div>}
                        {plan.supports?.length > 0 && (
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-2">Support Items</p>
                            <div className="space-y-2">
                              {plan.supports.map((s, idx) => (
                                <div key={idx} className="bg-slate-50 rounded-lg p-3 text-sm">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{CARE_PLAN_CATEGORIES.find(c => c.value === s.category)?.label || s.category}</span>
                                    {s.frequency && <span className="text-xs text-slate-500">{s.frequency}</span>}
                                  </div>
                                  {s.description && <p className="text-slate-700">{s.description}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {plan.review_notes && <div><p className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-1">Review Notes</p><p className="text-sm text-slate-700 whitespace-pre-wrap">{plan.review_notes}</p></div>}
                        <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                          {plan.created_by_name && <span>Created by {plan.created_by_name}</span>}
                          {plan.created_at && <span>· {formatDate(plan.created_at)}</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Care Plan Modal ─────────────────────────────────────────────────── */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30" onClick={closePlanModal} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-slate-800">{editingPlanId ? 'Edit Care Plan' : 'Create Care Plan'}</h2>
              <button onClick={closePlanModal} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
            </div>
            <form onSubmit={handlePlanSubmit} className="p-6 space-y-5">
              {planFormError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{planFormError}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input type="text" value={planForm.title} onChange={e => setPlanForm({ ...planForm, title: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g., 12-Week Therapy Plan" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea value={planForm.description} onChange={e => setPlanForm({ ...planForm, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" placeholder="What is this plan for?" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input type="date" value={planForm.start_date} onChange={e => setPlanForm({ ...planForm, start_date: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input type="date" value={planForm.end_date} onChange={e => setPlanForm({ ...planForm, end_date: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select value={planForm.status} onChange={e => setPlanForm({ ...planForm, status: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    {CARE_PLAN_STATUSES.map(s => <option key={s} value={s}>{CARE_PLAN_STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
              </div>

              {/* Supports */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Support Items</label>
                  <button type="button" onClick={() => setPlanForm(prev => ({ ...prev, supports: [...prev.supports, { ...EMPTY_SUPPORT }] }))} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus size={12} /> Add Item</button>
                </div>
                <div className="space-y-2">
                  {planForm.supports.map((support, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                      <select value={support.category} onChange={e => { const s = [...planForm.supports]; s[idx] = { ...s[idx], category: e.target.value }; setPlanForm({ ...planForm, supports: s }) }} className="px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                        {CARE_PLAN_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                      <input type="text" value={support.description} onChange={e => { const s = [...planForm.supports]; s[idx] = { ...s[idx], description: e.target.value }; setPlanForm({ ...planForm, supports: s }) }} className="flex-1 px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Description" />
                      <input type="text" value={support.frequency} onChange={e => { const s = [...planForm.supports]; s[idx] = { ...s[idx], frequency: e.target.value }; setPlanForm({ ...planForm, supports: s }) }} className="w-28 px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Frequency" />
                      <button type="button" onClick={() => setPlanForm(prev => ({ ...prev, supports: prev.supports.filter((_, i) => i !== idx) }))} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><X size={13} /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Review Notes</label>
                <textarea value={planForm.review_notes} onChange={e => setPlanForm({ ...planForm, review_notes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" placeholder="Any review notes..." />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closePlanModal} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
                <button type="submit" disabled={planSubmitting} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50">
                  <Check size={14} />{editingPlanId ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
