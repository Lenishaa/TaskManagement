# Task Management Application

A  full-stack task management application with **user authentication**, **CRUD operations**, **real-time updates**, and **modern responsive design**.

## ✨ Features

### 🔐 User Authentication & Authorization
- Secure registration and login with JWT tokens
- Password hashing with bcrypt (10 salt rounds)
- Token-based authentication with 7-day expiration
- Protected API routes
- Input validation and sanitization

### 📝 Task Management (CRUD)
- **Create** tasks with title and description
- **Read** all tasks with real-time updates
- **Update** tasks (edit title, description, completion status)
- **Delete** individual tasks or clear all completed tasks
- Per-user task isolation

### 🔄 Real-Time Updates
- Socket.io for instant synchronization
- Live updates across multiple tabs/devices
- Automatic task list refresh on changes
- Connection status monitoring

### 🎨 Modern UI/UX
- Beautiful gradient design
- Task statistics dashboard
- Search functionality
- Filter tasks (All/Active/Completed)
- Inline task editing
- Responsive design for all screen sizes
- Touch-friendly mobile interface

### ✅ Advanced Features
- Task completion tracking with visual indicators
- Search tasks by title or description
- Filter tasks by status
- Clear all completed tasks at once
- Real-time statistics (total, active, completed)
- Error handling with user-friendly messages
- Loading states for better UX

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Task_management_application
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory (or copy from `.env.example`):

```env
MONGO_URI=mongodb://localhost:27017/taskmanagement
JWT_SECRET=your_super_secure_jwt_secret_key_here_change_in_production
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**Note:** For production, use a strong JWT_SECRET and restrict CORS_ORIGIN to your domain.

Start the backend server:

```bash
npm run dev
```

Backend runs on `http://localhost:4000`

### 3. Setup Frontend

Open a new terminal window:

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory (or copy from `.env.example`):

```env
VITE_API=http://localhost:4000
VITE_BUILD_ENV=development
```

Start the frontend development server:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173` (or next available port)

---

## 📁 Project Structure

```
Task_management_application/
├── backend/
│   ├── src/
│   │   ├── server.js              # Express + Socket.io server
│   │   ├── db_mongo.js            # MongoDB database module
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT authentication middleware
│   │   │   └── validation.js      # Input validation rules
│   │   └── routes/
│   │       ├── auth.js            # Register/Login endpoints
│   │       └── tasks.js           # CRUD task endpoints
│   ├── .env                       # Backend environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # React components (Login, Register, TaskApp)
│   │   ├── main.jsx               # Entry point
│   │   └── styles.css             # Modern responsive styles
│   ├── .env                       # Frontend environment variables
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── README.md
└── package.json
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/auth/register` | `{username, password}` | `{token, user}` |
| POST | `/api/auth/login` | `{username, password}` | `{token, user}` |

**Validation Rules:**
- Username: 3-30 characters, alphanumeric only
- Password: Minimum 6 characters, must contain uppercase, lowercase, and number

### Tasks (All require `Authorization: Bearer <token>` header)

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/tasks` | - | `[{id, title, description, completed, user_id, created_at, updated_at}]` |
| POST | `/api/tasks` | `{title, description?}` | `{task object}` |
| PUT | `/api/tasks/:id` | `{title?, description?, completed?}` | `{updated task}` |
| DELETE | `/api/tasks/:id` | - | `{success: true}` |

**Validation Rules:**
- Title: 1-200 characters (required)
- Description: Maximum 1000 characters (optional)
- Completed: Boolean value (optional)

---

## 🔌 WebSocket Events

**Client → Server:**
- `authenticate` - Send JWT token for authentication

**Server → Client:**
- `task:created` - New task added
- `task:updated` - Task modified
- `task:deleted` - Task removed

Example:
```javascript
socket.on('task:created', (msg) => {
  console.log('New task:', msg.task);
});
```

---

## 🎯 Usage Guide

### Registration & Login
1. Open `http://localhost:5173`
2. Enter username and password
3. Click **Register** to create a new account or **Login** if you already have one
4. Password requirements: minimum 6 characters with uppercase, lowercase, and number

### Creating Tasks
1. Enter task title in the "What needs to be done?" field
2. Optionally add a description
3. Click **+ Add Task** button
4. Task appears instantly in the list

### Managing Tasks
- **Complete Task:** Click the checkbox to mark as complete/incomplete
- **Edit Task:** Click the **Edit** button, modify title/description, then click **Save**
- **Delete Task:** Click the **Delete** button
- **Search:** Use the search box to find tasks by title or description
- **Filter:** Use All/Active/Completed buttons to filter tasks
- **Clear Completed:** Click "Clear Completed" to remove all completed tasks

### Logout
- Click the **Logout** button at the bottom
- Returns to login screen
- Token cleared from browser

---

## 🔒 Security Features

- **Password Hashing:** bcrypt with 10 salt rounds
- **JWT Tokens:** Secure token-based authentication
- **Input Validation:** Server-side validation for all inputs
- **CORS Protection:** Configurable allowed origins
- **SQL Injection Prevention:** MongoDB parameterized queries
- **XSS Protection:** Input sanitization and escaping
- **Rate Limiting Ready:** Structure supports rate limiting implementation

---

### MongoDB Setup

**Option 1: MongoDB Atlas (Recommended for Production)**
1. Create account at https://www.mongodb.com/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGO_URI` in backend `.env`

**Option 2: Self-Hosted MongoDB**
1. Install MongoDB on your server
2. Configure authentication
3. Set up regular backups
4. Update `MONGO_URI` in backend `.env`

---

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with native driver
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **Real-Time:** Socket.io
- **Validation:** express-validator
- **CORS:** cors middleware

### Frontend
- **Library:** React 18
- **Build Tool:** Vite
- **HTTP Client:** Axios
- **Real-Time:** Socket.io Client
- **Styling:** Custom CSS with CSS Variables
- **Font:** Inter (Google Fonts)

---

## 📄 License

This project is licensed under the MIT License.
