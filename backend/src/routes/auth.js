const express = require('express');
const router = express.Router();
const db = require('../db_json');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SECRET } = require('../middleware/auth');

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  const existing = await db.getUserByUsername(username);
  if (existing) return res.status(400).json({ error: 'User exists' });

  const hash = await bcrypt.hash(password, 10);
  const user = await db.createUser(username, hash);

  const token = jwt.sign({ id: user.id, username }, SECRET);
  res.json({ token });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  const user = await db.getUserByUsername(username);
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
  
  const token = jwt.sign({ id: user.id, username }, SECRET);
  res.json({ token });
});

module.exports = router;
