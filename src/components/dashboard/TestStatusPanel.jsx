import StatusBadge from '../ui/StatusBadge'
import { Clock } from 'lucide-react'

export default function TestStatusPanel({ test }) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-1 border-b border-white/5 last:border-0 group hover:bg-white/[0.02] rounded-lg transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/80 font-medium truncate">{test.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-white/40">{test.value}</span>
          <span className="text-white/10">|</span>
          <Clock size={10} className="text-white/30" />
          <span className="text-[10px] text-white/30">{test.time}</span>
        </div>
      </div>
      <StatusBadge status={test.status} />
    </div>
  )
}
