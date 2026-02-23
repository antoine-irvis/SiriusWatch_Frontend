import {
  LayoutDashboard,
  Package,
  MonitorCog,
  Focus,
  Gamepad2,
  ScanSearch,
  BarChart3,
  Settings,
} from 'lucide-react'

const navSections = [
  {
    // Core — no label, shown at top
    items: [
      {
        label: 'Home',
        path: '/dashboard',
        icon: LayoutDashboard,
        description: 'Welcome & quick access',
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
    ],
  },
  {
    label: 'Setup & Tools',
    collapsible: true,
    items: [
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
    ],
  },
  {
    // Bottom-pinned — no label
    pinBottom: true,
    items: [
      {
        label: 'Settings',
        path: '/settings',
        icon: Settings,
        description: 'App preferences & config',
      },
    ],
  },
]

export const allNavItems = navSections.flatMap((section) => section.items)

export default navSections
