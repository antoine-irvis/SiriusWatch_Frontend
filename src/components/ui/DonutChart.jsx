import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

export default function DonutChart({ value, color = '#3b82f6', size = 140, strokeWidth = 12 }) {
  const data = [
    { name: 'value', value: value },
    { name: 'remainder', value: 100 - value },
  ]

  return (
    <ResponsiveContainer width="100%" height={size}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={size / 2 - strokeWidth - 10}
          outerRadius={size / 2 - 10}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          stroke="none"
        >
          <Cell fill={color} />
          <Cell fill="rgba(255,255,255,0.08)" />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
