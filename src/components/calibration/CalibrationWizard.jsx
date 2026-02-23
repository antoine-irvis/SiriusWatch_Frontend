import { useState, useEffect, useRef, Fragment } from 'react'
import { X, Check, ChevronDown, Wifi, Target, Camera, Cpu, ShieldCheck, Crosshair, Trash2, Circle } from 'lucide-react'
import Button from '../ui/Button'

const MIN_CAPTURES = 10
const MIN_POSES = 8

const CAMERA_STEPS = [
  { key: 'connect', title: 'Connect', icon: Wifi },
  { key: 'prepare', title: 'Prepare', icon: Target },
  { key: 'capture', title: 'Capture', icon: Camera },
  { key: 'compute', title: 'Compute', icon: Cpu },
  { key: 'verify', title: 'Verify', icon: ShieldCheck },
]

const HANDEYE_STEPS = [
  { key: 'prereq', title: 'Prerequisites', icon: Check },
  { key: 'mount', title: 'Mount', icon: Target },
  { key: 'record', title: 'Record', icon: Crosshair },
  { key: 'solve', title: 'Solve', icon: Cpu },
  { key: 'validate', title: 'Validate', icon: ShieldCheck },
]

const MOCK_CAMERA_RESULTS = {
  intrinsicMatrix: [[1432.5, 0, 962.3], [0, 1428.7, 540.1], [0, 0, 1]],
  distortionCoeffs: [-0.2134, 0.1562, -0.0008, 0.0012, -0.0423],
  reprojectionError: 0.32,
}

const MOCK_HANDEYE_RESULTS = {
  transformMatrix: [
    [0.9998, -0.0152, 0.0134, 42.51],
    [0.0148, 0.9995, 0.0273, -15.83],
    [-0.0138, -0.0271, 0.9995, 128.42],
    [0, 0, 0, 1],
  ],
  rotationError: 0.15,
  translationError: 0.42,
}

function randomChecker() {
  return {
    x: 60 + Math.random() * 180,
    y: 40 + Math.random() * 130,
    angle: -25 + Math.random() * 50,
    scale: 0.7 + Math.random() * 0.4,
    gridRegion: [Math.floor(Math.random() * 4), Math.floor(Math.random() * 3)],
  }
}

function randomPose() {
  return Array.from({ length: 6 }, () => (-180 + Math.random() * 360).toFixed(1))
}

/* ── Sub-components ── */

function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center justify-center gap-1 px-6 py-3 border-b border-white/5">
      {steps.map((s, i) => (
        <Fragment key={s.key}>
          <div className="flex items-center gap-1.5">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
              i < current ? 'bg-emerald-500/20 text-emerald-400' :
              i === current ? 'bg-blue-500/20 text-blue-400 ring-2 ring-blue-500/30' :
              'bg-white/5 text-white/25'
            }`}>
              {i < current ? <Check size={12} /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden md:inline ${i <= current ? 'text-white/70' : 'text-white/25'}`}>{s.title}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-6 lg:w-10 h-px mx-1 ${i < current ? 'bg-emerald-500/40' : 'bg-white/10'}`} />
          )}
        </Fragment>
      ))}
    </div>
  )
}

function CameraFeed({ pos }) {
  const sq = 10
  return (
    <div className="rounded-xl overflow-hidden border border-white/10">
      <svg viewBox="0 0 320 240" className="w-full bg-[#06060f]">
        {Array.from({ length: 7 }).map((_, i) => <line key={`v${i}`} x1={(i + 1) * 40} y1="0" x2={(i + 1) * 40} y2="240" stroke="white" strokeOpacity="0.03" />)}
        {Array.from({ length: 5 }).map((_, i) => <line key={`h${i}`} x1="0" y1={(i + 1) * 40} x2="320" y2={(i + 1) * 40} stroke="white" strokeOpacity="0.03" />)}
        {pos && (
          <g transform={`translate(${pos.x},${pos.y}) rotate(${pos.angle}) scale(${pos.scale})`}>
            {Array.from({ length: 8 }).map((_, c) =>
              Array.from({ length: 6 }).map((_, r) => (
                <rect key={`${c}${r}`} x={c * sq} y={r * sq} width={sq} height={sq} fill={(c + r) % 2 === 0 ? 'white' : '#222'} fillOpacity="0.85" />
              ))
            )}
            {Array.from({ length: 7 }).map((_, c) =>
              Array.from({ length: 5 }).map((_, r) => (
                <circle key={`d${c}${r}`} cx={(c + 1) * sq} cy={(r + 1) * sq} r="1.5" fill="#34d399" />
              ))
            )}
          </g>
        )}
        <circle cx="15" cy="15" r="4" fill="#ef4444"><animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" /></circle>
        <text x="25" y="19" fill="white" fontSize="9" fontFamily="monospace" fillOpacity="0.6">LIVE</text>
        <line x1="155" y1="120" x2="165" y2="120" stroke="white" strokeOpacity="0.2" />
        <line x1="160" y1="115" x2="160" y2="125" stroke="white" strokeOpacity="0.2" />
      </svg>
    </div>
  )
}

function CoverageHeatmap({ captures }) {
  const grid = Array.from({ length: 3 }, () => Array(4).fill(0))
  captures.forEach(c => { if (c.gridRegion) grid[c.gridRegion[1]][c.gridRegion[0]]++ })
  const total = 12
  const covered = grid.flat().filter(v => v > 0).length
  return (
    <div>
      <p className="text-[0.65rem] font-semibold text-white/30 uppercase tracking-wider mb-1.5">Coverage — {Math.round(covered / total * 100)}%</p>
      <svg viewBox="0 0 124 94" className="w-28">
        {grid.map((row, ri) => row.map((cnt, ci) => (
          <rect key={`${ri}${ci}`} x={ci * 31 + 1} y={ri * 31 + 1} width={29} height={29} rx={4}
            fill={cnt === 0 ? 'rgba(255,255,255,0.04)' : cnt === 1 ? 'rgba(59,130,246,0.35)' : cnt === 2 ? 'rgba(59,130,246,0.55)' : 'rgba(52,211,153,0.55)'}
            stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        )))}
      </svg>
    </div>
  )
}

function ReprojectionGauge({ value }) {
  const max = 2.0
  const f = Math.min(value / max, 1)
  const cx = 100, cy = 80, r = 55
  const ap = (frac) => ({ x: cx + r * Math.cos(Math.PI * (1 - frac)), y: cy - r * Math.sin(Math.PI * (1 - frac)) })
  const p0 = ap(0), p25 = ap(0.25), p50 = ap(0.5), p100 = ap(1)
  const na = Math.PI * (1 - f)
  const nx = cx + (r - 12) * Math.cos(na), ny = cy - (r - 12) * Math.sin(na)
  const color = value < 0.5 ? '#34d399' : value < 1.0 ? '#f59e0b' : '#ef4444'
  return (
    <svg viewBox="0 0 200 105" className="w-full max-w-[220px] mx-auto">
      <path d={`M ${p0.x} ${p0.y} A ${r} ${r} 0 0 1 ${p25.x} ${p25.y}`} stroke="#34d399" strokeWidth="10" fill="none" strokeOpacity="0.3" strokeLinecap="round" />
      <path d={`M ${p25.x} ${p25.y} A ${r} ${r} 0 0 1 ${p50.x} ${p50.y}`} stroke="#f59e0b" strokeWidth="10" fill="none" strokeOpacity="0.3" strokeLinecap="round" />
      <path d={`M ${p50.x} ${p50.y} A ${r} ${r} 0 0 1 ${p100.x} ${p100.y}`} stroke="#ef4444" strokeWidth="10" fill="none" strokeOpacity="0.3" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="4" fill="white" />
      <text x={cx} y={cy + 18} textAnchor="middle" fill={color} fontSize="16" fontWeight="bold">{value.toFixed(2)}</text>
      <text x={cx} y={cy + 30} textAnchor="middle" fill="white" fontSize="8" fillOpacity="0.4">pixels</text>
      <text x={p0.x} y={p0.y + 14} textAnchor="middle" fill="white" fontSize="7" fillOpacity="0.25">0</text>
      <text x={cx} y={ap(0.5).y - 6} textAnchor="middle" fill="white" fontSize="7" fillOpacity="0.25">1.0</text>
      <text x={p100.x} y={p100.y + 14} textAnchor="middle" fill="white" fontSize="7" fillOpacity="0.25">2.0</text>
    </svg>
  )
}

function DistortionComparison() {
  const n = 6, cell = 14, off = 8, sz = off * 2 + n * cell
  const strength = 3.5
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="text-center">
        <svg viewBox={`0 0 ${sz} ${sz}`} className="w-full rounded-lg border border-white/10 bg-[#0a0a14]">
          {Array.from({ length: n + 1 }).map((_, i) => {
            const y = off + i * cell, d = (i - n / 2) * -strength
            return <path key={`h${i}`} d={`M ${off} ${y} Q ${sz / 2} ${y + d} ${sz - off} ${y}`} stroke="white" strokeOpacity="0.35" fill="none" strokeWidth="0.5" />
          })}
          {Array.from({ length: n + 1 }).map((_, i) => {
            const x = off + i * cell, d = (i - n / 2) * -strength
            return <path key={`v${i}`} d={`M ${x} ${off} Q ${x + d} ${sz / 2} ${x} ${sz - off}`} stroke="white" strokeOpacity="0.35" fill="none" strokeWidth="0.5" />
          })}
        </svg>
        <p className="text-[0.6rem] text-white/30 mt-1">Before</p>
      </div>
      <div className="text-center">
        <svg viewBox={`0 0 ${sz} ${sz}`} className="w-full rounded-lg border border-emerald-500/20 bg-[#0a0a14]">
          {Array.from({ length: n + 1 }).map((_, i) => {
            const y = off + i * cell
            return <line key={`h${i}`} x1={off} y1={y} x2={sz - off} y2={y} stroke="white" strokeOpacity="0.35" strokeWidth="0.5" />
          })}
          {Array.from({ length: n + 1 }).map((_, i) => {
            const x = off + i * cell
            return <line key={`v${i}`} x1={x} y1={off} x2={x} y2={sz - off} stroke="white" strokeOpacity="0.35" strokeWidth="0.5" />
          })}
        </svg>
        <p className="text-[0.6rem] text-emerald-400/60 mt-1">After (corrected)</p>
      </div>
    </div>
  )
}

function MatrixDisplay({ matrix, label }) {
  return (
    <div>
      <p className="text-[0.65rem] font-semibold text-white/30 uppercase tracking-wider mb-2">{label}</p>
      <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3 font-mono text-xs overflow-x-auto">
        {matrix.map((row, i) => (
          <div key={i} className="flex gap-3 text-white/70">
            <span className="text-white/15">{'['}</span>
            {row.map((v, j) => <span key={j} className="w-16 text-right">{typeof v === 'number' ? v.toFixed(4) : v}</span>)}
            <span className="text-white/15">{']'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Main Wizard ── */

export default function CalibrationWizard({ type, onComplete, onCancel }) {
  const [step, setStep] = useState(0)
  const [captures, setCaptures] = useState([])
  const [poses, setPoses] = useState([])
  const [checkerPos, setCheckerPos] = useState(randomChecker())
  const [currentPose, setCurrentPose] = useState(randomPose())
  const [events, setEvents] = useState([])
  const [connected, setConnected] = useState(false)
  const [computing, setComputing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState(null)
  const [showLog, setShowLog] = useState(false)
  const logRef = useRef(null)

  const steps = type === 'camera' ? CAMERA_STEPS : HANDEYE_STEPS
  const addEvent = (msg) => setEvents(prev => [...prev, { time: new Date().toLocaleTimeString(), msg }])

  // Auto-scroll log
  useEffect(() => { logRef.current?.scrollTo(0, logRef.current.scrollHeight) }, [events, showLog])

  // Escape key to close wizard
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onCancel])

  // Step 0: auto-connect
  useEffect(() => {
    if (step !== 0) return
    setConnected(false)
    addEvent(type === 'camera' ? 'Initializing camera connection...' : 'Checking prerequisites...')
    const t = setTimeout(() => {
      setConnected(true)
      if (type === 'camera') {
        addEvent('Camera connected — 1920×1080 @ 30fps')
      } else {
        addEvent('Camera calibration verified — reproj. error 0.32 px')
        addEvent('Robot connection verified — UR5e online')
      }
    }, 2000)
    return () => clearTimeout(t)
  }, [step])

  // Step 2: animate checker position
  useEffect(() => {
    if (step !== 2 || type !== 'camera') return
    const iv = setInterval(() => setCheckerPos(randomChecker()), 1800)
    return () => clearInterval(iv)
  }, [step, type])

  // Step 3: auto-compute
  useEffect(() => {
    if (step !== 3) return
    setComputing(true)
    setProgress(0)
    setResults(null)
    addEvent(type === 'camera' ? 'Computing intrinsic parameters...' : 'Solving AX = XB (Tsai-Lenz)...')
    const iv = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(iv)
          setComputing(false)
          const r = type === 'camera' ? MOCK_CAMERA_RESULTS : MOCK_HANDEYE_RESULTS
          setResults(r)
          if (type === 'camera') {
            addEvent(`Converged in 24 iterations — reproj. error: ${r.reprojectionError} px`)
          } else {
            addEvent(`Converged — rot. error: ${r.rotationError}° | trans. error: ${r.translationError} mm`)
          }
          return 100
        }
        return prev + 2
      })
    }, 60)
    return () => clearInterval(iv)
  }, [step])

  const handleCapture = () => {
    const c = { ...checkerPos, id: captures.length + 1, timestamp: new Date().toLocaleTimeString() }
    setCaptures(prev => [...prev, c])
    setCheckerPos(randomChecker())
    addEvent(`Image ${captures.length + 1} captured — region [${c.gridRegion}]`)
  }

  const handleRecordPose = () => {
    const p = { id: poses.length + 1, joints: currentPose, timestamp: new Date().toLocaleTimeString() }
    setPoses(prev => [...prev, p])
    setCurrentPose(randomPose())
    addEvent(`Pose ${poses.length + 1} recorded — J1:${currentPose[0]}°`)
  }

  const canProceed = () => {
    if (step === 0) return connected
    if (step === 2) return type === 'camera' ? captures.length >= MIN_CAPTURES : poses.length >= MIN_POSES
    if (step === 3) return !computing && results !== null
    return true
  }

  const handleFinish = () => {
    addEvent('Calibration complete')
    onComplete({
      results,
      events: [...events, { time: new Date().toLocaleTimeString(), msg: 'Calibration complete' }],
      imageCount: type === 'camera' ? captures.length : poses.length,
      coverage: type === 'camera' ? Math.round(
        new Set(captures.map(c => `${c.gridRegion[0]},${c.gridRegion[1]}`)).size / 12 * 100
      ) : null,
    })
  }

  /* ── Step Renderers ── */

  const renderStep0 = () => (
    <div className="flex flex-col items-center justify-center py-10 gap-6">
      {!connected ? (
        <>
          <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center animate-pulse">
            <Wifi size={28} className="text-blue-400" />
          </div>
          <div className="text-center">
            <p className="text-white/70 font-medium">{type === 'camera' ? 'Detecting camera...' : 'Verifying prerequisites...'}</p>
            <p className="text-xs text-white/30 mt-1">This may take a few seconds</p>
          </div>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Check size={28} className="text-emerald-400" />
          </div>
          <div className="text-center">
            <p className="text-emerald-400 font-medium">{type === 'camera' ? 'Camera Connected' : 'All Prerequisites Met'}</p>
            {type === 'camera' ? (
              <p className="text-xs text-white/40 mt-1">Resolution: 1920×1080 &bull; 30 fps &bull; USB 3.0</p>
            ) : (
              <div className="text-xs text-white/40 mt-2 space-y-1">
                <p className="flex items-center gap-2 justify-center"><Check size={10} className="text-emerald-400" /> Camera calibration valid</p>
                <p className="flex items-center gap-2 justify-center"><Check size={10} className="text-emerald-400" /> Robot connected (UR5e)</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )

  const renderStep1 = () => (
    <div className="max-w-lg mx-auto space-y-6 py-4">
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
        {type === 'camera' ? (
          <>
            <h4 className="text-sm font-semibold text-white/80 mb-3">Prepare Calibration Target</h4>
            <ul className="space-y-2.5 text-sm text-white/50">
              <li className="flex gap-2"><span className="text-blue-400 mt-0.5">1.</span>Use a <Tip text="A flat board with alternating black and white squares">checkerboard pattern</Tip> — 8×6 inner corners, 25 mm squares</li>
              <li className="flex gap-2"><span className="text-blue-400 mt-0.5">2.</span>Ensure flat, rigid mounting (no flex/warp)</li>
              <li className="flex gap-2"><span className="text-blue-400 mt-0.5">3.</span>Provide even, diffuse lighting — avoid glare</li>
              <li className="flex gap-2"><span className="text-blue-400 mt-0.5">4.</span>Keep the target fully visible in the camera frame</li>
            </ul>
          </>
        ) : (
          <>
            <h4 className="text-sm font-semibold text-white/80 mb-3">Mount Calibration Target</h4>
            <ul className="space-y-2.5 text-sm text-white/50">
              <li className="flex gap-2"><span className="text-purple-400 mt-0.5">1.</span>Attach the calibration target rigidly to the robot end-effector</li>
              <li className="flex gap-2"><span className="text-purple-400 mt-0.5">2.</span>Ensure no play or wobble in the mount</li>
              <li className="flex gap-2"><span className="text-purple-400 mt-0.5">3.</span>Verify the target is visible to the camera from multiple robot poses</li>
              <li className="flex gap-2"><span className="text-purple-400 mt-0.5">4.</span>Plan a set of diverse poses covering the workspace</li>
            </ul>
          </>
        )}
      </div>
      {/* Diagram */}
      <div className="flex justify-center">
        {type === 'camera' ? (
          <svg viewBox="0 0 200 80" className="w-full max-w-[280px] text-blue-400">
            <rect x="10" y="20" width="40" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="30" cy="35" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="30" cy="35" r="3" fill="currentColor" fillOpacity="0.3" />
            <line x1="50" y1="28" x2="130" y2="15" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 2" strokeOpacity="0.4" />
            <line x1="50" y1="42" x2="130" y2="55" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 2" strokeOpacity="0.4" />
            {Array.from({ length: 4 }).map((_, c) =>
              Array.from({ length: 3 }).map((_, r) => (
                <rect key={`${c}${r}`} x={135 + c * 12} y={12 + r * 16} width={10} height={14} rx={1}
                  fill={(c + r) % 2 === 0 ? 'currentColor' : 'none'} fillOpacity="0.25" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
              ))
            )}
            <text x="30" y="65" textAnchor="middle" fill="white" fillOpacity="0.3" fontSize="7">Camera</text>
            <text x="160" y="65" textAnchor="middle" fill="white" fillOpacity="0.3" fontSize="7">Target</text>
          </svg>
        ) : (
          <svg viewBox="0 0 220 90" className="w-full max-w-[300px] text-purple-400">
            <rect x="10" y="60" width="50" height="8" rx="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1" />
            <rect x="50" y="35" width="8" height="33" rx="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1" />
            <rect x="50" y="30" width="30" height="10" rx="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1" />
            <rect x="82" y="18" width="16" height="12" rx="2" fill="none" stroke="#3b82f6" strokeWidth="1.2" />
            <circle cx="90" cy="24" r="3" fill="#3b82f6" fillOpacity="0.3" />
            <path d="M 82 35 C 82 50 120 50 120 35" stroke="#f59e0b" strokeWidth="1.2" fill="none" strokeDasharray="3 2" />
            <text x="100" y="55" fill="#f59e0b" fillOpacity="0.6" fontSize="7" textAnchor="middle">T_hand-eye</text>
            <text x="35" y="78" textAnchor="middle" fill="white" fillOpacity="0.3" fontSize="7">Robot</text>
            <text x="90" y="14" textAnchor="middle" fill="white" fillOpacity="0.3" fontSize="7">Camera</text>
          </svg>
        )}
      </div>
    </div>
  )

  const renderStep2Camera = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-3">
        <CameraFeed pos={checkerPos} />
        <div className="flex items-center gap-3">
          <Button onClick={handleCapture}>
            <Camera size={14} /> Capture
          </Button>
          <span className="text-sm text-white/40">{captures.length} / {MIN_CAPTURES} minimum</span>
          {captures.length >= MIN_CAPTURES && <Check size={14} className="text-emerald-400" />}
        </div>
      </div>
      <div className="space-y-5">
        <CoverageHeatmap captures={captures} />
        {/* Thumbnail gallery */}
        <div>
          <p className="text-[0.65rem] font-semibold text-white/30 uppercase tracking-wider mb-1.5">Images ({captures.length})</p>
          <div className="grid grid-cols-4 gap-1.5 max-h-40 overflow-y-auto pr-1">
            {captures.map(cap => (
              <div key={cap.id} className="relative group">
                <div className="aspect-[4/3] rounded bg-[#0a0a14] border border-white/10 flex items-center justify-center">
                  <svg viewBox="0 0 40 30" className="w-full h-full p-1">
                    <g transform={`translate(${(cap.x / 320) * 40},${(cap.y / 240) * 30}) scale(0.12)`}>
                      {Array.from({ length: 4 }).map((_, c) =>
                        Array.from({ length: 3 }).map((_, r) =>
                          (c + r) % 2 === 0 && <rect key={`${c}${r}`} x={c * 10} y={r * 10} width={10} height={10} fill="white" fillOpacity="0.6" />
                        )
                      )}
                    </g>
                    <circle cx="4" cy="4" r="1.5" fill="#34d399" />
                  </svg>
                </div>
                <button onClick={() => { setCaptures(prev => prev.filter(c => c.id !== cap.id)); addEvent(`Image ${cap.id} removed`) }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <X size={8} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep2HandEye = () => (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <p className="text-[0.65rem] font-semibold text-white/30 uppercase tracking-wider mb-3">Current Robot Pose</p>
        <div className="grid grid-cols-3 gap-3">
          {currentPose.map((v, i) => (
            <div key={i} className="bg-white/5 rounded-lg px-3 py-2 text-center">
              <span className="text-[0.65rem] text-white/30">J{i + 1}</span>
              <p className="text-sm font-mono text-white/80">{v}°</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={handleRecordPose}>
          <Crosshair size={14} /> Record Pose
        </Button>
        <span className="text-sm text-white/40">{poses.length} / {MIN_POSES} minimum</span>
        {poses.length >= MIN_POSES && <Check size={14} className="text-emerald-400" />}
      </div>
      {poses.length > 0 && (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[2rem_1fr_5rem_2rem] gap-2 px-3 py-2 text-[0.65rem] text-white/30 uppercase tracking-wider border-b border-white/5">
            <span>#</span><span>Joint Angles</span><span>Time</span><span></span>
          </div>
          <div className="max-h-40 overflow-y-auto">
            {poses.map(p => (
              <div key={p.id} className="grid grid-cols-[2rem_1fr_5rem_2rem] gap-2 px-3 py-2 text-xs border-b border-white/[0.03] items-center">
                <span className="text-white/30">{p.id}</span>
                <span className="font-mono text-white/60 truncate">[{p.joints.join(', ')}]</span>
                <span className="text-white/25">{p.timestamp}</span>
                <button onClick={() => { setPoses(prev => prev.filter(x => x.id !== p.id)); addEvent(`Pose ${p.id} removed`) }}
                  className="text-white/15 hover:text-rose-400 cursor-pointer"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderStep3 = () => (
    <div className="max-w-lg mx-auto py-8 space-y-6">
      {computing ? (
        <div className="space-y-4 text-center">
          <Cpu size={32} className="mx-auto text-blue-400 animate-pulse" />
          <p className="text-white/70 font-medium">{type === 'camera' ? 'Computing intrinsic parameters...' : 'Solving hand-eye transform...'}</p>
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-white/30">{progress}%</p>
        </div>
      ) : results && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 justify-center">
            <Check size={18} className="text-emerald-400" />
            <p className="text-emerald-400 font-medium">Computation Complete</p>
          </div>
          {type === 'camera' ? (
            <>
              <MatrixDisplay matrix={results.intrinsicMatrix} label="Intrinsic Matrix (K)" />
              <div>
                <p className="text-[0.65rem] font-semibold text-white/30 uppercase tracking-wider mb-2">
                  <Tip text="k1, k2: radial | p1, p2: tangential | k3: higher-order radial">Distortion Coefficients</Tip>
                </p>
                <div className="flex gap-3 flex-wrap">
                  {['k1', 'k2', 'p1', 'p2', 'k3'].map((name, i) => (
                    <div key={name} className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-center">
                      <span className="text-[0.6rem] text-white/30">{name}</span>
                      <p className="text-xs font-mono text-white/70">{results.distortionCoeffs[i].toFixed(4)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <MatrixDisplay matrix={results.transformMatrix} label="Hand-Eye Transform (4×4)" />
          )}
        </div>
      )}
    </div>
  )

  const renderStep4 = () => (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      <div className="text-center mb-2">
        <ShieldCheck size={28} className="mx-auto text-emerald-400 mb-2" />
        <p className="text-white/80 font-semibold">{type === 'camera' ? 'Calibration Verified' : 'Transform Validated'}</p>
      </div>
      {type === 'camera' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-[0.65rem] font-semibold text-white/30 uppercase tracking-wider mb-2">
                <Tip text="Average distance between projected and detected corners">Reprojection Error</Tip>
              </p>
              <ReprojectionGauge value={results?.reprojectionError ?? 0.32} />
            </div>
            <CoverageHeatmap captures={captures} />
          </div>
          <div className="space-y-4">
            <p className="text-[0.65rem] font-semibold text-white/30 uppercase tracking-wider">Distortion Correction</p>
            <DistortionComparison />
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
                <p className="text-lg font-bold text-white/80">{captures.length}</p>
                <p className="text-[0.65rem] text-white/30">Images Used</p>
              </div>
              <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
                <p className="text-lg font-bold text-emerald-400">{results?.reprojectionError?.toFixed(2)} px</p>
                <p className="text-[0.65rem] text-white/30">Reproj. Error</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{results?.rotationError}°</p>
            <p className="text-xs text-white/30 mt-1">Rotation Error</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{results?.translationError} mm</p>
            <p className="text-xs text-white/30 mt-1">Translation Error</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white/80">{poses.length}</p>
            <p className="text-xs text-white/30 mt-1">Poses Recorded</p>
          </div>
        </div>
      )}
    </div>
  )

  const renderStepContent = () => {
    if (step === 0) return renderStep0()
    if (step === 1) return renderStep1()
    if (step === 2) return type === 'camera' ? renderStep2Camera() : renderStep2HandEye()
    if (step === 3) return renderStep3()
    if (step === 4) return renderStep4()
  }

  /* ── Render ── */
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-6">
      <div className="bg-gray-950 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            {type === 'camera' ? <Camera size={18} className="text-blue-400" /> : <Crosshair size={18} className="text-purple-400" />}
            <h2 className="text-base font-semibold text-white/90">{type === 'camera' ? 'Camera Calibration' : 'Hand-Eye Calibration'}</h2>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <StepIndicator steps={steps} current={step} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {renderStepContent()}
        </div>

        {/* Event Log */}
        {events.length > 0 && (
          <div className="border-t border-white/5">
            <button onClick={() => setShowLog(!showLog)}
              className="w-full flex items-center gap-2 px-6 py-2 text-xs text-white/30 hover:text-white/50 transition-colors cursor-pointer">
              <ChevronDown size={12} className={`transition-transform ${showLog ? 'rotate-180' : ''}`} />
              Event Log ({events.length})
            </button>
            {showLog && (
              <div ref={logRef} className="max-h-28 overflow-y-auto px-6 pb-3 space-y-0.5">
                {events.map((e, i) => (
                  <div key={i} className="flex gap-3 text-[0.7rem]">
                    <span className="text-white/20 font-mono shrink-0">{e.time}</span>
                    <span className="text-white/45">{e.msg}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
          <Button variant="secondary" onClick={step > 0 ? () => setStep(step - 1) : onCancel}>
            {step > 0 ? 'Back' : 'Cancel'}
          </Button>
          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)} className={!canProceed() ? 'opacity-40 pointer-events-none' : ''}>
              Next
            </Button>
          ) : (
            <Button variant="success" onClick={handleFinish}>
              Finish
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Tooltip helper ── */
function Tip({ children, text }) {
  return (
    <span className="relative group/tip cursor-help border-b border-dashed border-white/20 inline">
      {children}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 border border-white/10 rounded-lg text-[0.65rem] text-white/70 whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 font-normal normal-case tracking-normal">
        {text}
      </span>
    </span>
  )
}
