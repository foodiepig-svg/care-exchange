import { useState, useEffect } from 'react'
import api from '../services/api'

export default function AdminSettings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/admin/settings')
      .then(res => { setSettings(res.data); setLoading(false) })
      .catch(err => { setError(err.response?.data?.error || 'Failed to load settings'); setLoading(false) })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await api.put('/admin/settings', settings)
      setSettings({ ...settings, ...res.data.updated })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6 text-slate-500">Loading...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!settings) return null

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Configure global platform behaviour</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-5">
        {/* Platform name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Platform Name</label>
          <input
            type="text"
            value={settings.platform_name || ''}
            onChange={e => setSettings({ ...settings, platform_name: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Support email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Support Email</label>
          <input
            type="email"
            value={settings.support_email || ''}
            onChange={e => setSettings({ ...settings, support_email: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Referral link expiry */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Referral Link Expiry (days)</label>
          <input
            type="number"
            min="1"
            max="30"
            value={settings.referral_link_expiry_days || 7}
            onChange={e => setSettings({ ...settings, referral_link_expiry_days: parseInt(e.target.value) })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Toggles */}
        <div className="space-y-4 pt-2">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm font-medium text-slate-700">Open Registration</div>
              <div className="text-xs text-slate-500">Allow new users to sign up</div>
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, registration_open: !settings.registration_open })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.registration_open ? 'bg-teal-600' : 'bg-slate-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                settings.registration_open ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm font-medium text-slate-700">Require Email Verification</div>
              <div className="text-xs text-slate-500">New users must verify their email</div>
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, require_email_verification: !settings.require_email_verification })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.require_email_verification ? 'bg-teal-600' : 'bg-slate-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                settings.require_email_verification ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-teal-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {saved && <span className="text-sm text-green-600 font-medium">Settings saved!</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  )
}
