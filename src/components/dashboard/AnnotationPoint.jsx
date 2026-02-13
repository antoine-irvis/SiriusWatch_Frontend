import { useState } from 'react'

const colors = {
  pass: 'bg-emerald-400 shadow-emerald-400/50',
  fail: 'bg-rose-400 shadow-rose-400/50',
  warning: 'bg-amber-400 shadow-amber-400/50',
}

const ringColors = {
  pass: 'border-emerald-400/30',
  fail: 'border-rose-400/30',
  warning: 'border-amber-400/30',
}

export default function AnnotationPoint({ point }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
      style={{ left: `${point.x}%`, top: `${point.y}%` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Pulse ring */}
      <div
        className={`absolute inset-0 w-6 h-6 -m-1.5 rounded-full border-2 ${ringColors[point.status]} animate-ping opacity-40`}
      />

      {/* Dot */}
      <div
        className={`w-3 h-3 rounded-full ${colors[point.status]} shadow-lg transition-transform duration-200 ${
          hovered ? 'scale-150' : 'scale-100'
        }`}
      />

      {/* Tooltip */}
      {hovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-lg text-xs whitespace-nowrap shadow-xl z-10">
          <p className="font-medium text-white/90">{point.label}</p>
          <p className={`text-[10px] mt-0.5 ${
            point.status === 'pass' ? 'text-emerald-400' :
            point.status === 'fail' ? 'text-rose-400' : 'text-amber-400'
          }`}>
            {point.status.toUpperCase()}
          </p>
        </div>
      )}
    </div>
  )
}
