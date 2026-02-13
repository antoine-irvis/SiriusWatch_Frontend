import Card from '../ui/Card'
import { scoreData } from '../../data/mockData'
import { TrendingUp, Award } from 'lucide-react'

export default function ScorePanel() {
  const percentage = ((scoreData.current / scoreData.total) * 100).toFixed(1)

  return (
    <Card className="flex flex-col items-center text-center">
      <Award size={20} className="text-blue-400 mb-3" />
      <p className="text-[10px] uppercase tracking-wider text-white/40 font-medium mb-2">
        {scoreData.label}
      </p>

      <div className="relative mb-3">
        <span className="text-4xl font-bold text-white/90 tracking-tight">
          {scoreData.current.toLocaleString()}
        </span>
        <span className="text-lg text-white/30 font-light">
          /{scoreData.total.toLocaleString()}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center gap-1.5">
        <TrendingUp size={12} className="text-emerald-400" />
        <span className="text-xs text-emerald-400 font-medium">{scoreData.trend}</span>
        <span className="text-xs text-white/30">vs last batch</span>
      </div>
    </Card>
  )
}
