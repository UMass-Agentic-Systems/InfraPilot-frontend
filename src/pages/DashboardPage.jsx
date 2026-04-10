import { useParams } from 'react-router-dom'
import ChatWindow from '../components/ChatWindow'

export default function DashboardPage() {
  const { appId } = useParams()

  if (!appId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500 text-sm">Select or create an app to get started.</p>
      </div>
    )
  }

  return <ChatWindow />
}
