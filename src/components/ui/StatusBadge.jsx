const variants = {
  pass: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/20',
  fail: 'bg-rose-400/15 text-rose-400 border-rose-400/20',
  warning: 'bg-amber-400/15 text-amber-400 border-amber-400/20',
}

const labels = {
  pass: 'PASS',
  fail: 'FAIL',
  warning: 'WARN',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[status] || variants.pass}`}
    >
      {labels[status] || status}
    </span>
  )
}
