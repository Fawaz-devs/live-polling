"use client"

import { useState, useEffect } from "react"

const PollHistory = ({ visible, onClose }) => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (visible) {
      fetchHistory()
    }
  }, [visible])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/poll/history")
      const data = await response.json()
      setHistory(data.history || [])
    } catch (error) {
      console.error("Failed to fetch poll history:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Poll History</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <p>No poll history available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((poll, index) => (
                <div key={poll.pollId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-gray-900 flex-1">{poll.question}</h3>
                    <div className="text-sm text-gray-600 ml-4">
                      {new Date(poll.createdAt).toLocaleDateString()} {new Date(poll.createdAt).toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      {poll.options.map((option, optIndex) => {
                        const count = poll.results[option] || 0
                        const percentage = poll.totalAnswers > 0 ? (count / poll.totalAnswers) * 100 : 0
                        const isHighest = count === Math.max(...Object.values(poll.results))

                        return (
                          <div key={optIndex} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>
                                {String.fromCharCode(65 + optIndex)}. {option}
                              </span>
                              <span>
                                {count} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${isHighest ? "bg-green-500" : "bg-blue-600"}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Total Responses: {poll.totalAnswers}</p>
                      <p>Connected Students: {poll.totalStudents}</p>
                      <p>
                        Response Rate:{" "}
                        {poll.totalStudents > 0 ? ((poll.totalAnswers / poll.totalStudents) * 100).toFixed(1) : 0}%
                      </p>
                      {poll.endedAt && <p>Ended: {new Date(poll.endedAt).toLocaleTimeString()}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PollHistory
