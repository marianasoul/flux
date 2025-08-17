import express from 'express';
import Professor from '../models/Professor.js';

const router = express.Router();

// GET /api/professors - Obter todos os professores
router.get('/', async (req, res) => {
  try {
    const professors = await Professor.find({ active: true }).sort({ name: 1 });
    res.json(professors);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar professores', details: error.message });
  }
});

// GET /api/professors/:id - Obter professor específico
router.get('/:id', async (req, res) => {
  try {
    const professor = await Professor.findById(req.params.id);
    if (!professor) {
      return res.status(404).json({ error: 'Professor não encontrado' });
    }
    res.json(professor);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar professor', details: error.message });
  }
});

// POST /api/professors - Criar novo professor
router.post('/', async (req, res) => {
  try {
    const professor = new Professor(req.body);
    const savedProfessor = await professor.save();
    res.status(201).json(savedProfessor);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Email já cadastrado' });
    } else {
      res.status(400).json({ error: 'Erro ao criar professor', details: error.message });
    }
  }
});

// PUT /api/professors/:id - Atualizar professor
router.put('/:id', async (req, res) => {
  try {
    const professor = await Professor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!professor) {
      return res.status(404).json({ error: 'Professor não encontrado' });
    }
    res.json(professor);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar professor', details: error.message });
  }
});

// DELETE /api/professors/:id - Excluir professor (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const professor = await Professor.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );
    if (!professor) {
      return res.status(404).json({ error: 'Professor não encontrado' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir professor', details: error.message });
  }
});

export default router;