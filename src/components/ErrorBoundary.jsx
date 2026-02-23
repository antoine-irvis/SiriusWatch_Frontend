import { Component } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[calc(100vh-7rem)] flex flex-col items-center justify-center gap-4 text-center px-6">
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <AlertTriangle size={32} className="text-rose-400" />
          </div>
          <h2 className="text-xl font-semibold text-white/80">Something went wrong</h2>
          <p className="text-sm text-white/40 max-w-md">
            An unexpected error occurred. Try refreshing the page or click the button below.
          </p>
          <button onClick={this.handleRetry}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-400 text-sm font-medium hover:bg-blue-500/25 transition-all cursor-pointer">
            <RotateCcw size={14} /> Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
