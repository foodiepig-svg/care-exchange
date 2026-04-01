import { MessageSquare } from 'lucide-react'

export default function Messages() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-500 mt-1">Communicate with your care team.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <MessageSquare size={20} className="text-slate-400" />
          </div>
          <p className="text-slate-500 text-sm">No messages yet</p>
          <p className="text-slate-400 text-xs mt-1">Messages with your care team will appear here</p>
        </div>
      </div>
    </div>
  )
}
