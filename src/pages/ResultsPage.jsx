import Card from '../components/ui/Card'
import { BarChart3, TrendingUp, TrendingDown, Clock } from 'lucide-react'

export default function ResultsPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="col-span-full">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 size={20} className="text-blue-400" />
          <h3 className="text-lg font-semibold text-white/90">Results & Analytics</h3>
        </div>
        <p className="text-sm text-white/50">
          Historical test results, pass/fail analytics, and quality trends.
        </p>
      </Card>

      {[
        { label: 'Total Inspections', value: '12,847', icon: BarChart3, change: '+124 today', color: 'text-blue-400' },
        { label: 'Pass Rate', value: '97.5%', icon: TrendingUp, change: '+0.3%', color: 'text-emerald-400' },
        { label: 'Defect Rate', value: '0.8%', icon: TrendingDown, change: '-0.1%', color: 'text-emerald-400' },
        { label: 'Avg. Cycle Time', value: '42.3s', icon: Clock, change: '-1.2s', color: 'text-blue-400' },
      ].map((stat) => (
        <Card key={stat.label}>
          <stat.icon size={18} className="text-white/30 mb-2" />
          <p className="text-2xl font-bold text-white/90">{stat.value}</p>
          <p className="text-xs text-white/50 mt-1">{stat.label}</p>
          <p className={`text-xs mt-1 ${stat.color}`}>{stat.change}</p>
        </Card>
      ))}
    </div>
  )
}
