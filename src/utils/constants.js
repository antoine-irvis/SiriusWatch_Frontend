// ── Status color maps ──
export const STATUS_TEXT_COLORS = {
  pass: 'text-emerald-400',
  fail: 'text-rose-400',
  warning: 'text-amber-400',
}

export const STATUS_BG_COLORS = {
  pass: 'bg-emerald-500',
  fail: 'bg-rose-500',
  warning: 'bg-amber-500',
}

export const STATUS_BORDER_BG_COLORS = {
  pass: 'bg-emerald-500/10 border-emerald-500/20',
  fail: 'bg-rose-500/10 border-rose-500/20',
  warning: 'bg-amber-500/10 border-amber-500/20',
}

export const STATUS_DOT_COLORS = {
  pass: 'bg-emerald-400 shadow-emerald-400/50',
  fail: 'bg-rose-400 shadow-rose-400/50',
  warning: 'bg-amber-400 shadow-amber-400/50',
}

export const STATUS_RING_COLORS = {
  pass: 'border-emerald-400/30',
  fail: 'border-rose-400/30',
  warning: 'border-amber-400/30',
}

export const PRIORITY_COLORS = {
  high: 'bg-rose-400',
  medium: 'bg-amber-400',
  low: 'bg-blue-400',
}

// ── Timing constants ──
export const TEST_DELAY_BASE_MS = 1800
export const TEST_DELAY_RANGE_MS = 1200
export const SAVE_FEEDBACK_MS = 2000
export const STALE_CALIBRATION_DAYS = 30
