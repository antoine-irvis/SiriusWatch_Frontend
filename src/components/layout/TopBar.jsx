import { useLocation } from 'react-router-dom'
import { Menu, Bell, User } from 'lucide-react'
import navItems from '../../data/navItems'

export default function TopBar({ onMenuClick }) {
  const location = useLocation()
  const currentPage = navItems.find((item) => item.path === location.pathname)

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <Menu size={20} className="text-white/60" />
        </button>
        <div>
          <h2 className="text-xl font-semibold text-white/90">
            {currentPage?.label || 'Dashboard'}
          </h2>
          <p className="text-xs text-white/40">{currentPage?.description || ''}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-xl hover:bg-white/10 transition-colors relative">
          <Bell size={18} className="text-white/50" />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-400" />
        </button>
        <button className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
          <User size={14} className="text-white" />
        </button>
      </div>
    </header>
  )
}
