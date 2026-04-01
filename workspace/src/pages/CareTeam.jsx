import { Users } from 'lucide-react'

export default function CareTeam() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Care Team</h1>
        <p className="text-slate-500 mt-1">Your care team members and their roles.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <Users size={20} className="text-slate-400" />
          </div>
          <p className="text-slate-500 text-sm">No care team members yet</p>
          <p className="text-slate-400 text-xs mt-1">Your care team will appear here once referrals are accepted</p>
        </div>
      </div>
    </div>
  )
}
