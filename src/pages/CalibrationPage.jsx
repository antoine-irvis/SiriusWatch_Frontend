import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Focus, Camera, Monitor, Crosshair } from 'lucide-react'

export default function CalibrationPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="col-span-full">
        <div className="flex items-center gap-3 mb-4">
          <Focus size={20} className="text-blue-400" />
          <h3 className="text-lg font-semibold text-white/90">Calibration</h3>
        </div>
        <p className="text-sm text-white/50">
          Camera intrinsic calibration, hand-eye calibration, and monitor color calibration.
        </p>
      </Card>

      {[
        { icon: Camera, label: 'Camera Calibration', desc: 'Intrinsic parameters & distortion correction' },
        { icon: Crosshair, label: 'Hand-Eye Calibration', desc: 'Camera-to-robot transform' },
        { icon: Monitor, label: 'Monitor Calibration', desc: 'Color accuracy & uniformity' },
      ].map((item) => (
        <Card key={item.label}>
          <item.icon size={24} className="text-blue-400 mb-3" />
          <h4 className="text-sm font-semibold text-white/80 mb-1">{item.label}</h4>
          <p className="text-xs text-white/40 mb-4">{item.desc}</p>
          <Button variant="secondary">Start Calibration</Button>
        </Card>
      ))}
    </div>
  )
}
