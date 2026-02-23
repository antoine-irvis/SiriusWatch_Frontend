import { useState, useMemo } from 'react'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import { useToast } from '../context/ToastContext'
import { STATUS_TEXT_COLORS, STATUS_BORDER_BG_COLORS } from '../utils/constants'
import {
  BarChart3, TrendingUp, Clock, AlertTriangle,
  Check, X, ChevronDown, Search, Download, Filter,
  CheckCircle2, XCircle, ArrowUpDown, ArrowUp, ArrowDown,
} from 'lucide-react'

/* ── mock historical runs ── */
const MOCK_RUNS = [
  {
    id: 'QC-2024-00847', date: '2024-02-19T14:32:00', product: 'PCB-A Rev3', operator: 'Tech A', duration: '42.3s',
    tests: [
      { name: 'ESD Protection', status: 'pass', value: '< 0.5 kV', threshold: '< 2.0 kV', time: '2.3s' },
      { name: 'Sound Level', status: 'pass', value: '32 dB', threshold: '< 45 dB', time: '5.1s' },
      { name: 'Camera Calibration', status: 'pass', value: 'RMS 0.12', threshold: '< 0.5', time: '8.7s' },
      { name: 'Monitor Uniformity', status: 'fail', value: 'Delta E 5.8', threshold: '< 3.0', time: '12.4s' },
      { name: 'Visual Inspection', status: 'pass', value: '98.2%', threshold: '> 95%', time: '3.9s' },
      { name: 'Connector Seating', status: 'pass', value: 'OK', threshold: 'OK', time: '1.2s' },
      { name: 'Solder Quality', status: 'warning', value: '94.1%', threshold: '> 95%', time: '6.5s' },
      { name: 'Component Polarity', status: 'pass', value: 'OK', threshold: 'OK', time: '2.8s' },
    ],
  },
  {
    id: 'QC-2024-00846', date: '2024-02-19T13:47:00', product: 'PCB-A Rev3', operator: 'Tech B', duration: '39.8s',
    tests: [
      { name: 'ESD Protection', status: 'pass', value: '< 0.3 kV', threshold: '< 2.0 kV', time: '2.1s' },
      { name: 'Sound Level', status: 'pass', value: '29 dB', threshold: '< 45 dB', time: '4.8s' },
      { name: 'Camera Calibration', status: 'pass', value: 'RMS 0.09', threshold: '< 0.5', time: '8.2s' },
      { name: 'Monitor Uniformity', status: 'pass', value: 'Delta E 2.1', threshold: '< 3.0', time: '11.6s' },
      { name: 'Visual Inspection', status: 'pass', value: '99.1%', threshold: '> 95%', time: '3.5s' },
      { name: 'Connector Seating', status: 'pass', value: 'OK', threshold: 'OK', time: '1.1s' },
      { name: 'Solder Quality', status: 'pass', value: '97.8%', threshold: '> 95%', time: '6.1s' },
      { name: 'Component Polarity', status: 'pass', value: 'OK', threshold: 'OK', time: '2.4s' },
    ],
  },
  {
    id: 'QC-2024-00845', date: '2024-02-19T11:15:00', product: 'PCB-B Rev1', operator: 'Tech A', duration: '51.2s',
    tests: [
      { name: 'ESD Protection', status: 'pass', value: '< 0.8 kV', threshold: '< 2.0 kV', time: '2.5s' },
      { name: 'Sound Level', status: 'fail', value: '48 dB', threshold: '< 45 dB', time: '5.4s' },
      { name: 'Camera Calibration', status: 'pass', value: 'RMS 0.18', threshold: '< 0.5', time: '9.1s' },
      { name: 'Monitor Uniformity', status: 'fail', value: 'Delta E 4.2', threshold: '< 3.0', time: '13.0s' },
      { name: 'Visual Inspection', status: 'pass', value: '96.5%', threshold: '> 95%', time: '4.2s' },
      { name: 'Connector Seating', status: 'pass', value: 'OK', threshold: 'OK', time: '1.3s' },
      { name: 'Solder Quality', status: 'warning', value: '93.2%', threshold: '> 95%', time: '7.0s' },
      { name: 'Component Polarity', status: 'pass', value: 'OK', threshold: 'OK', time: '2.7s' },
    ],
  },
  {
    id: 'QC-2024-00844', date: '2024-02-19T09:22:00', product: 'PCB-A Rev3', operator: 'Tech C', duration: '38.1s',
    tests: [
      { name: 'ESD Protection', status: 'pass', value: '< 0.2 kV', threshold: '< 2.0 kV', time: '2.0s' },
      { name: 'Sound Level', status: 'pass', value: '28 dB', threshold: '< 45 dB', time: '4.5s' },
      { name: 'Camera Calibration', status: 'pass', value: 'RMS 0.07', threshold: '< 0.5', time: '7.9s' },
      { name: 'Monitor Uniformity', status: 'pass', value: 'Delta E 1.9', threshold: '< 3.0', time: '10.8s' },
      { name: 'Visual Inspection', status: 'pass', value: '99.4%', threshold: '> 95%', time: '3.2s' },
      { name: 'Connector Seating', status: 'pass', value: 'OK', threshold: 'OK', time: '1.0s' },
      { name: 'Solder Quality', status: 'pass', value: '98.1%', threshold: '> 95%', time: '5.8s' },
      { name: 'Component Polarity', status: 'pass', value: 'OK', threshold: 'OK', time: '2.9s' },
    ],
  },
  {
    id: 'QC-2024-00843', date: '2024-02-18T16:55:00', product: 'PCB-C Rev2', operator: 'Tech B', duration: '45.6s',
    tests: [
      { name: 'ESD Protection', status: 'pass', value: '< 0.6 kV', threshold: '< 2.0 kV', time: '2.4s' },
      { name: 'Sound Level', status: 'pass', value: '35 dB', threshold: '< 45 dB', time: '5.3s' },
      { name: 'Camera Calibration', status: 'warning', value: 'RMS 0.41', threshold: '< 0.5', time: '9.5s' },
      { name: 'Monitor Uniformity', status: 'pass', value: 'Delta E 2.8', threshold: '< 3.0', time: '12.1s' },
      { name: 'Visual Inspection', status: 'pass', value: '97.0%', threshold: '> 95%', time: '4.0s' },
      { name: 'Connector Seating', status: 'pass', value: 'OK', threshold: 'OK', time: '1.2s' },
      { name: 'Solder Quality', status: 'pass', value: '96.3%', threshold: '> 95%', time: '6.8s' },
      { name: 'Component Polarity', status: 'pass', value: 'OK', threshold: 'OK', time: '2.3s' },
    ],
  },
  {
    id: 'QC-2024-00842', date: '2024-02-18T15:10:00', product: 'PCB-A Rev3', operator: 'Tech A', duration: '40.0s',
    tests: [
      { name: 'ESD Protection', status: 'pass', value: '< 0.4 kV', threshold: '< 2.0 kV', time: '2.2s' },
      { name: 'Sound Level', status: 'pass', value: '31 dB', threshold: '< 45 dB', time: '4.9s' },
      { name: 'Camera Calibration', status: 'pass', value: 'RMS 0.11', threshold: '< 0.5', time: '8.4s' },
      { name: 'Monitor Uniformity', status: 'pass', value: 'Delta E 2.4', threshold: '< 3.0', time: '11.3s' },
      { name: 'Visual Inspection', status: 'pass', value: '98.8%', threshold: '> 95%', time: '3.6s' },
      { name: 'Connector Seating', status: 'pass', value: 'OK', threshold: 'OK', time: '1.1s' },
      { name: 'Solder Quality', status: 'pass', value: '97.2%', threshold: '> 95%', time: '6.2s' },
      { name: 'Component Polarity', status: 'pass', value: 'OK', threshold: 'OK', time: '2.3s' },
    ],
  },
  {
    id: 'QC-2024-00841', date: '2024-02-18T13:30:00', product: 'PCB-B Rev1', operator: 'Tech C', duration: '48.9s',
    tests: [
      { name: 'ESD Protection', status: 'pass', value: '< 1.1 kV', threshold: '< 2.0 kV', time: '2.6s' },
      { name: 'Sound Level', status: 'pass', value: '38 dB', threshold: '< 45 dB', time: '5.7s' },
      { name: 'Camera Calibration', status: 'pass', value: 'RMS 0.22', threshold: '< 0.5', time: '9.8s' },
      { name: 'Monitor Uniformity', status: 'fail', value: 'Delta E 6.1', threshold: '< 3.0', time: '13.5s' },
      { name: 'Visual Inspection', status: 'warning', value: '95.3%', threshold: '> 95%', time: '4.5s' },
      { name: 'Connector Seating', status: 'pass', value: 'OK', threshold: 'OK', time: '1.4s' },
      { name: 'Solder Quality', status: 'fail', value: '88.7%', threshold: '> 95%', time: '7.2s' },
      { name: 'Component Polarity', status: 'pass', value: 'OK', threshold: 'OK', time: '4.2s' },
    ],
  },
  {
    id: 'QC-2024-00840', date: '2024-02-18T10:05:00', product: 'PCB-A Rev3', operator: 'Tech A', duration: '37.5s',
    tests: [
      { name: 'ESD Protection', status: 'pass', value: '< 0.3 kV', threshold: '< 2.0 kV', time: '2.0s' },
      { name: 'Sound Level', status: 'pass', value: '27 dB', threshold: '< 45 dB', time: '4.3s' },
      { name: 'Camera Calibration', status: 'pass', value: 'RMS 0.08', threshold: '< 0.5', time: '7.8s' },
      { name: 'Monitor Uniformity', status: 'pass', value: 'Delta E 1.7', threshold: '< 3.0', time: '10.5s' },
      { name: 'Visual Inspection', status: 'pass', value: '99.5%', threshold: '> 95%', time: '3.1s' },
      { name: 'Connector Seating', status: 'pass', value: 'OK', threshold: 'OK', time: '1.0s' },
      { name: 'Solder Quality', status: 'pass', value: '98.5%', threshold: '> 95%', time: '5.6s' },
      { name: 'Component Polarity', status: 'pass', value: 'OK', threshold: 'OK', time: '3.2s' },
    ],
  },
  {
    id: 'QC-2024-00839', date: '2024-02-17T16:20:00', product: 'PCB-C Rev2', operator: 'Tech B', duration: '44.1s',
    tests: [
      { name: 'ESD Protection', status: 'pass', value: '< 0.7 kV', threshold: '< 2.0 kV', time: '2.3s' },
      { name: 'Sound Level', status: 'pass', value: '33 dB', threshold: '< 45 dB', time: '5.0s' },
      { name: 'Camera Calibration', status: 'pass', value: 'RMS 0.15', threshold: '< 0.5', time: '8.9s' },
      { name: 'Monitor Uniformity', status: 'pass', value: 'Delta E 2.5', threshold: '< 3.0', time: '11.8s' },
      { name: 'Visual Inspection', status: 'pass', value: '97.8%', threshold: '> 95%', time: '3.8s' },
      { name: 'Connector Seating', status: 'pass', value: 'OK', threshold: 'OK', time: '1.1s' },
      { name: 'Solder Quality', status: 'pass', value: '96.9%', threshold: '> 95%', time: '6.4s' },
      { name: 'Component Polarity', status: 'pass', value: 'OK', threshold: 'OK', time: '4.8s' },
    ],
  },
  {
    id: 'QC-2024-00838', date: '2024-02-17T14:45:00', product: 'PCB-A Rev3', operator: 'Tech A', duration: '41.7s',
    tests: [
      { name: 'ESD Protection', status: 'pass', value: '< 0.5 kV', threshold: '< 2.0 kV', time: '2.2s' },
      { name: 'Sound Level', status: 'pass', value: '30 dB', threshold: '< 45 dB', time: '4.7s' },
      { name: 'Camera Calibration', status: 'pass', value: 'RMS 0.10', threshold: '< 0.5', time: '8.5s' },
      { name: 'Monitor Uniformity', status: 'warning', value: 'Delta E 2.9', threshold: '< 3.0', time: '12.0s' },
      { name: 'Visual Inspection', status: 'pass', value: '98.5%', threshold: '> 95%', time: '3.7s' },
      { name: 'Connector Seating', status: 'pass', value: 'OK', threshold: 'OK', time: '1.2s' },
      { name: 'Solder Quality', status: 'warning', value: '95.0%', threshold: '> 95%', time: '6.6s' },
      { name: 'Component Polarity', status: 'pass', value: 'OK', threshold: 'OK', time: '2.8s' },
    ],
  },
  {
    id: 'QC-2024-00837', date: '2024-02-17T11:30:00', product: 'PCB-B Rev1', operator: 'Tech C', duration: '53.4s',
    tests: [
      { name: 'ESD Protection', status: 'fail', value: '2.3 kV', threshold: '< 2.0 kV', time: '2.8s' },
      { name: 'Sound Level', status: 'pass', value: '36 dB', threshold: '< 45 dB', time: '5.5s' },
      { name: 'Camera Calibration', status: 'pass', value: 'RMS 0.19', threshold: '< 0.5', time: '9.3s' },
      { name: 'Monitor Uniformity', status: 'fail', value: 'Delta E 7.2', threshold: '< 3.0', time: '14.1s' },
      { name: 'Visual Inspection', status: 'pass', value: '96.1%', threshold: '> 95%', time: '4.3s' },
      { name: 'Connector Seating', status: 'fail', value: 'Loose', threshold: 'OK', time: '1.5s' },
      { name: 'Solder Quality', status: 'fail', value: '82.4%', threshold: '> 95%', time: '7.8s' },
      { name: 'Component Polarity', status: 'warning', value: 'Review', threshold: 'OK', time: '5.1s' },
    ],
  },
  {
    id: 'QC-2024-00836', date: '2024-02-17T09:10:00', product: 'PCB-A Rev3', operator: 'Tech B', duration: '39.2s',
    tests: [
      { name: 'ESD Protection', status: 'pass', value: '< 0.4 kV', threshold: '< 2.0 kV', time: '2.1s' },
      { name: 'Sound Level', status: 'pass', value: '29 dB', threshold: '< 45 dB', time: '4.6s' },
      { name: 'Camera Calibration', status: 'pass', value: 'RMS 0.06', threshold: '< 0.5', time: '8.0s' },
      { name: 'Monitor Uniformity', status: 'pass', value: 'Delta E 2.0', threshold: '< 3.0', time: '10.9s' },
      { name: 'Visual Inspection', status: 'pass', value: '99.2%', threshold: '> 95%', time: '3.4s' },
      { name: 'Connector Seating', status: 'pass', value: 'OK', threshold: 'OK', time: '1.0s' },
      { name: 'Solder Quality', status: 'pass', value: '97.5%', threshold: '> 95%', time: '6.0s' },
      { name: 'Component Polarity', status: 'pass', value: 'OK', threshold: 'OK', time: '4.2s' },
    ],
  },
]

/* ── helpers ── */
const getVerdict = (tests) => {
  if (tests.some(t => t.status === 'fail')) return 'fail'
  if (tests.some(t => t.status === 'warning')) return 'warning'
  return 'pass'
}

const formatDate = (iso) => {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
const formatTime = (iso) => {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

/* ── component ── */
export default function ResultsPage() {
  const { addToast } = useToast()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [sortKey, setSortKey] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [testTypeFilter, setTestTypeFilter] = useState('all')

  const testTypes = useMemo(() => {
    const types = new Set()
    MOCK_RUNS.forEach(r => r.tests.forEach(t => types.add(t.name)))
    return ['all', ...Array.from(types).sort()]
  }, [])

  const runs = useMemo(() => {
    return MOCK_RUNS.map(r => ({ ...r, verdict: getVerdict(r.tests) }))
  }, [])

  /* stats */
  const totalRuns = runs.length
  const passRate = Math.round((runs.filter(r => r.verdict === 'pass').length / totalRuns) * 1000) / 10
  const avgDuration = (runs.reduce((s, r) => s + parseFloat(r.duration), 0) / totalRuns).toFixed(1)

  const failureCounts = useMemo(() => {
    const counts = {}
    runs.forEach(r => r.tests.forEach(t => {
      if (t.status === 'fail') counts[t.name] = (counts[t.name] || 0) + 1
    }))
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [runs])

  const topFailure = failureCounts.length > 0 ? failureCounts[0][0] : 'None'

  /* filter + search + sort */
  const filtered = useMemo(() => {
    let list = runs
    if (filter !== 'all') list = list.filter(r => r.verdict === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        r.id.toLowerCase().includes(q) ||
        r.product.toLowerCase().includes(q) ||
        r.operator.toLowerCase().includes(q)
      )
    }
    if (dateFrom) list = list.filter(r => new Date(r.date) >= new Date(dateFrom))
    if (dateTo) list = list.filter(r => new Date(r.date) <= new Date(dateTo + 'T23:59:59'))
    if (testTypeFilter !== 'all') {
      list = list.filter(r => r.tests.some(t => t.name === testTypeFilter))
    }
    list = [...list].sort((a, b) => {
      let va, vb
      if (sortKey === 'date') { va = new Date(a.date); vb = new Date(b.date) }
      else if (sortKey === 'id') { va = a.id; vb = b.id }
      else if (sortKey === 'product') { va = a.product; vb = b.product }
      else if (sortKey === 'duration') { va = parseFloat(a.duration); vb = parseFloat(b.duration) }
      else if (sortKey === 'verdict') { va = a.verdict; vb = b.verdict }
      else { va = a[sortKey]; vb = b[sortKey] }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [runs, filter, search, sortKey, sortDir, dateFrom, dateTo, testTypeFilter])

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ArrowUpDown size={10} className="text-white/15" />
    return sortDir === 'asc'
      ? <ArrowUp size={10} className="text-blue-400" />
      : <ArrowDown size={10} className="text-blue-400" />
  }

  const handleExport = () => {
    const data = filtered.map(r => ({
      id: r.id, date: r.date, product: r.product, operator: r.operator,
      duration: r.duration, verdict: r.verdict,
      tests: r.tests,
      summary: {
        pass: r.tests.filter(t => t.status === 'pass').length,
        fail: r.tests.filter(t => t.status === 'fail').length,
        warning: r.tests.filter(t => t.status === 'warning').length,
      },
    }))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `results-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    addToast('Results exported', 'success')
  }

  const maxFail = failureCounts.length > 0 ? failureCounts[0][1] : 1

  const stats = [
    { label: 'Total Inspections', value: totalRuns.toLocaleString(), icon: BarChart3, sub: `${runs.filter(r => new Date(r.date).toDateString() === new Date('2024-02-19').toDateString()).length} today`, color: 'text-blue-400' },
    { label: 'Pass Rate', value: `${passRate}%`, icon: TrendingUp, sub: `${runs.filter(r => r.verdict === 'pass').length} passed`, color: 'text-emerald-400' },
    { label: 'Avg Cycle Time', value: `${avgDuration}s`, icon: Clock, sub: 'per inspection', color: 'text-blue-400' },
    { label: 'Top Failure', value: topFailure, icon: AlertTriangle, sub: failureCounts.length > 0 ? `${failureCounts[0][1]} occurrences` : 'No failures', color: 'text-rose-400' },
  ]

  return (
    <div className="min-h-[calc(100vh-7rem)] flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="flex items-start gap-4">
            <div className={`p-2.5 rounded-xl bg-white/5 ${s.color}`}>
              <s.icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/35 mb-1">{s.label}</p>
              <p className="text-lg font-bold text-white/90 truncate">{s.value}</p>
              <p className={`text-xs mt-0.5 ${s.color}`}>{s.sub}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        {/* Table — 3 cols */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Filters */}
          <Card className="!p-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 bg-white/5 rounded-lg p-1">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'pass', label: 'Passed' },
                  { key: 'warning', label: 'Warnings' },
                  { key: 'fail', label: 'Failed' },
                ].map(f => (
                  <button key={f.key} onClick={() => setFilter(f.key)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      filter === f.key
                        ? 'bg-white/10 text-white/80'
                        : 'text-white/30 hover:text-white/50'
                    }`}>
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 relative min-w-[180px]">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by ID, product, operator..."
                  className="w-full bg-white/5 border border-white/8 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white/70 placeholder:text-white/20 outline-none focus:border-white/20 transition-colors" />
              </div>

              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="bg-white/5 border border-white/8 rounded-lg px-2 py-1.5 text-xs text-white/70 outline-none focus:border-white/20 transition-colors" />
              <span className="text-xs text-white/15">to</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="bg-white/5 border border-white/8 rounded-lg px-2 py-1.5 text-xs text-white/70 outline-none focus:border-white/20 transition-colors" />

              <select value={testTypeFilter} onChange={e => setTestTypeFilter(e.target.value)}
                className="bg-white/5 border border-white/8 rounded-lg px-2 py-1.5 text-xs text-white/70 outline-none focus:border-white/20 transition-colors cursor-pointer">
                <option value="all" className="bg-gray-900">All Tests</option>
                {testTypes.filter(t => t !== 'all').map(t => (
                  <option key={t} value={t} className="bg-gray-900">{t}</option>
                ))}
              </select>

              <button onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/30 hover:text-white/60 hover:bg-white/5 transition-all cursor-pointer border border-white/8">
                <Download size={12} /> Export
              </button>

              <span className="text-xs text-white/20">{filtered.length} results</span>
            </div>
          </Card>

          {/* Table */}
          <Card className="!p-0 overflow-hidden flex-1">
            {/* Header */}
            <div className="grid grid-cols-[1fr_1fr_0.8fr_0.6fr_0.6fr_0.5fr_2rem] gap-3 px-5 py-3 border-b border-white/5 bg-white/[0.02]">
              {[
                { key: 'id', label: 'Run ID' },
                { key: 'date', label: 'Date' },
                { key: 'product', label: 'Product' },
                { key: 'operator', label: 'Operator' },
                { key: 'duration', label: 'Duration' },
                { key: 'verdict', label: 'Verdict' },
              ].map(col => (
                <button key={col.key} onClick={() => handleSort(col.key)}
                  className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/50 transition-colors cursor-pointer text-left">
                  {col.label} <SortIcon col={col.key} />
                </button>
              ))}
              <div />
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/5">
              {filtered.map(run => {
                const isOpen = expanded === run.id
                const p = run.tests.filter(t => t.status === 'pass').length
                const f = run.tests.filter(t => t.status === 'fail').length
                const w = run.tests.filter(t => t.status === 'warning').length
                return (
                  <div key={run.id}>
                    <button onClick={() => setExpanded(isOpen ? null : run.id)}
                      className="w-full grid grid-cols-[1fr_1fr_0.8fr_0.6fr_0.6fr_0.5fr_2rem] gap-3 px-5 py-3 text-left hover:bg-white/[0.03] transition-colors cursor-pointer">
                      <span className="text-xs font-mono text-white/60">{run.id}</span>
                      <span className="text-xs text-white/40">{formatDate(run.date)} {formatTime(run.date)}</span>
                      <span className="text-xs text-white/50">{run.product}</span>
                      <span className="text-xs text-white/40">{run.operator}</span>
                      <span className="text-xs font-mono text-white/40">{run.duration}</span>
                      <span className={`text-xs font-semibold ${STATUS_TEXT_COLORS[run.verdict]}`}>
                        {run.verdict === 'pass' ? 'PASS' : run.verdict === 'fail' ? 'FAIL' : 'WARN'}
                      </span>
                      <ChevronDown size={12} className={`text-white/20 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Expanded detail */}
                    {isOpen && (
                      <div className="px-5 pb-4 pt-1">
                        {/* Verdict bar */}
                        <div className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 mb-4 ${STATUS_BORDER_BG_COLORS[run.verdict]}`}>
                          {run.verdict === 'pass' ? <CheckCircle2 size={16} className="text-emerald-400" />
                            : run.verdict === 'fail' ? <XCircle size={16} className="text-rose-400" />
                            : <AlertTriangle size={16} className="text-amber-400" />}
                          <span className={`text-xs font-semibold ${STATUS_TEXT_COLORS[run.verdict]}`}>
                            {run.verdict === 'pass' ? 'PASSED' : run.verdict === 'fail' ? 'FAILED' : 'WARNING'}
                          </span>
                          <span className="text-xs text-white/30 ml-auto">
                            {p} passed · {f} failed · {w} warnings
                          </span>
                        </div>

                        {/* Test table */}
                        <div className="bg-white/[0.02] rounded-xl overflow-hidden">
                          <div className="grid grid-cols-[1fr_0.5fr_0.6fr_0.6fr_0.4fr] gap-3 px-4 py-2 text-[0.65rem] text-white/20 border-b border-white/5">
                            <span>Test</span><span>Status</span><span>Value</span><span>Threshold</span><span>Time</span>
                          </div>
                          {run.tests.map((t, i) => (
                            <div key={i} className="grid grid-cols-[1fr_0.5fr_0.6fr_0.6fr_0.4fr] gap-3 px-4 py-2 text-xs border-b border-white/[0.03] last:border-0">
                              <span className="text-white/60">{t.name}</span>
                              <span className="flex items-center gap-1.5">
                                {t.status === 'pass' ? <Check size={10} className="text-emerald-400" />
                                  : t.status === 'fail' ? <X size={10} className="text-rose-400" />
                                  : <AlertTriangle size={10} className="text-amber-400" />}
                                <span className={STATUS_TEXT_COLORS[t.status]}>{t.status.toUpperCase()}</span>
                              </span>
                              <span className={`font-mono ${t.status === 'fail' ? 'text-rose-400/70' : 'text-white/40'}`}>{t.value}</span>
                              <span className="font-mono text-white/20">{t.threshold}</span>
                              <span className="font-mono text-white/25">{t.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {filtered.length === 0 && (
                <EmptyState icon={Search} title="No results found" description="No results match your current filters" />
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar — failure breakdown */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card className="flex-1">
            <h4 className="text-xs font-semibold text-white/40 mb-4 flex items-center gap-2">
              <Filter size={12} /> Failure Breakdown
            </h4>
            {failureCounts.length === 0 ? (
              <p className="text-xs text-white/20 text-center py-8">No failures recorded</p>
            ) : (
              <div className="space-y-3">
                {failureCounts.map(([name, count]) => (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-white/50 truncate">{name}</span>
                      <span className="text-xs font-mono text-rose-400">{count}</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-rose-500/60 rounded-full transition-all duration-500"
                        style={{ width: `${(count / maxFail) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h4 className="text-xs font-semibold text-white/40 mb-4 flex items-center gap-2">
              <BarChart3 size={12} /> Pass / Fail Distribution
            </h4>
            <div className="flex items-end gap-1 h-24">
              {runs.slice().reverse().map(r => {
                const v = r.verdict ?? getVerdict(r.tests)
                return (
                  <div key={r.id} className="flex-1 flex flex-col justify-end h-full group relative">
                    <div className={`w-full rounded-sm transition-all ${
                      v === 'pass' ? 'bg-emerald-500/40 group-hover:bg-emerald-500/60'
                        : v === 'fail' ? 'bg-rose-500/40 group-hover:bg-rose-500/60'
                        : 'bg-amber-500/40 group-hover:bg-amber-500/60'
                    }`} style={{ height: `${60 + Math.random() * 40}%` }} />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 border border-white/10 rounded px-2 py-1 text-[0.6rem] text-white/60 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {r.id.slice(-3)}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-3">
              <span className="flex items-center gap-1.5 text-[0.65rem] text-white/30">
                <span className="w-2 h-2 rounded-sm bg-emerald-500/50" /> Pass
              </span>
              <span className="flex items-center gap-1.5 text-[0.65rem] text-white/30">
                <span className="w-2 h-2 rounded-sm bg-amber-500/50" /> Warn
              </span>
              <span className="flex items-center gap-1.5 text-[0.65rem] text-white/30">
                <span className="w-2 h-2 rounded-sm bg-rose-500/50" /> Fail
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
