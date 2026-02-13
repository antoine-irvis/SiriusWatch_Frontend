import {
  Package,
  MonitorCog,
  Focus,
  Gamepad2,
  ScanSearch,
  BarChart3,
  Settings,
} from 'lucide-react'

const navItems = [
  {
    label: 'Product Information',
    path: '/product',
    icon: Package,
    description: 'Product details & configuration',
  },
  {
    label: 'Environment Setup',
    path: '/environment',
    icon: MonitorCog,
    description: 'Robot connection & workspace',
  },
  {
    label: 'Calibration',
    path: '/calibration',
    icon: Focus,
    description: 'Camera & hand-eye calibration',
  },
  {
    label: 'Manual Control',
    path: '/manual-control',
    icon: Gamepad2,
    description: 'Jog robot arm & gripper',
  },
  {
    label: 'Inspection',
    path: '/inspection',
    icon: ScanSearch,
    description: 'Run tests & view results',
  },
  {
    label: 'Results',
    path: '/results',
    icon: BarChart3,
    description: 'Analytics & trends',
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    description: 'App preferences & config',
  },
]

export default navItems
