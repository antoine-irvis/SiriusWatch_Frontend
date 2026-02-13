import { finalVerdict } from '../../data/mockData'
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'

export default function FinalVerdictBar() {
  const isPassing = finalVerdict.status === 'pass'

  return (
    <div
      className={`sticky bottom-0 z-20 mt-4 mx-auto rounded-2xl border backdrop-blur-xl px-6 py-4 flex items-center gap-4 flex-wrap shadow-2xl transition-all duration-300 ${
        isPassing
          ? 'bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5'
          : 'bg-rose-500/10 border-rose-500/20 shadow-rose-500/5'
      }`}
    >
      {isPassing ? (
        <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
      ) : (
        <XCircle size={24} className="text-rose-400 shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${isPassing ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isPassing ? 'PASSED' : 'FAILED'} — Final Verdict
        </p>
        <p className="text-xs text-white/50 mt-0.5 truncate">{finalVerdict.message}</p>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={12} className="text-emerald-400" />
          <span className="text-white/60">{finalVerdict.passCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <XCircle size={12} className="text-rose-400" />
          <span className="text-white/60">{finalVerdict.failCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle size={12} className="text-amber-400" />
          <span className="text-white/60">{finalVerdict.warningCount}</span>
        </div>
      </div>
    </div>
  )
}
