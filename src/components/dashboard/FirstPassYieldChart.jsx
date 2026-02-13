import Card from '../ui/Card'
import DonutChart from '../ui/DonutChart'
import { firstPassYieldData } from '../../data/mockData'

export default function FirstPassYieldChart() {
  return (
    <Card className="flex flex-col items-center text-center">
      <p className="text-[10px] uppercase tracking-wider text-white/40 font-medium mb-2">
        {firstPassYieldData.label}
      </p>

      <div className="relative">
        <DonutChart value={firstPassYieldData.value} color={firstPassYieldData.color} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white/90">{firstPassYieldData.value}%</span>
        </div>
      </div>

      <p className="text-xs text-white/40 mt-2">Target: 95.0%</p>
    </Card>
  )
}
