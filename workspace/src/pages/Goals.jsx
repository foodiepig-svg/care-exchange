import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import {
  Plus, Target, TrendingUp, Calendar, Clock, ChevronDown, ChevronUp,
  X, CheckCircle2, AlertCircle
} from 'lucide-react'

const CATEGORY_COLORS = {
  daily_living: 'bg-slate-100 text-slate-700',
  social: 'bg-slate-100 text-slate-700',
  health: 'bg-slate-100 text-slate-700',
  employment: 'bg-slate-100 text-slate-700',
  education: 'bg-slate-100 text-slate-700',
  transport: 'bg-slate-100 text-slate-700',
  other: 'bg-slate-100 text-slate-700',
}

const STATUS_COLORS = {
  completed: 'bg-green-100 text-green-700',
  active: 'bg-blue-100 text-blue-700',
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

export default function Goals() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [goals, setGoals] = useState([])
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editingGoalId, setEditingGoalId] = useState(null)
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    category: 'daily_living',
    target_date: ''
  })
  const [progressUpdate, setProgressUpdate] = useState({})
  const [historyOpen, setHistoryOpen] = useState({})
  const [historyData, setHistoryData] = useState({})
  const [historyLoading, setHistoryLoading] = useState({})
  const [formError, setFormError] = useState(null)

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      setError(null)
      const res = await api.get('/goals')
      setGoals(res.data.goals || [])
    } catch (err) {
      console.error('Failed to fetch goals:', err)
      setError('Failed to load goals. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    total: goals.length,
    active: goals.filter(g => g.status === 'active').length,
    completed: goals.filter(g => g.status === 'completed').length,
    overallProgress: goals.length > 0
      ? Math.round(goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length)
      : 0
  }

  const handleGoalSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    if (!goalForm.title.trim()) {
      setFormError('Title is required')
      return
    }
    try {
      if (editingGoalId) {
        const res = await api.put(`/goals/${editingGoalId}`, goalForm)
        setGoals(goals.map(g => g.id === editingGoalId ? res.data.goal : g))
        setEditingGoalId(null)
      } else {
        const res = await api.post('/goals', goalForm)
        setGoals([res.data.goal, ...goals])
        setShowGoalForm(false)
      }
      setGoalForm({ title: '', description: '', category: 'daily_living', target_date: '' })
    } catch (err) {
      console.error('Failed to save goal:', err)
      setFormError('Failed to save goal. Please try again.')
    }
  }

  const handleGoalEdit = (goal) => {
    setGoalForm({
      title: goal.title,
      description: goal.description || '',
      category: goal.category || 'daily_living',
      target_date: goal.target_date || ''
    })
    setEditingGoalId(goal.id)
    setShowGoalForm(true)
  }

  const handleGoalProgressUpdate = async (goalId, progress) => {
    try {
      const res = await api.patch(`/goals/${goalId}/progress`, { progress: Number(progress) })
      setGoals(goals.map(g => g.id === goalId ? res.data.goal : g))
      setProgressUpdate({ ...progressUpdate, [goalId]: false })
    } catch (err) {
      console.error('Failed to update progress:', err)
    }
  }

  const cancelGoalEdit = () => {
    setEditingGoalId(null)
    setGoalForm({ title: '', description: '', category: 'daily_living', target_date: '' })
    setShowGoalForm(false)
    setFormError(null)
  }

  const fetchHistory = async (goalId) => {
    if (historyData[goalId]) {
      setHistoryOpen({ ...historyOpen, [goalId]: !historyOpen[goalId] })
      return
    }
    setHistoryLoading({ ...historyLoading, [goalId]: true })
    setHistoryOpen({ ...historyOpen, [goalId]: true })
    try {
      const res = await api.get(`/goals/${goalId}/history`)
      setHistoryData({ ...historyData, [goalId]: res.data.history || [] })
    } catch (err) {
      console.error('Failed to fetch history:', err)
      setHistoryData({ ...historyData, [goalId]: [] })
    } finally {
      setHistoryLoading({ ...historyLoading, [goalId]: false })
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-slate-500">Loading goals...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-800">My Goals</h1>
        </div>
        <button
          onClick={() => setShowGoalForm(!showGoalForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showGoalForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showGoalForm ? 'Cancel' : 'Add Goal'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showGoalForm && (
        <div className="mb-6 bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            {editingGoalId ? 'Edit Goal' : 'Create New Goal'}
          </h2>
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {formError}
            </div>
          )}
          <form onSubmit={handleGoalSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={goalForm.title}
                onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter goal title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                value={goalForm.description}
                onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Enter goal description (optional)"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={goalForm.category}
                  onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {GOAL_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={goalForm.target_date}
                  onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingGoalId ? 'Update Goal' : 'Create Goal'}
              </button>
              <button
                type="button"
                onClick={cancelGoalEdit}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <Target className="w-4 h-4" />
            <span>Total Goals</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Active</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Completed</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <Clock className="w-4 h-4" />
            <span>Overall Progress</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">{stats.overallProgress}%</div>
        </div>
      </div>

      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No goals yet. Click "Add Goal" to create your first goal.</p>
          </div>
        ) : (
          goals.map(goal => (
            <div key={goal.id} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-slate-800">{goal.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[goal.category] || 'bg-slate-100 text-slate-700'}`}>
                      {goal.category?.replace('_', ' ') || 'other'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[goal.status] || 'bg-slate-100 text-slate-700'}`}>
                      {goal.status || 'active'}
                    </span>
                  </div>
                  {goal.description && (
                    <p className="text-sm text-slate-600 mb-2">{goal.description}</p>
                  )}
                  {goal.target_date && (
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>Target: {formatDate(goal.target_date)}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGoalEdit(goal)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => fetchHistory(goal.id)}
                    className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-700"
                  >
                    History
                    {historyOpen[goal.id] ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600">Progress</span>
                  <span className="text-sm font-medium text-slate-800">{goal.progress || 0}%</span>
                </div>
                <div
                  onClick={() => setProgressUpdate({ ...progressUpdate, [goal.id]: !progressUpdate[goal.id] })}
                  className="w-full bg-slate-100 rounded-full h-2.5 cursor-pointer"
                >
                  <div
                    className="bg-green-500 rounded-full h-2.5 transition-all"
                    style={{ width: `${goal.progress || 0}%` }}
                  />
                </div>
                {progressUpdate[goal.id] && (
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={goal._tempProgress ?? goal.progress ?? 0}
                      onChange={(e) => {
                        const value = parseInt(e.target.value)
                        setGoals(goals.map(g =>
                          g.id === goal.id ? { ...g, _tempProgress: value } : g
                        ))
                      }}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={goal._tempProgress ?? goal.progress ?? 0}
                      onChange={(e) => {
                        const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                        setGoals(goals.map(g =>
                          g.id === goal.id ? { ...g, _tempProgress: value } : g
                        ))
                      }}
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-center text-sm"
                    />
                    <button
                      onClick={() => handleGoalProgressUpdate(goal.id, goal._tempProgress ?? goal.progress ?? 0)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => {
                        setProgressUpdate({ ...progressUpdate, [goal.id]: false })
                        setGoals(goals.map(g =>
                          g.id === goal.id ? { ...g, _tempProgress: undefined } : g
                        ))
                      }}
                      className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-sm hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                {!progressUpdate[goal.id] && (
                  <button
                    onClick={() => setProgressUpdate({ ...progressUpdate, [goal.id]: true })}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-700"
                  >
                    Update Progress
                  </button>
                )}
              </div>

              {historyOpen[goal.id] && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">History</h4>
                  {historyLoading[goal.id] ? (
                    <p className="text-sm text-slate-500">Loading history...</p>
                  ) : historyData[goal.id] && historyData[goal.id].length > 0 ? (
                    <div className="space-y-2">
                      {historyData[goal.id].map((entry, index) => (
                        <div key={entry.id || index} className="flex items-start gap-3 text-sm">
                          <div className="w-2 h-2 mt-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-700">
                                {entry.action || 'Updated'}
                              </span>
                              {entry.field_changed && (
                                <span className="text-slate-500">
                                  • {entry.field_changed}
                                </span>
                              )}
                            </div>
                            {entry.old_value !== undefined && entry.new_value !== undefined && (
                              <div className="text-slate-500 text-xs mt-0.5">
                                {entry.old_value} → {entry.new_value}
                              </div>
                            )}
                            <div className="text-xs text-slate-400 mt-0.5">
                              {formatDateTime(entry.created_at)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No history available</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
