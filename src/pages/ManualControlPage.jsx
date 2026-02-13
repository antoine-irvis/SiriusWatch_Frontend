import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Gamepad2, MoveHorizontal, MoveVertical, RotateCcw, Hand } from 'lucide-react'

export default function ManualControlPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="col-span-full">
        <div className="flex items-center gap-3 mb-4">
          <Gamepad2 size={20} className="text-blue-400" />
          <h3 className="text-lg font-semibold text-white/90">Manual Control</h3>
        </div>
        <p className="text-sm text-white/50">
          Jog the robot arm, move to saved positions, and control the gripper.
        </p>
      </Card>

      <Card>
        <h4 className="text-sm font-semibold text-white/80 mb-4">Jog Controls</h4>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: MoveHorizontal, label: 'X+' },
            { icon: MoveVertical, label: 'Y+' },
            { icon: MoveVertical, label: 'Z+' },
            { icon: MoveHorizontal, label: 'X-' },
            { icon: MoveVertical, label: 'Y-' },
            { icon: MoveVertical, label: 'Z-' },
          ].map((btn) => (
            <Button key={btn.label} variant="secondary" className="text-xs">
              {btn.label}
            </Button>
          ))}
        </div>
      </Card>

      <Card>
        <h4 className="text-sm font-semibold text-white/80 mb-4">Quick Actions</h4>
        <div className="space-y-2">
          <Button variant="secondary" className="w-full"><RotateCcw size={14} /> Home Position</Button>
          <Button variant="secondary" className="w-full"><Hand size={14} /> Toggle Gripper</Button>
          <Button variant="primary" className="w-full">Move to Inspection</Button>
        </div>
      </Card>
    </div>
  )
}
