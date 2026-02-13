import Card from '../ui/Card'
import { returnInspectionData } from '../../data/mockData'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { TrendingDown } from 'lucide-react'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-white/60">{label}</p>
      <p className="text-sm font-semibold text-blue-400">{payload[0].value}%</p>
    </div>
  )
}

export default function ReturnInspectionChart() {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <TrendingDown size={16} className="text-blue-400" />
        <h3 className="text-sm font-semibold text-white/80">Return Inspection Rate</h3>
        <span className="ml-auto text-xs text-emerald-400 font-medium">-62% improvement</span>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={returnInspectionData}>
          <defs>
            <linearGradient id="returnGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="month"
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            unit="%"
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="rate"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#returnGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
