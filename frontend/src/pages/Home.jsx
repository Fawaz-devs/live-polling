"use client"

import { useState } from "react"
import { Link } from "react-router-dom"

const Home = () => {
  const [selectedRole, setSelectedRole] = useState("")

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F5F5F5" }}>
      <div className="max-w-2xl w-full mx-4">
        <div className="text-center">
          <div className="mb-8">
            <span
              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: "#7B60DA" }}
            >
              ⚡ Intervue Poll
            </span>
          </div>

          <h1 className="text-4xl font-bold text-black mb-4">Welcome to the Live Polling System</h1>
          <p className="text-gray-500 mb-12 text-lg">
            Please select the role that best describes you to begin using the live polling system
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div
              className={`border-2 rounded-2xl p-8 cursor-pointer transition-all duration-200 text-left ${
                selectedRole === "student" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => setSelectedRole("student")}
            >
              <h3 className="font-semibold text-black text-xl mb-3">I'm a Student</h3>
              <p className="text-gray-500 text-base">
                Lorem ipsum is simply dummy text of the printing and typesetting industry
              </p>
            </div>

            <div
              className={`border-2 rounded-2xl p-8 cursor-pointer transition-all duration-200 text-left ${
                selectedRole === "teacher" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => setSelectedRole("teacher")}
            >
              <h3 className="font-semibold text-black text-xl mb-3">I'm a Teacher</h3>
              <p className="text-gray-500 text-base">Submit answers and view live poll results in real-time</p>
            </div>
          </div>

          <div>
            <Link
              to={selectedRole === "student" ? "/student" : selectedRole === "teacher" ? "/teacher" : "#"}
              className={`inline-block px-12 py-4 rounded-2xl font-medium text-lg transition-all duration-200 ${
                selectedRole ? "text-white shadow-lg hover:shadow-xl" : "text-gray-400 cursor-not-allowed"
              }`}
              style={{
                backgroundColor: selectedRole ? "#7B60DA" : "#E5E5E5",
              }}
              onClick={(e) => {
                if (!selectedRole) e.preventDefault()
              }}
            >
              Continue
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
