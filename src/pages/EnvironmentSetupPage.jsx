import { useState, useEffect, useCallback } from 'react'
import Card from '../components/ui/Card'
import { Cog, Camera, ChevronDown, Plus, Trash2, ChevronRight, Grid3X3, Download } from 'lucide-react'

const DICT_OPTIONS = [
  { value: '4x4', label: '4x4 (DICT_4X4_50)', gridSize: 4, maxId: 49 },
  { value: '5x5', label: '5x5 (DICT_5X5_100)', gridSize: 5, maxId: 99 },
  { value: '6x6', label: '6x6 (DICT_6X6_250)', gridSize: 6, maxId: 249 },
  { value: '7x7', label: '7x7 (DICT_7X7_1000)', gridSize: 7, maxId: 999 },
]

// Deterministic hash for generating ArUco-style marker bit patterns
function markerBits(markerId, gridSize) {
  const bits = []
  let seed = markerId * 2654435761 + 374761393
  for (let r = 0; r < gridSize; r++) {
    const row = []
    for (let c = 0; c < gridSize; c++) {
      seed = ((seed ^ (seed >> 16)) * 2246822507) >>> 0
      seed = ((seed ^ (seed >> 13)) * 3266489909) >>> 0
      seed = (seed ^ (seed >> 16)) >>> 0
      row.push(seed % 2 === 0 ? 1 : 0)
    }
    bits.push(row)
  }
  return bits
}

function ArUcoMarkerSVG({ markerId, gridSize, size }) {
  const borderWidth = size * 0.1
  const bits = markerBits(markerId, gridSize)
  const cellSize = (size - borderWidth * 2) / gridSize

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="mx-auto">
      {/* Black border */}
      <rect width={size} height={size} fill="black" />
      {/* White interior */}
      <rect
        x={borderWidth} y={borderWidth}
        width={size - borderWidth * 2} height={size - borderWidth * 2}
        fill="white"
      />
      {/* Bit cells */}
      {bits.map((row, r) =>
        row.map((bit, c) =>
          bit === 1 ? (
            <rect
              key={`${r}-${c}`}
              x={borderWidth + c * cellSize}
              y={borderWidth + r * cellSize}
              width={cellSize} height={cellSize}
              fill="black"
            />
          ) : null
        )
      )}
    </svg>
  )
}

function ArUcoMarkerCard() {
  const [markerId, setMarkerId] = useState(0)
  const [markerSize, setMarkerSize] = useState(50)
  const [dict, setDict] = useState('4x4')
  const [toast, setToast] = useState('')

  const dictInfo = DICT_OPTIONS.find(d => d.value === dict) || DICT_OPTIONS[0]

  const exportPNG = useCallback(() => {
    const scale = 10 // 10px per mm
    const s = markerSize * scale
    const canvas = document.createElement('canvas')
    canvas.width = s
    canvas.height = s
    const ctx = canvas.getContext('2d')

    const bw = markerSize * 0.1 * scale
    const gridSize = dictInfo.gridSize
    const bits = markerBits(markerId, gridSize)
    const cellSize = (s - bw * 2) / gridSize

    // Black border
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, s, s)

    // White interior
    ctx.fillStyle = 'white'
    ctx.fillRect(bw, bw, s - bw * 2, s - bw * 2)

    // Bits
    ctx.fillStyle = 'black'
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (bits[r][c] === 1) {
          ctx.fillRect(bw + c * cellSize, bw + r * cellSize, cellSize, cellSize)
        }
      }
    }

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `aruco_${dict}_id${markerId}_${markerSize}mm.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setToast('PNG exported successfully')
      setTimeout(() => setToast(''), 3000)
    }, 'image/png')
  }, [markerId, markerSize, dict, dictInfo])

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/80 outline-none focus:border-blue-500/50 transition-all'
  const labelCls = 'text-[0.6rem] font-semibold text-white/30 uppercase tracking-wider mb-1'

  return (
    <Card>
      <div className="flex items-center gap-2 mb-5">
        <Grid3X3 size={18} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-white/70">ArUco Marker</h3>
      </div>

      {/* Config */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div>
          <p className={labelCls}>Dictionary</p>
          <select value={dict} onChange={e => setDict(e.target.value)}
            className={inputCls + ' cursor-pointer'}>
            {DICT_OPTIONS.map(d => (
              <option key={d.value} value={d.value} className="bg-gray-900">{d.label}</option>
            ))}
          </select>
        </div>
        <div>
          <p className={labelCls}>Marker ID</p>
          <input type="number" min="0" max={dictInfo.maxId} value={markerId}
            onChange={e => setMarkerId(Math.max(0, Math.min(dictInfo.maxId, +e.target.value || 0)))}
            className={inputCls} />
          <p className="text-[0.5rem] text-white/20 mt-1">0–{dictInfo.maxId}</p>
        </div>
        <div>
          <p className={labelCls}>Size (mm)</p>
          <input type="number" min="10" max="200" value={markerSize}
            onChange={e => setMarkerSize(Math.max(10, Math.min(200, +e.target.value || 10)))}
            className={inputCls} />
        </div>
      </div>

      {/* Preview */}
      <div className="flex items-center justify-center py-6 rounded-lg border border-white/10 bg-white/[0.02] mb-4">
        <div className="bg-white p-3 rounded">
          <ArUcoMarkerSVG markerId={markerId} gridSize={dictInfo.gridSize} size={160} />
        </div>
      </div>

      {/* Info */}
      <div className="flex items-center justify-between text-[0.65rem] text-white/30 mb-4 px-1">
        <span>ID {markerId} · {dict} · {markerSize} mm</span>
        <span>{dictInfo.gridSize}x{dictInfo.gridSize} grid</span>
      </div>

      {/* Export */}
      <button onClick={exportPNG}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer bg-amber-500/10 border border-amber-500/25 text-amber-400 hover:bg-amber-500/20">
        <Download size={14} />
        Export PNG
      </button>

      {/* Toast */}
      {toast && (
        <div className="mt-3 text-center text-[0.65rem] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg py-2">
          {toast}
        </div>
      )}
    </Card>
  )
}

const mechanicalSystems = [
  { category: 'Collaborative Robots', models: ['UR3e', 'UR5e', 'UR10e', 'UR16e', 'UR20', 'UR30', 'Doosan M0609', 'Doosan M0617', 'Doosan M1013', 'Doosan M1509', 'Doosan A0509', 'Doosan H2017', 'FANUC CRX-5iA', 'FANUC CRX-10iA', 'FANUC CRX-20iA', 'ABB GoFa CRB 15000', 'ABB YuMi IRB 14000', 'Yaskawa HC10DT', 'Yaskawa HC20DT'] },
  { category: 'Industrial Robots', models: ['KUKA LBR iiwa 7', 'KUKA LBR iiwa 14', 'KUKA KR 6 R700', 'KUKA KR 10 R1100', 'KUKA KR 20 R1810', 'FANUC LR Mate 200iD', 'FANUC M-10iD', 'ABB IRB 1200', 'ABB IRB 4600', 'Yaskawa GP7', 'Yaskawa GP12', 'Yaskawa GP25'] },
  { category: 'Gantry Systems', models: ['IAI ROBO Cylinder', 'Festo EXCT Gantry', 'Bosch Rexroth CKK', 'Parker Hannifin HLE', 'Yamaha XY-X Series', 'Igus Drylin ZLW', 'Custom XYZ Gantry', 'Custom XYZR Gantry'] },
  { category: 'Linear Actuators', models: ['THK KR Series', 'Hiwin KK Series', 'Festo ELGA', 'SMC LEY Series', 'Parker ETH Series'] },
  { category: 'Rotary Stages', models: ['Newport RGV100', 'PI DT-34', 'Zaber X-RSW Series', 'Thorlabs PRMTZ8', 'Custom Turntable'] },
]

const sensorModels = [
  { category: '3D Cameras (Structured Light)', models: ['Intel RealSense D435i', 'Intel RealSense D455', 'Intel RealSense L515', 'Orbbec Femto Bolt', 'Orbbec Gemini 2', 'Azure Kinect DK'] },
  { category: '3D Cameras (Stereo)', models: ['Stereolabs ZED 2i', 'Stereolabs ZED X', 'Carnegie Robotics MultiSense S21', 'Nerian Karmin3'] },
  { category: 'Industrial 3D Scanners', models: ['Keyence LJ-X8000', 'Photoneo PhoXi 3D', 'Photoneo MotionCam-3D', 'SICK Ruler3000', 'Gocator 2500', 'Gocator 3500'] },
  { category: '2D Vision', models: ['Cognex In-Sight 2800', 'Cognex In-Sight 3800', 'Basler ace 2', 'FLIR Blackfly S', 'IDS uEye+'] },
]

function AddDropdown({ groups, onAdd, placeholder, icon: Icon, onOpenChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const toggle = (val) => {
    setIsOpen(val)
    if (!val) setSearch('')
    onOpenChange?.(val)
  }

  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e) => { if (e.key === 'Escape') toggle(false) }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen])

  const q = search.toLowerCase()
  const filtered = groups.map(g => ({
    ...g,
    items: g.items.filter(item => item.toLowerCase().includes(q)),
  })).filter(g => g.items.length > 0)

  return (
    <div className="relative">
      <button
        onClick={() => toggle(!isOpen)}
        className={`w-full flex items-center gap-3 border border-dashed rounded-xl px-4 py-3 text-sm text-left outline-none transition-all cursor-pointer ${
          isOpen
            ? 'bg-blue-500/5 border-blue-500/30'
            : 'bg-white/[0.03] border-white/10 hover:border-blue-500/30 hover:bg-white/[0.05]'
        }`}
      >
        <Plus size={16} className="text-blue-400" />
        <span className="text-white/30">{placeholder}</span>
        <ChevronDown size={16} className={`ml-auto text-white/20 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => toggle(false)} />
          <div className="absolute z-50 mt-2 w-full bg-gray-950/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b border-white/5">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                autoFocus
                className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-1.5 text-xs text-white/70 placeholder:text-white/20 outline-none focus:border-white/20 transition-colors"
              />
            </div>

            {/* List */}
            <div className="max-h-64 overflow-y-auto">
              {filtered.length === 0 && (
                <div className="px-4 py-6 text-center text-xs text-white/20">No results</div>
              )}
              {filtered.map((group) => (
                <div key={group.label}>
                  <div className="px-4 py-2 text-[0.6rem] font-semibold text-white/25 uppercase tracking-wider sticky top-0 bg-gray-950/95 backdrop-blur-sm border-b border-white/[0.03]">
                    {group.label}
                  </div>
                  {group.items.map((item) => (
                    <button
                      key={item}
                      onClick={() => { onAdd(item); toggle(false) }}
                      className="w-full text-left px-4 py-2.5 text-xs text-white/50 hover:bg-white/[0.05] hover:text-white/80 transition-all cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function EquipmentItem({ item, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden transition-all">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="cursor-pointer"
        >
          <ChevronRight size={14} className={`text-white/30 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
        <span className="text-sm font-medium text-white/80 flex-1">{item.name}</span>
        <span className="text-[0.65rem] text-white/25 mr-2">{item.fields.filter(f => f.value).length}/{item.fields.length} fields</span>
        <button
          onClick={onRemove}
          className="p-1 rounded-lg text-white/15 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Expandable fields */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-2 border-t border-white/5">
          {item.fields.map((field) => (
            <div key={field.id} className="flex items-center gap-3">
              <input
                type="text"
                value={field.label}
                onChange={(e) => onUpdate(field.id, 'label', e.target.value)}
                placeholder="Field name"
                className="w-36 shrink-0 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/60 placeholder-white/20 outline-none focus:border-blue-500/50 transition-all"
              />
              <input
                type="text"
                value={field.value}
                onChange={(e) => onUpdate(field.id, 'value', e.target.value)}
                placeholder="Value"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/90 placeholder-white/20 outline-none focus:border-blue-500/50 transition-all"
              />
            </div>
          ))}
          <button
            onClick={() => {
              const newId = Math.max(0, ...item.fields.map(f => f.id)) + 1
              onUpdate(newId, '_add', '')
            }}
            className="flex items-center gap-1 text-[0.7rem] text-blue-400/70 hover:text-blue-400 transition-colors cursor-pointer mt-1"
          >
            <Plus size={12} />
            Add field
          </button>
        </div>
      )}
    </div>
  )
}

function defaultFields(type) {
  if (type === 'mechanical') {
    return [
      { id: 1, label: 'IP Address', value: '' },
      { id: 2, label: 'Port', value: '' },
      { id: 3, label: 'Payload (kg)', value: '' },
      { id: 4, label: 'Reach (mm)', value: '' },
      { id: 5, label: 'Mounting', value: '' },
    ]
  }
  return [
    { id: 1, label: 'Serial Number', value: '' },
    { id: 2, label: 'Resolution', value: '' },
    { id: 3, label: 'Interface', value: '' },
    { id: 4, label: 'Mount Position', value: '' },
  ]
}

export default function EnvironmentSetupPage() {
  const [systems, setSystems] = useState([])
  const [sensors, setSensors] = useState([])
  const [mechDropdownOpen, setMechDropdownOpen] = useState(false)
  const [sensorDropdownOpen, setSensorDropdownOpen] = useState(false)

  let nextSystemId = Math.max(0, ...systems.map(s => s.id)) + 1
  let nextSensorId = Math.max(0, ...sensors.map(s => s.id)) + 1

  const addSystem = (name) => {
    setSystems([...systems, { id: nextSystemId, name, fields: defaultFields('mechanical') }])
  }

  const removeSystem = (id) => {
    setSystems(systems.filter(s => s.id !== id))
  }

  const updateSystemField = (systemId, fieldId, key, value) => {
    setSystems(systems.map(s => {
      if (s.id !== systemId) return s
      if (key === '_add') {
        return { ...s, fields: [...s.fields, { id: fieldId, label: '', value: '' }] }
      }
      return { ...s, fields: s.fields.map(f => f.id === fieldId ? { ...f, [key]: value } : f) }
    }))
  }

  const addSensor = (name) => {
    setSensors([...sensors, { id: nextSensorId, name, fields: defaultFields('sensor') }])
  }

  const removeSensor = (id) => {
    setSensors(sensors.filter(s => s.id !== id))
  }

  const updateSensorField = (sensorId, fieldId, key, value) => {
    setSensors(sensors.map(s => {
      if (s.id !== sensorId) return s
      if (key === '_add') {
        return { ...s, fields: [...s.fields, { id: fieldId, label: '', value: '' }] }
      }
      return { ...s, fields: s.fields.map(f => f.id === fieldId ? { ...f, [key]: value } : f) }
    }))
  }

  const mechGroups = mechanicalSystems.map(m => ({ label: m.category, items: m.models }))
  const sensorGroups = sensorModels.map(s => ({ label: s.category, items: s.models }))

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white/90">Environment Setup</h2>
        <p className="text-sm text-white/40 mt-1">Configure mechanical systems and sensors</p>
      </div>

      {/* Mechanical Systems */}
      <Card className={`${mechDropdownOpen ? 'relative z-30' : ''}`}>
        <div className="flex items-center gap-2 mb-4">
          <Cog size={18} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-white/70">Mechanical Systems</h3>
          {systems.length > 0 && (
            <span className="ml-auto text-[0.65rem] text-white/25">{systems.length} added</span>
          )}
        </div>

        {systems.length > 0 && (
          <div className="space-y-2 mb-4">
            {systems.map((sys) => (
              <EquipmentItem
                key={sys.id}
                item={sys}
                onUpdate={(fieldId, key, value) => updateSystemField(sys.id, fieldId, key, value)}
                onRemove={() => removeSystem(sys.id)}
              />
            ))}
          </div>
        )}

        <AddDropdown
          groups={mechGroups}
          onAdd={addSystem}
          placeholder="Add a mechanical system..."
          icon={Cog}
          onOpenChange={setMechDropdownOpen}
        />
      </Card>

      {/* Sensors */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Camera size={18} className="text-purple-400" />
          <h3 className="text-sm font-semibold text-white/70">Sensors / Cameras</h3>
          {sensors.length > 0 && (
            <span className="ml-auto text-[0.65rem] text-white/25">{sensors.length} added</span>
          )}
        </div>

        {sensors.length > 0 && (
          <div className="space-y-2 mb-4">
            {sensors.map((sensor) => (
              <EquipmentItem
                key={sensor.id}
                item={sensor}
                onUpdate={(fieldId, key, value) => updateSensorField(sensor.id, fieldId, key, value)}
                onRemove={() => removeSensor(sensor.id)}
              />
            ))}
          </div>
        )}

        <AddDropdown
          groups={sensorGroups}
          onAdd={addSensor}
          placeholder="Add a sensor..."
          icon={Camera}
          onOpenChange={setSensorDropdownOpen}
        />
      </Card>

      {/* ArUco Marker */}
      <ArUcoMarkerCard />
    </div>
  )
}
