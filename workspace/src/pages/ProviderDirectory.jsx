import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { Search, Loader2, Building2, Send, X } from 'lucide-react'

export default function ProviderDirectory() {
  const navigate = useNavigate()
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)

  const fetchProviders = async (query = '') => {
    try {
      setSearching(true)
      const endpoint = query ? `/providers?search=${encodeURIComponent(query)}` : '/providers'
      const res = await api.get(endpoint)
      setProviders(res.data?.providers || [])
      setError(null)
    } catch (err) {
      setError('Failed to load providers')
      console.error(err)
    } finally {
      setSearching(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProviders()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setLoading(true)
    fetchProviders(searchQuery)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setLoading(true)
    fetchProviders()
  }

  const handleRefer = (provider) => {
    navigate('/referrals', { state: { prefillProvider: provider } })
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Provider Directory</h1>
          <p className="text-slate-500 mt-1">Find and connect with healthcare providers in your area.</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 size={24} className="text-primary animate-spin mb-2" />
            <p className="text-slate-500 text-sm">Loading providers...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Provider Directory</h1>
        <p className="text-slate-500 mt-1">Find and connect with healthcare providers in your area.</p>
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
              placeholder="Search by name, service, or location..."
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
          {providers.length} provider{providers.length !== 1 ? 's' : ''} found for "{searchQuery}"
        </p>
      )}

      {providers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Building2 size={20} className="text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">
              {searchQuery ? 'No providers found matching your search' : 'No providers available'}
            </p>
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
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 size={18} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {provider.organisation_name}
                    </h3>
                    {provider.location && (
                      <p className="text-xs text-slate-500">{provider.location}</p>
                    )}
                  </div>
                </div>
              </div>

              {provider.service_types && provider.service_types.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                    Services
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {provider.service_types.slice(0, 4).map((service, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                    {provider.service_types.length > 4 && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">
                        +{provider.service_types.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {provider.contact_email && (
                <p className="text-sm text-slate-500 mb-4">{provider.contact_email}</p>
              )}

              <button
                onClick={() => handleRefer(provider)}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Send size={16} />
                Refer to this Provider
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
