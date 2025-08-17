import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware para processar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
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

// Dados de exemplo para progresso
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

// Rotas para disciplinas
app.get('/api/subjects', (req, res) => {
  res.json(subjects);
});

app.post('/api/subjects', (req, res) => {
  const { name, code, description, workload, color } = req.body;
  const newSubject = {
    id: subjects.length + 1,
    name,
    code,
    description,
    workload: parseInt(workload),
    color
  };
  subjects.push(newSubject);
  res.status(201).json(newSubject);
});

app.put('/api/subjects/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, code, description, workload, color } = req.body;
  
  const index = subjects.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Disciplina não encontrada' });
  }
  
  subjects[index] = { ...subjects[index], name, code, description, workload: parseInt(workload), color };
  res.json(subjects[index]);
});

app.delete('/api/subjects/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = subjects.findIndex(s => s.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Disciplina não encontrada' });
  }
  
  subjects.splice(index, 1);
  res.status(204).send();
});

// APIs para Professores
app.get('/api/professors', (req, res) => {
  res.json(professors);
});

app.post('/api/professors', (req, res) => {
  const { name, department, email, phone } = req.body;
  const newProfessor = {
    id: professors.length + 1,
    name,
    department,
    email,
    phone
  };
  professors.push(newProfessor);
  res.status(201).json(newProfessor);
});

app.put('/api/professors/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, department, email, phone } = req.body;
  
  const index = professors.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Professor não encontrado' });
  }
  
  professors[index] = { ...professors[index], name, department, email, phone };
  res.json(professors[index]);
});

app.delete('/api/professors/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = professors.findIndex(p => p.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Professor não encontrado' });
  }
  
  professors.splice(index, 1);
  res.status(204).send();
});

// APIs para Semestre
app.get('/api/semester', (req, res) => {
  res.json(currentSemester);
});

app.put('/api/semester', (req, res) => {
  const { name, period, startDate, endDate } = req.body;
  
  currentSemester.name = name;
  currentSemester.period = period;
  currentSemester.startDate = startDate;
  currentSemester.endDate = endDate;
  
  res.json(currentSemester);
});

// API para estatísticas do dashboard
app.get('/api/dashboard/stats', (req, res) => {
  const stats = subjects.map(subject => {
    const subjectLessons = lessons.filter(l => l.subjectId === subject.id);
    const subjectTasks = tasks.filter(t => t.subjectId === subject.id);
    const subjectGrades = grades.filter(g => g.subjectId === subject.id);
    
    const completedTasks = subjectTasks.filter(t => t.completed).length;
    const pendingTasks = subjectTasks.length - completedTasks;
    
    const averageGrade = subjectGrades.length > 0 
      ? subjectGrades.reduce((sum, grade) => sum + grade.score, 0) / subjectGrades.length 
      : 0;
    
    return {
      id: subject.id,
      name: subject.name,
      color: subject.color,
      lessonsCount: subjectLessons.length,
      completedTasks,
      pendingTasks,
      averageGrade: averageGrade.toFixed(1)
    };
  });
  
  res.json(stats);
});

// Rotas para aulas
app.get('/api/lessons', (req, res) => {
  res.json(lessons);
});

app.post('/api/lessons', (req, res) => {
  const { subjectId, title, description, date } = req.body;
  const newLesson = {
    id: lessons.length + 1,
    subjectId: parseInt(subjectId),
    title,
    description,
    date
  };
  lessons.push(newLesson);
  res.status(201).json(newLesson);
});

app.put('/api/lessons/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { subjectId, title, description, date } = req.body;
  
  const index = lessons.findIndex(l => l.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Aula não encontrada' });
  }
  
  lessons[index] = { 
    ...lessons[index], 
    subjectId: parseInt(subjectId), 
    title, 
    description, 
    date 
  };
  res.json(lessons[index]);
});

app.delete('/api/lessons/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = lessons.findIndex(l => l.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Aula não encontrada' });
  }
  
  lessons.splice(index, 1);
  res.status(204).send();
});

// Rotas para tarefas
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const { subjectId, title, description, dueDate, completed } = req.body;
  const newTask = {
    id: tasks.length + 1,
    subjectId: parseInt(subjectId),
    title,
    description,
    dueDate,
    completed: completed === 'true' || completed === true
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { subjectId, title, description, dueDate, completed } = req.body;
  
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Tarefa não encontrada' });
  }
  
  tasks[index] = { 
    ...tasks[index], 
    subjectId: parseInt(subjectId), 
    title, 
    description, 
    dueDate,
    completed: completed === 'true' || completed === true
  };
  res.json(tasks[index]);
});

app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Tarefa não encontrada' });
  }
  
  tasks.splice(index, 1);
  res.status(204).send();
});

// Rotas para notas
app.get('/api/grades', (req, res) => {
  res.json(grades);
});

app.post('/api/grades', (req, res) => {
  const { subjectId, title, score, maxScore, date } = req.body;
  const newGrade = {
    id: grades.length + 1,
    subjectId: parseInt(subjectId),
    title,
    score: parseFloat(score),
    maxScore: parseFloat(maxScore),
    date
  };
  grades.push(newGrade);
  res.status(201).json(newGrade);
});

app.put('/api/grades/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { subjectId, title, score, maxScore, date } = req.body;
  
  const index = grades.findIndex(g => g.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Nota não encontrada' });
  }
  
  grades[index] = { 
    ...grades[index], 
    subjectId: parseInt(subjectId), 
    title, 
    score: parseFloat(score), 
    maxScore: parseFloat(maxScore), 
    date 
  };
  res.json(grades[index]);
});

app.delete('/api/grades/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = grades.findIndex(g => g.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Nota não encontrada' });
  }
  
  grades.splice(index, 1);
  res.status(204).send();
});

// Rotas para progresso
app.get('/api/progress', (req, res) => {
  res.json(progressData);
});

// Rotas para agenda
app.get('/api/agenda', (req, res) => {
  res.json(agenda);
});

app.post('/api/agenda', (req, res) => {
  const { title, description, date, time, type, subject, dueDate, priority, status } = req.body;
  const newItem = {
    id: agenda.length + 1,
    title,
    description,
    date: date || dueDate,
    time,
    type: type || 'task',
    subject,
    dueDate,
    priority: priority || 'medium',
    status: status || 'pending',
    completed: false
  };
  agenda.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/agenda/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, description, date, time, type, completed, subject, dueDate, priority, status } = req.body;
  
  const index = agenda.findIndex(item => item.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Item não encontrado' });
  }
  
  agenda[index] = { 
    ...agenda[index], 
    title: title || agenda[index].title,
    description: description || agenda[index].description,
    date: date || agenda[index].date,
    time: time || agenda[index].time,
    type: type || agenda[index].type,
    subject: subject || agenda[index].subject,
    dueDate: dueDate || agenda[index].dueDate,
    priority: priority || agenda[index].priority,
    status: status || agenda[index].status,
    completed: completed !== undefined ? (completed === 'true' || completed === true) : agenda[index].completed
  };
  res.json(agenda[index]);
});

app.patch('/api/agenda/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;
  
  const index = agenda.findIndex(item => item.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Item não encontrado' });
  }
  
  agenda[index] = { 
    ...agenda[index], 
    ...updates
  };
  res.json(agenda[index]);
});

app.delete('/api/agenda/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = agenda.findIndex(item => item.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Item não encontrado' });
  }
  
  agenda.splice(index, 1);
  res.status(204).send();
});

// Rotas para cronograma
app.get('/api/schedule', (req, res) => {
  res.json(schedule);
});

// Rotas para cronograma (nova API)
app.get('/api/cronograma', (req, res) => {
  res.json(lessons);
});

app.post('/api/cronograma', (req, res) => {
  const { subject, professor, dayOfWeek, startTime, endTime, room } = req.body;
  
  const subjectData = subjects.find(s => s.id === parseInt(subject));
  const professorData = professors.find(p => p.id === parseInt(professor));
  
  if (!subjectData || !professorData) {
    return res.status(400).json({ error: 'Disciplina ou professor não encontrado' });
  }
  
  const newLesson = {
    id: lessons.length + 1,
    subject: parseInt(subject),
    professor: parseInt(professor),
    dayOfWeek,
    startTime,
    endTime,
    room
  };
  
  lessons.push(newLesson);
  res.status(201).json(newLesson);
});

app.put('/api/cronograma/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { subject, professor, dayOfWeek, startTime, endTime, room } = req.body;
  
  const lessonIndex = lessons.findIndex(l => l.id === id);
  if (lessonIndex === -1) {
    return res.status(404).json({ error: 'Aula não encontrada' });
  }
  
  const subjectData = subjects.find(s => s.id === parseInt(subject));
  const professorData = professors.find(p => p.id === parseInt(professor));
  
  if (!subjectData || !professorData) {
    return res.status(400).json({ error: 'Disciplina ou professor não encontrado' });
  }
  
  lessons[lessonIndex] = {
    ...lessons[lessonIndex],
    subject: parseInt(subject),
    professor: parseInt(professor),
    dayOfWeek,
    startTime,
    endTime,
    room
  };
  
  res.json(lessons[lessonIndex]);
});

app.delete('/api/cronograma/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = lessons.findIndex(l => l.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Aula não encontrada' });
  }
  
  lessons.splice(index, 1);
  res.status(204).send();
});

app.post('/api/schedule', (req, res) => {
  const { subjectId, professorId, day, time, type, location } = req.body;
  
  const subject = subjects.find(s => s.id === parseInt(subjectId));
  const professor = professors.find(p => p.id === parseInt(professorId));
  
  if (!subject || !professor) {
    return res.status(400).json({ error: 'Disciplina ou professor não encontrado' });
  }
  
  const newClass = {
    id: schedule.length + 1,
    day,
    time,
    subject: subject.name,
    type,
    location,
    professor: professor.name,
    color: subject.color,
    subjectId: subject.id,
    professorId: professor.id
  };
  
  schedule.push(newClass);
  res.status(201).json(newClass);
});

app.put('/api/schedule/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { subjectId, professorId, day, time, type, location } = req.body;
  
  const classIndex = schedule.findIndex(c => c.id === id);
  if (classIndex === -1) {
    return res.status(404).json({ error: 'Aula não encontrada' });
  }
  
  const subject = subjects.find(s => s.id === parseInt(subjectId));
  const professor = professors.find(p => p.id === parseInt(professorId));
  
  if (!subject || !professor) {
    return res.status(400).json({ error: 'Disciplina ou professor não encontrado' });
  }
  
  schedule[classIndex] = {
    ...schedule[classIndex],
    day,
    time,
    subject: subject.name,
    type,
    location,
    professor: professor.name,
    color: subject.color,
    subjectId: subject.id,
    professorId: professor.id
  };
  
  res.json(schedule[classIndex]);
});

app.delete('/api/schedule/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = schedule.findIndex(c => c.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Aula não encontrada' });
  }
  
  schedule.splice(index, 1);
  res.status(204).send();
});

// Rotas para páginas HTML
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
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});