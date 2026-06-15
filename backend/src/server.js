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
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io);

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);

io.on('connection', (socket) => {
  socket.on('authenticate', (token) => {
    socket.token = token;
  });
});

const PORT = process.env.PORT || 4000;

(async function start(){
  try {
    await db.connect();
    server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();

module.exports = app;
