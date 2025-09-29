"use client"

import { useState, useEffect } from "react"
import { useSocket } from "../contexts/SocketContext"
import ConnectionStatus from "../components/ConnectionStatus"
import StudentRegistration from "../components/StudentRegistration"
import PollAnswer from "../components/PollAnswer"
import PollResults from "../components/PollResults"
import LoadingSpinner from "../components/LoadingSpinner"
import ChatPopup from "../components/ChatPopup"

const Student = () => {
  const { socket, connected } = useSocket()
  const [studentData, setStudentData] = useState(null)
  const [currentPoll, setCurrentPoll] = useState(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [pollResults, setPollResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showChat, setShowChat] = useState(false)

  // Load student data from localStorage on mount
  useEffect(() => {
    const savedStudentData = localStorage.getItem("studentData")
    if (savedStudentData) {
      try {
        const data = JSON.parse(savedStudentData)
        setStudentData(data)
      } catch (err) {
        localStorage.removeItem("studentData")
      }
    }
  }, [])

  // Socket event listeners
  useEffect(() => {
    if (!socket || !studentData) return

    // Join as student
    socket.emit("student:join", {
      studentId: studentData.studentId,
      name: studentData.name,
    })

    // Listen for poll updates
    socket.on("poll:current", (data) => {
      setCurrentPoll(data.poll)
      setHasAnswered(data.hasAnswered || false)
      setLoading(false)
    })

    socket.on("poll:new", (poll) => {
      setCurrentPoll(poll)
      setHasAnswered(false)
      setPollResults(null)
      setError("")
    })

    socket.on("poll:results", (results) => {
      setPollResults(results)
    })

    socket.on("poll:ended", (results) => {
      setPollResults(results)
    })

    socket.on("answer:confirmed", () => {
      setHasAnswered(true)
      setError("")
    })

    socket.on("error", (data) => {
      setError(data.message)
    })

    socket.on("student:removed", (data) => {
      alert(data.message)
      handleLogout()
    })

    return () => {
      socket.off("poll:current")
      socket.off("poll:new")
      socket.off("poll:results")
      socket.off("poll:ended")
      socket.off("answer:confirmed")
      socket.off("error")
      socket.off("student:removed")
    }
  }, [socket, studentData])

  const handleRegister = async (name) => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/student/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to register")
      }

      const newStudentData = {
        studentId: result.studentId,
        name: result.name,
      }

      setStudentData(newStudentData)
      localStorage.setItem("studentData", JSON.stringify(newStudentData))

      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (answer) => {
    if (!socket || !studentData || !currentPoll || hasAnswered) return

    socket.emit("student:answer", {
      studentId: studentData.studentId,
      answer,
    })
  }

  const handleLogout = () => {
    localStorage.removeItem("studentData")
    setStudentData(null)
    setCurrentPoll(null)
    setHasAnswered(false)
    setPollResults(null)
    setError("")
  }

  // Show registration if no student data
  if (!studentData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <ConnectionStatus />
        <div className="card max-w-lg w-full">
          <StudentRegistration onRegister={handleRegister} loading={loading} error={error} connected={connected} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F5F5" }}>
      <ConnectionStatus />

      <div className="max-w-4xl mx-auto p-6">
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
            </div>
            <div className="text-right">
              <div className="text-sm text-[#A6A6A6]">Participants</div>
              <div className="flex items-center space-x-1">
                <div className="w-6 h-6 bg-[#7B60DA] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">2</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Poll Content - Left Side */}
          <div className="lg:col-span-2">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl mb-6">{error}</div>
            )}

            {currentPoll ? (
              <>
                {!hasAnswered && !pollResults ? (
                  <PollAnswer poll={currentPoll} onAnswer={handleAnswer} disabled={!connected} />
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-black mb-2">Answer Submitted!</h3>
                      <p className="text-gray-500">
                        {pollResults ? "Here are the results:" : "Waiting for other students to answer..."}
                      </p>
                    </div>

                    {!pollResults && (
                      <div className="text-center py-4">
                        <LoadingSpinner size="md" />
                        <p className="mt-2 text-sm text-gray-500">Results will appear when the poll ends</p>
                      </div>
                    )}
                  </div>
                )}

                {pollResults && <PollResults results={pollResults} />}
              </>
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
                  <h3 className="text-xl font-semibold text-black mb-2">Wait for the teacher to ask questions..</h3>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        style={{ backgroundColor: "#7B60DA" }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {showChat && (
        <ChatPopup onClose={() => setShowChat(false)} userType="student" userName={studentData?.name || "Student"} />
      )}
    </div>
  )
}

export default Student
