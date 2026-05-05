import { Outlet, useNavigate } from 'react-router-dom'
import { Cloud, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import ToastNotification from '../components/ToastNotification'

export default function DashboardLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => {
    signOut()
    navigate('/')
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gray-950">
      <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2 text-gray-100">
          <Cloud className="w-6 h-6 text-brand-400" />
          <span className="font-semibold text-lg">InfraPilot</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-gray-300 truncate max-w-[12rem]">
            {user?.email}
          </span>
          <button
            onClick={handleSignOut}
            className="p-1.5 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-md transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>

      <ToastNotification />
    </div>
  )
}
