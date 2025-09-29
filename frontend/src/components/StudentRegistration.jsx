"use client"

import { useState } from "react"
import LoadingSpinner from "./LoadingSpinner"

const StudentRegistration = ({ onRegister, loading, error, connected }) => {
  const [name, setName] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim()) {
      return
    }

    await onRegister(name.trim())
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F5F5F5" }}>
      <div className="max-w-lg w-full mx-4">
        <div className="text-center">
          <div className="mb-8">
            <span
              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: "#7B60DA" }}
            >
              ⚡ Intervue Poll
            </span>
          </div>

          <h1 className="text-4xl font-bold text-black mb-6">Let's Get Started</h1>
          <p className="text-gray-500 mb-12 text-lg">
            If you're a student, you'll be able to <span className="font-semibold text-black">submit your answers</span>
            , participate in live polls, and see how your responses compare with your classmates
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl mb-6">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label htmlFor="name" className="block text-lg font-medium text-black mb-4 text-left">
                Enter your Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rahul Bajaj"
                className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-100 text-black text-lg"
                disabled={loading || !connected}
                maxLength={50}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !connected || !name.trim()}
              className={`w-full px-12 py-4 rounded-2xl font-medium text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                loading || !connected || !name.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "text-white shadow-lg hover:shadow-xl"
              }`}
              style={{
                backgroundColor: loading || !connected || !name.trim() ? "#E5E5E5" : "#7B60DA",
              }}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Joining...</span>
                </>
              ) : (
                <span>Continue</span>
              )}
            </button>

            {!connected && <p className="text-sm text-red-600 text-center">Disconnected from server. Please wait...</p>}
          </form>
        </div>
      </div>
    </div>
  )
}

export default StudentRegistration
