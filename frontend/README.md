# Live Polling System - Frontend

React frontend for the live polling system with real-time updates.

## Setup

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start development server:
\`\`\`bash
npm run dev
\`\`\`

3. Build for production:
\`\`\`bash
npm run build
\`\`\`

## Environment Variables

Create a `.env` file in the frontend directory:

\`\`\`
VITE_BACKEND_URL=http://localhost:5000
\`\`\`

## Features

- **Home Page**: Role selection (Teacher/Student)
- **Teacher Interface**: Create polls and view real-time results
- **Student Interface**: Join session, answer polls, view results
- **Real-time Updates**: Socket.io integration for live data
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- React 18
- React Router v6
- Socket.io Client
- Tailwind CSS
- Vite
- Axios for HTTP requests
