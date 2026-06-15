const express = require('express');
const router = express.Router();
const db = require('../db_json');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const tasks = await db.listTasksByUser(req.user.id);
  res.json(tasks);
});

router.post('/', async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });

  const task = await db.createTask({ title, description, user_id: req.user.id });
  req.app.get('io')?.emit('task:created', { task });
  res.json(task);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  const task = await db.getTaskByIdAndUser(id, req.user.id);
  if (!task) return res.status(404).json({ error: 'Not found' });

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (completed !== undefined) updates.completed = completed;

  const updated = await db.updateTask(id, updates);
  req.app.get('io')?.emit('task:updated', { task: updated });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const task = await db.getTaskByIdAndUser(id, req.user.id);
  if (!task) return res.status(404).json({ error: 'Not found' });

  await db.deleteTask(id);
  req.app.get('io')?.emit('task:deleted', { id: id });
  res.json({ success: true });
});

module.exports = router;
