"use client"

import { useState, useEffect } from "react"

const PollAnswer = ({ poll, onAnswer, disabled }) => {
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [timeLeft, setTimeLeft] = useState(60)

  useEffect(() => {
    if (!poll) return

    const startTime = new Date(poll.createdAt).getTime()
    const timeLimit = poll.timeLimit || 60000
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, Math.ceil((timeLimit - elapsed) / 1000))

    setTimeLeft(remaining)

    const timer = setInterval(() => {
      const newElapsed = Date.now() - startTime
      const newRemaining = Math.max(0, Math.ceil((timeLimit - newElapsed) / 1000))
      setTimeLeft(newRemaining)

      if (newRemaining === 0) {
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [poll])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedAnswer && !disabled) {
      onAnswer(selectedAnswer)
    }
  }

  const handleOptionSelect = (option) => {
    if (!disabled && timeLeft > 0) {
      setSelectedAnswer(option)
    }
  }

  if (!poll) return null

  const isTimeUp = timeLeft === 0
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-black">Question</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-red-500 font-medium">⏱</span>
            <span className={`text-sm font-medium ${timeLeft <= 10 ? "text-red-500" : "text-gray-600"}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="bg-gray-800 text-white px-6 py-4 rounded-t-2xl">
          <p className="font-medium text-lg">{poll.question}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          {poll.options.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleOptionSelect(option)}
              className={`w-full p-4 text-left border-2 rounded-xl transition-all duration-200 flex items-center space-x-4 ${
                selectedAnswer === option
                  ? "text-white shadow-lg"
                  : "border-gray-200 hover:border-purple-300 bg-white text-black"
              } ${disabled || isTimeUp ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              style={{
                backgroundColor: selectedAnswer === option ? "#7B60DA" : "white",
                borderColor: selectedAnswer === option ? "#7B60DA" : "#E5E7EB",
              }}
              disabled={disabled || isTimeUp}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedAnswer === option ? "border-white bg-white" : "border-gray-400 bg-transparent"
                }`}
              >
                {selectedAnswer === option && (
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#7B60DA" }} />
                )}
              </div>
              <span className="font-medium text-lg">{option}</span>
            </button>
          ))}
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={!selectedAnswer || disabled || isTimeUp}
            className={`w-full px-8 py-4 rounded-2xl font-medium text-lg transition-all duration-200 ${
              !selectedAnswer || disabled || isTimeUp
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "text-white shadow-lg hover:shadow-xl"
            }`}
            style={{
              backgroundColor: !selectedAnswer || disabled || isTimeUp ? "#E5E5E5" : "#7B60DA",
            }}
          >
            {isTimeUp ? "Time's Up!" : "Submit Answer"}
          </button>
        </div>

        {disabled && !isTimeUp && <p className="text-sm text-gray-500 text-center">Disconnected from server</p>}
      </form>
    </div>
  )
}

export default PollAnswer
