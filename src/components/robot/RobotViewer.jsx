import { useRef, useEffect, Component } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei'
import URDFLoader from 'urdf-loader'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { Mesh, MeshStandardMaterial, Object3D } from 'three'

const LINK_COLORS = [
  '#4a5568', '#3b4c6b', '#2d4a7c', '#2e5090',
  '#3355a0', '#4466b0', '#5577c0', '#6688d0',
]

// ──────────────────────────────────────────────────────────
// Scene setup: lights, orbit controls, grid
// ──────────────────────────────────────────────────────────

function SceneSetup({ cameraY = 0.15 }) {
  const controlsRef = useRef()

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(0, cameraY, 0)
      controlsRef.current.update()
    }
  }, [cameraY])

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.0} castShadow />
      <directionalLight position={[-3, 4, -2]} intensity={0.3} />
      <pointLight position={[0, 3, 0]} intensity={0.2} color="#6688cc" />
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.1}
        minDistance={0.15}
        maxDistance={1.5}
        target={[0, cameraY, 0]}
      />
      <Grid
        args={[2, 2]}
        cellSize={0.05}
        cellThickness={0.5}
        cellColor="#1a2040"
        sectionSize={0.25}
        sectionThickness={1}
        sectionColor="#2a3560"
        fadeDistance={1.5}
        infiniteGrid
        position={[0, -0.001, 0]}
      />
      <GizmoHelper alignment="bottom-left" margin={[60, 60]}>
        <GizmoViewport
          axisColors={['#ef4444', '#3b82f6', '#22c55e']}
          labels={['X', 'Z', 'Y']}
          labelColor="white"
        />
      </GizmoHelper>
    </>
  )
}

// ──────────────────────────────────────────────────────────
// URDF scene: loads/parses URDF, updates joints reactively
// ──────────────────────────────────────────────────────────

function URDFScene({ urdfUrl, urdfText, meshFiles, jointValues, onRobotLoad }) {
  const { scene } = useThree()
  const robotRef = useRef(null)
  const onRobotLoadRef = useRef(onRobotLoad)
  onRobotLoadRef.current = onRobotLoad

  useEffect(() => {
    if (robotRef.current) {
      scene.remove(robotRef.current)
      robotRef.current = null
    }

    if (!urdfUrl && !urdfText) return

    const loader = new URDFLoader()
    let meshIdx = 0

    // Custom STL mesh loader with gradient material
    loader.loadMeshCb = (path, mgr, done) => {
      let url = path
      if (meshFiles) {
        const filename = path.split('/').pop()
        if (meshFiles[filename]) url = meshFiles[filename]
      }

      const color = LINK_COLORS[meshIdx++ % LINK_COLORS.length]
      const mat = new MeshStandardMaterial({ color, metalness: 0.6, roughness: 0.35 })

      const stlLoader = new STLLoader(mgr)
      stlLoader.load(
        url,
        (geometry) => done(new Mesh(geometry, mat)),
        undefined,
        () => done(new Object3D()),
      )
    }

    const handleLoaded = (robot) => {
      // Convert from URDF Z-up to Three.js Y-up
      robot.rotation.set(-Math.PI / 2, 0, 0)
      scene.add(robot)
      robotRef.current = robot

      // Extract joint metadata for parent
      if (onRobotLoadRef.current) {
        const joints = Object.values(robot.joints)
          .filter(j => j.jointType !== 'fixed')
          .map(j => ({
            name: j.name,
            type: j.jointType,
            lower: j.limit?.lower ?? -6.2832,
            upper: j.limit?.upper ?? 6.2832,
          }))
        onRobotLoadRef.current(joints, robot)
      }
    }

    if (urdfText) {
      // Upload mode: parse raw URDF XML
      const robot = loader.parse(urdfText)
      handleLoaded(robot)
    } else {
      // URL mode: fetch and parse
      loader.load(urdfUrl, handleLoaded, undefined, (err) => {
        console.error('Failed to load URDF:', err)
      })
    }

    return () => {
      if (robotRef.current) {
        scene.remove(robotRef.current)
        robotRef.current = null
      }
    }
  }, [urdfUrl, urdfText, meshFiles, scene])

  // Reactively update joint angles
  useEffect(() => {
    if (!robotRef.current || !jointValues) return
    Object.entries(jointValues).forEach(([name, radians]) => {
      robotRef.current.setJointValue(name, radians)
    })
  }, [jointValues])

  return null
}

// ──────────────────────────────────────────────────────────
// Error boundary catches Three.js / R3F crashes
// ──────────────────────────────────────────────────────────

class ViewerErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100%', height: '100%', minHeight: 300,
          borderRadius: 12, display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: 'rgba(255,255,255,0.03)',
        }}>
          <div style={{ textAlign: 'center', padding: 16 }}>
            <p style={{ fontSize: 12, color: 'rgba(251,113,133,0.8)', marginBottom: 4 }}>
              3D viewer failed to load
            </p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
              {this.state.error?.message || 'Unknown error'}
            </p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ──────────────────────────────────────────────────────────
// Main exported component
// ──────────────────────────────────────────────────────────

export default function RobotViewer({
  urdfUrl = '/models/ur3/ur3.urdf',
  urdfText = null,
  meshFiles = null,
  jointValues = {},
  onRobotLoad = null,
  cameraY = 0.15,
}) {
  return (
    <ViewerErrorBoundary>
      <div className="w-full h-full min-h-[300px] rounded-xl overflow-hidden bg-gray-950/50">
        <Canvas
          camera={{ position: [0.8, 0.55, 0.8], fov: 45, near: 0.01, far: 10 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <SceneSetup cameraY={cameraY} />
          <URDFScene
            urdfUrl={urdfText ? null : urdfUrl}
            urdfText={urdfText}
            meshFiles={meshFiles}
            jointValues={jointValues}
            onRobotLoad={onRobotLoad}
          />
        </Canvas>
      </div>
    </ViewerErrorBoundary>
  )
}
