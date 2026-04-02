import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import {
  Target, FileText, Plus, Edit2, Trash2, X, Check, Calendar,
  ChevronDown, ChevronUp, Clock
} from 'lucide-react'

const CATEGORY_COLORS = {
  daily_living: 'bg-blue-100 text-blue-700',
  social: 'bg-violet-100 text-violet-700',
  health: 'bg-red-100 text-red-700',
  employment: 'bg-green-100 text-green-700',
  education: 'bg-amber-100 text-amber-700',
  transport: 'bg-cyan-100 text-cyan-700',
  other: 'bg-slate-100 text-slate-700',
}

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  paused: 'bg-amber-100 text-amber-700',
  discontinued: 'bg-red-100 text-red-700',
}

const CARE_PLAN_STATUS_COLORS = {
  draft: 'bg-slate-100 text-slate-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  on_hold: 'bg-amber-100 text-amber-700',
}

const GOAL_CATEGORIES = ['daily_living', 'social', 'health', 'employment', 'education', 'transport', 'other']
const GOAL_STATUSES = ['active', 'completed', 'paused', 'discontinued']
const SUPPORT_CATEGORIES = ['daily_living', 'social', 'health', 'employment', 'education', 'transport', 'other']
const FREQUENCY_OPTIONS = ['daily', 'weekly', ' fortnightly', 'monthly', 'as_needed']

export default function CareRecord() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('goals')
  const [loading, setLoading] = useState(true)

  // Goals state
  const [goals, setGoals] = useState([])
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editingGoalId, setEditingGoalId] = useState(null)
  const [goalForm, setGoalForm] = useState({ title: '', description: '', category: 'daily_living', target_date: '' })
  const [goalProgressUpdate, setGoalProgressUpdate] = useState({})
  const [deletingGoalId, setDeletingGoalId] = useState(null)

  // Care Plans state
  const [carePlans, setCarePlans] = useState([])
  const [showCarePlanForm, setShowCarePlanForm] = useState(false)
  const [editingCarePlanId, setEditingCarePlanId] = useState(null)
  const [carePlanForm, setCarePlanForm] = useState({
    title: '', description: '', start_date: '', end_date: '', supports: []
  })
  const [deletingCarePlanId, setDeletingCarePlanId] = useState(null)

  useEffect(() => {
    fetchGoals()
    fetchCarePlans()
  }, [])

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals')
      setGoals(res.data.goals || [])
    } catch (err) {
      console.error('Failed to fetch goals:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCarePlans = async () => {
    try {
      const res = await api.get('/care-plans')
      setCarePlans(res.data.care_plans || [])
    } catch (err) {
      console.error('Failed to fetch care plans:', err)
    }
  }

  // Goal handlers
  const handleGoalSubmit = async (e) => {
    e.preventDefault()
    if (!goalForm.title.trim()) return
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
  }

  const handleGoalDelete = async (goalId) => {
    try {
      await api.delete(`/goals/${goalId}`)
      setGoals(goals.filter(g => g.id !== goalId))
      setDeletingGoalId(null)
    } catch (err) {
      console.error('Failed to delete goal:', err)
    }
  }

  const handleGoalProgressUpdate = async (goalId, progress) => {
    try {
      const res = await api.patch(`/goals/${goalId}/progress`, { progress: Number(progress) })
      setGoals(goals.map(g => g.id === goalId ? res.data.goal : g))
      setGoalProgressUpdate({})
    } catch (err) {
      console.error('Failed to update progress:', err)
    }
  }

  const cancelGoalEdit = () => {
    setEditingGoalId(null)
    setGoalForm({ title: '', description: '', category: 'daily_living', target_date: '' })
    setShowGoalForm(false)
  }

  // Care Plan handlers
  const handleCarePlanSubmit = async (e) => {
    e.preventDefault()
    if (!carePlanForm.title.trim()) return
    try {
      if (editingCarePlanId) {
        const res = await api.put(`/care-plans/${editingCarePlanId}`, carePlanForm)
        setCarePlans(carePlans.map(cp => cp.id === editingCarePlanId ? res.data.care_plan : cp))
        setEditingCarePlanId(null)
      } else {
        const res = await api.post('/care-plans', carePlanForm)
        setCarePlans([res.data.care_plan, ...carePlans])
        setShowCarePlanForm(false)
      }
      setCarePlanForm({ title: '', description: '', start_date: '', end_date: '', supports: [] })
    } catch (err) {
      console.error('Failed to save care plan:', err)
    }
  }

  const handleCarePlanEdit = (carePlan) => {
    setCarePlanForm({
      title: carePlan.title,
      description: carePlan.description || '',
      start_date: carePlan.start_date || '',
      end_date: carePlan.end_date || '',
      supports: carePlan.supports || []
    })
    setEditingCarePlanId(carePlan.id)
  }

  const handleCarePlanDelete = async (carePlanId) => {
    try {
      await api.delete(`/care-plans/${carePlanId}`)
      setCarePlans(carePlans.filter(cp => cp.id !== carePlanId))
      setDeletingCarePlanId(null)
    } catch (err) {
      console.error('Failed to delete care plan:', err)
    }
  }

  const cancelCarePlanEdit = () => {
    setEditingCarePlanId(null)
    setCarePlanForm({ title: '', description: '', start_date: '', end_date: '', supports: [] })
    setShowCarePlanForm(false)
  }

  const addSupportItem = () => {
    setCarePlanForm({
      ...carePlanForm,
      supports: [...carePlanForm.supports, { category: 'daily_living', description: '', frequency: 'weekly' }]
    })
  }

  const updateSupportItem = (index, field, value) => {
    const newSupports = [...carePlanForm.supports]
    newSupports[index] = { ...newSupports[index], [field]: value }
    setCarePlanForm({ ...carePlanForm, supports: newSupports })
  }

  const removeSupportItem = (index) => {
    setCarePlanForm({
      ...carePlanForm,
      supports: carePlanForm.supports.filter((_, i) => i !== index)
    })
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Care Record</h1>
          <p className="text-slate-500 mt-1">Loading your care record...</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Care Record</h1>
        <p className="text-slate-500 mt-1">Track your goals and care plans.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('goals')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'goals'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Goals
          </button>
          <button
            onClick={() => setActiveTab('care-plans')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'care-plans'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Care Plans
          </button>
        </nav>
      </div>

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-4">
          {/* Add Goal Button / Form */}
          {!showGoalForm && !editingGoalId && (
            <button
              onClick={() => setShowGoalForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus size={16} />
              Add Goal
            </button>
          )}

          {(showGoalForm || editingGoalId) && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">{editingGoalId ? 'Edit Goal' : 'New Goal'}</h3>
                <button onClick={cancelGoalEdit} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleGoalSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={goalForm.title}
                    onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="e.g., Learn to use public transport independently"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={goalForm.description}
                    onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    placeholder="Describe what you want to achieve..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select
                      value={goalForm.category}
                      onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      {GOAL_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Target Date</label>
                    <input
                      type="date"
                      value={goalForm.target_date}
                      onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={cancelGoalEdit} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
                    Cancel
                  </button>
                  <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90">
                    <Check size={14} />
                    {editingGoalId ? 'Update Goal' : 'Create Goal'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Goals List */}
          {goals.length === 0 && !showGoalForm && !editingGoalId ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Target size={20} className="text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm">Every big journey starts with a goal. Create your first one below.</p>
              <button
                onClick={() => setShowGoalForm(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors mx-auto"
              >
                <Plus size={16} />
                Add Goal
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="bg-white rounded-xl border border-slate-200 p-5">
                  {editingGoalId === goal.id ? (
                    <form onSubmit={handleGoalSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                        <input
                          type="text"
                          value={goalForm.title}
                          onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                          value={goalForm.description}
                          onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                          <select
                            value={goalForm.category}
                            onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          >
                            {GOAL_CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Target Date</label>
                          <input
                            type="date"
                            value={goalForm.target_date}
                            onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={cancelGoalEdit} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
                          Cancel
                        </button>
                        <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90">
                          <Check size={14} />
                          Update Goal
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className="font-semibold text-slate-900">{goal.title}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[goal.category] || CATEGORY_COLORS.other}`}>
                              {goal.category?.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[goal.status] || 'bg-slate-100 text-slate-700'}`}>
                              {goal.status}
                            </span>
                          </div>
                          {goal.description && (
                            <p className="text-sm text-slate-600 mb-3">{goal.description}</p>
                          )}
                          {goal.target_date && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                              <Calendar size={12} />
                              <span>Target: {formatDate(goal.target_date)}</span>
                            </div>
                          )}
                          {goal.created_by_name && (
                            <p className="text-xs text-slate-400">Created by {goal.created_by_name}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleGoalEdit(goal)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                          >
                            <Edit2 size={14} />
                          </button>
                          {deletingGoalId === goal.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleGoalDelete(goal.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => setDeletingGoalId(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingGoalId(goal.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-slate-500">Progress</span>
                          <span className="text-xs font-medium text-slate-700">{goal.progress || 0}%</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${goal.progress || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Quick Progress Update */}
                      {goalProgressUpdate[goal.id] !== undefined ? (
                        <div className="flex items-center gap-2 mt-3">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={goalProgressUpdate[goal.id]}
                            onChange={(e) => setGoalProgressUpdate({ ...goalProgressUpdate, [goal.id]: Number(e.target.value) })}
                            className="flex-1 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer"
                          />
                          <span className="text-xs font-medium text-slate-700 w-8">{goalProgressUpdate[goal.id]}%</span>
                          <button
                            onClick={() => handleGoalProgressUpdate(goal.id, goalProgressUpdate[goal.id])}
                            className="p-1 text-primary hover:bg-primary/10 rounded"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => {
                              const newUpdate = { ...goalProgressUpdate }
                              delete newUpdate[goal.id]
                              setGoalProgressUpdate(newUpdate)
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setGoalProgressUpdate({ ...goalProgressUpdate, [goal.id]: goal.progress || 0 })}
                          className="mt-3 text-xs text-primary hover:text-primary/80 font-medium"
                        >
                          Update Progress
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Care Plans Tab */}
      {activeTab === 'care-plans' && (
        <div className="space-y-4">
          {/* Add Care Plan Button / Form */}
          {!showCarePlanForm && !editingCarePlanId && (
            <button
              onClick={() => setShowCarePlanForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus size={16} />
              Add Care Plan
            </button>
          )}

          {(showCarePlanForm || editingCarePlanId) && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">{editingCarePlanId ? 'Edit Care Plan' : 'New Care Plan'}</h3>
                <button onClick={cancelCarePlanEdit} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCarePlanSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={carePlanForm.title}
                    onChange={(e) => setCarePlanForm({ ...carePlanForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="e.g., Monthly Support Schedule"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={carePlanForm.description}
                    onChange={(e) => setCarePlanForm({ ...carePlanForm, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    placeholder="Describe this care plan..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={carePlanForm.start_date}
                      onChange={(e) => setCarePlanForm({ ...carePlanForm, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={carePlanForm.end_date}
                      onChange={(e) => setCarePlanForm({ ...carePlanForm, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                {/* Supports Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Supports</label>
                    <button
                      type="button"
                      onClick={addSupportItem}
                      className="text-xs text-primary hover:text-primary/80 font-medium"
                    >
                      + Add Support
                    </button>
                  </div>
                  {carePlanForm.supports.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2">No supports added yet. Click "Add Support" to add one.</p>
                  ) : (
                    <div className="space-y-2">
                      {carePlanForm.supports.map((support, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg">
                          <select
                            value={support.category}
                            onChange={(e) => updateSupportItem(index, 'category', e.target.value)}
                            className="px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          >
                            {SUPPORT_CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={support.description}
                            onChange={(e) => updateSupportItem(index, 'description', e.target.value)}
                            className="flex-1 px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="Description"
                          />
                          <select
                            value={support.frequency}
                            onChange={(e) => updateSupportItem(index, 'frequency', e.target.value)}
                            className="px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          >
                            {FREQUENCY_OPTIONS.map(freq => (
                              <option key={freq} value={freq}>{freq.replace('_', ' ')}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => removeSupportItem(index)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={cancelCarePlanEdit} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
                    Cancel
                  </button>
                  <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90">
                    <Check size={14} />
                    {editingCarePlanId ? 'Update Care Plan' : 'Create Care Plan'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Care Plans List */}
          {carePlans.length === 0 && !showCarePlanForm && !editingCarePlanId ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <FileText size={20} className="text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm">A care plan helps you track your supports. Create your first plan below.</p>
              <button
                onClick={() => setShowCarePlanForm(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors mx-auto"
              >
                <Plus size={16} />
                Add Care Plan
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {carePlans.map((plan) => (
                <div key={plan.id} className="bg-white rounded-xl border border-slate-200 p-5">
                  {editingCarePlanId === plan.id ? (
                    <form onSubmit={handleCarePlanSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                        <input
                          type="text"
                          value={carePlanForm.title}
                          onChange={(e) => setCarePlanForm({ ...carePlanForm, title: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                          value={carePlanForm.description}
                          onChange={(e) => setCarePlanForm({ ...carePlanForm, description: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                          <input
                            type="date"
                            value={carePlanForm.start_date}
                            onChange={(e) => setCarePlanForm({ ...carePlanForm, start_date: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                          <input
                            type="date"
                            value={carePlanForm.end_date}
                            onChange={(e) => setCarePlanForm({ ...carePlanForm, end_date: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>
                      </div>

                      {/* Supports Section */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-slate-700">Supports</label>
                          <button
                            type="button"
                            onClick={addSupportItem}
                            className="text-xs text-primary hover:text-primary/80 font-medium"
                          >
                            + Add Support
                          </button>
                        </div>
                        {carePlanForm.supports.length === 0 ? (
                          <p className="text-xs text-slate-400 py-2">No supports added yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {carePlanForm.supports.map((support, index) => (
                              <div key={index} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg">
                                <select
                                  value={support.category}
                                  onChange={(e) => updateSupportItem(index, 'category', e.target.value)}
                                  className="px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                >
                                  {SUPPORT_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  value={support.description}
                                  onChange={(e) => updateSupportItem(index, 'description', e.target.value)}
                                  className="flex-1 px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                  placeholder="Description"
                                />
                                <select
                                  value={support.frequency}
                                  onChange={(e) => updateSupportItem(index, 'frequency', e.target.value)}
                                  className="px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                >
                                  {FREQUENCY_OPTIONS.map(freq => (
                                    <option key={freq} value={freq}>{freq.replace('_', ' ')}</option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => removeSupportItem(index)}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={cancelCarePlanEdit} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
                          Cancel
                        </button>
                        <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90">
                          <Check size={14} />
                          Update Care Plan
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">{plan.title}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${CARE_PLAN_STATUS_COLORS[plan.status] || 'bg-slate-100 text-slate-700'}`}>
                              {plan.status}
                            </span>
                          </div>
                          {plan.description && (
                            <p className="text-sm text-slate-600 mb-2">{plan.description}</p>
                          )}
                          {(plan.start_date || plan.end_date) && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Calendar size={12} />
                              <span>
                                {formatDate(plan.start_date)} — {formatDate(plan.end_date)}
                              </span>
                            </div>
                          )}
                          {plan.created_by_name && (
                            <p className="text-xs text-slate-400 mt-1">Created by {plan.created_by_name}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCarePlanEdit(plan)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                          >
                            <Edit2 size={14} />
                          </button>
                          {deletingCarePlanId === plan.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleCarePlanDelete(plan.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => setDeletingCarePlanId(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingCarePlanId(plan.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Supports Table */}
                      {plan.supports && plan.supports.length > 0 && (
                        <div className="mt-4 border-t border-slate-100 pt-4">
                          <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Supports</h4>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-xs text-slate-500">
                                <th className="pb-1 font-medium">Category</th>
                                <th className="pb-1 font-medium">Description</th>
                                <th className="pb-1 font-medium">Frequency</th>
                              </tr>
                            </thead>
                            <tbody className="text-slate-700">
                              {plan.supports.map((support, idx) => (
                                <tr key={idx} className="border-t border-slate-50">
                                  <td className="py-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[support.category] || CATEGORY_COLORS.other}`}>
                                      {support.category?.replace('_', ' ')}
                                    </span>
                                  </td>
                                  <td className="py-2 text-slate-600">{support.description}</td>
                                  <td className="py-2 text-slate-500">{support.frequency}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Review Notes */}
                      {plan.review_notes && (
                        <div className="mt-4 border-t border-slate-100 pt-4">
                          <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Review Notes</h4>
                          <p className="text-sm text-slate-700">{plan.review_notes}</p>
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
    </div>
  )
}
