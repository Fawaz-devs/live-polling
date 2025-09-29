import { useSocket } from "../contexts/SocketContext"

const ConnectionStatus = () => {
  const { connected, connectionError, reconnectAttempts } = useSocket()

  if (connected) return null

  const getStatusMessage = () => {
    if (reconnectAttempts > 0) {
      return `Reconnecting... (attempt ${reconnectAttempts})`
    }
    if (connectionError) {
      return connectionError
    }
    return "Disconnected"
  }

  const getStatusColor = () => {
    if (reconnectAttempts > 0) {
      return "warning"
    }
    return "danger"
  }

  const statusColor = getStatusColor()

  return (
    <div
      className={`fixed top-4 right-4 bg-${statusColor}-100 border border-${statusColor}-200 text-${statusColor}-800 px-4 py-2 rounded-lg shadow-sm z-50`}
    >
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 bg-${statusColor}-500 rounded-full ${reconnectAttempts > 0 ? "animate-pulse" : ""}`} />
        <span className="text-sm font-medium">{getStatusMessage()}</span>
      </div>
    </div>
  )
}

export default ConnectionStatus
