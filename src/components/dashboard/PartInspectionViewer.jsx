import Card from '../ui/Card'
import AnnotationPoint from './AnnotationPoint'
import { annotationPoints } from '../../data/mockData'
import { Camera } from 'lucide-react'

export default function PartInspectionViewer() {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center gap-2 px-5 pt-4 pb-3">
        <Camera size={16} className="text-blue-400" />
        <h3 className="text-sm font-semibold text-white/80">Part Inspection</h3>
        <span className="ml-auto text-[10px] text-white/30 font-medium">LIVE FEED</span>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 mx-4 mb-4 rounded-xl overflow-hidden aspect-[16/10]">
        {/* PCB placeholder image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 400 250" className="w-full h-full opacity-30">
            {/* Board outline */}
            <rect x="30" y="20" width="340" height="210" rx="8" fill="none" stroke="rgba(59,130,246,0.3)" strokeWidth="1.5" />
            {/* Traces */}
            <path d="M60 60 H150 V100 H200" stroke="rgba(59,130,246,0.2)" strokeWidth="1" fill="none" />
            <path d="M100 40 V120 H180 V160" stroke="rgba(59,130,246,0.2)" strokeWidth="1" fill="none" />
            <path d="M250 50 V90 H320 V140" stroke="rgba(59,130,246,0.2)" strokeWidth="1" fill="none" />
            <path d="M60 180 H140 V140 H220 V200" stroke="rgba(59,130,246,0.15)" strokeWidth="1" fill="none" />
            {/* Components */}
            <rect x="80" y="55" width="30" height="12" rx="2" fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.25)" strokeWidth="0.5" />
            <rect x="160" y="35" width="40" height="25" rx="2" fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />
            <rect x="260" y="60" width="50" height="35" rx="3" fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />
            <circle cx="130" cy="150" r="15" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />
            <rect x="200" y="130" width="20" height="8" rx="1" fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />
            <rect x="300" y="170" width="35" height="20" rx="2" fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />
            {/* IC chip */}
            <rect x="150" y="90" width="60" height="40" rx="3" fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.3)" strokeWidth="1" />
            <text x="180" y="115" textAnchor="middle" fill="rgba(59,130,246,0.3)" fontSize="8" fontFamily="monospace">IC</text>
            {/* Pin headers */}
            {[0,1,2,3,4,5].map(i => (
              <rect key={`pin-${i}`} x={55 + i * 10} y="190" width="6" height="12" rx="1" fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />
            ))}
          </svg>
        </div>

        {/* Annotation dots */}
        {annotationPoints.map((point) => (
          <AnnotationPoint key={point.id} point={point} />
        ))}

        {/* Crosshair overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-blue-500/10" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-blue-500/10" />
        </div>
      </div>
    </Card>
  )
}
