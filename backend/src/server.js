require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const tasksRoutes = require('./routes/tasks');
const db = require('./db_json');

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { 
  cors: { 
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true 
  } 
});
app.set('io', io);

app.use(cors({ 
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true 
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);

// Health check endpoint for Render
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

io.on('connection', (socket) => {
  // Get token from handshake auth
  const token = socket.handshake.auth?.token;
  if (token) {
    socket.token = token;
    console.log('Socket authenticated for user');
  } else {
    console.log('Socket connected without token');
  }
});

const PORT = process.env.PORT || 4000;

// Start server immediately, then connect to database
server.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Connect to database in background
(async function connectDB(){
  try {
    await db.connect();
    console.log('✅ Database connected successfully');
  } catch (err) {
    console.error('⚠️  Database connection failed:', err.message);
    console.log('⚠️  Server is running but database is not connected');
  }
})();

module.exports = app;
