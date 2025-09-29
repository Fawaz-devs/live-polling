# Live Polling System

A real-time polling system built with React (frontend) and Express.js + Socket.io (backend) that enables teachers to create polls and students to participate in real-time.

## Features

### Teacher Features
- Create polls with customizable questions and up to 6 options
- Set configurable time limits (10-300 seconds)
- View real-time polling results with animated charts
- End polls manually or let them timeout automatically
- View poll history with detailed statistics
- Monitor connected students count
- Connection status indicators

### Student Features
- Simple name registration (stored locally per session)
- Join polling sessions with unique student IDs
- Answer polls with visual countdown timer
- View live results after submission
- Automatic reconnection on connection loss
- Responsive design for mobile and desktop

### System Features
- Real-time updates using Socket.io
- Automatic poll timeout (configurable)
- In-memory data storage (no database required)
- Connection status monitoring
- Network status detection
- Graceful error handling and reconnection
- Poll history tracking (last 50 polls)

## Tech Stack

### Frontend
- React 18 with Vite
- React Router v6 for routing
- Socket.io Client for real-time communication
- Tailwind CSS for styling
- Axios for HTTP requests

### Backend
- Node.js with Express.js
- Socket.io for WebSocket communication
- CORS enabled for cross-origin requests
- In-memory data structures for state management

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
\`\`\`bash
cd backend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

The backend server will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
\`\`\`bash
cd frontend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create a \`.env\` file (optional):
\`\`\`
VITE_BACKEND_URL=http://localhost:5000
\`\`\`

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

The frontend will run on http://localhost:3000

## Usage

1. **Teacher**: Navigate to http://localhost:3000/teacher
   - Create polls with questions and multiple choice options
   - Set custom time limits for polls
   - Monitor real-time responses
   - View poll history and statistics

2. **Student**: Navigate to http://localhost:3000/student
   - Enter your name to join the session
   - Answer active polls within the time limit
   - View results after submission

## Deployment

### Backend Deployment (Render/Heroku)
- Set environment variable: \`PORT\` (automatically set by most platforms)
- Set environment variable: \`FRONTEND_URL\` to your frontend domain

### Frontend Deployment (Vercel/Netlify)
- Set environment variable: \`VITE_BACKEND_URL\` to your backend domain
- Build command: \`npm run build\`
- Output directory: \`dist\`

## API Endpoints

- \`GET /api/health\` - Health check
- \`GET /api/poll/current\` - Get current poll status
- \`POST /api/poll/create\` - Create new poll
- \`POST /api/poll/end\` - End current poll manually
- \`GET /api/poll/history\` - Get poll history
- \`POST /api/student/register\` - Register new student
- \`GET /api/students\` - Get connected students list

## Socket Events

### Client to Server
- \`student:join\` - Student joins session
- \`teacher:join\` - Teacher joins session
- \`student:answer\` - Student submits answer

### Server to Client
- \`poll:new\` - New poll created
- \`poll:current\` - Current poll state
- \`poll:results\` - Updated poll results
- \`poll:ended\` - Poll has ended
- \`students:count\` - Updated student count
- \`answer:confirmed\` - Answer submission confirmed
- \`error\` - Error message

## Architecture

The system uses a client-server architecture with WebSocket communication:

1. **Backend**: Express.js server with Socket.io handles poll management, student tracking, and real-time communication
2. **Frontend**: React SPA with Socket.io client for real-time updates
3. **Data Flow**: Teacher creates poll → Server broadcasts to students → Students submit answers → Server aggregates and broadcasts results

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
