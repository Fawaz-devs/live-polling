"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { io } from "socket.io-client"

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [connectionError, setConnectionError] = useState(null)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)

  useEffect(() => {
    const backendUrl = window.location.origin
    const newSocket = io(backendUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: 5,
      timeout: 20000,
    })

    newSocket.on("connect", () => {
      console.log("Connected to server")
      setConnected(true)
      setConnectionError(null)
      setReconnectAttempts(0)
    })

    newSocket.on("disconnect", (reason) => {
      console.log("Disconnected from server:", reason)
      setConnected(false)

      if (reason === "io server disconnect") {
        setConnectionError("Server disconnected the connection")
      } else if (reason === "transport close") {
        setConnectionError("Connection lost")
      }
    })

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("Reconnected after", attemptNumber, "attempts")
      setConnectionError(null)
      setReconnectAttempts(0)
    })

    newSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log("Reconnection attempt", attemptNumber)
      setReconnectAttempts(attemptNumber)
      setConnectionError(`Reconnecting... (attempt ${attemptNumber})`)
    })

    newSocket.on("reconnect_error", (error) => {
      console.log("Reconnection failed:", error)
      setConnectionError("Failed to reconnect")
    })

    newSocket.on("reconnect_failed", () => {
      console.log("Reconnection failed after maximum attempts")
      setConnectionError("Unable to connect to server. Please refresh the page.")
    })

    newSocket.on("connect_error", (error) => {
      console.log("Connection error:", error)
      setConnectionError("Failed to connect to server")
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const value = {
    socket,
    connected,
    connectionError,
    reconnectAttempts,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
