import express from "express";
import type { Express, Request, Response } from "express";
import { createServer, Server } from "http";
import { storage } from "./storage.ts";
import { insertSubjectSchema, insertClassSchema, insertTaskSchema, insertGradeSchema } from "../shared/schema.ts";
import { z } from "zod";
import bcrypt from "bcryptjs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Usuários em memória (substituir por banco em produção)
  const users: any[] = [];
  // Usuário padrão para acesso inicial
  users.push({
    id: '1',
    name: 'admin',
    email: 'admin@admin.com',
    password: await bcrypt.hash('admin123', 10),
    semester: 1
  });

  // Cadastro de usuário
  app.post("/api/register", async (req, res) => {
    try {
      const { name, email, password, semester } = req.body;
      if (!name || !email || !password || !semester) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
      }
      if (users.find(u => u.email === email)) {
        return res.status(409).json({ error: "E-mail já cadastrado." });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = { id: Date.now().toString(), name, email, password: hashedPassword, semester };
      users.push(user);
      res.status(201).json({ message: "Usuário cadastrado com sucesso." });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: "Erro interno do servidor." });
    }
  });

  // Login de usuário
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
      }
      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ error: "Usuário não encontrado." });
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Senha incorreta." });
      }
      // Simples token (substituir por JWT em produção)
      res.json({ message: "Login realizado com sucesso.", user: { id: user.id, name: user.name, email: user.email, semester: user.semester } });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: "Erro interno do servidor." });
    }
  });
  // Subjects routes
  app.get("/api/subjects", async (req, res) => {
    try {
      const subjects = await storage.getSubjects();
      res.json(subjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      res.status(500).json({ error: "Failed to fetch subjects" });
    }
  });

  app.get("/api/subjects/stats", async (req, res) => {
    try {
      const subjectsWithStats = await storage.getSubjectsWithStats();
      res.json(subjectsWithStats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subjects with stats" });
    }
  });

  app.get("/api/subjects/:id", async (req, res) => {
    try {
      const subject = await storage.getSubject(req.params.id);
      if (!subject) {
        return res.status(404).json({ error: "Subject not found" });
      }
      res.json(subject);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subject" });
    }
  });

  app.post("/api/subjects", async (req, res) => {
    try {
      const validatedData = insertSubjectSchema.parse(req.body);
      const subject = await storage.createSubject(validatedData);
      res.status(201).json(subject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create subject" });
    }
  });

  app.put("/api/subjects/:id", async (req, res) => {
    try {
      const validatedData = insertSubjectSchema.partial().parse(req.body);
      const subject = await storage.updateSubject(req.params.id, validatedData);
      if (!subject) {
        return res.status(404).json({ error: "Subject not found" });
      }
      res.json(subject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update subject" });
    }
  });

  app.delete("/api/subjects/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSubject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Subject not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete subject" });
    }
  });

  // Classes routes
  app.get("/api/classes", async (req, res) => {
    try {
      const classes = await storage.getClasses();
      res.json(classes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch classes" });
    }
  });

  app.get("/api/classes/:id", async (req, res) => {
    try {
      const classItem = await storage.getClass(req.params.id);
      if (!classItem) {
        return res.status(404).json({ error: "Class not found" });
      }
      res.json(classItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch class" });
    }
  });

  app.post("/api/classes", async (req, res) => {
    try {
      const validatedData = insertClassSchema.parse(req.body);
      const classItem = await storage.createClass(validatedData);
      res.status(201).json(classItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create class" });
    }
  });

  app.put("/api/classes/:id", async (req, res) => {
    try {
      const validatedData = insertClassSchema.partial().parse(req.body);
      const classItem = await storage.updateClass(req.params.id, validatedData);
      if (!classItem) {
        return res.status(404).json({ error: "Class not found" });
      }
      res.json(classItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update class" });
    }
  });

  app.delete("/api/classes/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteClass(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Class not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete class" });
    }
  });

  // Tasks routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const { status } = req.query;
      let tasks;
      
      if (status && typeof status === 'string') {
        tasks = await storage.getTasksByStatus(status as 'Pendente' | 'Em Andamento' | 'Concluído');
      } else {
        tasks = await storage.getTasks();
      }
      
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/urgent", async (req, res) => {
    try {
      const urgentTasks = await storage.getUrgentTasks();
      res.json(urgentTasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch urgent tasks" });
    }
  });

  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch task" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const validatedData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(req.params.id, validatedData);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTask(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Grades routes
  app.get("/api/grades", async (req, res) => {
    try {
      const grades = await storage.getGrades();
      res.json(grades);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch grades" });
    }
  });

  app.get("/api/grades/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const recentGrades = await storage.getRecentGrades(limit);
      res.json(recentGrades);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent grades" });
    }
  });

  app.get("/api/grades/average/overall", async (req, res) => {
    try {
      const average = await storage.calculateOverallAverage();
      res.json({ average });
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate overall average" });
    }
  });

  app.get("/api/grades/average/:subjectId", async (req, res) => {
    try {
      const average = await storage.calculateSubjectAverage(req.params.subjectId);
      res.json({ average });
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate subject average" });
    }
  });

  app.get("/api/grades/:id", async (req, res) => {
    try {
      const grade = await storage.getGrade(req.params.id);
      if (!grade) {
        return res.status(404).json({ error: "Grade not found" });
      }
      res.json(grade);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch grade" });
    }
  });

  app.post("/api/grades", async (req, res) => {
    try {
      const validatedData = insertGradeSchema.parse(req.body);
      const grade = await storage.createGrade(validatedData);
      res.status(201).json(grade);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create grade" });
    }
  });

  app.put("/api/grades/:id", async (req, res) => {
    try {
      const validatedData = insertGradeSchema.partial().parse(req.body);
      const grade = await storage.updateGrade(req.params.id, validatedData);
      if (!grade) {
        return res.status(404).json({ error: "Grade not found" });
      }
      res.json(grade);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update grade" });
    }
  });

  app.delete("/api/grades/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteGrade(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Grade not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete grade" });
    }
  });

  // Study Plans endpoints
  app.get('/api/study-plans', async (req, res) => {
    try {
      const studyPlans = await storage.getStudyPlans();
      res.json(studyPlans);
    } catch (error) {
      console.error('Error fetching study plans:', error);
      res.status(500).json({ error: 'Failed to fetch study plans' });
    }
  });

  app.post('/api/study-plans/:classId', async (req, res) => {
    try {
      const { classId } = req.params;
      const studyPlan = await storage.createOrUpdateStudyPlan(classId, req.body);
      res.status(201).json(studyPlan);
    } catch (error) {
      console.error('Error creating/updating study plan:', error);
      res.status(500).json({ error: 'Failed to save study plan' });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const pendingTasks = await storage.getTasksByStatus('Pendente');
      const inProgressTasks = await storage.getTasksByStatus('Em Andamento');
      const allTasks = await storage.getTasks();
      const completedTasks = await storage.getTasksByStatus('Concluído');
      const overallAverage = await storage.calculateOverallAverage();
      const classes = await storage.getClasses();
      
      // Calculate weekly progress
      const totalTasks = allTasks.length;
      const completed = completedTasks.length;
      const weeklyProgress = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

      // Count weekly classes (assuming all classes happen weekly)
      const weeklyClasses = classes.length;

      const stats = {
        pendingTasks: pendingTasks.length,
        generalAverage: overallAverage || 0,
        weeklyClasses,
        weeklyProgress,
        totalTasks: allTasks.length,
        completedTasks: completed,
        inProgressTasks: inProgressTasks.length,
      };

      res.json(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
