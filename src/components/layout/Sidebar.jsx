import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import navItems from '../../data/navItems'
import siriusLogo from '../../assets/sirius-logo.png'

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo hero section */}
        <div className="relative px-5 pt-5 pb-5 border-b border-white/10 overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-24 h-24 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 lg:hidden p-1 rounded-lg hover:bg-white/10 transition-colors z-10"
          >
            <X size={18} className="text-white/60" />
          </button>

          {/* Logo + text */}
          <div className="relative flex flex-col items-center text-center">
            <div className="relative -mb-1">
              <img src={siriusLogo} alt="Sirius Watch" className="w-[4.5rem] h-[4.5rem] object-contain drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
            </div>
            <h1 className="text-xl font-bold tracking-widest text-white uppercase">
              Sirius
            </h1>
            <span className="text-[0.65rem] font-medium tracking-[0.35em] text-blue-400/80 uppercase mt-0.5">
              Watch
            </span>
            <span className="text-[0.55rem] text-white/30 tracking-wider mt-1.5">
              Quality Control System
            </span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                    : 'text-white/60 hover:text-white/80 hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <item.icon size={18} className="shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom status */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
            <span className="text-xs text-white/40">Robot Connected</span>
          </div>
        </div>
      </aside>
    </>
  )
}
