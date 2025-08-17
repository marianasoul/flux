import express from 'express';
import Subject from '../models/Subject.js';

const router = express.Router();

// GET /api/subjects - Obter todas as disciplinas
router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.find({ active: true }).sort({ name: 1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar disciplinas', details: error.message });
  }
});

// GET /api/subjects/:id - Obter disciplina específica
router.get('/:id', async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ error: 'Disciplina não encontrada' });
    }
    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar disciplina', details: error.message });
  }
});

// POST /api/subjects - Criar nova disciplina
router.post('/', async (req, res) => {
  try {
    const subject = new Subject(req.body);
    const savedSubject = await subject.save();
    res.status(201).json(savedSubject);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Código da disciplina já existe' });
    } else {
      res.status(400).json({ error: 'Erro ao criar disciplina', details: error.message });
    }
  }
});

// PUT /api/subjects/:id - Atualizar disciplina
router.put('/:id', async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!subject) {
      return res.status(404).json({ error: 'Disciplina não encontrada' });
    }
    res.json(subject);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar disciplina', details: error.message });
  }
});

// DELETE /api/subjects/:id - Excluir disciplina (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );
    if (!subject) {
      return res.status(404).json({ error: 'Disciplina não encontrada' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir disciplina', details: error.message });
  }
});

export default router;