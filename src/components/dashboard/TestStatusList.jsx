import Card from '../ui/Card'
import TestStatusPanel from './TestStatusPanel'
import { testResults } from '../../data/mockData'
import { ClipboardCheck } from 'lucide-react'

export default function TestStatusList() {
  const passCount = testResults.filter((t) => t.status === 'pass').length
  const total = testResults.length

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <ClipboardCheck size={16} className="text-blue-400" />
        <h3 className="text-sm font-semibold text-white/80">Test Results</h3>
        <span className="ml-auto text-xs text-white/40">
          {passCount}/{total} passed
        </span>
      </div>

      <div className="space-y-0.5">
        {testResults.map((test) => (
          <TestStatusPanel key={test.id} test={test} />
        ))}
      </div>
    </Card>
  )
}
