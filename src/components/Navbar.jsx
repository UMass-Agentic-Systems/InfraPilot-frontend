import { Link } from 'react-router-dom'
import { Cloud } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cloud className="w-6 h-6 text-brand-400" />
          <span className="text-lg font-semibold text-gray-100">InfraPilot</span>
        </div>
        <Link
          to="/signin"
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Sign In
        </Link>
      </div>
    </nav>
  )
}
