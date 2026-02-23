import { useState, useEffect } from 'react'
import Card from '../components/ui/Card'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import {
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ChevronUp, ChevronDown,
  Hand, Home, Eye, Plus, Trash2, Play, Unlock, Gauge,
  Globe, Box, Wrench, RotateCcw, OctagonX
} from 'lucide-react'

const STEP_SIZES = [0.1, 1, 10, 100]
const FRAMES = [
  { key: 'world', label: 'World', icon: Globe },
  { key: 'base', label: 'Base', icon: Box },
  { key: 'tool', label: 'Tool', icon: Wrench },
]

const PRESET_POSITIONS = [
  { id: 1, name: 'Home', joints: [0, -90, 0, -90, 0, 0], cartesian: [400.0, 0.0, 350.0, 180.0, 0.0, 0.0], preset: true },
  { id: 2, name: 'Inspection', joints: [45.2, -60.3, 82.1, -110.5, -45.0, 12.8], cartesian: [520.3, 180.5, 280.0, 175.2, -5.3, 42.1], preset: true },
  { id: 3, name: 'Pickup', joints: [-30.0, -45.0, 60.0, -105.0, 90.0, -30.0], cartesian: [350.0, -200.5, 150.0, 180.0, 0.0, -30.0], preset: true },
]

const JOINT_LABELS = ['J1', 'J2', 'J3', 'J4', 'J5', 'J6']
const CART_LABELS = ['X', 'Y', 'Z', 'Rx', 'Ry', 'Rz']
const CART_UNITS = ['mm', 'mm', 'mm', '°', '°', '°']

function JogButton({ children, onPress, pressed, className = '' }) {
  return (
    <button onMouseDown={onPress}
      className={`flex items-center justify-center gap-1 rounded-xl border transition-all cursor-pointer select-none ${
        pressed
          ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
          : 'bg-white/[0.04] border-white/8 text-white/50 hover:bg-white/10 hover:text-white hover:border-white/15 active:bg-blue-500/20 active:border-blue-500/30 active:text-blue-400'
      } ${className}`}>
      {children}
    </button>
  )
}

function SegmentToggle({ options, value, onChange }) {
  return (
    <div className="flex bg-white/[0.04] rounded-lg p-0.5">
      {options.map(opt => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[0.7rem] font-medium transition-all cursor-pointer ${
            value === opt.value ? 'bg-white/10 text-white/80' : 'text-white/30 hover:text-white/50'
          }`}>
          {opt.icon && <opt.icon size={11} />}
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default function ManualControlPage() {
  const [posView, setPosView] = useState('cartesian')
  const [jogMode, setJogMode] = useState('cartesian')
  const [stepSize, setStepSize] = useState(1)
  const [speed, setSpeed] = useState(25)
  const [frame, setFrame] = useState('world')
  const [gripperOpen, setGripperOpen] = useState(true)
  const [gripperForce, setGripperForce] = useState(50)
  const [freedrive, setFreedrive] = useState(false)
  const [estop, setEstop] = useState(false)
  const [positions, setPositions] = useState(PRESET_POSITIONS)
  const [saveName, setSaveName] = useState('')
  const [nextId, setNextId] = useState(4)

  const [joints, setJoints] = useState([45.2, -60.3, 82.1, -110.5, -45.0, 12.8])
  const [cartesian, setCartesian] = useState([520.3, 180.5, 280.0, 175.2, -5.3, 42.1])
  const [showEstopConfirm, setShowEstopConfirm] = useState(false)
  const [pressedKey, setPressedKey] = useState(null)

  /* Arrow key jog support */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (estop) return
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (jogMode === 'cartesian') {
        switch (e.key) {
          case 'ArrowLeft':  e.preventDefault(); setPressedKey('x-'); jog(0, -1); break
          case 'ArrowRight': e.preventDefault(); setPressedKey('x+'); jog(0, 1); break
          case 'ArrowUp':    e.preventDefault(); setPressedKey('y+'); jog(1, 1); break
          case 'ArrowDown':  e.preventDefault(); setPressedKey('y-'); jog(1, -1); break
        }
      }
    }
    const handleKeyUp = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        setPressedKey(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  })

  const jog = (axis, dir) => {
    if (estop) return
    if (jogMode === 'cartesian') {
      setCartesian(prev => prev.map((v, i) => i === axis ? +(v + dir * stepSize).toFixed(2) : v))
    } else {
      setJoints(prev => prev.map((v, i) => i === axis ? +(v + dir * stepSize * 0.1).toFixed(2) : v))
    }
  }

  const goTo = (pos) => {
    if (estop) return
    setJoints([...pos.joints])
    setCartesian([...pos.cartesian])
  }

  const savePosition = () => {
    if (!saveName.trim()) return
    setPositions(prev => [...prev, { id: nextId, name: saveName.trim(), joints: [...joints], cartesian: [...cartesian], preset: false }])
    setNextId(nextId + 1)
    setSaveName('')
  }

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white/90">Manual Control</h2>
          <p className="text-sm text-white/40 mt-1">Jog the robot, control the gripper, and manage positions</p>
        </div>
        <button onClick={() => estop ? setEstop(false) : setShowEstopConfirm(true)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            estop
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
              : 'bg-white/[0.04] border border-rose-500/30 text-rose-400 hover:bg-rose-500/10'
          }`}>
          <OctagonX size={16} />
          {estop ? 'Release E-Stop' : 'E-Stop'}
        </button>
      </div>

      {/* E-Stop banner */}
      {estop && (
        <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl px-5 py-3 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <p className="text-sm text-rose-400">Emergency stop active — all motion disabled</p>
        </div>
      )}

      {/* Main grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ─── Left: Position & Jog (3 cols) ─── */}
        <div className="lg:col-span-3 flex flex-col gap-6">

          {/* Position readout */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-white/60">Current Position</h3>
              <div className="flex gap-2">
                <SegmentToggle
                  options={[{ value: 'cartesian', label: 'Cartesian' }, { value: 'joint', label: 'Joints' }]}
                  value={posView} onChange={setPosView} />
                {posView === 'cartesian' && (
                  <SegmentToggle
                    options={FRAMES.map(f => ({ value: f.key, label: f.label, icon: f.icon }))}
                    value={frame} onChange={setFrame} />
                )}
              </div>
            </div>
            <div className="grid grid-cols-6 gap-3">
              {(posView === 'cartesian' ? cartesian : joints).map((v, i) => (
                <div key={i} className="text-center py-3">
                  <p className="text-[0.65rem] text-white/25 mb-1">
                    {posView === 'cartesian' ? CART_LABELS[i] : JOINT_LABELS[i]}
                  </p>
                  <p className="text-lg font-mono font-medium text-white/85">{v.toFixed(1)}</p>
                  <p className="text-[0.55rem] text-white/20 mt-0.5">
                    {posView === 'cartesian' ? CART_UNITS[i] : '°'}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Jog controls */}
          <Card className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-white/60">Jog</h3>
              <SegmentToggle
                options={[{ value: 'cartesian', label: 'Cartesian' }, { value: 'joint', label: 'Joint' }]}
                value={jogMode} onChange={setJogMode} />
            </div>

            {jogMode === 'cartesian' ? (
              <div className="flex-1 grid grid-cols-3 gap-6 content-center">
                {/* X Axis */}
                <div className="flex flex-col gap-3">
                  <p className="text-[0.65rem] font-semibold text-center uppercase tracking-widest text-rose-400/60">X</p>
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <JogButton onPress={() => jog(0, -1)} pressed={pressedKey === 'x-'} className="min-h-16">
                      <ArrowLeft size={18} /><span className="text-xs">X−</span>
                    </JogButton>
                    <JogButton onPress={() => jog(0, 1)} pressed={pressedKey === 'x+'} className="min-h-16">
                      <span className="text-xs">X+</span><ArrowRight size={18} />
                    </JogButton>
                  </div>
                </div>
                {/* Y Axis */}
                <div className="flex flex-col gap-3">
                  <p className="text-[0.65rem] font-semibold text-center uppercase tracking-widest text-emerald-400/60">Y</p>
                  <div className="flex flex-col gap-2 flex-1">
                    <JogButton onPress={() => jog(1, 1)} pressed={pressedKey === 'y+'} className="flex-1 min-h-16 w-full">
                      <ArrowUp size={18} /><span className="text-xs">Y+</span>
                    </JogButton>
                    <JogButton onPress={() => jog(1, -1)} pressed={pressedKey === 'y-'} className="flex-1 min-h-16 w-full">
                      <ArrowDown size={18} /><span className="text-xs">Y−</span>
                    </JogButton>
                  </div>
                </div>
                {/* Z Axis */}
                <div className="flex flex-col gap-3">
                  <p className="text-[0.65rem] font-semibold text-center uppercase tracking-widest text-blue-400/60">Z</p>
                  <div className="flex flex-col gap-2 flex-1">
                    <JogButton onPress={() => jog(2, 1)} className="flex-1 min-h-16 w-full">
                      <ChevronUp size={18} /><span className="text-xs">Z+</span>
                    </JogButton>
                    <JogButton onPress={() => jog(2, -1)} className="flex-1 min-h-16 w-full">
                      <ChevronDown size={18} /><span className="text-xs">Z−</span>
                    </JogButton>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 grid grid-cols-6 gap-3 content-center">
                {JOINT_LABELS.map((label, i) => (
                  <div key={label} className="flex flex-col gap-2">
                    <JogButton onPress={() => jog(i, 1)} className="flex-1 min-h-14 w-full">
                      <ChevronUp size={18} />
                    </JogButton>
                    <div className="text-center py-1">
                      <p className="text-[0.6rem] text-white/25">{label}</p>
                      <p className="text-sm font-mono text-white/60">{joints[i].toFixed(1)}°</p>
                    </div>
                    <JogButton onPress={() => jog(i, -1)} className="flex-1 min-h-14 w-full">
                      <ChevronDown size={18} />
                    </JogButton>
                  </div>
                ))}
              </div>
            )}

            {/* Step & Speed */}
            <div className="grid grid-cols-2 gap-6 pt-5 mt-auto border-t border-white/5">
              <div>
                <p className="text-[0.65rem] font-semibold text-white/25 uppercase tracking-wider mb-2.5">Step Size</p>
                <SegmentToggle
                  options={STEP_SIZES.map(s => ({ value: s, label: `${s}` }))}
                  value={stepSize} onChange={setStepSize} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[0.65rem] font-semibold text-white/25 uppercase tracking-wider">Speed</p>
                  <span className="text-xs font-mono text-white/40">{speed}%</span>
                </div>
                <input type="range" min="1" max="100" value={speed}
                  onChange={(e) => setSpeed(+e.target.value)}
                  className="w-full accent-blue-500 cursor-pointer" />
              </div>
            </div>
          </Card>
        </div>

        {/* ─── Right: Status, Gripper, Positions (2 cols) ─── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Status + Freedrive */}
          <Card>
            <h3 className="text-sm font-semibold text-white/60 mb-4">Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/30">Connection</span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/30">Mode</span>
                <span className={estop ? 'text-rose-400' : freedrive ? 'text-amber-400' : 'text-white/60'}>
                  {estop ? 'E-Stop' : freedrive ? 'Freedrive' : 'Remote'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/30">Speed</span>
                <span className="text-white/50">{speed}%</span>
              </div>
            </div>
            <button onClick={() => setFreedrive(!freedrive)}
              className={`w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                freedrive
                  ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                  : 'bg-white/[0.04] border border-white/8 text-white/35 hover:text-white/60 hover:bg-white/[0.07]'
              }`}>
              <Unlock size={14} />
              {freedrive ? 'Freedrive Active' : 'Enable Freedrive'}
            </button>
          </Card>

          {/* Gripper */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white/60">Gripper</h3>
              <span className="text-xs text-white/25">{gripperOpen ? 'Open' : 'Closed'}</span>
            </div>
            {/* Visual */}
            <div className="flex items-center justify-center py-5">
              <div className={`w-2.5 h-10 rounded-l-md transition-all duration-300 ${gripperOpen ? 'bg-white/15 -translate-x-4' : 'bg-purple-400/60 -translate-x-[1px]'}`} />
              <div className={`w-2.5 h-10 rounded-r-md transition-all duration-300 ${gripperOpen ? 'bg-white/15 translate-x-4' : 'bg-purple-400/60 translate-x-[1px]'}`} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setGripperOpen(true)}
                className={`py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  gripperOpen ? 'bg-white/10 border border-white/15 text-white/70' : 'bg-white/[0.03] border border-white/8 text-white/30 hover:bg-white/[0.06]'
                }`}>Open</button>
              <button onClick={() => setGripperOpen(false)}
                className={`py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  !gripperOpen ? 'bg-purple-500/15 border border-purple-500/25 text-purple-400' : 'bg-white/[0.03] border border-white/8 text-white/30 hover:bg-white/[0.06]'
                }`}>Close</button>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[0.65rem] text-white/25">Force</span>
                <span className="text-xs font-mono text-white/35">{gripperForce}%</span>
              </div>
              <input type="range" min="10" max="100" value={gripperForce}
                onChange={(e) => setGripperForce(+e.target.value)}
                className="w-full accent-purple-500 cursor-pointer" />
            </div>
          </Card>

          {/* Positions */}
          <Card className="flex-1 flex flex-col">
            <h3 className="text-sm font-semibold text-white/60 mb-4">Positions</h3>
            <div className="space-y-2 flex-1 max-h-56 overflow-y-auto pr-1">
              {positions.map(pos => (
                <div key={pos.id} className="flex items-center gap-3 bg-white/[0.03] rounded-xl px-3 py-2.5 group">
                  <span className="text-sm text-white/60 flex-1">{pos.name}</span>
                  <button onClick={() => goTo(pos)}
                    className="p-1.5 rounded-lg text-white/15 hover:text-blue-400 hover:bg-blue-500/10 transition-all cursor-pointer">
                    <Play size={13} />
                  </button>
                  {!pos.preset && (
                    <button onClick={() => setPositions(prev => prev.filter(p => p.id !== pos.id))}
                      className="p-1.5 rounded-lg text-white/10 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
              <input type="text" value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && savePosition()}
                placeholder="Save current position..."
                className="flex-1 bg-white/[0.04] border border-white/8 rounded-xl px-3 py-2 text-xs text-white/70 placeholder-white/20 outline-none focus:border-white/20 transition-all" />
              <button onClick={savePosition}
                className="px-3 rounded-xl bg-white/[0.04] border border-white/8 text-white/25 hover:text-emerald-400 hover:border-emerald-500/25 hover:bg-emerald-500/10 transition-all cursor-pointer">
                <Plus size={14} />
              </button>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={showEstopConfirm}
        danger
        title="Activate Emergency Stop?"
        message="This will immediately halt all robot motion."
        confirmLabel="Activate E-Stop"
        onConfirm={() => { setEstop(true); setShowEstopConfirm(false) }}
        onCancel={() => setShowEstopConfirm(false)}
      />
    </div>
  )
}
