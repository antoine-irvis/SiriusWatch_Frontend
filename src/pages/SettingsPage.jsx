import { useState, useEffect } from 'react'
import Card from '../components/ui/Card'
import {
  User, ScanSearch, Focus, Gauge, Database, RotateCcw,
  Save, Upload, Download, Trash2, Check,
} from 'lucide-react'

/* ── defaults ── */
const DEFAULTS = {
  operatorName: '',
  operatorRole: 'Operator',
  operatorId: '',
  inspectionDelay: 2000,
  autoExport: false,
  exportFormat: 'json',
  staleDays: 30,
  minCaptures: 10,
  minPoses: 8,
  defaultSpeed: 25,
  defaultStepSize: 1,
  defaultGripperForce: 50,
  speedLimit: 100,
}

const LS_KEY = 'sw-settings'

const load = () => {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(LS_KEY)) }
  } catch { return { ...DEFAULTS } }
}

/* ── sub-components ── */

function Toggle({ value, onChange, label, desc }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs text-white/60">{label}</p>
        {desc && <p className="text-[0.65rem] text-white/25 mt-0.5">{desc}</p>}
      </div>
      <button onClick={() => onChange(!value)}
        className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer shrink-0 ${
          value ? 'bg-blue-500' : 'bg-white/10'
        }`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
          value ? 'translate-x-4' : 'translate-x-0.5'
        }`} />
      </button>
    </div>
  )
}

function Field({ label, desc, children }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs text-white/60">{label}</p>
        {desc && <p className="text-[0.65rem] text-white/25 mt-0.5">{desc}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function TextInput({ value, onChange, placeholder, className = '' }) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`bg-white/5 border border-white/8 rounded-lg px-3 py-1.5 text-xs text-white/70 placeholder:text-white/20 outline-none focus:border-white/20 transition-colors ${className}`} />
  )
}

function NumberInput({ value, onChange, min, max, step = 1, unit }) {
  return (
    <div className="flex items-center gap-2">
      <input type="number" value={value} min={min} max={max} step={step}
        onChange={e => onChange(Number(e.target.value))}
        className="w-20 bg-white/5 border border-white/8 rounded-lg px-3 py-1.5 text-xs text-white/70 text-right outline-none focus:border-white/20 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
      {unit && <span className="text-[0.65rem] text-white/20">{unit}</span>}
    </div>
  )
}

function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="bg-white/5 border border-white/8 rounded-lg px-3 py-1.5 text-xs text-white/70 outline-none focus:border-white/20 transition-colors cursor-pointer appearance-none pr-6"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.2)' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}>
      {options.map(o => (
        <option key={o.value} value={o.value} className="bg-gray-900 text-white/70">{o.label}</option>
      ))}
    </select>
  )
}

function Section({ icon: Icon, title, desc, children }) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-5">
        <Icon size={16} className="text-blue-400" />
        <h3 className="text-sm font-semibold text-white/70">{title}</h3>
        {desc && <span className="ml-auto text-[0.65rem] text-white/20">{desc}</span>}
      </div>
      <div className="space-y-4">{children}</div>
    </Card>
  )
}

function Divider() {
  return <div className="border-t border-white/5" />
}

/* ── page ── */
export default function SettingsPage() {
  const [settings, setSettings] = useState(load)
  const [saved, setSaved] = useState(false)

  const set = (key, val) => setSettings(prev => ({ ...prev, [key]: val }))

  const handleSave = () => {
    localStorage.setItem(LS_KEY, JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    setSettings({ ...DEFAULTS })
    localStorage.removeItem(LS_KEY)
  }

  const handleExportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'siriuswatch-settings.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportSettings = () => {
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
          setSettings({ ...DEFAULTS, ...data })
        } catch { /* ignore bad files */ }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleClearAllData = () => {
    const keys = ['sw-camera-cal', 'sw-handeye-cal', 'sw-cal-history', LS_KEY]
    keys.forEach(k => localStorage.removeItem(k))
    setSettings({ ...DEFAULTS })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white/90">Settings</h2>
          <p className="text-sm text-white/40 mt-1">App preferences and configuration</p>
        </div>
        <button onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            saved
              ? 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-400'
              : 'bg-blue-500/15 border border-blue-500/25 text-blue-400 hover:bg-blue-500/25'
          }`}>
          {saved ? <><Check size={13} /> Saved</> : <><Save size={13} /> Save Settings</>}
        </button>
      </div>

      {/* User Profile */}
      <Section icon={User} title="User Profile" desc="Appears in exported reports">
        <Field label="Operator Name" desc="Your display name">
          <TextInput value={settings.operatorName} onChange={v => set('operatorName', v)} placeholder="e.g. John Doe" className="w-48" />
        </Field>
        <Divider />
        <Field label="Role">
          <Select value={settings.operatorRole} onChange={v => set('operatorRole', v)} options={[
            { value: 'Operator', label: 'Operator' },
            { value: 'Technician', label: 'Technician' },
            { value: 'QC Lead', label: 'QC Lead' },
            { value: 'Engineer', label: 'Engineer' },
            { value: 'Admin', label: 'Admin' },
          ]} />
        </Field>
        <Divider />
        <Field label="Operator ID" desc="Unique identifier for traceability">
          <TextInput value={settings.operatorId} onChange={v => set('operatorId', v)} placeholder="e.g. OP-001" className="w-32" />
        </Field>
      </Section>

      {/* Inspection */}
      <Section icon={ScanSearch} title="Inspection" desc="Test execution defaults">
        <Field label="Test Delay" desc="Time per test point in milliseconds">
          <NumberInput value={settings.inspectionDelay} onChange={v => set('inspectionDelay', v)} min={500} max={10000} step={100} unit="ms" />
        </Field>
        <Divider />
        <Toggle label="Auto-export results" desc="Automatically download results when inspection completes"
          value={settings.autoExport} onChange={v => set('autoExport', v)} />
        <Divider />
        <Field label="Export Format" desc="File format for exported results">
          <Select value={settings.exportFormat} onChange={v => set('exportFormat', v)} options={[
            { value: 'json', label: 'JSON' },
            { value: 'csv', label: 'CSV' },
          ]} />
        </Field>
      </Section>

      {/* Calibration */}
      <Section icon={Focus} title="Calibration" desc="Calibration parameters">
        <Field label="Stale Warning" desc="Days before calibration is flagged as outdated">
          <NumberInput value={settings.staleDays} onChange={v => set('staleDays', v)} min={1} max={365} unit="days" />
        </Field>
        <Divider />
        <Field label="Min. Captures" desc="Minimum checkerboard images for camera calibration">
          <NumberInput value={settings.minCaptures} onChange={v => set('minCaptures', v)} min={5} max={50} />
        </Field>
        <Divider />
        <Field label="Min. Poses" desc="Minimum robot poses for hand-eye calibration">
          <NumberInput value={settings.minPoses} onChange={v => set('minPoses', v)} min={4} max={30} />
        </Field>
      </Section>

      {/* Robot Defaults */}
      <Section icon={Gauge} title="Robot Defaults" desc="Manual control defaults">
        <Field label="Default Speed" desc="Initial speed percentage on page load">
          <NumberInput value={settings.defaultSpeed} onChange={v => set('defaultSpeed', v)} min={1} max={100} unit="%" />
        </Field>
        <Divider />
        <Field label="Default Step Size" desc="Initial jog step size in mm">
          <Select value={String(settings.defaultStepSize)} onChange={v => set('defaultStepSize', Number(v))} options={[
            { value: '0.1', label: '0.1 mm' },
            { value: '1', label: '1 mm' },
            { value: '10', label: '10 mm' },
            { value: '100', label: '100 mm' },
          ]} />
        </Field>
        <Divider />
        <Field label="Default Gripper Force">
          <NumberInput value={settings.defaultGripperForce} onChange={v => set('defaultGripperForce', v)} min={10} max={100} unit="%" />
        </Field>
        <Divider />
        <Field label="Speed Limit" desc="Maximum allowed robot speed">
          <NumberInput value={settings.speedLimit} onChange={v => set('speedLimit', v)} min={10} max={100} unit="%" />
        </Field>
      </Section>

      {/* Data */}
      <Section icon={Database} title="Data & Storage">
        <div className="flex flex-wrap gap-2">
          <button onClick={handleExportSettings}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-white/40 hover:text-white/70 bg-white/[0.03] border border-white/8 hover:border-white/15 transition-all cursor-pointer">
            <Download size={12} /> Export Settings
          </button>
          <button onClick={handleImportSettings}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-white/40 hover:text-white/70 bg-white/[0.03] border border-white/8 hover:border-white/15 transition-all cursor-pointer">
            <Upload size={12} /> Import Settings
          </button>
          <button onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-white/30 hover:text-amber-400 bg-white/[0.03] border border-white/8 hover:border-amber-500/20 hover:bg-amber-500/5 transition-all cursor-pointer">
            <RotateCcw size={12} /> Reset to Defaults
          </button>
        </div>
        <Divider />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60">Clear All Data</p>
            <p className="text-[0.65rem] text-white/25 mt-0.5">Remove all calibrations, history, and settings from this browser</p>
          </div>
          <button onClick={handleClearAllData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-white/30 hover:text-rose-400 bg-white/[0.03] border border-white/8 hover:border-rose-500/20 hover:bg-rose-500/5 transition-all cursor-pointer">
            <Trash2 size={12} /> Clear All
          </button>
        </div>
      </Section>
    </div>
  )
}
