# Task Management Application

A full-stack task management app with **user authentication**, **CRUD operations**, **real-time updates**, and **responsive design**.

## Features

✅ **User Authentication & Authorization**
- Register & login with JWT tokens
- Secure password hashing (bcrypt)
- Token stored in browser localStorage
- Protected API routes

✅ **CRUD Operations**
- Create, Read, Update, Delete tasks
- Per-user task isolation
- Real-time list updates via WebSocket

✅ **Real-Time Updates**
- Socket.io for instant updates
- Broadcast task changes to all connected clients
- Live sync across tabs/devices

✅ **Responsive Design**
- Mobile-first CSS with flexbox
- Optimized for desktop & mobile screens
- Touch-friendly form inputs & buttons

---

## Quick Start

### 1. Start Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:4000`

### 2. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` (or next available port)

---

## Environment Variables

### Backend (`.env` or Terminal)

```bash
JWT_SECRET=your_secret_key_here
PORT=4000
```

**Default:** `JWT_SECRET=dev_secret_change_me` (change in production!)

### Frontend (`.env`)

```bash
VITE_API=http://localhost:4000
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/auth/register` | `{username, password}` | `{token}` |
| POST | `/api/auth/login` | `{username, password}` | `{token}` |

### Tasks (All require `Authorization: Bearer <token>` header)

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/tasks` | - | `[{id, title, description, completed, user_id, created_at}]` |
| POST | `/api/tasks` | `{title, description?}` | `{task object}` |
| PUT | `/api/tasks/:id` | `{title?, description?, completed?}` | `{updated task}` |
| DELETE | `/api/tasks/:id` | - | `{success: true}` |

---

## WebSocket Events

**Emitted by Server:**

- `task:created` - New task added
- `task:updated` - Task modified
- `task:deleted` - Task removed

Example listener (client):
```javascript
socket.on('task:created', (msg) => console.log(msg.task));
```

---

## File Structure

```
.
├── backend/
│   ├── src/
│   │   ├── server.js          # Express + Socket.io server
│   │   ├── db_json.js         # MongoDB database module
│   │   ├── middleware/auth.js # JWT authentication
│   │   └── routes/
│   │       ├── auth.js        # Register/Login endpoints
│   │       └── tasks.js       # CRUD task endpoints
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # React components (Login, Register, TaskApp)
│   │   ├── main.jsx           # Entry point
│   │   ├── styles.css         # Responsive styles
│   │   └── .env               # Frontend config
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## Testing

### Register & Login
1. Open `http://localhost:5173`
2. Enter username & password
3. Click Register (creates new user)
4. Tasks page loads automatically

### Create Task
1. Type task title in "New task" field
2. Click Add button
3. Task appears in list (real-time)

### Complete Task
- Click checkbox to mark complete/incomplete
- Styling updates immediately

### Delete Task
- Click Delete button
- Task removed from list

### Logout
- Click Logout button
- Returns to Login/Register screen
- Token cleared from localStorage

### Login Again
- Use same credentials
- All tasks persist in database

---

## Dependencies

### Backend
- **express** - Web framework
- **jsonwebtoken** - JWT tokens
- **bcrypt** - Password hashing
- **socket.io** - Real-time communication
- **cors** - Cross-origin requests
- **nodemon** - Auto-restart on changes

### Frontend
- **react** - UI library
- **axios** - HTTP client
- **socket.io-client** - WebSocket client
- **vite** - Build tool

---

## Notes

 - This backend stores data directly in MongoDB. Set `MONGO_URI` in `backend/.env`.
 - Data is no longer stored in `backend/data.json`.
 - Tokens expire after browser close (no refresh tokens yet)
 - No input validation yet (add before production)
 - CORS allows all origins (`*`) - restrict in production

---

## Next Steps (Optional)

- Add email verification
- Implement task categories/tags
- Add due dates & reminders
- Database: PostgreSQL/MongoDB
- Deploy to Heroku/Vercel
- Add unit tests
- Input validation & sanitization
- Rate limiting for auth endpoints

