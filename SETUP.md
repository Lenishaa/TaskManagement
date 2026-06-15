# Setup Guide - Task Management Application

Complete guide to set up and configure the Task Management Application.

---

## System Requirements

- **Node.js**: 16.0+ (tested with 22.20.0)
- **npm**: 8.0+
- **OS**: Windows, macOS, or Linux
- **RAM**: 512MB+
- **Disk Space**: 500MB+

---

## Installation Steps

### 1. Clone or Extract Project

```bash
cd Task_management_application
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

**Installed packages:**
- `express` - Web framework
- `jsonwebtoken` - JWT auth
- `bcrypt` - Password hashing
- `socket.io` - WebSocket
- `cors` - CORS middleware
- `nodemon` - Dev auto-restart

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

**Installed packages:**
- `react` - UI library
- `react-dom` - DOM rendering
- `axios` - HTTP client
- `socket.io-client` - WebSocket client
- `vite` - Build tool

---

## Configuration

### Backend Configuration

#### Step 1: Create `.env` file

```bash
cd backend
cp .env.example .env
```

Or create `backend/.env` manually:

```
JWT_SECRET=your_secure_secret_key_here
PORT=4000
NODE_ENV=development
```

**Options:**

| Variable | Default | Purpose | Production |
|----------|---------|---------|------------|
| `JWT_SECRET` | `dev_secret_change_me` | Token signing key | **MUST CHANGE** |
| `PORT` | `4000` | Server listen port | Keep or change |
| `NODE_ENV` | `development` | Environment mode | Set to `production` |

#### JWT Secret Best Practices

Generate a strong secret:

```bash
# On Windows PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString())) | Cut -c 1-32

# On macOS/Linux
openssl rand -base64 32
```

Example strong secret:
```
JWT_SECRET=aB9$mK2!xQ7@pL5&nR3^vC8#tU1%sJ6
```

### Frontend Configuration

#### Step 1: Create `.env` file

```bash
cd frontend
cp .env.example .env
```

Or create `frontend/.env` manually:

```
VITE_API=http://localhost:4000
```

**Options:**

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API` | `http://localhost:4000` | Backend API URL |

#### Examples

**Local Development:**
```
VITE_API=http://localhost:4000
```

**Remote Server:**
```
VITE_API=https://api.example.com
```

**Production:**
```
VITE_API=https://api.production.com
```

---

## Running the Application

### Development Mode

#### Terminal 1: Start Backend

```bash
cd backend
npm run dev
```

Expected output:
```
[nodemon] starting `node src/server.js`
Server listening on 4000
```

#### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.4.21 ready in 1234 ms

➜ Local: http://localhost:5173/
```

### Production Build

#### Build Frontend

```bash
cd frontend
npm run build
```

Creates `dist/` folder with optimized files.

#### Deploy Backend

Set production environment variables:
```bash
export JWT_SECRET=your_strong_secret_here
export NODE_ENV=production
export PORT=4000
```

Then start:
```bash
cd backend
npm start
```

---

## Database

### Data Storage

The backend stores data directly in MongoDB. Set `MONGO_URI` in `backend/.env` before starting the server.

- **MongoDB**: set `MONGO_URI` environment variable.

Example MongoDB schema:

```json
{
  "users": [
    {
      "id": 1,
      "username": "johnmo",
      "password_hash": "$2b$10$..."
    }
  ],
  "tasks": [
    {
      "id": 1,
      "title": "Buy groceries",
      "description": "",
      "completed": true,
      "user_id": 1,
      "created_at": "2026-06-14T06:45:00Z",
      "updated_at": "2026-06-14T06:46:00Z"
    }
  ],
  "lastIds": {
    "users": 1,
    "tasks": 1
  }
}
```

### Reset Data

To reset MongoDB data, clear the `users` and `tasks` collections in your database.

---

## API Testing

### Using Postman or cURL

#### 1. Register User

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

Response:
```json
{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
```

#### 2. Login User

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

#### 3. Get Tasks (requires token from login)

```bash
curl -X GET http://localhost:4000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 4. Create Task

```bash
curl -X POST http://localhost:4000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"My new task","description":"Do something"}'
```

---

## Troubleshooting

### Backend won't start

**Error:** `Error: Cannot find module 'express'`
- **Fix**: Run `npm install` in `backend/` folder

**Error:** `Port 4000 already in use`
- **Fix**: Change `PORT` in `.env` or kill process using port 4000

### Frontend won't connect

**Error:** `net::ERR_CONNECTION_REFUSED`
- **Fix**: Ensure backend is running on correct port
- **Fix**: Check `VITE_API` in `frontend/.env`

### Login fails

**Error:** `Invalid credentials`
- **Fix**: Ensure username/password are correct
- **Fix**: Check `JWT_SECRET` matches on backend

### CORS errors

**Error:** `Access to XMLHttpRequest blocked by CORS`
- **Fix**: Check backend is running
- **Fix**: Verify `VITE_API` URL is correct

---

## File Locations

```
Task_management_application/
├── backend/
│   ├── .env                    # ⭐ Create this! (or copy from .env.example)
│   ├── .env.example            # Template
│   ├── data.json               # Generated after first run
│   ├── src/
│   │   ├── server.js
│   │   ├── db_json.js
│   │   ├── middleware/auth.js
│   │   └── routes/
│   │       ├── auth.js
│   │       └── tasks.js
│   ├── package.json
│   └── node_modules/
│
├── frontend/
│   ├── .env                    # ⭐ Create this! (or copy from .env.example)
│   ├── .env.example            # Template
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── node_modules/
│
└── README.md
```

---

## Next Steps

1. ✅ Install dependencies
2. ✅ Create `.env` files
3. ✅ Run backend and frontend
4. ✅ Test register/login/tasks
5. Consider: Add input validation
6. Consider: Add rate limiting
7. Consider: Deploy to production

---

## Support

For issues:
1. Check error messages in browser console & terminal
2. Verify `.env` files exist with correct values
3. Ensure ports 4000 (backend) and 5173 (frontend) are available
4. Check that Node.js version is 16.0+

