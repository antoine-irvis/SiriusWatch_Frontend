import { useState, useEffect, useRef } from 'react'
import Card from '../ui/Card'
import { Play, Pause, Square, Download, Check, X, AlertTriangle, ChevronDown, RotateCcw } from 'lucide-react'

const TESTS = [
  { id: 'esd', name: 'ESD Protection' },
  { id: 'sound', name: 'Sound Level' },
  { id: 'camera', name: 'Camera Calibration' },
  { id: 'monitor', name: 'Monitor Uniformity' },
  { id: 'visual', name: 'Visual Inspection' },
  { id: 'connector', name: 'Connector Seating' },
  { id: 'solder', name: 'Solder Quality' },
  { id: 'polarity', name: 'Component Polarity' },
]

const MOCK_RESULTS = {
  esd: { status: 'pass', value: '< 0.5 kV' },
  sound: { status: 'pass', value: '32 dB' },
  camera: { status: 'pass', value: 'RMS 0.12' },
  monitor: { status: 'fail', value: 'Delta E 5.8' },
  visual: { status: 'pass', value: '98.2%' },
  connector: { status: 'pass', value: 'OK' },
  solder: { status: 'warning', value: '94.1%' },
  polarity: { status: 'pass', value: 'OK' },
}

const statusIcon = (s) => {
  if (s === 'pass') return <Check size={10} className="text-emerald-400" />
  if (s === 'fail') return <X size={10} className="text-rose-400" />
  return <AlertTriangle size={10} className="text-amber-400" />
}

export default function InspectionSequence() {
  const [selected, setSelected] = useState(() => new Set(TESTS.map(t => t.id)))
  const [status, setStatus] = useState('idle')
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [logs, setLogs] = useState([])
  const [results, setResults] = useState([])
  const [logsOpen, setLogsOpen] = useState(true)

  const statusRef = useRef('idle')
  const testsRef = useRef([])
  const indexRef = useRef(-1)
  const timerRef = useRef(null)
  const logRef = useRef(null)

  const selectedTests = TESTS.filter(t => selected.has(t.id))
  const isIdle = status === 'idle'
  const isRunning = status === 'running'
  const isPaused = status === 'paused'
  const isDone = status === 'done'

  const progress = isDone ? 100
    : (isRunning || isPaused) && testsRef.current.length > 0
      ? Math.round((results.length / testsRef.current.length) * 100)
      : 0

  const addLog = (msg, type = 'info') => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg, type }])
  }

  useEffect(() => { logRef.current?.scrollTo(0, logRef.current.scrollHeight) }, [logs])
  useEffect(() => () => clearTimeout(timerRef.current), [])

  const toggleTest = (id) => {
    if (!isIdle) return
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const runTest = (index) => {
    if (statusRef.current !== 'running') return
    const tests = testsRef.current
    if (index >= tests.length) {
      statusRef.current = 'done'
      setStatus('done')
      addLog('Inspection sequence complete', 'success')
      return
    }
    indexRef.current = index
    setCurrentIndex(index)
    const test = tests[index]
    addLog(`Running ${test.name}...`)
    timerRef.current = setTimeout(() => {
      if (statusRef.current !== 'running') return
      const result = MOCK_RESULTS[test.id]
      setResults(prev => [...prev, { ...test, ...result }])
      addLog(`${test.name}: ${result.status.toUpperCase()} (${result.value})`, result.status)
      runTest(index + 1)
    }, 1500 + Math.random() * 1500)
  }

  const handleStart = () => {
    if (selectedTests.length === 0) return
    testsRef.current = [...selectedTests]
    statusRef.current = 'running'
    setStatus('running')
    setCurrentIndex(0)
    setLogs([])
    setResults([])
    addLog(`Starting inspection — ${selectedTests.length} tests selected`)
    runTest(0)
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
    const test = testsRef.current[indexRef.current]
    timerRef.current = setTimeout(() => {
      if (statusRef.current !== 'running') return
      const result = MOCK_RESULTS[test.id]
      setResults(prev => [...prev, { ...test, ...result }])
      addLog(`${test.name}: ${result.status.toUpperCase()} (${result.value})`, result.status)
      runTest(indexRef.current + 1)
    }, 800 + Math.random() * 700)
  }

  const handleStop = () => {
    clearTimeout(timerRef.current)
    statusRef.current = 'idle'
    setStatus('idle')
    setCurrentIndex(-1)
    addLog('Stopped', 'warning')
  }

  const handleReset = () => {
    setStatus('idle')
    statusRef.current = 'idle'
    setCurrentIndex(-1)
    setResults([])
    setLogs([])
  }

  const handleExport = () => {
    const data = {
      timestamp: new Date().toISOString(),
      results,
      logs,
      summary: {
        total: results.length,
        passed: results.filter(r => r.status === 'pass').length,
        failed: results.filter(r => r.status === 'fail').length,
        warnings: results.filter(r => r.status === 'warning').length,
      },
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inspection-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const passCount = results.filter(r => r.status === 'pass').length
  const failCount = results.filter(r => r.status === 'fail').length
  const warnCount = results.filter(r => r.status === 'warning').length

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-white/60">Inspection Sequence</h3>
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

      {/* Test selection */}
      <div className="flex flex-wrap gap-2 mb-5">
        {TESTS.map(t => {
          const on = selected.has(t.id)
          const done = results.find(r => r.id === t.id)
          const active = isRunning && testsRef.current[indexRef.current]?.id === t.id
          return (
            <button key={t.id} onClick={() => toggleTest(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                !isIdle ? 'cursor-default' : 'cursor-pointer'
              } ${
                active
                  ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400 animate-pulse'
                  : done
                    ? `bg-white/[0.03] border text-white/50 ${
                        done.status === 'pass' ? 'border-emerald-500/20' :
                        done.status === 'fail' ? 'border-rose-500/20' :
                        'border-amber-500/20'
                      }`
                    : on
                      ? 'bg-white/[0.06] border border-white/15 text-white/70'
                      : 'bg-white/[0.02] border border-white/5 text-white/25'
              }`}>
              {done ? statusIcon(done.status) : on && isIdle ? <Check size={10} className="text-white/30" /> : null}
              {t.name}
            </button>
          )
        })}
      </div>

      {/* Controls + Progress */}
      <div className="flex items-center gap-4 mb-5">
        {/* Transport controls */}
        <div className="flex items-center gap-1.5">
          {isIdle || isDone ? (
            <button onClick={handleStart} disabled={selectedTests.length === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedTests.length === 0
                  ? 'bg-white/5 text-white/20 cursor-not-allowed'
                  : 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/25'
              }`}>
              <Play size={13} /> Start
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

        {/* Progress */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-white/35">
              {isIdle && 'Ready'}
              {isRunning && `Test ${results.length + 1} / ${testsRef.current.length}`}
              {isPaused && `Paused — ${results.length} / ${testsRef.current.length}`}
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
        <div className="border-t border-white/5 pt-4">
          <button onClick={() => setLogsOpen(!logsOpen)}
            className="flex items-center gap-1.5 text-xs text-white/25 hover:text-white/40 transition-colors cursor-pointer mb-2">
            <ChevronDown size={12} className={`transition-transform ${logsOpen ? 'rotate-180' : ''}`} />
            Logs ({logs.length})
          </button>
          {logsOpen && (
            <div ref={logRef} className="max-h-36 overflow-y-auto space-y-0.5 bg-white/[0.02] rounded-lg p-3">
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
  )
}
