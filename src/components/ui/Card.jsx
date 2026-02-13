export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg shadow-black/20 p-5 transition-all duration-200 hover:bg-white/[0.07] hover:border-white/15 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
