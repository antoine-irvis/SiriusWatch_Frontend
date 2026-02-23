import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import siriusLogo from '../assets/sirius-logo.png'
import {
  ScanSearch, BarChart3, Focus, Gamepad2,
  ArrowRight,
  Lightbulb, ChevronRight, ChevronLeft,
  Package, Camera,
} from 'lucide-react'

const QUICK_LINKS = [
  { label: 'Run Inspection', desc: 'Start a new test sequence', path: '/inspection', icon: ScanSearch, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { label: 'View Results', desc: 'Browse past inspections', path: '/results', icon: BarChart3, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { label: 'Calibration', desc: 'Camera & hand-eye setup', path: '/calibration', icon: Focus, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { label: 'Manual Control', desc: 'Jog robot & gripper', path: '/manual-control', icon: Gamepad2, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
]

const TIPS = [
  { text: 'Use arrow keys on the Manual Control page to jog the robot arm.', icon: Gamepad2 },
  { text: 'Press Escape to close any dialog or wizard overlay.', icon: Lightbulb },
  { text: 'Export your calibration data regularly as a backup.', icon: Focus },
  { text: 'Use the Results page filters to quickly find specific inspections.', icon: ScanSearch },
  { text: 'Check the Thermal camera feed for hotspot detection during inspection.', icon: Camera },
  { text: 'You can import product configurations from JSON files.', icon: Package },
  { text: 'Recalibrate cameras every 30 days for best accuracy.', icon: Focus },
]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const greeting = useMemo(getGreeting, [])

  const todayIndex = new Date().getDate() % TIPS.length
  const [tipIndex, setTipIndex] = useState(todayIndex)
  const tip = TIPS[tipIndex]

  return (
    <div className="min-h-[calc(100vh-7rem)] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl space-y-8">

        {/* Hero */}
        <div className="text-center">
          <img src={siriusLogo} alt="Sirius Watch" className="w-44 h-44 mx-auto -mb-2 object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]" />
          <h1 className="text-5xl font-bold tracking-widest text-white uppercase">
            Sirius
          </h1>
          <span className="text-xl font-medium tracking-[0.35em] text-blue-400/80 uppercase">
            Watch
          </span>
          <p className="text-sm text-white/40 mt-3">
            {greeting} — ready to inspect.
          </p>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUICK_LINKS.map(link => (
            <Card key={link.path}
              className="group cursor-pointer hover:scale-[1.02] transition-transform"
              onClick={() => navigate(link.path)}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl border ${link.bg}`}>
                  <link.icon size={20} className={link.color} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white/80">{link.label}</p>
                  <p className="text-xs text-white/30 mt-0.5">{link.desc}</p>
                </div>
                <ArrowRight size={14} className="text-white/10 group-hover:text-white/30 transition-colors" />
              </div>
            </Card>
          ))}
        </div>

        {/* Tip of the Day */}
        <Card className="!bg-white/[0.03]">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 shrink-0">
              <Lightbulb size={16} className="text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[0.6rem] font-semibold text-white/25 uppercase tracking-wider mb-1">Tip of the day</p>
              <p className="text-xs text-white/50">{tip.text}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setTipIndex(i => (i - 1 + TIPS.length) % TIPS.length)}
                className="p-1 rounded-lg text-white/15 hover:text-white/40 hover:bg-white/5 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setTipIndex(i => (i + 1) % TIPS.length)}
                className="p-1 rounded-lg text-white/15 hover:text-white/40 hover:bg-white/5 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </Card>

      </div>
    </div>
  )
}
