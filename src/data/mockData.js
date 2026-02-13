// ── Annotation points on the part image ──
export const annotationPoints = [
  { id: 1, x: 22, y: 30, label: 'Connector A', status: 'pass' },
  { id: 2, x: 45, y: 18, label: 'IC U3', status: 'pass' },
  { id: 3, x: 68, y: 42, label: 'Capacitor C12', status: 'fail' },
  { id: 4, x: 35, y: 60, label: 'Solder Joint B7', status: 'pass' },
  { id: 5, x: 78, y: 70, label: 'Resistor R22', status: 'warning' },
  { id: 6, x: 55, y: 50, label: 'Header P1', status: 'pass' },
  { id: 7, x: 15, y: 75, label: 'Diode D4', status: 'pass' },
  { id: 8, x: 85, y: 25, label: 'Crystal Y1', status: 'pass' },
]

// ── Test status rows ──
export const testResults = [
  { id: 1, name: 'ESD Protection', status: 'pass', value: '< 0.5 kV', time: '2.3s' },
  { id: 2, name: 'Sound Level Test', status: 'pass', value: '32 dB', time: '5.1s' },
  { id: 3, name: 'Camera Calibration', status: 'pass', value: 'RMS 0.12', time: '8.7s' },
  { id: 4, name: 'Monitor Uniformity', status: 'fail', value: 'Delta E 5.8', time: '12.4s' },
  { id: 5, name: 'Visual Inspection', status: 'pass', value: '98.2%', time: '3.9s' },
  { id: 6, name: 'Connector Seating', status: 'pass', value: 'OK', time: '1.2s' },
  { id: 7, name: 'Solder Quality', status: 'warning', value: '94.1%', time: '6.5s' },
  { id: 8, name: 'Component Polarity', status: 'pass', value: 'OK', time: '2.8s' },
]

// ── Score panel ──
export const scoreData = {
  current: 9220,
  total: 9500,
  label: 'Quality Score',
  trend: '+2.4%',
}

// ── First pass yield donut ──
export const firstPassYieldData = {
  value: 97.5,
  label: 'First Pass Yield',
  color: '#34d399',
}

// ── Production quality donut ──
export const productionQualityData = {
  value: 99.0,
  label: 'Production Quality',
  color: '#3b82f6',
}

// ── Return inspection line chart ──
export const returnInspectionData = [
  { month: 'Jul', rate: 2.1 },
  { month: 'Aug', rate: 1.8 },
  { month: 'Sep', rate: 2.4 },
  { month: 'Oct', rate: 1.5 },
  { month: 'Nov', rate: 1.2 },
  { month: 'Dec', rate: 0.9 },
  { month: 'Jan', rate: 1.1 },
  { month: 'Feb', rate: 0.8 },
]

// ── Defects trend bar + line combo ──
export const defectsTrendData = [
  { week: 'W1', defects: 12, rate: 1.8 },
  { week: 'W2', defects: 9, rate: 1.4 },
  { week: 'W3', defects: 15, rate: 2.1 },
  { week: 'W4', defects: 7, rate: 1.0 },
  { week: 'W5', defects: 5, rate: 0.8 },
  { week: 'W6', defects: 8, rate: 1.1 },
  { week: 'W7', defects: 4, rate: 0.6 },
  { week: 'W8', defects: 3, rate: 0.5 },
]

// ── Action items ──
export const actionItems = [
  {
    id: 1,
    title: 'Replace capacitor C12 on Station 3',
    priority: 'high',
    assignee: 'Tech A',
    due: 'Today',
  },
  {
    id: 2,
    title: 'Recalibrate monitor Delta E threshold',
    priority: 'high',
    assignee: 'QC Lead',
    due: 'Today',
  },
  {
    id: 3,
    title: 'Review solder paste batch #4421',
    priority: 'medium',
    assignee: 'Tech B',
    due: 'Tomorrow',
  },
  {
    id: 4,
    title: 'Update ESD test firmware to v2.3',
    priority: 'low',
    assignee: 'Eng. C',
    due: 'This week',
  },
  {
    id: 5,
    title: 'Schedule hand-eye recalibration',
    priority: 'medium',
    assignee: 'Tech A',
    due: 'This week',
  },
]

// ── Final verdict ──
export const finalVerdict = {
  status: 'pass',
  message: 'Unit QC-2024-00847 — All critical tests passed',
  passCount: 7,
  failCount: 1,
  warningCount: 1,
  totalTests: 9,
}
