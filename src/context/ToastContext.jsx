import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { X, Check, AlertTriangle, Info, XCircle } from 'lucide-react'

const ToastContext = createContext(null)

const TOAST_STYLES = {
  success: 'border-emerald-500/30 bg-emerald-500/10',
  error: 'border-rose-500/30 bg-rose-500/10',
  warning: 'border-amber-500/30 bg-amber-500/10',
  info: 'border-blue-500/30 bg-blue-500/10',
}

const TOAST_ICON_COLORS = {
  success: 'text-emerald-400',
  error: 'text-rose-400',
  warning: 'text-amber-400',
  info: 'text-blue-400',
}

const TOAST_ICONS = {
  success: Check,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((message, type = 'info') => {
    const id = ++idRef.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), 4000)
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast stack */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2 pointer-events-none">
        {toasts.map(toast => {
          const Icon = TOAST_ICONS[toast.type]
          return (
            <div key={toast.id}
              className={`pointer-events-auto flex items-center gap-3 min-w-[300px] max-w-[400px] px-4 py-3 rounded-xl border bg-gray-950/95 backdrop-blur-xl shadow-2xl shadow-black/50 animate-slide-in ${TOAST_STYLES[toast.type]}`}>
              <Icon size={16} className={TOAST_ICON_COLORS[toast.type]} />
              <p className="text-sm text-white/80 flex-1">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)}
                className="p-0.5 rounded-md text-white/20 hover:text-white/50 transition-colors cursor-pointer">
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
