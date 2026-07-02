const express = require('express');
const router = express.Router();
const db = require('../db_json');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SECRET } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');

router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { username, password } = req.body;
    const existing = await db.getUserByUsername(username);
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = await db.createUser(username, hash);

    const token = jwt.sign({ id: user.id, username }, SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, username } });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', validateLogin, async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.getUserByUsername(username);
    if (!user) return res.status(401).json({ error: 'Invalid username or password' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid username or password' });
    
    const token = jwt.sign({ id: user.id, username }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
