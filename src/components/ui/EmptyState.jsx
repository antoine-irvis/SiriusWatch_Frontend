export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      {Icon && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
          <Icon size={24} className="text-white/25" />
        </div>
      )}
      <h4 className="text-sm font-semibold text-white/50 mb-1">{title}</h4>
      {description && <p className="text-xs text-white/30 max-w-xs">{description}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction}
          className="mt-4 px-4 py-2 rounded-full text-xs font-medium bg-blue-500/15 border border-blue-500/25 text-blue-400 hover:bg-blue-500/25 transition-all cursor-pointer">
          {actionLabel}
        </button>
      )}
    </div>
  )
}
