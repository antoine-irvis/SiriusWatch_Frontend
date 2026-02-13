import Card from '../ui/Card'
import { defectsTrendData } from '../../data/mockData'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { BarChart3 } from 'lucide-react'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-white/60 mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-xs">
          <span className="text-white/50">{entry.dataKey === 'defects' ? 'Defects' : 'Rate'}:</span>{' '}
          <span className="font-semibold" style={{ color: entry.color }}>
            {entry.value}{entry.dataKey === 'rate' ? '%' : ''}
          </span>
        </p>
      ))}
    </div>
  )
}

export default function DefectsTrendChart() {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={16} className="text-blue-400" />
        <h3 className="text-sm font-semibold text-white/80">Defects Trend</h3>
        <span className="ml-auto text-xs text-emerald-400 font-medium">-75% over 8 weeks</span>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={defectsTrendData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="week"
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            unit="%"
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            yAxisId="left"
            dataKey="defects"
            fill="rgba(59,130,246,0.3)"
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="rate"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: '#f59e0b', r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  )
}
