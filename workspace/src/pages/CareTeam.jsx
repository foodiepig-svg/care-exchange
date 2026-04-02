import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { Users, Building2, Mail, Phone, ArrowRight } from 'lucide-react'

export default function CareTeam() {
  const { user } = useAuth()
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReferrals()
  }, [])

  const fetchReferrals = async () => {
    try {
      const res = await api.get('/referrals')
      setReferrals(res.data || [])
    } catch (err) {
      console.error('Failed to fetch referrals:', err)
    } finally {
      setLoading(false)
    }
  }

  const acceptedReferrals = referrals.filter(r => r.status === 'accepted')

  const careTeamMembers = acceptedReferrals.map(referral => {
    if (user?.role === 'participant') {
      return {
        id: referral.provider_id,
        name: referral.provider_name || referral.provider?.full_name || 'Unknown Provider',
        organisation: referral.provider_organisation || referral.provider?.organisation_name || 'Unknown Organisation',
        role: referral.provider_role || referral.provider?.role || 'Healthcare Provider',
        email: referral.provider_email || referral.provider?.email,
        phone: referral.provider_phone || referral.provider?.phone,
        referralId: referral.id
      }
    } else if (user?.role === 'provider') {
      return {
        id: referral.participant_id,
        name: referral.participant_name || referral.participant?.full_name || 'Unknown Participant',
        organisation: referral.participant_organisation || 'N/A',
        role: 'Participant',
        email: referral.participant_email || referral.participant?.email,
        phone: referral.participant_phone || referral.participant?.phone,
        referralId: referral.id
      }
    } else {
      return {
        id: referral.participant_id || referral.provider_id,
        name: referral.participant_name || referral.provider_name || 'Unknown',
        organisation: referral.provider_organisation || 'N/A',
        role: referral.provider_role || 'Care Coordinator',
        email: null,
        phone: null,
        referralId: referral.id
      }
    }
  })

  const uniqueMembers = careTeamMembers.reduce((acc, member) => {
    if (!acc.find(m => m.id === member.id)) {
      acc.push(member)
    }
    return acc
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Care Team</h1>
          <p className="text-slate-500 mt-1">Loading your care team...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-32 mb-3"></div>
              <div className="h-3 bg-slate-200 rounded w-48 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Care Team</h1>
        <p className="text-slate-500 mt-1">
          {user?.role === 'participant'
            ? 'Your healthcare providers and care coordinators'
            : user?.role === 'provider'
            ? 'Your assigned participants'
            : 'Coordinated care team members'}
        </p>
      </div>

      {uniqueMembers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Users size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">No care team members yet</p>
            <p className="text-slate-400 text-xs mt-1">
              Your care team will appear here once referrals are accepted
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {uniqueMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users size={20} className="text-primary" />
                </div>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {member.role}
                </span>
              </div>

              <h3 className="font-semibold text-slate-900 text-lg mb-1">
                {member.name}
              </h3>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Building2 size={14} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">{member.organisation}</span>
                </div>

                {member.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail size={14} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}

                {member.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone size={14} className="text-slate-400 flex-shrink-0" />
                    <span>{member.phone}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <button className="w-full flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                  View Details
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
