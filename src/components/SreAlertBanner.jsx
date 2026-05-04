import { Bell } from 'lucide-react'

export default function SreAlertBanner({ children }) {
  return (
    <div className="border-l-4 border-amber-400 pl-3 -ml-1">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Bell className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-xs font-semibold text-amber-300 uppercase tracking-wide">
          Background Alert
        </span>
      </div>
      {children}
    </div>
  )
}
