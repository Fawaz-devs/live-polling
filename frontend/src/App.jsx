import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Teacher from "./pages/Teacher"
import Student from "./pages/Student"
import { SocketProvider } from "./contexts/SocketContext"
import NetworkStatus from "./components/NetworkStatus"

function App() {
  return (
    <SocketProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/teacher" element={<Teacher />} />
          <Route path="/student" element={<Student />} />
        </Routes>
        <NetworkStatus />
      </div>
    </SocketProvider>
  )
}

export default App
