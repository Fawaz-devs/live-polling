# Live Polling System - Backend

Express.js server with Socket.io for real-time polling functionality.

## Setup

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start development server:
\`\`\`bash
npm run dev
\`\`\`

3. Start production server:
\`\`\`bash
npm start
\`\`\`

## Environment Variables

- `PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:3000)

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/poll/current` - Get current poll status
- `POST /api/poll/create` - Create new poll (Teacher only)
- `POST /api/student/register` - Register new student

## Socket Events

### Client to Server
- `student:join` - Student joins the session
- `teacher:join` - Teacher joins the session
- `student:answer` - Student submits answer

### Server to Client
- `poll:new` - New poll created
- `poll:current` - Current poll state
- `poll:results` - Updated poll results
- `poll:ended` - Poll has ended
- `students:count` - Updated student count
- `answer:confirmed` - Answer submission confirmed
- `error` - Error message
