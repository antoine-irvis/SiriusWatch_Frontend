import { useState } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import CalibrationWizard from '../components/calibration/CalibrationWizard'
import { useToast } from '../context/ToastContext'
import { STALE_CALIBRATION_DAYS } from '../utils/constants'
import { Camera, Crosshair, Play, Upload, Download, ChevronDown, Lock, AlertTriangle, CheckCircle, Circle, Clock, Trash2 } from 'lucide-react'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function isStale(calData) {
  if (!calData) return false
  return (Date.now() - new Date(calData.completedAt).getTime()) / 86400000 > STALE_CALIBRATION_DAYS
}

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

/* ── Results Summary (shown inside cards) ── */

function CameraResultsSummary({ data }) {
  const r = data.results
  return (
    <div className="space-y-3 mt-4 pt-4 border-t border-white/5">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
          <p className="text-sm font-bold text-emerald-400">{r.reprojectionError.toFixed(2)} px</p>
          <p className="text-[0.6rem] text-white/25 mt-0.5"><Tip text="Average distance between projected and detected corner points">Reproj. Error</Tip></p>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
          <p className="text-sm font-bold text-white/80">{data.imageCount}</p>
          <p className="text-[0.6rem] text-white/25 mt-0.5">Images</p>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
          <p className="text-sm font-bold text-white/80">{data.coverage ?? '—'}%</p>
          <p className="text-[0.6rem] text-white/25 mt-0.5">Coverage</p>
        </div>
      </div>
      {/* Intrinsic matrix preview */}
      <div className="bg-white/[0.03] border border-white/5 rounded-lg p-2.5">
        <p className="text-[0.6rem] text-white/25 mb-1"><Tip text="Focal length (fx, fy) and principal point (cx, cy)">Intrinsic Matrix</Tip></p>
        <div className="font-mono text-[0.6rem] text-white/50 leading-relaxed">
          {r.intrinsicMatrix.map((row, i) => (
            <div key={i}>[{row.map(v => v.toFixed(1)).join(', ')}]</div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HandEyeResultsSummary({ data }) {
  const r = data.results
  return (
    <div className="space-y-3 mt-4 pt-4 border-t border-white/5">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
          <p className="text-sm font-bold text-emerald-400">{r.rotationError}°</p>
          <p className="text-[0.6rem] text-white/25 mt-0.5">Rot. Error</p>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
          <p className="text-sm font-bold text-emerald-400">{r.translationError} mm</p>
          <p className="text-[0.6rem] text-white/25 mt-0.5">Trans. Error</p>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
          <p className="text-sm font-bold text-white/80">{data.imageCount}</p>
          <p className="text-[0.6rem] text-white/25 mt-0.5">Poses</p>
        </div>
      </div>
      <div className="bg-white/[0.03] border border-white/5 rounded-lg p-2.5">
        <p className="text-[0.6rem] text-white/25 mb-1"><Tip text="Homogeneous transformation from camera frame to robot end-effector frame">Transform Matrix</Tip></p>
        <div className="font-mono text-[0.6rem] text-white/50 leading-relaxed">
          {r.transformMatrix.map((row, i) => (
            <div key={i}>[{row.map(v => v.toFixed(4)).join(', ')}]</div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── History Panel ── */

function HistoryPanel({ history, onClear }) {
  const [open, setOpen] = useState(false)
  if (history.length === 0) return (
    <EmptyState icon={Clock} title="No calibration history" description="Past calibration runs will appear here" />
  )
  return (
    <div className="mt-4">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs text-white/30 hover:text-white/50 transition-colors cursor-pointer">
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        <Clock size={12} />
        Calibration History ({history.length})
      </button>
      {open && (
        <div className="mt-3 bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
          <div className="max-h-48 overflow-y-auto">
            {history.map((entry, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.03] text-xs">
                {entry.type === 'camera'
                  ? <Camera size={12} className="text-blue-400 shrink-0" />
                  : <Crosshair size={12} className="text-purple-400 shrink-0" />
                }
                <span className="text-white/60 flex-1">
                  {entry.type === 'camera' ? 'Camera Calibration' : 'Hand-Eye Calibration'}
                </span>
                <span className="text-white/30 font-mono">
                  {entry.type === 'camera'
                    ? `${entry.results.reprojectionError} px`
                    : `${entry.results.rotationError}° / ${entry.results.translationError} mm`
                  }
                </span>
                <span className="text-white/20">{new Date(entry.completedAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-white/5 flex justify-end">
            <button onClick={onClear} className="flex items-center gap-1 text-[0.65rem] text-white/20 hover:text-rose-400 transition-colors cursor-pointer">
              <Trash2 size={10} /> Clear History
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Calibration Card ── */

function CalibrationCard({ type, icon: Icon, iconColor, title, description, calData, onStart, locked }) {
  const stale = isStale(calData)
  const colorClasses = type === 'camera'
    ? { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' }
    : { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' }

  return (
    <Card className={`flex flex-col h-full relative ${locked ? 'opacity-50' : ''}`}>
      {locked && (
        <div className="absolute inset-0 z-10 bg-gray-950/60 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center gap-3">
          <Lock size={24} className="text-white/30" />
          <p className="text-sm text-white/40 font-medium">Complete camera calibration first</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`p-3 rounded-xl ${colorClasses.bg} ${colorClasses.border} border`}>
          <Icon size={24} className={colorClasses.text} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white/90">{title}</h3>
          <p className="text-sm text-white/40 mt-0.5">{description}</p>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 mb-3">
        {!calData ? (
          <span className="flex items-center gap-1.5 text-xs text-white/25">
            <Circle size={8} /> Not calibrated
          </span>
        ) : (
          <>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle size={12} /> Complete
            </span>
            <span className="text-[0.6rem] text-white/20 ml-auto">
              {timeAgo(calData.completedAt)}
            </span>
          </>
        )}
      </div>

      {/* Stale Warning */}
      {stale && (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mb-3">
          <AlertTriangle size={14} className="text-amber-400 shrink-0" />
          <p className="text-[0.65rem] text-amber-400/80">Calibration is over {STALE_CALIBRATION_DAYS} days old — consider recalibrating</p>
        </div>
      )}

      {/* Results */}
      <div className="flex-1">
        {calData && type === 'camera' && <CameraResultsSummary data={calData} />}
        {calData && type === 'handEye' && <HandEyeResultsSummary data={calData} />}
      </div>

      {/* Event log preview */}
      {calData?.events && <EventLogPreview events={calData.events} />}

      {/* Action */}
      <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-[0.65rem] text-white/20">
          {calData ? 'Calibration data saved' : 'Starts guided wizard'}
        </span>
        <Button variant={calData ? 'secondary' : 'primary'} onClick={onStart} className={locked ? 'pointer-events-none' : ''}>
          <Play size={14} />
          {calData ? 'Recalibrate' : 'Start Calibration'}
        </Button>
      </div>
    </Card>
  )
}

function EventLogPreview({ events }) {
  const [open, setOpen] = useState(false)
  const last3 = events.slice(-3)
  return (
    <div className="mt-3">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[0.6rem] text-white/20 hover:text-white/40 transition-colors cursor-pointer">
        <ChevronDown size={10} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        Last run log ({events.length} events)
      </button>
      {open && (
        <div className="mt-2 max-h-24 overflow-y-auto space-y-0.5 bg-white/[0.02] rounded-lg p-2">
          {(open ? events : last3).map((e, i) => (
            <div key={i} className="flex gap-2 text-[0.6rem]">
              <span className="text-white/15 font-mono shrink-0">{e.time}</span>
              <span className="text-white/35">{e.msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Main Page ── */

export default function CalibrationPage() {
  const { addToast } = useToast()
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false)
  const [cameraCalData, setCameraCalData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sw-camera-cal')) } catch { return null }
  })
  const [handEyeCalData, setHandEyeCalData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sw-handeye-cal')) } catch { return null }
  })
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sw-cal-history')) || [] } catch { return [] }
  })
  const [wizardType, setWizardType] = useState(null)

  const handleComplete = (data) => {
    const entry = {
      type: wizardType,
      results: data.results,
      events: data.events,
      imageCount: data.imageCount,
      coverage: data.coverage,
      completedAt: new Date().toISOString(),
    }
    if (wizardType === 'camera') {
      setCameraCalData(entry)
      localStorage.setItem('sw-camera-cal', JSON.stringify(entry))
    } else {
      setHandEyeCalData(entry)
      localStorage.setItem('sw-handeye-cal', JSON.stringify(entry))
    }
    const newHistory = [entry, ...history]
    setHistory(newHistory)
    localStorage.setItem('sw-cal-history', JSON.stringify(newHistory))
    setWizardType(null)
  }

  const handleExport = () => {
    const data = { cameraCalData, handEyeCalData, history, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'calibration-data.json'
    a.click()
    URL.revokeObjectURL(url)
    addToast('Calibration data exported', 'success')
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result)
          if (data.cameraCalData) {
            setCameraCalData(data.cameraCalData)
            localStorage.setItem('sw-camera-cal', JSON.stringify(data.cameraCalData))
          }
          if (data.handEyeCalData) {
            setHandEyeCalData(data.handEyeCalData)
            localStorage.setItem('sw-handeye-cal', JSON.stringify(data.handEyeCalData))
          }
          if (data.history) {
            setHistory(data.history)
            localStorage.setItem('sw-cal-history', JSON.stringify(data.history))
          }
          addToast('Calibration data imported', 'success')
        } catch { addToast('Invalid calibration file', 'error') }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('sw-cal-history')
    addToast('Calibration history cleared', 'info')
  }

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white/90">Calibration</h2>
          <p className="text-sm text-white/40 mt-1">Camera intrinsic calibration and hand-eye calibration</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleImport}>
            <Upload size={14} /> Import
          </Button>
          <Button variant="secondary" onClick={handleExport}>
            <Download size={14} /> Export
          </Button>
        </div>
      </div>

      {/* Two calibration cards */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalibrationCard
          type="camera"
          icon={Camera}
          iconColor="blue"
          title="Camera Calibration"
          description="Compute intrinsic parameters and lens distortion coefficients."
          calData={cameraCalData}
          onStart={() => setWizardType('camera')}
          locked={false}
        />
        <CalibrationCard
          type="handEye"
          icon={Crosshair}
          iconColor="purple"
          title="Hand-Eye Calibration"
          description="Determine the spatial transform between camera and robot."
          calData={handEyeCalData}
          onStart={() => setWizardType('handEye')}
          locked={false}
        />
      </div>

      {/* History */}
      <HistoryPanel history={history} onClear={() => setShowClearHistoryConfirm(true)} />

      {/* Wizard Modal */}
      {wizardType && (
        <CalibrationWizard
          type={wizardType}
          onComplete={handleComplete}
          onCancel={() => setWizardType(null)}
        />
      )}

      <ConfirmDialog
        open={showClearHistoryConfirm}
        danger
        title="Clear Calibration History?"
        message="All past calibration records will be removed."
        confirmLabel="Clear History"
        onConfirm={() => { clearHistory(); setShowClearHistoryConfirm(false) }}
        onCancel={() => setShowClearHistoryConfirm(false)}
      />
    </div>
  )
}
