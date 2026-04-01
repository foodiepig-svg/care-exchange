import { FileText, Send, Clock } from 'lucide-react'

export default function Referrals() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Referrals</h1>
        <p className="text-slate-500 mt-1">Send and manage secure referral links to providers.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <FileText size={20} className="text-slate-400" />
          </div>
          <p className="text-slate-500 text-sm">No referrals yet</p>
          <p className="text-slate-400 text-xs mt-1">Referrals you send or receive will appear here</p>
        </div>
      </div>
    </div>
  )
}
