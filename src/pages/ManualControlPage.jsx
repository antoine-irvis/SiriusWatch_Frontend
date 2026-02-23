import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react'
import Card from '../components/ui/Card'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import {
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ChevronUp, ChevronDown,
  Hand, Home, Eye, Plus, Trash2, Play, Unlock, Gauge,
  Globe, Box, Wrench, RotateCcw, OctagonX, Upload
} from 'lucide-react'

const RobotViewer = lazy(() => import('../components/robot/RobotViewer'))

const DEG = Math.PI / 180
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

function EditableValue({ value, onChange, disabled }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState('')

  const handleFocus = (e) => {
    setEditing(true)
    setText(value.toFixed(1))
    e.target.select()
  }

  const handleBlur = () => {
    setEditing(false)
    const val = parseFloat(text)
    if (!isNaN(val) && !disabled) onChange(val)
  }

  return (
    <input
      type="number"
      className="w-full bg-transparent text-center text-lg font-mono font-medium text-white/85 border-b border-transparent hover:border-white/20 focus:border-blue-400/60 focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      value={editing ? text : value.toFixed(1)}
      onChange={(e) => setText(e.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur() }}
      disabled={disabled}
    />
  )
}

function ViewerFallback() {
  return (
    <div className="w-full h-full min-h-[300px] rounded-xl bg-white/[0.03] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-white/30">Loading 3D viewer...</p>
      </div>
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

  const [jointValues, setJointValues] = useState({})
  const [jointInfo, setJointInfo] = useState([])
  const [cartesian, setCartesian] = useState([520.3, 180.5, 280.0, 175.2, -5.3, 42.1])
  const [showEstopConfirm, setShowEstopConfirm] = useState(false)
  const [pressedKey, setPressedKey] = useState(null)

  const [cameraY, setCameraY] = useState(0.15)
  const [robotSource, setRobotSource] = useState('ur3')
  const [customUrdf, setCustomUrdf] = useState(null)

  const robotSourceRef = useRef(robotSource)
  robotSourceRef.current = robotSource
  const robotObjRef = useRef(null)

  // Convert degrees → radians for the viewer
  const jointValuesRad = useMemo(() => {
    const result = {}
    Object.entries(jointValues).forEach(([name, degrees]) => {
      result[name] = degrees * DEG
    })
    return result
  }, [jointValues])

  // Called when a robot finishes loading
  const handleRobotLoad = (joints, robotObj) => {
    setJointInfo(joints)
    robotObjRef.current = robotObj || null
    const UR3_DEFAULTS = [45.2, -60.3, 82.1, -110.5, -45.0, 12.8]
    const initial = {}
    joints.forEach((j, i) => {
      initial[j.name] = robotSourceRef.current === 'ur3' ? (UR3_DEFAULTS[i] ?? 0) : 0
    })
    setJointValues(initial)
  }

  // Handle URDF + mesh file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    // Revoke old object URLs
    if (customUrdf?.meshFiles) {
      Object.values(customUrdf.meshFiles).forEach(url => URL.revokeObjectURL(url))
    }

    const urdfFile = files.find(f => f.name.endsWith('.urdf'))
    if (!urdfFile) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const meshMap = {}
      files.forEach(f => {
        if (!f.name.endsWith('.urdf')) {
          meshMap[f.name] = URL.createObjectURL(f)
        }
      })
      setCustomUrdf({ urdfText: event.target.result, meshFiles: meshMap })
    }
    reader.readAsText(urdfFile)
  }

  /* Arrow key jog support (cartesian only) */
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

  // ──────── FK helpers ────────
  const updateWorld = () => {
    const robot = robotObjRef.current
    if (!robot) return
    let root = robot
    while (root.parent) root = root.parent
    root.updateMatrixWorld(true)
  }

  const getEEPos = () => {
    const robot = robotObjRef.current
    if (!robot || !jointInfo.length) return null
    const names = jointInfo.map(j => j.name)
    const lastJoint = robot.joints[names[names.length - 1]]
    const Vec3 = robot.position.constructor
    const p = new Vec3()
    lastJoint.getWorldPosition(p)
    return p
  }

  // Compute forward kinematics: actual EE position + orientation from robot model
  const computeFK = () => {
    const robot = robotObjRef.current
    if (!robot || !jointInfo.length) return null

    const names = jointInfo.map(j => j.name)
    names.forEach(name => robot.setJointValue(name, (jointValues[name] || 0) * DEG))
    updateWorld()

    const pos = getEEPos()
    if (!pos) return null

    // Three.js Y-up → URDF Z-up (meters → mm)
    const x = pos.x * 1000
    const y = -pos.z * 1000
    const z = pos.y * 1000

    // Orientation: extract from EE world quaternion, undo root rotation
    const lastJoint = robot.joints[names[names.length - 1]]
    const Quat = robot.quaternion.constructor
    const Euler = robot.rotation.constructor
    const qEE = new Quat()
    lastJoint.getWorldQuaternion(qEE)
    // Robot root is rotated [-PI/2, 0, 0]. Undo: multiply by inverse = [+PI/2, 0, 0]
    const s = Math.sin(Math.PI / 4)
    const c = Math.cos(Math.PI / 4)
    const qInv = new Quat(s, 0, 0, c) // inverse of [-PI/2, 0, 0]
    qEE.premultiply(qInv)
    const euler = new Euler()
    euler.setFromQuaternion(qEE, 'XYZ')

    return [x, y, z, euler.x / DEG, euler.y / DEG, euler.z / DEG]
  }

  // Update cartesian readout from FK whenever joints change
  useEffect(() => {
    const fk = computeFK()
    if (fk) setCartesian(fk.map(v => +v.toFixed(1)))
  }, [jointValues, jointInfo])

  // ──────── IK: solve to reach a target XYZ position ────────
  const solveIKToTarget = (targetMm) => {
    const robot = robotObjRef.current
    if (!robot || !jointInfo.length) return null

    const eps = 1e-5
    const N = jointInfo.length
    const names = jointInfo.map(j => j.name)
    const Vec3 = robot.position.constructor

    // URDF target → Three.js coords (mm → m)
    const tgt = [targetMm[0] * 0.001, targetMm[2] * 0.001, -targetMm[1] * 0.001]

    const q = names.map(name => (jointValues[name] || 0) * DEG)
    names.forEach((name, i) => robot.setJointValue(name, q[i]))
    updateWorld()

    const ITERATIONS = 60
    const lambda = 0.001
    const tolerance = 0.0003 // 0.3mm

    for (let iter = 0; iter < ITERATIONS; iter++) {
      const eePos = getEEPos()
      const dx = [tgt[0] - eePos.x, tgt[1] - eePos.y, tgt[2] - eePos.z]
      const dist = Math.sqrt(dx[0] ** 2 + dx[1] ** 2 + dx[2] ** 2)
      if (dist < tolerance) break

      // Clamp step
      const maxStep = 0.005
      if (dist > maxStep) {
        const s = maxStep / dist
        dx[0] *= s; dx[1] *= s; dx[2] *= s
      }

      // Central-difference Jacobian
      const J = []
      for (let i = 0; i < N; i++) {
        const orig = q[i]
        robot.setJointValue(names[i], orig + eps)
        updateWorld()
        const pP = getEEPos()
        robot.setJointValue(names[i], orig - eps)
        updateWorld()
        const pM = getEEPos()
        J.push([(pP.x - pM.x) / (2 * eps), (pP.y - pM.y) / (2 * eps), (pP.z - pM.z) / (2 * eps)])
        robot.setJointValue(names[i], orig)
      }
      updateWorld()

      // Damped least-squares
      const JJT = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
      for (let i = 0; i < N; i++)
        for (let r = 0; r < 3; r++)
          for (let c = 0; c < 3; c++)
            JJT[r][c] += J[i][r] * J[i][c]
      JJT[0][0] += lambda; JJT[1][1] += lambda; JJT[2][2] += lambda

      const [[a, b, cc], [d, e, f], [g, h, k]] = JJT
      const det = a * (e * k - f * h) - b * (d * k - f * g) + cc * (d * h - e * g)
      if (Math.abs(det) < 1e-12) break
      const inv = 1 / det
      const M = [
        [(e * k - f * h) * inv, (cc * h - b * k) * inv, (b * f - cc * e) * inv],
        [(f * g - d * k) * inv, (a * k - cc * g) * inv, (cc * d - a * f) * inv],
        [(d * h - e * g) * inv, (b * g - a * h) * inv, (a * e - b * d) * inv],
      ]
      const y = [
        M[0][0] * dx[0] + M[0][1] * dx[1] + M[0][2] * dx[2],
        M[1][0] * dx[0] + M[1][1] * dx[1] + M[1][2] * dx[2],
        M[2][0] * dx[0] + M[2][1] * dx[1] + M[2][2] * dx[2],
      ]
      for (let i = 0; i < N; i++) {
        q[i] += J[i][0] * y[0] + J[i][1] * y[1] + J[i][2] * y[2]
        q[i] = Math.max(jointInfo[i].lower, Math.min(jointInfo[i].upper, q[i]))
      }
      names.forEach((name, i) => robot.setJointValue(name, q[i]))
      updateWorld()
    }

    const result = {}
    names.forEach((name, i) => { result[name] = +(q[i] / DEG).toFixed(2) })
    return result
  }

  // Numerical IK: iteratively compute joint deltas to move end-effector along a cartesian axis
  const solvePositionIK = (axis, deltaMm) => {
    const robot = robotObjRef.current
    if (!robot || !jointInfo.length || axis > 2) return null

    const eps = 1e-5 // radians for numerical Jacobian
    // Axis mapping: user frame (URDF Z-up) → Three.js world (Y-up)
    // Robot rotation [-PI/2, 0, 0]: URDF X→ThreeX, URDF Y→-ThreeZ, URDF Z→ThreeY
    const axisVectors = [[1, 0, 0], [0, 0, -1], [0, 1, 0]]
    const dir = axisVectors[axis]
    const totalDelta = deltaMm * 0.001 // mm → meters
    const N = jointInfo.length
    const names = jointInfo.map(j => j.name)

    const Vec3 = robot.position.constructor

    // Helper: update full world matrix chain from scene root
    const updateWorld = () => {
      let root = robot
      while (root.parent) root = root.parent
      root.updateMatrixWorld(true)
    }

    // Helper: get current EE world position
    const getEE = () => {
      const lastJoint = robot.joints[names[N - 1]]
      const p = new Vec3()
      lastJoint.getWorldPosition(p)
      return p
    }

    // Start from current joint config (radians)
    const q = names.map(name => (jointValues[name] || 0) * DEG)

    // Apply initial config
    names.forEach((name, i) => robot.setJointValue(name, q[i]))
    updateWorld()

    // Break into substeps for better straight-line tracking
    const SUBSTEPS = 8
    const subDelta = totalDelta / SUBSTEPS
    const lambda = 0.001 // damping factor

    for (let step = 0; step < SUBSTEPS; step++) {
      // Current EE position
      const eePos = getEE()

      // Build Jacobian J[i] = d(ee)/d(q_i)  (3 x N)
      const J = []
      for (let i = 0; i < N; i++) {
        const orig = q[i]
        robot.setJointValue(names[i], orig + eps)
        updateWorld()
        const pPlus = getEE()

        robot.setJointValue(names[i], orig - eps)
        updateWorld()
        const pMinus = getEE()

        // Central difference for better accuracy
        J.push([
          (pPlus.x - pMinus.x) / (2 * eps),
          (pPlus.y - pMinus.y) / (2 * eps),
          (pPlus.z - pMinus.z) / (2 * eps),
        ])

        robot.setJointValue(names[i], orig) // restore
      }
      updateWorld()

      // Desired displacement for this substep
      const dx = [dir[0] * subDelta, dir[1] * subDelta, dir[2] * subDelta]

      // Damped least-squares: dq = J^T (J J^T + λI)^-1 dx
      // Compute JJT (3x3)
      const JJT = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
      for (let i = 0; i < N; i++)
        for (let r = 0; r < 3; r++)
          for (let c = 0; c < 3; c++)
            JJT[r][c] += J[i][r] * J[i][c]
      JJT[0][0] += lambda; JJT[1][1] += lambda; JJT[2][2] += lambda

      // Invert 3x3 via cofactors
      const [[a, b, c], [d, e, f], [g, h, k]] = JJT
      const det = a * (e * k - f * h) - b * (d * k - f * g) + c * (d * h - e * g)
      if (Math.abs(det) < 1e-12) break

      const inv = 1 / det
      const M = [
        [(e * k - f * h) * inv, (c * h - b * k) * inv, (b * f - c * e) * inv],
        [(f * g - d * k) * inv, (a * k - c * g) * inv, (c * d - a * f) * inv],
        [(d * h - e * g) * inv, (b * g - a * h) * inv, (a * e - b * d) * inv],
      ]

      // y = M * dx
      const y = [
        M[0][0] * dx[0] + M[0][1] * dx[1] + M[0][2] * dx[2],
        M[1][0] * dx[0] + M[1][1] * dx[1] + M[1][2] * dx[2],
        M[2][0] * dx[0] + M[2][1] * dx[1] + M[2][2] * dx[2],
      ]

      // dq = J^T * y
      for (let i = 0; i < N; i++) {
        const dq = J[i][0] * y[0] + J[i][1] * y[1] + J[i][2] * y[2]
        q[i] += dq
        // Clamp to joint limits
        const info = jointInfo[i]
        q[i] = Math.max(info.lower, Math.min(info.upper, q[i]))
      }

      // Apply updated config for next substep
      names.forEach((name, i) => robot.setJointValue(name, q[i]))
      updateWorld()
    }

    // Return total deltas in degrees
    const result = {}
    names.forEach((name, i) => {
      result[name] = (q[i] / DEG) - (jointValues[name] || 0)
    })
    return result
  }

  const jog = (axis, dir) => {
    if (estop) return
    // Position IK for X/Y/Z (cartesian readout updated by FK effect)
    const deltas = solvePositionIK(axis, dir * stepSize)
    if (deltas) {
      setJointValues(prev => {
        const next = { ...prev }
        for (const name in deltas) next[name] = +((next[name] || 0) + deltas[name]).toFixed(2)
        return next
      })
    }
  }

  const jogJoint = (jointName, dir) => {
    if (estop) return
    setJointValues(prev => ({
      ...prev,
      [jointName]: +((prev[jointName] || 0) + dir * stepSize * 0.1).toFixed(2)
    }))
  }

  const goTo = (pos) => {
    if (estop) return
    if (jointInfo.length && pos.joints) {
      const named = {}
      jointInfo.forEach((j, i) => {
        if (i < pos.joints.length) named[j.name] = pos.joints[i]
      })
      setJointValues(named)
    }
    setCartesian([...pos.cartesian])
  }

  const savePosition = () => {
    if (!saveName.trim()) return
    const jointArr = jointInfo.map(j => jointValues[j.name] || 0)
    setPositions(prev => [...prev, { id: nextId, name: saveName.trim(), joints: jointArr, cartesian: [...cartesian], preset: false }])
    setNextId(nextId + 1)
    setSaveName('')
  }

  // Viewer props based on robot source
  const viewerProps = robotSource === 'custom' && customUrdf
    ? { urdfText: customUrdf.urdfText, meshFiles: customUrdf.meshFiles, urdfUrl: null }
    : { urdfUrl: '/models/ur3/ur3.urdf', urdfText: null, meshFiles: null }

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

      {/* Position readout - full width */}
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
        {posView === 'cartesian' ? (
          <div className="grid grid-cols-6 gap-3">
            {cartesian.map((v, i) => (
              <div key={i} className="text-center py-3">
                <p className="text-[0.65rem] text-white/25 mb-1">{CART_LABELS[i]}</p>
                <EditableValue
                  value={v}
                  disabled={estop}
                  onChange={(val) => {
                    if (i < 3) {
                      // XYZ: solve IK to reach target position
                      const target = [...cartesian]
                      target[i] = val
                      const joints = solveIKToTarget(target.slice(0, 3))
                      if (joints) setJointValues(joints)
                    }
                  }}
                />
                <p className="text-[0.55rem] text-white/20 mt-0.5">{CART_UNITS[i]}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {jointInfo.length > 0 ? jointInfo.map(j => (
              <div key={j.name} className="text-center py-3">
                <p className="text-[0.65rem] text-white/25 mb-1">{j.name}</p>
                <EditableValue
                  value={jointValues[j.name] || 0}
                  disabled={estop}
                  onChange={(val) => {
                    const info = jointInfo.find(ji => ji.name === j.name)
                    const clamped = info ? Math.max(info.lower / DEG, Math.min(info.upper / DEG, val)) : val
                    setJointValues(prev => ({ ...prev, [j.name]: +clamped.toFixed(2) }))
                  }}
                />
                <p className="text-[0.55rem] text-white/20 mt-0.5">°</p>
              </div>
            )) : (
              <div className="col-span-full text-center py-3">
                <p className="text-sm text-white/20">Loading joints...</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Main 3-column grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ─── Column 1: Jog Controls ─── */}
        <div className="flex flex-col gap-6">
          <Card className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white/60">Jog</h3>
              <SegmentToggle
                options={[{ value: 'cartesian', label: 'Cartesian' }, { value: 'joint', label: 'Joint' }]}
                value={jogMode} onChange={setJogMode} />
            </div>

            {jogMode === 'cartesian' ? (
              <div className="flex-1 grid grid-cols-3 gap-3 content-center">
                {/* X Axis */}
                <div className="flex flex-col gap-2">
                  <p className="text-[0.6rem] font-semibold text-center uppercase tracking-widest text-rose-400/60">X</p>
                  <div className="grid grid-cols-2 gap-1.5 flex-1">
                    <JogButton onPress={() => jog(0, -1)} pressed={pressedKey === 'x-'} className="min-h-12">
                      <ArrowLeft size={15} /><span className="text-[0.6rem]">X−</span>
                    </JogButton>
                    <JogButton onPress={() => jog(0, 1)} pressed={pressedKey === 'x+'} className="min-h-12">
                      <span className="text-[0.6rem]">X+</span><ArrowRight size={15} />
                    </JogButton>
                  </div>
                </div>
                {/* Y Axis */}
                <div className="flex flex-col gap-2">
                  <p className="text-[0.6rem] font-semibold text-center uppercase tracking-widest text-emerald-400/60">Y</p>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <JogButton onPress={() => jog(1, 1)} pressed={pressedKey === 'y+'} className="flex-1 min-h-12 w-full">
                      <ArrowUp size={15} /><span className="text-[0.6rem]">Y+</span>
                    </JogButton>
                    <JogButton onPress={() => jog(1, -1)} pressed={pressedKey === 'y-'} className="flex-1 min-h-12 w-full">
                      <ArrowDown size={15} /><span className="text-[0.6rem]">Y−</span>
                    </JogButton>
                  </div>
                </div>
                {/* Z Axis */}
                <div className="flex flex-col gap-2">
                  <p className="text-[0.6rem] font-semibold text-center uppercase tracking-widest text-blue-400/60">Z</p>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <JogButton onPress={() => jog(2, 1)} className="flex-1 min-h-12 w-full">
                      <ChevronUp size={15} /><span className="text-[0.6rem]">Z+</span>
                    </JogButton>
                    <JogButton onPress={() => jog(2, -1)} className="flex-1 min-h-12 w-full">
                      <ChevronDown size={15} /><span className="text-[0.6rem]">Z−</span>
                    </JogButton>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 grid grid-cols-3 gap-3 content-center">
                {jointInfo.length > 0 ? jointInfo.map(j => (
                  <div key={j.name} className="flex flex-col gap-1.5">
                    <JogButton onPress={() => jogJoint(j.name, 1)} className="flex-1 min-h-10 w-full">
                      <ChevronUp size={15} />
                    </JogButton>
                    <div className="text-center py-0.5">
                      <p className="text-[0.55rem] text-white/25 truncate">{j.name}</p>
                      <p className="text-xs font-mono text-white/60">{(jointValues[j.name] || 0).toFixed(1)}°</p>
                    </div>
                    <JogButton onPress={() => jogJoint(j.name, -1)} className="flex-1 min-h-10 w-full">
                      <ChevronDown size={15} />
                    </JogButton>
                  </div>
                )) : (
                  <div className="col-span-3 flex items-center justify-center py-8">
                    <p className="text-sm text-white/20">Loading joints...</p>
                  </div>
                )}
              </div>
            )}

            {/* Step & Speed - stacked */}
            <div className="space-y-4 pt-4 mt-auto border-t border-white/5">
              <div>
                <p className="text-[0.65rem] font-semibold text-white/25 uppercase tracking-wider mb-2">Step Size</p>
                <SegmentToggle
                  options={STEP_SIZES.map(s => ({ value: s, label: `${s}` }))}
                  value={stepSize} onChange={setStepSize} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
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

        {/* ─── Column 2: 3D Viewer ─── */}
        <div className="flex flex-col">
          <Card className="flex-1 flex flex-col p-2">
            <div className="flex items-center justify-between px-3 pt-2 pb-2">
              <h3 className="text-sm font-semibold text-white/60">3D View</h3>
              <div className="flex items-center gap-2">
                <SegmentToggle
                  options={[{ value: 'ur3', label: 'UR3' }, { value: 'custom', label: 'Upload' }]}
                  value={robotSource} onChange={setRobotSource} />
                <span className="text-[0.6rem] text-white/20">Drag to orbit</span>
              </div>
            </div>

            {robotSource === 'custom' && !customUrdf && (
              <div className="px-3 pb-2">
                <label className="flex items-center gap-2 px-3 py-2 bg-white/[0.04] rounded-lg border border-white/8 cursor-pointer hover:bg-white/[0.07] transition-all">
                  <Upload size={14} className="text-white/30" />
                  <span className="text-xs text-white/30">Select .urdf + mesh files</span>
                  <input type="file" multiple accept=".urdf,.stl,.dae,.obj" className="hidden"
                    onChange={handleFileUpload} />
                </label>
              </div>
            )}
            {robotSource === 'custom' && customUrdf && (
              <div className="px-3 pb-2 flex items-center gap-2">
                <span className="text-xs text-white/30 flex-1 truncate">Custom URDF loaded</span>
                <label className="text-[0.6rem] text-blue-400/60 hover:text-blue-400 cursor-pointer transition-all">
                  Replace
                  <input type="file" multiple accept=".urdf,.stl,.dae,.obj" className="hidden"
                    onChange={handleFileUpload} />
                </label>
              </div>
            )}

            <div className="flex-1 min-h-[400px] relative">
              {robotSource === 'custom' && !customUrdf ? (
                <div className="w-full h-full min-h-[300px] rounded-xl bg-white/[0.03] flex items-center justify-center">
                  <p className="text-sm text-white/15">Upload a URDF to visualize</p>
                </div>
              ) : (
                <Suspense fallback={<ViewerFallback />}>
                  <RobotViewer
                    {...viewerProps}
                    jointValues={jointValuesRad}
                    onRobotLoad={handleRobotLoad}
                    cameraY={cameraY}
                  />
                </Suspense>
              )}
              {/* Camera pan overlay */}
              <div className="absolute top-3 left-3 flex flex-col gap-0.5 z-10">
                <button onClick={() => setCameraY(y => +(y + 0.05).toFixed(2))}
                  className="p-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-white/30 hover:text-white/70 hover:bg-white/[0.12] backdrop-blur-sm transition-all cursor-pointer">
                  <ChevronUp size={14} />
                </button>
                <button onClick={() => setCameraY(y => +(y - 0.05).toFixed(2))}
                  className="p-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-white/30 hover:text-white/70 hover:bg-white/[0.12] backdrop-blur-sm transition-all cursor-pointer">
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* ─── Column 3: Status, Gripper, Positions ─── */}
        <div className="flex flex-col gap-6">

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
              {positions.filter(pos => !pos.preset || robotSource === 'ur3').map(pos => (
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
