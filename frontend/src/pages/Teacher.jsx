"use client"

import { useState, useEffect } from "react"
import { useSocket } from "../contexts/SocketContext"
import ConnectionStatus from "../components/ConnectionStatus"
import CreatePollForm from "../components/CreatePollForm"
import PollResults from "../components/PollResults"
import PollHistory from "../components/PollHistory"
import StudentList from "../components/StudentList"
import ChatPopup from "../components/ChatPopup"

const Teacher = () => {
  const { socket, connected } = useSocket()
  const [currentPoll, setCurrentPoll] = useState(null)
  const [pollResults, setPollResults] = useState(null)
  const [studentsCount, setStudentsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [showStudents, setShowStudents] = useState(false)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    if (!socket) return

    // Join as teacher
    socket.emit("teacher:join")

    // Listen for poll updates
    socket.on("poll:current", (data) => {
      setCurrentPoll(data.poll)
      setPollResults(data.results)
      setStudentsCount(data.studentsCount || 0)
      setLoading(false)
    })

    socket.on("poll:new", (poll) => {
      setCurrentPoll(poll)
      setPollResults(null)
    })

    socket.on("poll:results", (results) => {
      setPollResults(results)
    })

    socket.on("poll:ended", (results) => {
      setPollResults(results)
    })

    socket.on("students:count", (count) => {
      setStudentsCount(count)
    })

    return () => {
      socket.off("poll:current")
      socket.off("poll:new")
      socket.off("poll:results")
      socket.off("poll:ended")
      socket.off("students:count")
    }
  }, [socket])

  const handleCreatePoll = async (pollData) => {
    try {
      const response = await fetch("/api/poll/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pollData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create poll")
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const handleEndPoll = async () => {
    try {
      const response = await fetch("/api/poll/end", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Failed to end poll")
      }
    } catch (error) {
      console.error("Failed to end poll:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F5F5F5" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to server...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F5F5" }}>
      <ConnectionStatus />

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-4">
                <span
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: "#7B60DA" }}
                >
                  ⚡ Intervue Poll
                </span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
                  <span>{connected ? "Connected" : "Disconnected"}</span>
                </div>
                <button
                  onClick={() => setShowStudents(true)}
                  className="flex items-center space-x-2 hover:text-purple-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                  <span>{studentsCount} students connected</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowChat(true)}
                className="px-4 py-2 text-purple-600 border border-purple-300 rounded-xl hover:bg-purple-50 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span>Chat</span>
              </button>

              <button
                onClick={() => setShowHistory(true)}
                className="px-4 py-2 text-purple-600 border border-purple-300 rounded-xl hover:bg-purple-50 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Poll History</span>
              </button>

              {currentPoll && !pollResults && (
                <button
                  onClick={handleEndPoll}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                    />
                  </svg>
                  <span>End Poll</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Poll Section */}
          <div className="space-y-6">
            <CreatePollForm
              onCreatePoll={handleCreatePoll}
              disabled={!connected || (currentPoll && !pollResults)}
              connected={connected}
            />
          </div>

          {/* Results Section */}
          <div>
            {pollResults ? (
              <PollResults results={pollResults} />
            ) : currentPoll ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-xl font-semibold text-black mb-6">Waiting for Responses</h3>
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 mb-2">Students are answering the poll...</p>
                  <p className="text-sm text-gray-500">
                    Poll will end automatically after the time limit or when all students answer
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="text-center py-12">
                  <div className="mb-6">
                    <span
                      className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: "#7B60DA" }}
                    >
                      ⚡ Intervue Poll
                    </span>
                  </div>
                  <div className="w-16 h-16 mx-auto mb-6">
                    <div
                      className="w-full h-full border-4 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: "#7B60DA", borderTopColor: "transparent" }}
                    ></div>
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-2">Ready to create your first poll</h3>
                  <p className="text-gray-500">Fill out the form on the left to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <PollHistory visible={showHistory} onClose={() => setShowHistory(false)} />
      <StudentList visible={showStudents} onClose={() => setShowStudents(false)} />
      {showChat && <ChatPopup onClose={() => setShowChat(false)} userType="teacher" userName="Teacher" />}
    </div>
  )
}

export default Teacher
