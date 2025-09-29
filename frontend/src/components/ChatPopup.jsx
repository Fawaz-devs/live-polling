"use client"

import { useState, useEffect, useRef } from "react"
import { useSocket } from "../contexts/SocketContext"

const ChatPopup = ({ onClose, userType = "student", userName = "Anonymous" }) => {
  const { socket, connected } = useSocket()
  const [activeTab, setActiveTab] = useState("chat")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [participants, setParticipants] = useState([])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!socket) return

    // Listen for chat messages
    socket.on("chat:message", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          ...data,
          timestamp: new Date().toISOString(),
        },
      ])
    })

    // Listen for participant updates
    socket.on("chat:participants", (data) => {
      setParticipants(data.participants || [])
    })

    // Request current chat state
    socket.emit("chat:join", { userType, userName })

    return () => {
      socket.off("chat:message")
      socket.off("chat:participants")
    }
  }, [socket, userType, userName])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (message.trim() && socket && connected) {
      socket.emit("chat:send", {
        message: message.trim(),
        userType,
        userName,
      })
      setMessage("")
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab("chat")}
              className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                activeTab === "chat" ? "text-purple-600 border-purple-600" : "text-gray-500 border-transparent"
              }`}
            >
              Chat ({messages.length})
            </button>
            <button
              onClick={() => setActiveTab("participants")}
              className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                activeTab === "participants" ? "text-purple-600 border-purple-600" : "text-gray-500 border-transparent"
              }`}
            >
              Participants ({participants.length})
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "chat" ? (
            <div className="flex flex-col h-full">
              {/* Messages */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-96">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.userType === userType && msg.userName === userName ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          msg.userType === userType && msg.userName === userName
                            ? "text-white"
                            : "bg-gray-100 text-black"
                        }`}
                        style={{
                          backgroundColor:
                            msg.userType === userType && msg.userName === userName ? "#7B60DA" : undefined,
                        }}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-medium">
                            {msg.userType === "teacher" ? "👨‍🏫" : "👨‍🎓"} {msg.userName}
                          </span>
                          <span className="text-xs opacity-75">{formatTime(msg.timestamp)}</span>
                        </div>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex space-x-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={!connected}
                    maxLength={500}
                  />
                  <button
                    type="submit"
                    disabled={!message.trim() || !connected}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      !message.trim() || !connected
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "text-white hover:opacity-90"
                    }`}
                    style={{
                      backgroundColor: !message.trim() || !connected ? undefined : "#7B60DA",
                    }}
                  >
                    Send
                  </button>
                </form>
                {!connected && <p className="text-xs text-red-500 mt-2">Disconnected from server</p>}
              </div>
            </div>
          ) : (
            <div className="p-6">
              {participants.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500">No participants online</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {participants.map((participant, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: "#7B60DA" }}
                      >
                        {participant.userType === "teacher" ? "👨‍🏫" : "👨‍🎓"}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-black">{participant.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{participant.userType}</div>
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full ${participant.connected ? "bg-green-500" : "bg-gray-400"}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatPopup
