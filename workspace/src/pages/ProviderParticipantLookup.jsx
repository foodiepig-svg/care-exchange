import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { Search, Loader2, User, FileText, X, Shield, ShieldCheck, ShieldAlert } from 'lucide-react'

export default function ProviderParticipantLookup() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)

  const fetchParticipants = async (query = '') => {
    try {
      setSearching(true)
      const endpoint = query
        ? `/participants/me/care-team?search=${encodeURIComponent(query)}`
        : '/participants/me/care-team'
      const res = await api.get(endpoint)
      setParticipants(res.data?.participants || res.data || [])
      setError(null)
    } catch (err) {
      setError('Failed to load participants')
      console.error(err)
    } finally {
      setSearching(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchParticipants()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setLoading(true)
    fetchParticipants(searchQuery)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setLoading(true)
    fetchParticipants()
  }

  const handleViewCareRecord = (participant) => {
    navigate('/care-record', { state: { participantId: participant.id } })
  }

  const getConsentBadge = (consent) => {
    if (!consent) {
      return {
        icon: ShieldAlert,
        label: 'Limited Access',
        className: 'bg-amber-50 text-amber-600',
        description: 'Basic information only'
      }
    }

    const consentedCategories = []
    if (consent.goals) consentedCategories.push('Goals')
    if (consent.progress_notes) consentedCategories.push('Progress Notes')
    if (consent.documents) consentedCategories.push('Documents')
    if (consent.plan_details) consentedCategories.push('Plan Details')

    if (consentedCategories.length === 0) {
      return {
        icon: ShieldAlert,
        label: 'Limited Access',
        className: 'bg-amber-50 text-amber-600',
        description: 'Basic information only'
      }
    }

    if (consentedCategories.length >= 4) {
      return {
        icon: ShieldCheck,
        label: 'Full Access',
        className: 'bg-green-50 text-green-600',
        description: 'All data categories'
      }
    }

    return {
      icon: Shield,
      label: 'Partial Access',
      className: 'bg-blue-50 text-blue-600',
      description: consentedCategories.join(', ')
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Participant Lookup</h1>
          <p className="text-slate-500 mt-1">View participants who have granted you consent.</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 size={24} className="text-primary animate-spin mb-2" />
            <p className="text-slate-500 text-sm">Loading participants...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Participant Lookup</h1>
        <p className="text-slate-500 mt-1">View participants who have granted you consent to access their care records.</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by participant name or NDIS number..."
              className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={searching}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {searching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {searchQuery && (
        <p className="text-sm text-slate-500">
          {participants.length} participant{participants.length !== 1 ? 's' : ''} found for "{searchQuery}"
        </p>
      )}

      {participants.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <User size={20} className="text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">
              {searchQuery
                ? 'No participants found matching your search'
                : 'No participants have granted you consent yet'}
            </p>
            {!searchQuery && (
              <p className="text-slate-400 text-xs mt-1">
                Participants will appear here once they grant you consent to access their care record
              </p>
            )}
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="mt-3 text-sm text-primary hover:text-primary/80"
              >
                Clear search
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {participants.map((participant) => {
            const consentInfo = getConsentBadge(participant.consent)
            const ConsentIcon = consentInfo.icon
            const canViewCareRecord = participant.consent && (
              participant.consent.goals ||
              participant.consent.progress_notes ||
              participant.consent.documents ||
              participant.consent.plan_details
            )

            return (
              <div
                key={participant.id}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <User size={18} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {participant.full_name || participant.name || 'Unknown Participant'}
                      </h3>
                      {participant.ndis_number && (
                        <p className="text-xs text-slate-500">NDIS: {participant.ndis_number}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Consent Status */}
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${consentInfo.className}`}>
                  <ConsentIcon size={12} />
                  {consentInfo.label}
                </div>

                {consentInfo.description !== 'All data categories' && (
                  <p className="text-xs text-slate-500 mt-2">
                    {consentInfo.description}
                  </p>
                )}

                {/* View Care Record Button */}
                <button
                  onClick={() => handleViewCareRecord(participant)}
                  disabled={!canViewCareRecord}
                  className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    canViewCareRecord
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                  title={!canViewCareRecord ? 'Participant has not granted consent to view care record data' : 'View participant care record'}
                >
                  <FileText size={16} />
                  {canViewCareRecord ? 'View Care Record' : 'No Data Access'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
