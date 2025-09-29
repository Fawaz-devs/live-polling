"use client"

import { useEffect } from "react"
import { useSocket } from "../contexts/SocketContext"

export const useSocketEvent = (event, handler, dependencies = []) => {
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    socket.on(event, handler)

    return () => {
      socket.off(event, handler)
    }
  }, [socket, event, handler, ...dependencies])
}

export const useSocketEmit = () => {
  const { socket, connected } = useSocket()

  const emit = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data)
      return true
    }
    return false
  }

  return { emit, connected }
}
