import { useState, useEffect, useRef } from 'react'
import Card from '../components/ui/Card'
import {
  Camera, Crosshair, Play, Pause, Square, Download, Check, X,
  AlertTriangle, ChevronDown, RotateCcw, ZoomIn, ZoomOut, Maximize2,
  Focus, Eye, Hand, Cpu, Radio,
} from 'lucide-react'

/* ── inspection points on the PCB ── */
const POINTS = [
  { id: 'conn-a', x: 22, y: 30, label: 'Connector A', test: 'Connector Seating', zone: 'top-left' },
  { id: 'ic-u3', x: 45, y: 24, label: 'IC U3', test: 'Visual Inspection', zone: 'top-center' },
  { id: 'cap-c12', x: 68, y: 42, label: 'Capacitor C12', test: 'Component Polarity', zone: 'center-right' },
  { id: 'solder-b7', x: 35, y: 58, label: 'Solder Joint B7', test: 'Solder Quality', zone: 'center-left' },
  { id: 'res-r22', x: 78, y: 68, label: 'Resistor R22', test: 'ESD Protection', zone: 'bottom-right' },
  { id: 'header-p1', x: 55, y: 50, label: 'Header P1', test: 'Connector Seating', zone: 'center' },
  { id: 'diode-d4', x: 15, y: 75, label: 'Diode D4', test: 'Component Polarity', zone: 'bottom-left' },
  { id: 'crystal-y1', x: 85, y: 25, label: 'Crystal Y1', test: 'Sound Level', zone: 'top-right' },
]

/* ── mock results per point ── */
const MOCK_RESULTS = {
  'conn-a': { status: 'pass', value: 'Seated OK', detail: 'Pin alignment within 0.1mm tolerance' },
  'ic-u3': { status: 'pass', value: '98.2%', detail: 'No defects detected in visual scan' },
  'cap-c12': { status: 'fail', value: 'Reversed', detail: 'Polarity mismatch — capacitor rotated 180°' },
  'solder-b7': { status: 'pass', value: '97.8%', detail: 'Good wetting, no bridging detected' },
  'res-r22': { status: 'pass', value: '< 0.5 kV', detail: 'ESD discharge within safe limits' },
  'header-p1': { status: 'pass', value: 'Seated OK', detail: 'All pins fully inserted' },
  'diode-d4': { status: 'warning', value: 'Marginal', detail: 'Polarity correct but placement offset 0.3mm' },
  'crystal-y1': { status: 'pass', value: '32 dB', detail: 'Oscillation frequency nominal' },
}

/* ── inspection types ── */
const INSPECTIONS = [
  { id: 'esd', name: 'ESD Protection' },
  { id: 'sound', name: 'Sound Level' },
  { id: 'visual', name: 'Visual Inspection' },
  { id: 'connector', name: 'Connector Seating' },
  { id: 'solder', name: 'Solder Quality' },
  { id: 'polarity', name: 'Component Polarity' },
]

const TEST_TO_INSPECTION = {
  'ESD Protection': 'esd',
  'Sound Level': 'sound',
  'Visual Inspection': 'visual',
  'Connector Seating': 'connector',
  'Solder Quality': 'solder',
  'Component Polarity': 'polarity',
}

/* ── camera sources ── */
const CAMERAS = [
  { id: 'main', name: 'Main Camera', icon: Camera, res: '1920×1080', fps: 30, desc: 'Top-down inspection camera' },
  { id: 'hand-eye', name: 'Hand-Eye', icon: Hand, res: '1280×720', fps: 60, desc: 'Wrist-mounted camera' },
  { id: 'microscope', name: 'Microscope', icon: Eye, res: '2560×1440', fps: 15, desc: 'High-magnification lens' },
  { id: 'thermal', name: 'Thermal', icon: Radio, res: '640×480', fps: 30, desc: 'IR thermal imaging' },
]

/* ── helpers ── */
const statusColor = { pass: 'text-emerald-400', fail: 'text-rose-400', warning: 'text-amber-400' }
const statusBg = { pass: 'bg-emerald-500', fail: 'bg-rose-500', warning: 'bg-amber-500' }
const statusIcon = (s) => {
  if (s === 'pass') return <Check size={10} className="text-emerald-400" />
  if (s === 'fail') return <X size={10} className="text-rose-400" />
  return <AlertTriangle size={10} className="text-amber-400" />
}

/* ── PCB SVG (reused in camera + map) ── */
const PcbSvg = ({ opacity = 'opacity-40' }) => (
  <svg viewBox="0 0 400 250" className={`w-full h-full ${opacity}`}>
    <rect x="30" y="20" width="340" height="210" rx="8" fill="none" stroke="rgba(59,130,246,0.3)" strokeWidth="1.5" />
    <path d="M60 60 H150 V100 H200" stroke="rgba(59,130,246,0.2)" strokeWidth="1" fill="none" />
    <path d="M100 40 V120 H180 V160" stroke="rgba(59,130,246,0.2)" strokeWidth="1" fill="none" />
    <path d="M250 50 V90 H320 V140" stroke="rgba(59,130,246,0.2)" strokeWidth="1" fill="none" />
    <path d="M60 180 H140 V140 H220 V200" stroke="rgba(59,130,246,0.15)" strokeWidth="1" fill="none" />
    <rect x="80" y="55" width="30" height="12" rx="2" fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.25)" strokeWidth="0.5" />
    <rect x="160" y="35" width="40" height="25" rx="2" fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />
    <rect x="260" y="60" width="50" height="35" rx="3" fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />
    <circle cx="130" cy="150" r="15" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />
    <rect x="200" y="130" width="20" height="8" rx="1" fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />
    <rect x="300" y="170" width="35" height="20" rx="2" fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />
    <rect x="150" y="90" width="60" height="40" rx="3" fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.3)" strokeWidth="1" />
    <text x="180" y="115" textAnchor="middle" fill="rgba(59,130,246,0.3)" fontSize="8" fontFamily="monospace">IC</text>
    {[0,1,2,3,4,5].map(i => (
      <rect key={i} x={55 + i * 10} y="190" width="6" height="12" rx="1" fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />
    ))}
  </svg>
)

/* ── thermal overlay SVG ── */
const ThermalOverlay = () => (
  <svg viewBox="0 0 400 250" className="w-full h-full opacity-50">
    <defs>
      <radialGradient id="heat1" cx="45%" cy="40%" r="25%">
        <stop offset="0%" stopColor="rgba(239,68,68,0.5)" />
        <stop offset="50%" stopColor="rgba(245,158,11,0.3)" />
        <stop offset="100%" stopColor="rgba(59,130,246,0.1)" />
      </radialGradient>
      <radialGradient id="heat2" cx="70%" cy="55%" r="15%">
        <stop offset="0%" stopColor="rgba(239,68,68,0.4)" />
        <stop offset="100%" stopColor="rgba(245,158,11,0.1)" />
      </radialGradient>
    </defs>
    <rect x="30" y="20" width="340" height="210" rx="8" fill="url(#heat1)" />
    <rect x="30" y="20" width="340" height="210" rx="8" fill="url(#heat2)" />
    <rect x="30" y="20" width="340" height="210" rx="8" fill="none" stroke="rgba(245,158,11,0.3)" strokeWidth="1.5" />
  </svg>
)

export default function InspectionPage() {
  /* inspection type selection */
  const [selectedInspections, setSelectedInspections] = useState(() => new Set(INSPECTIONS.map(i => i.id)))

  /* point selection */
  const [selected, setSelected] = useState(() => new Set(POINTS.map(p => p.id)))
  const [hovered, setHovered] = useState(null)

  /* run state */
  const [status, setStatus] = useState('idle')
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [results, setResults] = useState([])
  const [logs, setLogs] = useState([])
  const [logsOpen, setLogsOpen] = useState(true)

  /* camera */
  const [zoom, setZoom] = useState(1)
  const [camSource, setCamSource] = useState('main')

  /* refs for timer callbacks */
  const statusRef = useRef('idle')
  const pointsRef = useRef([])
  const indexRef = useRef(-1)
  const timerRef = useRef(null)
  const logRef = useRef(null)

  const selectedPoints = POINTS.filter(p =>
    selected.has(p.id) && selectedInspections.has(TEST_TO_INSPECTION[p.test])
  )
  const isIdle = status === 'idle'
  const isRunning = status === 'running'
  const isPaused = status === 'paused'
  const isDone = status === 'done'

  const currentPoint = (isRunning || isPaused) && indexRef.current >= 0
    ? pointsRef.current[indexRef.current] : null

  const progress = isDone ? 100
    : (isRunning || isPaused) && pointsRef.current.length > 0
      ? Math.round((results.length / pointsRef.current.length) * 100) : 0

  const passCount = results.filter(r => r.status === 'pass').length
  const failCount = results.filter(r => r.status === 'fail').length
  const warnCount = results.filter(r => r.status === 'warning').length

  const activeCam = CAMERAS.find(c => c.id === camSource)

  const addLog = (msg, type = 'info') => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg, type }])
  }

  useEffect(() => { logRef.current?.scrollTo(0, logRef.current.scrollHeight) }, [logs])
  useEffect(() => () => clearTimeout(timerRef.current), [])

  /* selection */
  const togglePoint = (id) => {
    if (!isIdle) return
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectAll = () => setSelected(new Set(POINTS.map(p => p.id)))
  const selectNone = () => setSelected(new Set())

  const toggleInspection = (id) => {
    if (!isIdle) return
    setSelectedInspections(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  /* run logic */
  const runPoint = (index) => {
    if (statusRef.current !== 'running') return
    const pts = pointsRef.current
    if (index >= pts.length) {
      statusRef.current = 'done'
      setStatus('done')
      addLog('Inspection complete', 'success')
      return
    }
    indexRef.current = index
    setCurrentIndex(index)
    const pt = pts[index]
    addLog(`Inspecting ${pt.label} (${pt.test})...`)
    timerRef.current = setTimeout(() => {
      if (statusRef.current !== 'running') return
      const result = MOCK_RESULTS[pt.id]
      setResults(prev => [...prev, { ...pt, ...result }])
      addLog(`${pt.label}: ${result.status.toUpperCase()} — ${result.value}`, result.status)
      runPoint(index + 1)
    }, 1800 + Math.random() * 1200)
  }

  const handleStart = () => {
    if (selectedPoints.length === 0) return
    pointsRef.current = [...selectedPoints]
    statusRef.current = 'running'
    setStatus('running')
    setCurrentIndex(0)
    indexRef.current = 0
    setLogs([])
    setResults([])
    setZoom(1)
    addLog(`Starting inspection — ${selectedPoints.length} points selected`)
    runPoint(0)
  }

  const handlePause = () => {
    clearTimeout(timerRef.current)
    statusRef.current = 'paused'
    setStatus('paused')
    addLog('Paused', 'warning')
  }

  const handleResume = () => {
    statusRef.current = 'running'
    setStatus('running')
    addLog('Resumed')
    const pt = pointsRef.current[indexRef.current]
    timerRef.current = setTimeout(() => {
      if (statusRef.current !== 'running') return
      const result = MOCK_RESULTS[pt.id]
      setResults(prev => [...prev, { ...pt, ...result }])
      addLog(`${pt.label}: ${result.status.toUpperCase()} — ${result.value}`, result.status)
      runPoint(indexRef.current + 1)
    }, 800 + Math.random() * 700)
  }

  const handleStop = () => {
    clearTimeout(timerRef.current)
    statusRef.current = 'idle'
    setStatus('idle')
    setCurrentIndex(-1)
    indexRef.current = -1
    addLog('Stopped', 'warning')
  }

  const handleReset = () => {
    setStatus('idle')
    statusRef.current = 'idle'
    setCurrentIndex(-1)
    indexRef.current = -1
    setResults([])
    setLogs([])
  }

  const handleExport = () => {
    const data = {
      timestamp: new Date().toISOString(),
      results,
      logs,
      summary: { total: results.length, passed: passCount, failed: failCount, warnings: warnCount },
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inspection-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const cameraTarget = currentPoint || (hovered ? POINTS.find(p => p.id === hovered) : null)

  return (
    <div className="min-h-[calc(100vh-7rem)] flex flex-col gap-4">

      {/* ══════════ TOP: Inspection Sequence ══════════ */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white/60 flex items-center gap-2">
            <Focus size={14} /> Inspection Sequence
          </h3>
          <div className="flex items-center gap-2">
            {isDone && (
              <button onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/30 hover:text-white/60 hover:bg-white/5 transition-all cursor-pointer">
                <RotateCcw size={12} /> Reset
              </button>
            )}
            {results.length > 0 && (
              <button onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/30 hover:text-white/60 hover:bg-white/5 transition-all cursor-pointer border border-white/8">
                <Download size={12} /> Export
              </button>
            )}
          </div>
        </div>

        {/* Inspection type chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {INSPECTIONS.map(insp => {
            const on = selectedInspections.has(insp.id)
            const pointCount = POINTS.filter(p => TEST_TO_INSPECTION[p.test] === insp.id && selected.has(p.id)).length
            const doneResults = results.filter(r => TEST_TO_INSPECTION[r.test] === insp.id)
            const hasFail = doneResults.some(r => r.status === 'fail')
            const hasWarn = doneResults.some(r => r.status === 'warning')
            return (
              <button key={insp.id} onClick={() => toggleInspection(insp.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  !isIdle ? 'cursor-default' : 'cursor-pointer'
                } ${
                  doneResults.length > 0
                    ? `bg-white/[0.03] border text-white/50 ${
                        hasFail ? 'border-rose-500/20' : hasWarn ? 'border-amber-500/20' : 'border-emerald-500/20'
                      }`
                    : on
                      ? 'bg-white/[0.06] border border-white/15 text-white/70'
                      : 'bg-white/[0.02] border border-white/5 text-white/25'
                }`}>
                {doneResults.length > 0
                  ? statusIcon(hasFail ? 'fail' : hasWarn ? 'warning' : 'pass')
                  : on && isIdle ? <Check size={10} className="text-white/30" /> : null}
                {insp.name}
                {on && pointCount > 0 && (
                  <span className="text-[0.6rem] text-white/20 ml-0.5">({pointCount})</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Controls + Progress */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {isIdle || isDone ? (
              <button onClick={handleStart} disabled={selectedPoints.length === 0}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedPoints.length === 0
                    ? 'bg-white/5 text-white/20 cursor-not-allowed'
                    : 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/25'
                }`}>
                <Play size={13} /> {isDone ? 'Re-run' : 'Start'} ({selectedPoints.length})
              </button>
            ) : (
              <>
                {isRunning ? (
                  <button onClick={handlePause}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500/15 border border-amber-500/25 text-amber-400 hover:bg-amber-500/25 transition-all cursor-pointer">
                    <Pause size={13} /> Pause
                  </button>
                ) : (
                  <button onClick={handleResume}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/25 transition-all cursor-pointer">
                    <Play size={13} /> Resume
                  </button>
                )}
                <button onClick={handleStop}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-white/40 hover:text-rose-400 hover:border-rose-500/25 hover:bg-rose-500/10 transition-all cursor-pointer">
                  <Square size={11} /> Stop
                </button>
              </>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-white/35">
                {isIdle && `${selectedPoints.length} points ready`}
                {isRunning && `Inspecting ${results.length + 1} / ${pointsRef.current.length}`}
                {isPaused && `Paused — ${results.length} / ${pointsRef.current.length}`}
                {isDone && (
                  <span className="flex items-center gap-3">
                    <span className="text-emerald-400">{passCount} passed</span>
                    {failCount > 0 && <span className="text-rose-400">{failCount} failed</span>}
                    {warnCount > 0 && <span className="text-amber-400">{warnCount} warnings</span>}
                  </span>
                )}
              </span>
              {(isRunning || isPaused || isDone) && (
                <span className="text-xs font-mono text-white/25">{progress}%</span>
              )}
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${
                isDone
                  ? failCount > 0 ? 'bg-rose-500' : 'bg-emerald-500'
                  : isPaused ? 'bg-amber-500' : 'bg-blue-500'
              }`} style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* Logs */}
        {logs.length > 0 && (
          <div className="border-t border-white/5 pt-3 mt-4">
            <button onClick={() => setLogsOpen(!logsOpen)}
              className="flex items-center gap-1.5 text-xs text-white/25 hover:text-white/40 transition-colors cursor-pointer mb-2">
              <ChevronDown size={12} className={`transition-transform ${logsOpen ? 'rotate-180' : ''}`} />
              Logs ({logs.length})
            </button>
            {logsOpen && (
              <div ref={logRef} className="max-h-32 overflow-y-auto space-y-0.5 bg-white/[0.02] rounded-lg p-3">
                {logs.map((entry, i) => (
                  <div key={i} className="flex gap-3 text-[0.7rem]">
                    <span className="text-white/15 font-mono shrink-0">{entry.time}</span>
                    <span className={
                      entry.type === 'pass' ? 'text-emerald-400/70' :
                      entry.type === 'fail' ? 'text-rose-400/70' :
                      entry.type === 'warning' ? 'text-amber-400/70' :
                      entry.type === 'success' ? 'text-emerald-400' :
                      'text-white/40'
                    }>{entry.msg}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ══════════ MIDDLE: Camera Feed + Test Points ══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 flex-1">

        {/* ── Camera Feed ── */}
        <Card className="lg:col-span-3 !p-0 overflow-hidden flex flex-col">
          {/* Header with source switcher */}
          <div className="flex items-center gap-2 px-5 pt-4 pb-3">
            <Camera size={16} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-white/80">Camera Feed</h3>

            {/* Source tabs */}
            <div className="flex items-center gap-1 ml-3 bg-white/5 rounded-lg p-0.5">
              {CAMERAS.map(cam => {
                const Icon = cam.icon
                const active = camSource === cam.id
                return (
                  <button key={cam.id} onClick={() => setCamSource(cam.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[0.65rem] font-medium transition-all cursor-pointer ${
                      active
                        ? 'bg-white/10 text-white/80'
                        : 'text-white/25 hover:text-white/50'
                    }`}
                    title={cam.desc}>
                    <Icon size={11} />
                    {cam.name}
                  </button>
                )
              })}
            </div>

            <span className="ml-auto flex items-center gap-2">
              {isRunning && (
                <span className="flex items-center gap-1.5 text-[0.65rem] text-blue-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> SCANNING
                </span>
              )}
              {!isRunning && !isPaused && (
                <span className="flex items-center gap-1.5 text-[0.65rem] text-white/25 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
                </span>
              )}
              {isPaused && (
                <span className="text-[0.65rem] text-amber-400 font-medium">PAUSED</span>
              )}
            </span>
          </div>

          {/* Camera viewport */}
          <div className="relative flex-1 bg-gradient-to-br from-gray-900/80 to-gray-950/80 mx-4 mb-3 rounded-xl overflow-hidden min-h-[300px]">
            {/* Simulated camera view */}
            <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700"
              style={{
                transform: cameraTarget
                  ? `scale(${1.4 + zoom * 0.3}) translate(${(50 - cameraTarget.x) * 0.4}%, ${(50 - cameraTarget.y) * 0.4}%)`
                  : `scale(${zoom})`,
              }}>
              {camSource === 'thermal' ? <ThermalOverlay /> : <PcbSvg />}
            </div>

            {/* Hand-eye perspective overlay */}
            {camSource === 'hand-eye' && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-4 border border-dashed border-white/[0.06] rounded-lg" />
                <div className="absolute top-2 right-2 text-[0.55rem] font-mono text-white/15 bg-black/30 px-2 py-0.5 rounded">
                  WRIST CAM
                </div>
              </div>
            )}

            {/* Microscope grid overlay */}
            {camSource === 'microscope' && (
              <div className="absolute inset-0 pointer-events-none">
                {[1,2,3].map(i => (
                  <div key={`h${i}`} className="absolute left-0 right-0 h-px bg-white/[0.04]" style={{ top: `${i * 25}%` }} />
                ))}
                {[1,2,3].map(i => (
                  <div key={`v${i}`} className="absolute top-0 bottom-0 w-px bg-white/[0.04]" style={{ left: `${i * 25}%` }} />
                ))}
                <div className="absolute top-2 right-2 text-[0.55rem] font-mono text-white/15 bg-black/30 px-2 py-0.5 rounded">
                  40× MAG
                </div>
              </div>
            )}

            {/* Thermal legend */}
            {camSource === 'thermal' && (
              <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                <div className="text-[0.55rem] font-mono text-white/15 bg-black/30 px-2 py-0.5 rounded">IR THERMAL</div>
                <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded">
                  <div className="w-16 h-1.5 rounded-full bg-gradient-to-r from-blue-500 via-amber-500 to-rose-500" />
                  <span className="text-[0.5rem] font-mono text-white/20">20-80°C</span>
                </div>
              </div>
            )}

            {/* Scan line effect when running */}
            {isRunning && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"
                  style={{ animation: 'scan 2s linear infinite' }} />
              </div>
            )}

            {/* Crosshairs */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white/[0.06]" />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/[0.06]" />
            </div>

            {/* Target reticle */}
            {cameraTarget && (
              <div className="absolute pointer-events-none transition-all duration-500"
                style={{ left: `${cameraTarget.x}%`, top: `${cameraTarget.y}%`, transform: 'translate(-50%, -50%)' }}>
                <div className="w-16 h-16 border border-blue-400/40 rounded-full animate-pulse" />
                <div className="absolute inset-2 border border-blue-400/20 rounded-full" />
                <div className="absolute top-1/2 left-0 right-0 h-px bg-blue-400/30" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-blue-400/30" />
              </div>
            )}

            {/* Current test info overlay */}
            {currentPoint && (
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2">
                <p className="text-[0.65rem] text-white/30 mb-0.5">Inspecting</p>
                <p className="text-xs font-semibold text-white/80">{currentPoint.label}</p>
                <p className="text-[0.65rem] text-blue-400">{currentPoint.test}</p>
              </div>
            )}

            {/* Done overlay */}
            {results.length > 0 && isDone && (
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2">
                <p className="text-[0.65rem] text-white/30 mb-0.5">Complete</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-emerald-400 font-semibold">{passCount}P</span>
                  {failCount > 0 && <span className="text-rose-400 font-semibold">{failCount}F</span>}
                  {warnCount > 0 && <span className="text-amber-400 font-semibold">{warnCount}W</span>}
                </div>
              </div>
            )}

            {/* Coordinates */}
            <div className="absolute bottom-3 left-3 text-[0.6rem] font-mono text-white/15">
              {cameraTarget
                ? `X: ${cameraTarget.x.toFixed(1)}  Y: ${cameraTarget.y.toFixed(1)}  Z: ${(zoom * 1.2).toFixed(1)}`
                : `X: 50.0  Y: 50.0  Z: ${zoom.toFixed(1)}`}
            </div>

            {/* Zoom controls */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1">
              <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                className="p-1.5 rounded-md bg-black/40 text-white/30 hover:text-white/60 transition-colors cursor-pointer">
                <ZoomOut size={12} />
              </button>
              <span className="text-[0.6rem] font-mono text-white/20 w-8 text-center">{zoom.toFixed(1)}x</span>
              <button onClick={() => setZoom(z => Math.min(3, z + 0.25))}
                className="p-1.5 rounded-md bg-black/40 text-white/30 hover:text-white/60 transition-colors cursor-pointer">
                <ZoomIn size={12} />
              </button>
              <button onClick={() => setZoom(1)}
                className="p-1.5 rounded-md bg-black/40 text-white/30 hover:text-white/60 transition-colors cursor-pointer">
                <Maximize2 size={12} />
              </button>
            </div>
          </div>

          {/* Camera info bar */}
          <div className="flex items-center gap-3 px-5 pb-4 text-[0.65rem] text-white/20">
            <span className="font-mono">RES {activeCam.res}</span>
            <span className="w-px h-3 bg-white/10" />
            <span className="font-mono">FPS {activeCam.fps}</span>
            <span className="w-px h-3 bg-white/10" />
            <span className="font-mono">EXP {camSource === 'thermal' ? 'N/A' : '1/120'}</span>
            <span className="w-px h-3 bg-white/10" />
            <span className="font-mono">{camSource === 'thermal' ? 'EMISSIVITY 0.95' : 'GAIN 1.0'}</span>
            <span className="ml-auto text-white/10">{activeCam.desc}</span>
          </div>
        </Card>

        {/* ── Test Points ── */}
        <Card className="lg:col-span-2 !p-0 overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 px-5 pt-4 pb-3">
            <Crosshair size={16} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-white/80">Test Points</h3>
            <span className="ml-auto text-[0.65rem] text-white/25">
              {selectedPoints.length}/{POINTS.length} active
            </span>
          </div>

          {/* PCB map */}
          <div className="relative bg-gradient-to-br from-gray-900/60 to-gray-950/60 mx-4 rounded-xl overflow-hidden aspect-[16/10]">
            <PcbSvg opacity="opacity-25" />

            {POINTS.map(pt => {
              const on = selected.has(pt.id)
              const inspEnabled = selectedInspections.has(TEST_TO_INSPECTION[pt.test])
              const result = results.find(r => r.id === pt.id)
              const active = currentPoint?.id === pt.id
              const isHov = hovered === pt.id
              const dimmed = !inspEnabled && on
              return (
                <div key={pt.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                  onMouseEnter={() => setHovered(pt.id)}
                  onMouseLeave={() => setHovered(null)}>

                  {(active || (on && inspEnabled && !result)) && (
                    <div className={`absolute w-7 h-7 -m-2 rounded-full border-2 animate-ping opacity-30 ${
                      active ? 'border-blue-400' : 'border-white/20'
                    }`} />
                  )}

                  <button onClick={() => togglePoint(pt.id)}
                    className={`relative w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                      isIdle ? 'cursor-pointer' : 'cursor-default'
                    } ${
                      active
                        ? 'bg-blue-400 shadow-lg shadow-blue-400/50 scale-150'
                        : result
                          ? `${statusBg[result.status]} shadow-lg ${result.status === 'pass' ? 'shadow-emerald-400/30' : result.status === 'fail' ? 'shadow-rose-400/30' : 'shadow-amber-400/30'}`
                          : dimmed
                            ? 'bg-white/10 border border-dashed border-white/10'
                            : on
                              ? 'bg-white/50 shadow-md shadow-white/20'
                              : 'bg-white/15 border border-white/10'
                    } ${isHov && isIdle ? 'scale-150' : ''}`} />

                  {isHov && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-lg text-xs whitespace-nowrap shadow-xl z-10">
                      <p className="font-medium text-white/90">{pt.label}</p>
                      <p className="text-[0.6rem] text-white/30 mt-0.5">{pt.test}</p>
                      {!inspEnabled && <p className="text-[0.6rem] text-white/15 mt-0.5 italic">Inspection type disabled</p>}
                      {result && (
                        <p className={`text-[0.6rem] mt-0.5 font-semibold ${statusColor[result.status]}`}>
                          {result.status.toUpperCase()} — {result.value}
                        </p>
                      )}
                      {!result && isIdle && inspEnabled && (
                        <p className="text-[0.6rem] text-white/20 mt-0.5">
                          {on ? 'Click to deselect' : 'Click to select'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Point list */}
          <div className="flex-1 px-4 py-3 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[0.65rem] text-white/20">Test points</span>
              {isIdle && (
                <div className="flex items-center gap-2">
                  <button onClick={selectAll} className="text-[0.65rem] text-white/20 hover:text-white/50 transition-colors cursor-pointer">All</button>
                  <span className="text-white/10">·</span>
                  <button onClick={selectNone} className="text-[0.65rem] text-white/20 hover:text-white/50 transition-colors cursor-pointer">None</button>
                </div>
              )}
            </div>
            <div className="space-y-1">
              {POINTS.map(pt => {
                const on = selected.has(pt.id)
                const inspEnabled = selectedInspections.has(TEST_TO_INSPECTION[pt.test])
                const result = results.find(r => r.id === pt.id)
                const active = currentPoint?.id === pt.id
                const dimmed = !inspEnabled && on
                return (
                  <button key={pt.id}
                    onClick={() => togglePoint(pt.id)}
                    onMouseEnter={() => setHovered(pt.id)}
                    onMouseLeave={() => setHovered(null)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                      isIdle ? 'cursor-pointer' : 'cursor-default'
                    } ${
                      active
                        ? 'bg-blue-500/10 border border-blue-500/20'
                        : hovered === pt.id
                          ? 'bg-white/[0.04]'
                          : 'hover:bg-white/[0.03]'
                    }`}>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      active ? 'bg-blue-400 animate-pulse'
                        : result ? statusBg[result.status]
                        : dimmed ? 'bg-white/10 border border-dashed border-white/15'
                        : on ? 'bg-white/40' : 'bg-white/10'
                    }`} />
                    <span className={`flex-1 text-left truncate ${
                      active ? 'text-blue-400'
                        : result ? statusColor[result.status]
                        : dimmed ? 'text-white/15 line-through'
                        : on ? 'text-white/60' : 'text-white/20'
                    }`}>{pt.label}</span>
                    <span className={`text-[0.6rem] truncate ${dimmed ? 'text-white/10' : 'text-white/15'}`}>{pt.test}</span>
                    {result && (
                      <span className={`text-[0.6rem] font-mono ${statusColor[result.status]}`}>{result.value}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Scan line animation */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  )
}
