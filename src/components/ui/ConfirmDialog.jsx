import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ open, onConfirm, onCancel, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false }) {
  useEffect(() => {
    if (!open) return
    const handleEsc = (e) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-gray-950/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-6 max-w-md w-full mx-4">
        {danger && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 w-fit">
            <AlertTriangle size={20} className="text-rose-400" />
          </div>
        )}
        <h3 className="text-lg font-semibold text-white/90 mb-2">{title}</h3>
        <p className="text-sm text-white/50 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel}
            className="px-4 py-2 rounded-full text-sm font-medium bg-white/10 text-white/60 border border-white/10 hover:bg-white/15 transition-all cursor-pointer">
            {cancelLabel}
          </button>
          <button onClick={onConfirm}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
              danger
                ? 'bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30'
                : 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30'
            }`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
