import express from 'express';
import Lesson from '../models/Lesson.js';

const router = express.Router();

// GET /api/lessons - Obter todas as aulas (com filtros opcionais)
router.get('/', async (req, res) => {
  try {
    let query = {};
    
    // Filtro por data de início e fim
    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) {
        query.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.date.$lte = new Date(req.query.endDate);
      }
    }
    
    // Filtro para semana atual
    if (req.query.semana === 'atual') {
      const now = new Date();
      const startOfWeek = new Date(now);
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Segunda-feira
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      query.date = {
        $gte: startOfWeek,
        $lte: endOfWeek
      };
    }
    
    const lessons = await Lesson.find(query)
      .populate('subject', 'name code color')
      .populate('professor', 'name email')
      .sort({ date: 1, time: 1 }); // Ordenar por data e hora
      
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar aulas', details: error.message });
  }
});

// GET /api/lessons/:id - Obter aula específica
router.get('/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('subject', 'name code color')
      .populate('professor', 'name email');
    if (!lesson) {
      return res.status(404).json({ error: 'Aula não encontrada' });
    }
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar aula', details: error.message });
  }
});

// POST /api/lessons - Criar nova aula
router.post('/', async (req, res) => {
  try {
    const lesson = new Lesson(req.body);
    const savedLesson = await lesson.save();
    const populatedLesson = await Lesson.findById(savedLesson._id)
      .populate('subject', 'name code color')
      .populate('professor', 'name email');
    res.status(201).json(populatedLesson);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar aula', details: error.message });
  }
});

// PUT /api/lessons/:id - Atualizar aula
router.put('/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('subject', 'name code color')
     .populate('professor', 'name email');
    if (!lesson) {
      return res.status(404).json({ error: 'Aula não encontrada' });
    }
    res.json(lesson);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar aula', details: error.message });
  }
});

// DELETE /api/lessons/:id - Excluir aula
router.delete('/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Aula não encontrada' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir aula', details: error.message });
  }
});

export default router;