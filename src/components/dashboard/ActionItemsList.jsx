import Card from '../ui/Card'
import { actionItems } from '../../data/mockData'
import { AlertCircle, Clock, User } from 'lucide-react'
import { PRIORITY_COLORS } from '../../utils/constants'

export default function ActionItemsList() {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle size={16} className="text-blue-400" />
        <h3 className="text-sm font-semibold text-white/80">Action Items</h3>
        <span className="ml-auto text-xs text-white/40">{actionItems.length} items</span>
      </div>

      <div className="space-y-2">
        {actionItems.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
          >
            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${PRIORITY_COLORS[item.priority]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/80 font-medium">{item.title}</p>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <User size={10} className="text-white/30" />
                  <span className="text-[10px] text-white/40">{item.assignee}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={10} className="text-white/30" />
                  <span className="text-[10px] text-white/40">{item.due}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
