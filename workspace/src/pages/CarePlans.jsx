import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import {
  Plus, FileText, Calendar, X, ChevronDown, ChevronUp,
  Trash2, Edit2, AlertCircle, CheckCircle2
} from 'lucide-react'

const STATUS_COLORS = {
  draft: 'bg-slate-100 text-slate-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  on_hold: 'bg-amber-100 text-amber-700',
}

const STATUS_LABELS = {
  draft: 'Draft',
  active: 'Active',
  completed: 'Completed',
  on_hold: 'On Hold',
}

const CATEGORY_COLORS = {
  medical: 'bg-rose-50 text-rose-700',
  therapy: 'bg-violet-50 text-violet-700',
  home_care: 'bg-amber-50 text-amber-700',
  transport: 'bg-sky-50 text-sky-700',
  social: 'bg-emerald-50 text-emerald-700',
  other: 'bg-slate-100 text-slate-700',
}

const CATEGORY_LABELS = {
  medical: 'Medical',
  therapy: 'Therapy',
  home_care: 'Home Care',
  transport: 'Transport',
  social: 'Social',
  other: 'Other',
}

const SUPPORT_CATEGORIES = [
  { value: 'medical', label: 'Medical' },
  { value: 'therapy', label: 'Therapy' },
  { value: 'home_care', label: 'Home Care' },
  { value: 'transport', label: 'Transport' },
  { value: 'social', label: 'Social' },
  { value: 'other', label: 'Other' },
]

const STATUSES = ['draft', 'active', 'completed', 'on_hold']

function formatDate(dateString) {
  if (!dateString) return null
  return new Date(dateString).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[status] || 'bg-slate-100 text-slate-700'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

function CategoryBadge({ category }) {
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded ${CATEGORY_COLORS[category] || 'bg-slate-100 text-slate-700'}`}>
      {CATEGORY_LABELS[category] || category}
    </span>
  )
}

const EMPTY_SUPPORT = { category: 'other', description: '', frequency: '', provider_id: '' }

export default function CarePlans() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [carePlans, setCarePlans] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingPlanId, setEditingPlanId] = useState(null)
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Expanded plan detail
  const [expandedPlanId, setExpandedPlanId] = useState(null)

  // Form state
  const [planForm, setPlanForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'draft',
    supports: [],
    review_notes: '',
  })

  useEffect(() => {
    fetchCarePlans()
  }, [])

  const fetchCarePlans = async () => {
    try {
      setError(null)
      const res = await api.get('/care_plans')
      setCarePlans(res.data.care_plans || [])
    } catch (err) {
      console.error('Failed to fetch care plans:', err)
      setError('Failed to load care plans. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredPlans = statusFilter === 'all'
    ? carePlans
    : carePlans.filter(p => p.status === statusFilter)

  const handleOpenCreate = () => {
    setPlanForm({
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'draft',
      supports: [],
      review_notes: '',
    })
    setEditingPlanId(null)
    setFormError(null)
    setShowModal(true)
  }

  const handleOpenEdit = (plan) => {
    setPlanForm({
      title: plan.title || '',
      description: plan.description || '',
      start_date: plan.start_date || '',
      end_date: plan.end_date || '',
      status: plan.status || 'draft',
      supports: plan.supports && plan.supports.length > 0
        ? plan.supports.map(s => ({
            category: s.category || 'other',
            description: s.description || '',
            frequency: s.frequency || '',
            provider_id: s.provider_id || '',
          }))
        : [],
      review_notes: plan.review_notes || '',
    })
    setEditingPlanId(plan.id)
    setFormError(null)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingPlanId(null)
    setFormError(null)
    setPlanForm({
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'draft',
      supports: [],
      review_notes: '',
    })
  }

  const handleAddSupport = () => {
    setPlanForm(prev => ({
      ...prev,
      supports: [...prev.supports, { ...EMPTY_SUPPORT }],
    }))
  }

  const handleRemoveSupport = (index) => {
    setPlanForm(prev => ({
      ...prev,
      supports: prev.supports.filter((_, i) => i !== index),
    }))
  }

  const handleSupportChange = (index, field, value) => {
    setPlanForm(prev => ({
      ...prev,
      supports: prev.supports.map((s, i) =>
        i === index ? { ...s, [field]: value } : s
      ),
    }))
  }

  const handlePlanSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (!planForm.title.trim()) {
      setFormError('Title is required')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        ...planForm,
        supports: planForm.supports.filter(s => s.description.trim() || s.frequency.trim()),
      }

      if (editingPlanId) {
        const res = await api.put(`/care_plans/${editingPlanId}`, payload)
        setCarePlans(carePlans.map(p => p.id === editingPlanId ? res.data.care_plan : p))
        handleCloseModal()
      } else {
        const res = await api.post('/care_plans', payload)
        setCarePlans([res.data.care_plan, ...carePlans])
        handleCloseModal()
      }
    } catch (err) {
      console.error('Failed to save care plan:', err)
      setFormError(err.response?.data?.error || 'Failed to save care plan. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePlan = async (planId) => {
    try {
      await api.delete(`/care_plans/${planId}`)
      setCarePlans(carePlans.filter(p => p.id !== planId))
      setDeleteConfirm(null)
      if (expandedPlanId === planId) {
        setExpandedPlanId(null)
      }
    } catch (err) {
      console.error('Failed to delete care plan:', err)
      setError('Failed to delete care plan. Please try again.')
      setDeleteConfirm(null)
    }
  }

  // Escape key closes modal
  useEffect(() => {
    if (!showModal) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleCloseModal()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showModal])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-slate-500">Loading care plans...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-800">Care Plans</h1>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Care Plan
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-slate-200">
        {['all', ...STATUSES].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              statusFilter === status
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {status === 'all' ? 'All' : STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {/* Plans list */}
      <div className="space-y-4">
        {filteredPlans.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">
              {statusFilter === 'all'
                ? 'No care plans yet. Click "Create Care Plan" to add one.'
                : `No ${STATUS_LABELS[statusFilter]} care plans.`}
            </p>
          </div>
        ) : (
          filteredPlans.map(plan => (
            <div key={plan.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* Card header — always visible */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-slate-800">{plan.title}</h3>
                      <StatusBadge status={plan.status} />
                    </div>

                    {plan.description && (
                      <p className="text-sm text-slate-600 mb-2 line-clamp-2">{plan.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      {plan.start_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(plan.start_date)}
                        </span>
                      )}
                      {plan.start_date && plan.end_date && (
                        <span>—</span>
                      )}
                      {plan.end_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(plan.end_date)}
                        </span>
                      )}
                    </div>

                    {/* Supports preview */}
                    {plan.supports && plan.supports.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {plan.supports.slice(0, 3).map((support, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 text-xs bg-slate-50 text-slate-600 px-2 py-1 rounded border border-slate-100"
                          >
                            <CategoryBadge category={support.category} />
                            {support.description && (
                              <span className="max-w-[120px] truncate">{support.description}</span>
                            )}
                            {support.frequency && (
                              <span className="text-slate-400">· {support.frequency}</span>
                            )}
                          </span>
                        ))}
                        {plan.supports.length > 3 && (
                          <span className="text-xs text-slate-400 px-2 py-1">
                            +{plan.supports.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(plan)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      aria-label="Edit care plan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(plan.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Delete care plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      aria-label={expandedPlanId === plan.id ? 'Collapse details' : 'Expand details'}
                    >
                      {expandedPlanId === plan.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded detail */}
              {expandedPlanId === plan.id && (
                <div className="px-6 pb-6 pt-0 border-t border-slate-100">
                  <div className="pt-4 space-y-4">
                    {plan.description && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-1">Description</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{plan.description}</p>
                      </div>
                    )}

                    {plan.supports && plan.supports.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-2">Support Items</p>
                        <div className="space-y-2">
                          {plan.supports.map((support, idx) => (
                            <div key={idx} className="bg-slate-50 rounded-lg p-3 text-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <CategoryBadge category={support.category} />
                                {support.frequency && (
                                  <span className="text-xs text-slate-500">{support.frequency}</span>
                                )}
                              </div>
                              {support.description && (
                                <p className="text-slate-700">{support.description}</p>
                              )}
                              {support.provider_id && (
                                <p className="text-xs text-slate-400 mt-1">Provider ID: {support.provider_id}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {plan.review_notes && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-1">Review Notes</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{plan.review_notes}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
                      {plan.created_by_name && (
                        <span>Created by {plan.created_by_name}</span>
                      )}
                      {plan.created_at && (
                        <span>· {formatDate(plan.created_at)}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="care-plan-modal-title"
        >
          <div
            className="fixed inset-0 bg-black/30"
            onClick={handleCloseModal}
            aria-hidden="true"
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 id="care-plan-modal-title" className="text-lg font-semibold text-slate-800">
                {editingPlanId ? 'Edit Care Plan' : 'Create Care Plan'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {formError}
                </div>
              )}

              <form id="care-plan-form" onSubmit={handlePlanSubmit} className="space-y-5">
                {/* Title */}
                <div>
                  <label htmlFor="plan-title" className="block text-sm font-medium text-slate-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="plan-title"
                    type="text"
                    value={planForm.title}
                    onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter care plan title"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="plan-description" className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="plan-description"
                    value={planForm.description}
                    onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="3"
                    placeholder="Enter description (optional)"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="plan-start-date" className="block text-sm font-medium text-slate-700 mb-1">
                      Start Date
                    </label>
                    <input
                      id="plan-start-date"
                      type="date"
                      value={planForm.start_date}
                      onChange={(e) => setPlanForm({ ...planForm, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="plan-end-date" className="block text-sm font-medium text-slate-700 mb-1">
                      End Date
                    </label>
                    <input
                      id="plan-end-date"
                      type="date"
                      value={planForm.end_date}
                      onChange={(e) => setPlanForm({ ...planForm, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="plan-status" className="block text-sm font-medium text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    id="plan-status"
                    value={planForm.status}
                    onChange={(e) => setPlanForm({ ...planForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>

                {/* Support Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Support Items
                    </label>
                    <button
                      type="button"
                      onClick={handleAddSupport}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Add Support Item
                    </button>
                  </div>

                  {planForm.supports.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No support items added yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {planForm.supports.map((support, index) => (
                        <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <div>
                                <label
                                  htmlFor={`support-category-${index}`}
                                  className="block text-xs font-medium text-slate-600 mb-1"
                                >
                                  Category
                                </label>
                                <select
                                  id={`support-category-${index}`}
                                  value={support.category}
                                  onChange={(e) => handleSupportChange(index, 'category', e.target.value)}
                                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  {SUPPORT_CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label
                                  htmlFor={`support-frequency-${index}`}
                                  className="block text-xs font-medium text-slate-600 mb-1"
                                >
                                  Frequency
                                </label>
                                <input
                                  id={`support-frequency-${index}`}
                                  type="text"
                                  value={support.frequency}
                                  onChange={(e) => handleSupportChange(index, 'frequency', e.target.value)}
                                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="e.g. weekly"
                                />
                              </div>
                              <div className="col-span-2">
                                <label
                                  htmlFor={`support-description-${index}`}
                                  className="block text-xs font-medium text-slate-600 mb-1"
                                >
                                  Description
                                </label>
                                <input
                                  id={`support-description-${index}`}
                                  type="text"
                                  value={support.description}
                                  onChange={(e) => handleSupportChange(index, 'description', e.target.value)}
                                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Support item description"
                                />
                              </div>
                              <div>
                                <label
                                  htmlFor={`support-provider-${index}`}
                                  className="block text-xs font-medium text-slate-600 mb-1"
                                >
                                  Provider ID (optional)
                                </label>
                                <input
                                  id={`support-provider-${index}`}
                                  type="number"
                                  value={support.provider_id}
                                  onChange={(e) => handleSupportChange(index, 'provider_id', e.target.value)}
                                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="ID"
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveSupport(index)}
                              className="mt-5 p-1 text-slate-400 hover:text-red-600 transition-colors"
                              aria-label="Remove support item"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Review Notes */}
                <div>
                  <label htmlFor="plan-review-notes" className="block text-sm font-medium text-slate-700 mb-1">
                    Review Notes
                  </label>
                  <textarea
                    id="plan-review-notes"
                    value={planForm.review_notes}
                    onChange={(e) => setPlanForm({ ...planForm, review_notes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="3"
                    placeholder="Enter review notes (optional)"
                  />
                </div>
              </form>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="care-plan-form"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                {submitting ? 'Saving...' : editingPlanId ? 'Update Plan' : 'Create Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-desc"
        >
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setDeleteConfirm(null)}
            aria-hidden="true"
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 id="delete-dialog-title" className="text-lg font-semibold text-slate-800">
                  Delete Care Plan?
                </h3>
                <p id="delete-dialog-desc" className="text-sm text-slate-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePlan(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
