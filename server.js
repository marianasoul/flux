import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

// Importar rotas
import subjectsRouter from './routes/subjects.js';
import professorsRouter from './routes/professors.js';
import lessonsRouter from './routes/lessons.js';
import tasksRouter from './routes/tasks.js';

// Configurar dotenv
dotenv.config();

// Conectar ao banco de dados
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware para processar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Dados simulados para teste
const users = [
  { id: 1, username: 'admin', password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' }, // senha: 'admin'
];

const subjects = [
  { id: 1, name: 'Anatomia', code: 'MED001', description: 'Estudo da estrutura do corpo humano', workload: 120, color: '#FF5733' },
  { id: 2, name: 'Fisiologia', code: 'MED002', description: 'Estudo do funcionamento do corpo humano', workload: 100, color: '#33FF57' },
  { id: 3, name: 'Bioquímica', code: 'MED003', description: 'Estudo dos processos químicos nos organismos vivos', workload: 80, color: '#3357FF' },
  { id: 4, name: 'Histologia', code: 'MED004', description: 'Estudo dos tecidos do corpo humano', workload: 60, color: '#f59e0b' },
  { id: 5, name: 'Embriologia', code: 'MED005', description: 'Estudo do desenvolvimento embrionário', workload: 40, color: '#8b5cf6' },
];

// Dados dos professores
const professors = [
  { id: 1, name: 'Dr. João Silva', department: 'Anatomia', email: 'joao.silva@med.edu', phone: '(11) 99999-0001' },
  { id: 2, name: 'Dra. Maria Costa', department: 'Fisiologia', email: 'maria.costa@med.edu', phone: '(11) 99999-0002' },
  { id: 3, name: 'Dra. Ana Lima', department: 'Bioquímica', email: 'ana.lima@med.edu', phone: '(11) 99999-0003' },
  { id: 4, name: 'Dr. Carlos Santos', department: 'Histologia', email: 'carlos.santos@med.edu', phone: '(11) 99999-0004' },
  { id: 5, name: 'Dra. Lucia Oliveira', department: 'Embriologia', email: 'lucia.oliveira@med.edu', phone: '(11) 99999-0005' },
];

// Dados do semestre vigente
const currentSemester = {
  id: 1,
  name: '2024.1',
  period: '2024-02-01 a 2024-06-30',
  startDate: '2024-02-01',
  endDate: '2024-06-30',
  active: true
};

const lessons = [
  { id: 1, subjectId: 1, title: 'Introdução à Anatomia', description: 'Conceitos básicos de anatomia', date: '2023-10-15' },
  { id: 2, subjectId: 1, title: 'Sistema Esquelético', description: 'Estudo dos ossos e articulações', date: '2023-10-22' },
  { id: 3, subjectId: 2, title: 'Homeostase', description: 'Mecanismos de regulação do corpo', date: '2023-10-18' },
];

const tasks = [
  { id: 1, subjectId: 1, title: 'Relatório de Anatomia', description: 'Entregar relatório sobre sistema muscular', dueDate: '2023-11-10', completed: false },
  { id: 2, subjectId: 2, title: 'Questionário de Fisiologia', description: 'Responder questionário sobre sistema circulatório', dueDate: '2023-11-15', completed: true },
  { id: 3, subjectId: 3, title: 'Apresentação de Bioquímica', description: 'Preparar slides sobre metabolismo celular', dueDate: '2023-11-20', completed: false },
];

const grades = [
  { id: 1, subjectId: 1, title: 'Prova 1', score: 8.5, maxScore: 10, date: '2023-10-20' },
  { id: 2, subjectId: 1, title: 'Trabalho Prático', score: 9.0, maxScore: 10, date: '2023-10-25' },
  { id: 3, subjectId: 2, title: 'Prova 1', score: 7.5, maxScore: 10, date: '2023-10-22' },
];

// Dados de progresso
const progressData = {
  overview: {
    totalSubjects: 8,
    completedTasks: 45,
    pendingTasks: 12,
    studyHours: 156,
    averageGrade: 8.7,
    attendanceRate: 95
  },
  weeklyProgress: [
    { week: 'Sem 1', studyHours: 18, tasksCompleted: 8, averageGrade: 8.2 },
    { week: 'Sem 2', studyHours: 22, tasksCompleted: 12, averageGrade: 8.5 },
    { week: 'Sem 3', studyHours: 20, tasksCompleted: 10, averageGrade: 8.8 },
    { week: 'Sem 4', studyHours: 25, tasksCompleted: 15, averageGrade: 9.1 }
  ],
  subjectProgress: [
    {
      subject: 'Anatomia',
      color: '#ef4444',
      completedTopics: 12,
      totalTopics: 15,
      averageGrade: 9.2,
      studyHours: 45,
      lastActivity: '2024-01-15'
    },
    {
      subject: 'Fisiologia',
      color: '#3b82f6',
      completedTopics: 8,
      totalTopics: 12,
      averageGrade: 8.8,
      studyHours: 38,
      lastActivity: '2024-01-14'
    },
    {
      subject: 'Bioquímica',
      color: '#10b981',
      completedTopics: 10,
      totalTopics: 14,
      averageGrade: 8.5,
      studyHours: 32,
      lastActivity: '2024-01-13'
    },
    {
      subject: 'Histologia',
      color: '#f59e0b',
      completedTopics: 6,
      totalTopics: 10,
      averageGrade: 8.9,
      studyHours: 28,
      lastActivity: '2024-01-12'
    }
  ]
};

// Dados da agenda
const agenda = [
  {
    id: 1,
    title: 'Estudar Anatomia',
    description: 'Revisar sistema muscular',
    date: '2024-01-20',
    time: '14:00',
    type: 'study',
    completed: false
  },
  {
    id: 2,
    title: 'Prova de Fisiologia',
    description: 'Prova sobre sistema circulatório',
    date: '2024-01-22',
    time: '08:00',
    type: 'exam',
    completed: false
  },
  {
    id: 3,
    title: 'Entrega de Trabalho',
    description: 'Trabalho de Bioquímica sobre metabolismo',
    date: '2024-01-25',
    time: '23:59',
    type: 'assignment',
    completed: false
  }
];

// Dados do cronograma
const schedule = [
  {
    id: 1,
    day: 'Segunda',
    time: '08:00 - 10:00',
    subject: 'Anatomia',
    type: 'Teórica',
    location: 'Sala 101',
    professor: 'Dr. João Silva',
    color: '#FF5733',
    subjectId: 1,
    professorId: 1
  },
  {
    id: 2,
    day: 'Terça',
    time: '10:00 - 12:00',
    subject: 'Fisiologia',
    type: 'Prática',
    location: 'Lab 201',
    professor: 'Dra. Maria Costa',
    color: '#33FF57',
    subjectId: 2,
    professorId: 2
  }
];

// APIs REST

// Disciplinas
app.get('/api/subjects', (req, res) => {
  res.json(subjects);
});

app.post('/api/subjects', (req, res) => {
  const newSubject = {
    id: subjects.length + 1,
    name: req.body.name,
    code: req.body.code,
    description: req.body.description,
    workload: req.body.workload,
    color: req.body.color
  };
  subjects.push(newSubject);
  res.status(201).json(newSubject);
});

app.put('/api/subjects/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const subjectIndex = subjects.findIndex(s => s.id === id);
  if (subjectIndex !== -1) {
    subjects[subjectIndex] = { ...subjects[subjectIndex], ...req.body };
    res.json(subjects[subjectIndex]);
  } else {
    res.status(404).json({ error: 'Disciplina não encontrada' });
  }
});

app.delete('/api/subjects/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const subjectIndex = subjects.findIndex(s => s.id === id);
  if (subjectIndex !== -1) {
    subjects.splice(subjectIndex, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Disciplina não encontrada' });
  }
});

// Professores
app.get('/api/professors', (req, res) => {
  res.json(professors);
});

app.post('/api/professors', (req, res) => {
  const newProfessor = {
    id: professors.length + 1,
    name: req.body.name,
    department: req.body.department,
    email: req.body.email,
    phone: req.body.phone
  };
  professors.push(newProfessor);
  res.status(201).json(newProfessor);
});

app.put('/api/professors/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const professorIndex = professors.findIndex(p => p.id === id);
  if (professorIndex !== -1) {
    professors[professorIndex] = { ...professors[professorIndex], ...req.body };
    res.json(professors[professorIndex]);
  } else {
    res.status(404).json({ error: 'Professor não encontrado' });
  }
});

app.delete('/api/professors/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const professorIndex = professors.findIndex(p => p.id === id);
  if (professorIndex !== -1) {
    professors.splice(professorIndex, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Professor não encontrado' });
  }
});

// Semestre
app.get('/api/semester', (req, res) => {
  res.json(currentSemester);
});

app.put('/api/semester', (req, res) => {
  Object.assign(currentSemester, req.body);
  res.json(currentSemester);
});

// Dashboard stats
app.get('/api/dashboard/stats', (req, res) => {
  const stats = subjects.map(subject => {
    const subjectTasks = tasks.filter(task => task.subjectId === subject.id);
    const subjectGrades = grades.filter(grade => grade.subjectId === subject.id);
    
    const completedTasks = subjectTasks.filter(task => task.completed).length;
    const pendingTasks = subjectTasks.filter(task => !task.completed).length;
    const averageGrade = subjectGrades.length > 0 
      ? (subjectGrades.reduce((sum, grade) => sum + grade.score, 0) / subjectGrades.length).toFixed(1)
      : '0.0';
    
    return {
      subject: subject.name,
      completedTasks,
      pendingTasks,
      averageGrade
    };
  });
  
  res.json(stats);
});

// Aulas
app.get('/api/lessons', (req, res) => {
  res.json(lessons);
});

app.post('/api/lessons', (req, res) => {
  const newLesson = {
    id: lessons.length + 1,
    subjectId: req.body.subjectId,
    title: req.body.title,
    description: req.body.description,
    date: req.body.date
  };
  lessons.push(newLesson);
  res.status(201).json(newLesson);
});

app.put('/api/lessons/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const lessonIndex = lessons.findIndex(l => l.id === id);
  if (lessonIndex !== -1) {
    lessons[lessonIndex] = { ...lessons[lessonIndex], ...req.body };
    res.json(lessons[lessonIndex]);
  } else {
    res.status(404).json({ error: 'Aula não encontrada' });
  }
});

app.delete('/api/lessons/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const lessonIndex = lessons.findIndex(l => l.id === id);
  if (lessonIndex !== -1) {
    lessons.splice(lessonIndex, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Aula não encontrada' });
  }
});

// Tarefas
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const newTask = {
    id: tasks.length + 1,
    subjectId: req.body.subjectId,
    title: req.body.title,
    description: req.body.description,
    dueDate: req.body.dueDate,
    completed: false
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex !== -1) {
    tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
    res.json(tasks[taskIndex]);
  } else {
    res.status(404).json({ error: 'Tarefa não encontrada' });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Tarefa não encontrada' });
  }
});

// Notas
app.get('/api/grades', (req, res) => {
  res.json(grades);
});

app.post('/api/grades', (req, res) => {
  const newGrade = {
    id: grades.length + 1,
    subjectId: req.body.subjectId,
    title: req.body.title,
    score: req.body.score,
    maxScore: req.body.maxScore,
    date: req.body.date
  };
  grades.push(newGrade);
  res.status(201).json(newGrade);
});

app.put('/api/grades/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const gradeIndex = grades.findIndex(g => g.id === id);
  if (gradeIndex !== -1) {
    grades[gradeIndex] = { ...grades[gradeIndex], ...req.body };
    res.json(grades[gradeIndex]);
  } else {
    res.status(404).json({ error: 'Nota não encontrada' });
  }
});

app.delete('/api/grades/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const gradeIndex = grades.findIndex(g => g.id === id);
  if (gradeIndex !== -1) {
    grades.splice(gradeIndex, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Nota não encontrada' });
  }
});

// Progresso
app.get('/api/progress', (req, res) => {
  res.json(progressData);
});

// Agenda
app.get('/api/agenda', (req, res) => {
  res.json(agenda);
});

app.post('/api/agenda', (req, res) => {
  const newItem = {
    id: agenda.length + 1,
    title: req.body.title,
    description: req.body.description,
    date: req.body.date,
    time: req.body.time,
    type: req.body.type || 'study',
    completed: false
  };
  agenda.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/agenda/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const itemIndex = agenda.findIndex(item => item.id === id);
  if (itemIndex !== -1) {
    agenda[itemIndex] = { ...agenda[itemIndex], ...req.body };
    res.json(agenda[itemIndex]);
  } else {
    res.status(404).json({ error: 'Item da agenda não encontrado' });
  }
});

app.patch('/api/agenda/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const itemIndex = agenda.findIndex(item => item.id === id);
  if (itemIndex !== -1) {
    if (req.body.hasOwnProperty('completed')) {
      agenda[itemIndex].completed = req.body.completed;
    }
    res.json(agenda[itemIndex]);
  } else {
    res.status(404).json({ error: 'Item da agenda não encontrado' });
  }
});

app.delete('/api/agenda/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const itemIndex = agenda.findIndex(item => item.id === id);
  if (itemIndex !== -1) {
    agenda.splice(itemIndex, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Item da agenda não encontrado' });
  }
});

// Cronograma
app.get('/api/schedule', (req, res) => {
  res.json(schedule);
});

app.get('/api/cronograma', (req, res) => {
  res.json(schedule);
});

app.post('/api/cronograma', (req, res) => {
  const newScheduleItem = {
    id: schedule.length + 1,
    day: req.body.day,
    time: req.body.time,
    subject: req.body.subject,
    type: req.body.type,
    location: req.body.location,
    professor: req.body.professor,
    color: req.body.color,
    subjectId: req.body.subjectId,
    professorId: req.body.professorId
  };
  schedule.push(newScheduleItem);
  res.status(201).json(newScheduleItem);
});

app.put('/api/cronograma/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const scheduleIndex = schedule.findIndex(s => s.id === id);
  if (scheduleIndex !== -1) {
    schedule[scheduleIndex] = { ...schedule[scheduleIndex], ...req.body };
    res.json(schedule[scheduleIndex]);
  } else {
    res.status(404).json({ error: 'Item do cronograma não encontrado' });
  }
});

app.delete('/api/cronograma/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const scheduleIndex = schedule.findIndex(s => s.id === id);
  if (scheduleIndex !== -1) {
    schedule.splice(scheduleIndex, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Item do cronograma não encontrado' });
  }
});

app.post('/api/schedule', (req, res) => {
  const newScheduleItem = {
    id: schedule.length + 1,
    day: req.body.day,
    time: req.body.time,
    subject: req.body.subject,
    type: req.body.type,
    location: req.body.location,
    professor: req.body.professor,
    color: req.body.color,
    subjectId: req.body.subjectId,
    professorId: req.body.professorId
  };
  schedule.push(newScheduleItem);
  res.status(201).json(newScheduleItem);
});

app.put('/api/schedule/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const scheduleIndex = schedule.findIndex(s => s.id === id);
  if (scheduleIndex !== -1) {
    schedule[scheduleIndex] = { ...schedule[scheduleIndex], ...req.body };
    res.json(schedule[scheduleIndex]);
  } else {
    res.status(404).json({ error: 'Item do cronograma não encontrado' });
  }
});

app.delete('/api/schedule/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const scheduleIndex = schedule.findIndex(s => s.id === id);
  if (scheduleIndex !== -1) {
    schedule.splice(scheduleIndex, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Item do cronograma não encontrado' });
  }
});

// Rotas para servir páginas HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/cronograma', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cronograma.html'));
});

app.get('/agenda', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'agenda.html'));
});

app.get('/planejamento', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'planejamento.html'));
});

app.get('/progresso', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'progresso.html'));
});

app.get('/disciplinas', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'disciplinas.html'));
});

app.get('/professores', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'professores.html'));
});

app.get('/semestre', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'semestre.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
});
