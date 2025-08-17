import express from 'express';
import Task from '../models/Task.js';

const router = express.Router();

// GET /api/tasks - Obter todas as tarefas
router.get('/', async (req, res) => {
  try {
    const { status, priority, subject } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (subject) filter.subject = subject;
    
    const tasks = await Task.find(filter)
      .populate('subject', 'name code color')
      .sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar tarefas', details: error.message });
  }
});

// GET /api/tasks/:id - Obter tarefa específica
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('subject', 'name code color');
    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar tarefa', details: error.message });
  }
});

// POST /api/tasks - Criar nova tarefa
router.post('/', async (req, res) => {
  try {
    const task = new Task(req.body);
    const savedTask = await task.save();
    const populatedTask = await Task.findById(savedTask._id)
      .populate('subject', 'name code color');
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar tarefa', details: error.message });
  }
});

// PUT /api/tasks/:id - Atualizar tarefa
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('subject', 'name code color');
    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar tarefa', details: error.message });
  }
});

// PATCH /api/tasks/:id/complete - Marcar tarefa como concluída
router.patch('/:id/complete', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { 
        completed: true,
        status: 'concluída',
        completedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('subject', 'name code color');
    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao marcar tarefa como concluída', details: error.message });
  }
});

// DELETE /api/tasks/:id - Excluir tarefa
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir tarefa', details: error.message });
  }
});

export default router;