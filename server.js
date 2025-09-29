const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const cors = require("cors")
const path = require("path")

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"],
  },
})

// Middleware
app.use(cors())
app.use(express.json())

app.use(express.static(path.join(process.cwd(), "./dist")))

// In-memory data structures
let currentPoll = null
const students = new Map() // studentId -> { name, socketId, hasAnswered }
const answers = new Map() // studentId -> answer
const pollHistory = [] // Array of completed polls
let pollTimeout = null
const chatMessages = [] // Array of chat messages
const chatParticipants = new Map() // socketId -> { userType, userName, connected }

// REST API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

app.get("/api/poll/current", (req, res) => {
  res.json({
    poll: currentPoll,
    studentsCount: students.size,
    answersCount: answers.size,
  })
})

app.post("/api/poll/create", (req, res) => {
  const { question, options, timeLimit } = req.body

  if (!question || !options || options.length < 2) {
    return res.status(400).json({ error: "Question and at least 2 options required" })
  }

  if (options.length > 6) {
    return res.status(400).json({ error: "Maximum 6 options allowed" })
  }

  // Check if poll can be created
  if (currentPoll && answers.size < students.size && students.size > 0) {
    return res.status(400).json({ error: "Cannot create poll while students are still answering" })
  }

  // Save previous poll to history if it exists
  if (currentPoll) {
    const previousResults = getPollResults()
    if (previousResults) {
      pollHistory.push({
        ...previousResults,
        endedAt: new Date().toISOString(),
      })
    }
  }

  // Clear previous poll data
  answers.clear()
  students.forEach((student) => (student.hasAnswered = false))

  // Create new poll
  const pollTimeLimit = timeLimit && timeLimit >= 10 && timeLimit <= 300 ? timeLimit * 1000 : 60000
  currentPoll = {
    id: Date.now(),
    question: question.trim(),
    options: options.map((opt) => opt.trim()).filter((opt) => opt.length > 0),
    createdAt: new Date().toISOString(),
    timeLimit: pollTimeLimit,
  }

  // Set timeout for poll
  if (pollTimeout) clearTimeout(pollTimeout)
  pollTimeout = setTimeout(() => {
    endPoll()
  }, currentPoll.timeLimit)

  // Broadcast new poll to all clients
  io.emit("poll:new", currentPoll)

  res.json({ success: true, poll: currentPoll })
})

app.post("/api/student/register", (req, res) => {
  const { name } = req.body

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: "Name is required" })
  }

  const studentId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  res.json({
    success: true,
    studentId,
    name: name.trim(),
  })
})

app.get("/api/poll/history", (req, res) => {
  res.json({
    history: pollHistory.slice(-10), // Last 10 polls
    currentPoll: currentPoll ? getPollResults() : null,
  })
})

app.post("/api/poll/end", (req, res) => {
  if (!currentPoll) {
    return res.status(400).json({ error: "No active poll to end" })
  }

  endPoll()
  res.json({ success: true, message: "Poll ended successfully" })
})

app.get("/api/students", (req, res) => {
  const studentsList = Array.from(students.entries()).map(([id, data]) => ({
    id,
    name: data.name,
    hasAnswered: data.hasAnswered,
    connected: true,
  }))

  res.json({
    students: studentsList,
    count: students.size,
  })
})

app.post("/api/student/:studentId/remove", (req, res) => {
  const { studentId } = req.params

  if (!students.has(studentId)) {
    return res.status(404).json({ error: "Student not found" })
  }

  const student = students.get(studentId)

  // Find the student's socket and disconnect them
  const studentSocket = Array.from(io.sockets.sockets.values()).find((socket) => socket.studentId === studentId)

  if (studentSocket) {
    studentSocket.emit("student:removed", { message: "You have been removed from the session" })
    studentSocket.disconnect(true)
  }

  // Remove student from data structures
  students.delete(studentId)
  answers.delete(studentId)

  // Broadcast updated student count
  io.emit("students:count", students.size)

  console.log(`Student ${student.name} (${studentId}) was removed by teacher`)

  res.json({
    success: true,
    message: "Student removed successfully",
    studentName: student.name,
  })
})

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id)

  socket.on("student:join", (data) => {
    const { studentId, name } = data
    students.set(studentId, {
      name,
      socketId: socket.id,
      hasAnswered: currentPoll ? answers.has(studentId) : false,
    })

    socket.studentId = studentId

    // Send current poll state to the new student
    socket.emit("poll:current", {
      poll: currentPoll,
      hasAnswered: answers.has(studentId),
    })

    // Broadcast updated student count
    io.emit("students:count", students.size)

    console.log(`Student ${name} joined with ID: ${studentId}`)
  })

  socket.on("teacher:join", () => {
    socket.isTeacher = true

    // Send current state to teacher
    socket.emit("poll:current", {
      poll: currentPoll,
      results: getPollResults(),
      studentsCount: students.size,
    })

    console.log("Teacher joined")
  })

  socket.on("student:answer", (data) => {
    const { studentId, answer } = data

    if (!currentPoll) {
      socket.emit("error", { message: "No active poll" })
      return
    }

    if (answers.has(studentId)) {
      socket.emit("error", { message: "Already answered" })
      return
    }

    if (!currentPoll.options.includes(answer)) {
      socket.emit("error", { message: "Invalid answer" })
      return
    }

    // Record the answer
    answers.set(studentId, answer)

    // Update student status
    if (students.has(studentId)) {
      students.get(studentId).hasAnswered = true
    }

    // Send confirmation to student
    socket.emit("answer:confirmed", { answer })

    // Broadcast updated results to all clients
    const results = getPollResults()
    io.emit("poll:results", results)

    // Check if all students have answered
    if (answers.size === students.size && students.size > 0) {
      endPoll()
    }

    console.log(`Student ${studentId} answered: ${answer}`)
  })

  socket.on("chat:join", (data) => {
    const { userType, userName } = data
    chatParticipants.set(socket.id, {
      userType,
      userName,
      connected: true,
    })

    // Send current chat messages to the new participant
    socket.emit("chat:messages", { messages: chatMessages.slice(-50) }) // Last 50 messages

    // Send updated participants list to all clients
    broadcastParticipants()

    console.log(`${userType} ${userName} joined chat`)
  })

  socket.on("chat:send", (data) => {
    const { message, userType, userName } = data

    if (!message || message.trim().length === 0) {
      return
    }

    const chatMessage = {
      id: Date.now() + Math.random(),
      message: message.trim(),
      userType,
      userName,
      timestamp: new Date().toISOString(),
    }

    // Store message
    chatMessages.push(chatMessage)

    // Keep only last 100 messages
    if (chatMessages.length > 100) {
      chatMessages.splice(0, chatMessages.length - 100)
    }

    // Broadcast message to all clients
    io.emit("chat:message", chatMessage)

    console.log(`Chat message from ${userType} ${userName}: ${message}`)
  })

  socket.on("disconnect", () => {
    if (socket.studentId) {
      students.delete(socket.studentId)
      io.emit("students:count", students.size)
      console.log(`Student ${socket.studentId} disconnected`)
    }

    // Remove from chat participants
    if (chatParticipants.has(socket.id)) {
      chatParticipants.delete(socket.id)
      broadcastParticipants()
    }

    console.log("Client disconnected:", socket.id)
  })
})

function broadcastParticipants() {
  const participants = Array.from(chatParticipants.values())
  io.emit("chat:participants", { participants })
}

function getPollResults() {
  if (!currentPoll) return null

  const results = {}
  const detailedResults = {}

  currentPoll.options.forEach((option) => {
    results[option] = 0
    detailedResults[option] = {
      count: 0,
      percentage: 0,
      students: [],
    }
  })

  answers.forEach((answer, studentId) => {
    if (results.hasOwnProperty(answer)) {
      results[answer]++
      const student = students.get(studentId)
      if (student) {
        detailedResults[answer].students.push({
          id: studentId,
          name: student.name,
        })
      }
    }
  })

  // Calculate percentages
  const totalAnswers = answers.size
  Object.keys(detailedResults).forEach((option) => {
    const count = (detailedResults[option].count = results[option])
    detailedResults[option].percentage = totalAnswers > 0 ? (count / totalAnswers) * 100 : 0
  })

  return {
    pollId: currentPoll.id,
    question: currentPoll.question,
    options: currentPoll.options,
    results,
    detailedResults,
    totalAnswers,
    totalStudents: students.size,
    createdAt: currentPoll.createdAt,
    timeLimit: currentPoll.timeLimit,
  }
}

function endPoll() {
  if (pollTimeout) {
    clearTimeout(pollTimeout)
    pollTimeout = null
  }

  if (currentPoll) {
    const results = getPollResults()

    // Add to history
    pollHistory.push({
      ...results,
      endedAt: new Date().toISOString(),
    })

    // Keep only last 50 polls in history
    if (pollHistory.length > 50) {
      pollHistory.splice(0, pollHistory.length - 50)
    }

    io.emit("poll:ended", results)
    console.log(`Poll ended: "${currentPoll.question}" - ${results.totalAnswers}/${results.totalStudents} responses`)
  }
}

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
