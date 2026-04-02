import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { ShieldCheck, Plus, X, Trash2 } from 'lucide-react'

const dataCategories = [
  { id: 'care_plans', label: 'Care Plans', color: 'bg-blue-50 text-blue-700' },
  { id: 'goals', label: 'Goals', color: 'bg-green-50 text-green-700' },
  { id: 'progress_notes', label: 'Progress Notes', color: 'bg-amber-50 text-amber-700' },
  { id: 'documents', label: 'Documents', color: 'bg-violet-50 text-violet-700' },
  { id: 'messages', label: 'Messages', color: 'bg-rose-50 text-rose-700' }
]

export default function ConsentSettings() {
  const [consents, setConsents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    granted_to_id: '',
    data_categories: [],
    expires_at: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadConsents()
  }, [])

  async function loadConsents() {
    try {
      const res = await api.get('/api/v1/consents')
      setConsents(res.data.consents || [])
    } catch (err) {
      console.error('Failed to load consents', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.granted_to_id || form.data_categories.length === 0) return

    setSubmitting(true)
    try {
      const payload = {
        granted_to_id: form.granted_to_id,
        data_categories: form.data_categories
      }
      if (form.expires_at) payload.expires_at = form.expires_at

        const res = await api.post('/api/v1/consents', payload)
        setConsents(prev => [res.data.consent, ...prev])
      setShowForm(false)
      setForm({ granted_to_id: '', data_categories: [], expires_at: '' })
    } catch (err) {
      console.error('Failed to grant consent', err)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRevoke(id) {
    try {
      await api.delete(`/api/v1/consents/${id}`)
      setConsents(prev =>
        prev.map(c => c.id === id ? { ...c, active: false } : c)
      )
    } catch (err) {
      console.error('Failed to revoke consent', err)
    }
  }

  function toggleCategory(catId) {
    setForm(prev => ({
      ...prev,
      data_categories: prev.data_categories.includes(catId)
        ? prev.data_categories.filter(c => c !== catId)
        : [...prev.data_categories, catId]
    }))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Consent Settings</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          Grant New Consent
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-amber-800">
          You control which data categories are shared with other care team members. 
          All consents can be revoked at any time. Shared data will only be accessible 
          to those you explicitly grant access to.
        </p>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Grant New Consent</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Recipient ID (email or user ID)
              </label>
              <input
                type="text"
                value={form.granted_to_id}
                onChange={e => setForm({ ...form, granted_to_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Enter recipient's email or ID"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Data Categories to Share
              </label>
              <div className="flex flex-wrap gap-2">
                {dataCategories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${
                      form.data_categories.includes(cat.id)
                        ? 'bg-primary text-white border-primary'
                        : `${cat.color} border-current opacity-70 hover:opacity-100`
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              {form.data_categories.length === 0 && (
                <p className="text-xs text-slate-500 mt-2">Select at least one category</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Expires At (optional)
              </label>
              <input
                type="datetime-local"
                value={form.expires_at}
                onChange={e => setForm({ ...form, expires_at: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !form.granted_to_id || form.data_categories.length === 0}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting ? 'Granting...' : 'Grant Consent'}
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : consents.length === 0 ? (
        <div className="text-center py-12">
          <ShieldCheck size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No consents granted yet</p>
          <p className="text-sm text-slate-400 mt-1">Grant consent to share your data with care team members</p>
        </div>
      ) : (
        <div className="space-y-4">
          {consents.map(consent => (
            <div key={consent.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 text-sm">
                    Shared with: {consent.granted_to_id}
                  </h3>
                  <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                    consent.active
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${consent.active ? 'bg-green-500' : 'bg-red-500'}`} />
                    {consent.active ? 'Active' : 'Revoked'}
                  </span>
                </div>
                {consent.active && (
                  <button
                    onClick={() => handleRevoke(consent.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                    Revoke
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {consent.data_categories.map(catId => {
                  const cat = dataCategories.find(c => c.id === catId)
                  return cat ? (
                    <span
                      key={catId}
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${cat.color}`}
                    >
                      {cat.label}
                    </span>
                  ) : null
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                <span>Granted: {new Date(consent.granted_at).toLocaleDateString()}</span>
                {consent.expires_at && (
                  <span>Expires: {new Date(consent.expires_at).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
