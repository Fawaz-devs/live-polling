"use client"

import { useState } from "react"
import LoadingSpinner from "./LoadingSpinner"

const CreatePollForm = ({ onCreatePoll, disabled, connected }) => {
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [timeLimit, setTimeLimit] = useState(60)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""])
    }
  }

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!question.trim()) {
      setError("Question is required")
      return
    }

    const validOptions = options.filter((opt) => opt.trim())
    if (validOptions.length < 2) {
      setError("At least 2 options are required")
      return
    }

    if (timeLimit < 10 || timeLimit > 300) {
      setError("Time limit must be between 10 and 300 seconds")
      return
    }

    setLoading(true)

    try {
      const result = await onCreatePoll({
        question: question.trim(),
        options: validOptions.map((opt) => opt.trim()),
        timeLimit,
      })

      if (result.success) {
        setQuestion("")
        setOptions(["", ""])
        setTimeLimit(60)
      } else {
        setError(result.error || "Failed to create poll")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const timeLimitOptions = [
    { value: 30, label: "30 seconds" },
    { value: 60, label: "1 minute" },
    { value: 90, label: "1.5 minutes" },
    { value: 120, label: "2 minutes" },
    { value: 180, label: "3 minutes" },
    { value: 300, label: "5 minutes" },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F5F5F5" }}>
      <div className="max-w-2xl w-full mx-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="mb-6">
              <span
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: "#7B60DA" }}
              >
                ⚡ Intervue Poll
              </span>
            </div>
            <h2 className="text-3xl font-bold text-black mb-4">Create New Poll</h2>
            <p className="text-gray-500 text-lg">
              Create engaging polls for your students with customizable time limits and multiple choice options
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl">{error}</div>}

            {/* Question Input */}
            <div>
              <label htmlFor="question" className="block text-lg font-medium text-black mb-4">
                Enter your question
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What is the capital of France?"
                className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-100 text-black text-lg resize-none"
                rows={3}
                disabled={disabled || loading}
                maxLength={200}
              />
              <div className="text-right mt-2">
                <span className="text-sm text-gray-500">{question.length}/200</span>
              </div>
            </div>

            {/* Time Limit Configuration */}
            <div>
              <label className="block text-lg font-medium text-black mb-4">Poll Duration</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {timeLimitOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTimeLimit(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      timeLimit === option.value
                        ? "text-white shadow-lg"
                        : "border-gray-200 hover:border-purple-300 bg-white text-black"
                    }`}
                    style={{
                      backgroundColor: timeLimit === option.value ? "#7B60DA" : "white",
                      borderColor: timeLimit === option.value ? "#7B60DA" : "#E5E7EB",
                    }}
                    disabled={disabled || loading}
                  >
                    <div className="text-center">
                      <div className="font-medium">{option.label}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">Custom:</label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number.parseInt(e.target.value) || 60)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-20 text-center"
                    disabled={disabled || loading}
                  />
                  <span className="text-sm text-gray-500">seconds (10-300)</span>
                </div>
              </div>
            </div>

            {/* Options */}
            <div>
              <label className="block text-lg font-medium text-black mb-4">Answer Options</label>
              <div className="space-y-4">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: "#7B60DA" }}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-100 text-black"
                      disabled={disabled || loading}
                      maxLength={100}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        disabled={disabled || loading}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {options.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="mt-4 px-4 py-2 text-purple-600 border border-purple-300 rounded-xl hover:bg-purple-50 transition-colors flex items-center space-x-2"
                  disabled={disabled || loading}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Option</span>
                </button>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={disabled || loading}
                className={`w-full px-8 py-4 rounded-2xl font-medium text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                  disabled || loading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "text-white shadow-lg hover:shadow-xl"
                }`}
                style={{
                  backgroundColor: disabled || loading ? "#E5E5E5" : "#7B60DA",
                }}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Creating Poll...</span>
                  </>
                ) : (
                  <span>Create Poll</span>
                )}
              </button>

              {disabled && !loading && (
                <p className="text-sm text-gray-500 text-center mt-3">
                  {!connected ? "Disconnected from server" : "Wait for current poll to finish"}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreatePollForm
