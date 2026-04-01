import { ShieldCheck } from 'lucide-react'

export default function CareRecord() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Care Record</h1>
        <p className="text-slate-500 mt-1">Your NDIS care summary and consent management.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <ShieldCheck size={20} className="text-slate-400" />
          </div>
          <p className="text-slate-500 text-sm">Care record coming soon</p>
        </div>
      </div>
    </div>
  )
}
