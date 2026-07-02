const express = require('express');
const router = express.Router();
const db = require('../db_json');
const { authMiddleware } = require('../middleware/auth');
const { validateTask } = require('../middleware/validation');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const tasks = await db.listTasksByUser(req.user.id);
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/', validateTask, async (req, res) => {
  try {
    const { title, description } = req.body;
    const task = await db.createTask({ title, description, user_id: req.user.id });
    req.app.get('io')?.emit('task:created', { task });
    res.status(201).json(task);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    const task = await db.getTaskByIdAndUser(id, req.user.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (completed !== undefined) updates.completed = completed;

    const updated = await db.updateTask(id, updates);
    req.app.get('io')?.emit('task:updated', { task: updated });
    res.json(updated);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await db.getTaskByIdAndUser(id, req.user.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await db.deleteTask(id);
    req.app.get('io')?.emit('task:deleted', { id: id });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
