import { type Subject, type Class, type Task, type Grade, type StudyPlan, type InsertSubject, type InsertClass, type InsertTask, type InsertGrade, type InsertStudyPlan, type ClassWithSubject, type TaskWithSubject, type GradeWithSubject, type SubjectWithStats } from "../shared/schema.ts";
import { randomUUID } from "crypto";

export interface IStorage {
  // Subjects
  getSubjects(): Promise<Subject[]>;
  getSubject(id: string): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: string, subject: Partial<InsertSubject>): Promise<Subject | undefined>;
  deleteSubject(id: string): Promise<boolean>;
  getSubjectsWithStats(): Promise<SubjectWithStats[]>;

  // Classes
  getClasses(): Promise<ClassWithSubject[]>;
  getClass(id: string): Promise<ClassWithSubject | undefined>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: string, classData: Partial<InsertClass>): Promise<Class | undefined>;
  deleteClass(id: string): Promise<boolean>;
  getClassesBySubject(subjectId: string): Promise<ClassWithSubject[]>;

  // Tasks
  getTasks(): Promise<TaskWithSubject[]>;
  getTask(id: string): Promise<TaskWithSubject | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  getTasksBySubject(subjectId: string): Promise<TaskWithSubject[]>;
  getTasksByStatus(status: 'Pendente' | 'Em Andamento' | 'Concluído'): Promise<TaskWithSubject[]>;
  getUrgentTasks(): Promise<TaskWithSubject[]>;

  // Grades
  getGrades(): Promise<GradeWithSubject[]>;
  getGrade(id: string): Promise<GradeWithSubject | undefined>;
  createGrade(grade: InsertGrade): Promise<Grade>;
  updateGrade(id: string, grade: Partial<InsertGrade>): Promise<Grade | undefined>;
  deleteGrade(id: string): Promise<boolean>;
  getGradesBySubject(subjectId: string): Promise<GradeWithSubject[]>;
  getRecentGrades(limit: number): Promise<GradeWithSubject[]>;
  calculateSubjectAverage(subjectId: string): Promise<number | null>;
  calculateOverallAverage(): Promise<number | null>;
  
  // Study Plans
  getStudyPlans(): Promise<StudyPlan[]>;
  getStudyPlan(classId: string): Promise<StudyPlan | undefined>;
  createOrUpdateStudyPlan(classId: string, plan: Partial<InsertStudyPlan>): Promise<StudyPlan>;
}

export class MemStorage implements IStorage {
  private subjects: Map<string, Subject> = new Map();
  private classes: Map<string, Class> = new Map();
  private tasks: Map<string, Task> = new Map();
  private grades: Map<string, Grade> = new Map();
  private studyPlans: Map<string, StudyPlan> = new Map();

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample subjects
    const anatomia: Subject = {
      id: randomUUID(),
      name: "Anatomia",
      code: "ANA001",
      color: "#2563EB",
      semester: 6,
      createdAt: new Date(),
    };

    const fisiologia: Subject = {
      id: randomUUID(),
      name: "Fisiologia",
      code: "FIS001",
      color: "#059669",
      semester: 6,
      createdAt: new Date(),
    };

    const patologia: Subject = {
      id: randomUUID(),
      name: "Patologia",
      code: "PAT001",
      color: "#F59E0B",
      semester: 6,
      createdAt: new Date(),
    };

    const farmacologia: Subject = {
      id: randomUUID(),
      name: "Farmacologia",
      code: "FAR001",
      color: "#DC2626",
      semester: 6,
      createdAt: new Date(),
    };

    this.subjects.set(anatomia.id, anatomia);
    this.subjects.set(fisiologia.id, fisiologia);
    this.subjects.set(patologia.id, patologia);
    this.subjects.set(farmacologia.id, farmacologia);

    // Create sample classes
    const classes: Class[] = [
      {
        id: randomUUID(),
        subjectId: anatomia.id,
        dayOfWeek: "Segunda",
        startTime: "08:00",
        endTime: "10:00",
        type: "Laboratório",
        location: "Lab 1",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        subjectId: fisiologia.id,
        dayOfWeek: "Segunda",
        startTime: "14:00",
        endTime: "16:00",
        type: "TBL",
        location: "Sala 201",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        subjectId: patologia.id,
        dayOfWeek: "Terça",
        startTime: "08:00",
        endTime: "10:00",
        type: "Aula Expositiva",
        location: "Auditório",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        subjectId: farmacologia.id,
        dayOfWeek: "Quarta",
        startTime: "14:00",
        endTime: "16:00",
        type: "SBE",
        location: "Lab SBE",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        subjectId: anatomia.id,
        dayOfWeek: "Quinta",
        startTime: "08:00",
        endTime: "10:00",
        type: "Aula Expositiva",
        location: "Sala 101",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        subjectId: fisiologia.id,
        dayOfWeek: "Sexta",
        startTime: "08:00",
        endTime: "12:00",
        type: "Laboratório",
        location: "Lab 2",
        createdAt: new Date(),
      },
    ];

    classes.forEach(c => this.classes.set(c.id, c));

    // Create sample tasks
    const tasks: Task[] = [
      {
        id: randomUUID(),
        title: "Revisar Sistema Cardiovascular",
        description: "Estudar anatomia e fisiologia do coração e vasos sanguíneos",
        subjectId: anatomia.id,
        classId: null,
        status: "Em Andamento",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Relatório de Laboratório - Histologia",
        description: "Completar relatório sobre observações microscópicas",
        subjectId: anatomia.id,
        classId: null,
        status: "Pendente",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Estudar Farmacocinética",
        description: "Revisar absorção, distribuição, metabolismo e excreção de fármacos",
        subjectId: farmacologia.id,
        classId: null,
        status: "Pendente",
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Preparar Apresentação TBL",
        description: "Preparar caso clínico para discussão em equipe",
        subjectId: fisiologia.id,
        classId: null,
        status: "Concluído",
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ];

    tasks.forEach(t => this.tasks.set(t.id, t));

    // Create sample grades
    const grades: Grade[] = [
      {
        id: randomUUID(),
        subjectId: anatomia.id,
        examName: "Prova P1 - Anatomia Geral",
        score: "8.5",
        maxScore: "10.0",
        weight: "40.0",
        examDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        subjectId: fisiologia.id,
        examName: "Trabalho - Sistema Respiratório",
        score: "9.2",
        maxScore: "10.0",
        weight: "30.0",
        examDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        subjectId: farmacologia.id,
        examName: "Quiz - Farmacologia Básica",
        score: "7.8",
        maxScore: "10.0",
        weight: "20.0",
        examDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        subjectId: patologia.id,
        examName: "Seminário - Inflamação",
        score: "9.5",
        maxScore: "10.0",
        weight: "35.0",
        examDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        createdAt: new Date(),
      },
    ];

    grades.forEach(g => this.grades.set(g.id, g));
  }

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }

  async getSubject(id: string): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    const id = randomUUID();
    const newSubject: Subject = {
      ...subject,
      id,
      createdAt: new Date(),
    };
    this.subjects.set(id, newSubject);
    return newSubject;
  }

  async updateSubject(id: string, subject: Partial<InsertSubject>): Promise<Subject | undefined> {
    const existing = this.subjects.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...subject };
    this.subjects.set(id, updated);
    return updated;
  }

  async deleteSubject(id: string): Promise<boolean> {
    return this.subjects.delete(id);
  }

  async getSubjectsWithStats(): Promise<SubjectWithStats[]> {
    const subjects = Array.from(this.subjects.values());
    const stats = await Promise.all(subjects.map(async (subject) => {
      const tasks = Array.from(this.tasks.values()).filter(t => t.subjectId === subject.id);
      const completedTasks = tasks.filter(t => t.status === 'Concluído').length;
      const totalTasks = tasks.length;
      const averageGrade = await this.calculateSubjectAverage(subject.id);
      const weeklyClasses = Array.from(this.classes.values()).filter(c => c.subjectId === subject.id).length;

      return {
        ...subject,
        completedTasks,
        totalTasks,
        averageGrade,
        weeklyClasses,
      };
    }));
    return stats;
  }

  // Classes
  async getClasses(): Promise<ClassWithSubject[]> {
    const classes = Array.from(this.classes.values());
    return classes.map(c => ({
      ...c,
      subject: this.subjects.get(c.subjectId)!,
    })).filter(c => c.subject);
  }

  async getClass(id: string): Promise<ClassWithSubject | undefined> {
    const classItem = this.classes.get(id);
    if (!classItem) return undefined;

    const subject = this.subjects.get(classItem.subjectId);
    if (!subject) return undefined;

    return { ...classItem, subject };
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const id = randomUUID();
    const newClass: Class = {
      ...classData,
      id,
      createdAt: new Date(),
    };
    this.classes.set(id, newClass);
    return newClass;
  }

  async updateClass(id: string, classData: Partial<InsertClass>): Promise<Class | undefined> {
    const existing = this.classes.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...classData };
    this.classes.set(id, updated);
    return updated;
  }

  async deleteClass(id: string): Promise<boolean> {
    return this.classes.delete(id);
  }

  async getClassesBySubject(subjectId: string): Promise<ClassWithSubject[]> {
    const classes = Array.from(this.classes.values()).filter(c => c.subjectId === subjectId);
    const subject = this.subjects.get(subjectId);
    if (!subject) return [];

    return classes.map(c => ({ ...c, subject }));
  }

  // Tasks
  async getTasks(): Promise<TaskWithSubject[]> {
    const tasks = Array.from(this.tasks.values());
    return tasks.map(t => ({
      ...t,
      subject: t.subjectId ? this.subjects.get(t.subjectId) || null : null,
      class: t.classId ? this.classes.get(t.classId) || null : null,
    }));
  }

  async getTask(id: string): Promise<TaskWithSubject | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    return {
      ...task,
      subject: task.subjectId ? this.subjects.get(task.subjectId) || null : null,
      class: task.classId ? this.classes.get(task.classId) || null : null,
    };
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = randomUUID();
    const newTask: Task = {
      ...task,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: string, task: Partial<InsertTask>): Promise<Task | undefined> {
    const existing = this.tasks.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...task, updatedAt: new Date() };
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async getTasksBySubject(subjectId: string): Promise<TaskWithSubject[]> {
    const tasks = Array.from(this.tasks.values()).filter(t => t.subjectId === subjectId);
    const subject = this.subjects.get(subjectId);
    
    return tasks.map(t => ({
      ...t,
      subject: subject || null,
      class: t.classId ? this.classes.get(t.classId) || null : null,
    }));
  }

  async getTasksByStatus(status: 'Pendente' | 'Em Andamento' | 'Concluído'): Promise<TaskWithSubject[]> {
    const tasks = Array.from(this.tasks.values()).filter(t => t.status === status);
    return tasks.map(t => ({
      ...t,
      subject: t.subjectId ? this.subjects.get(t.subjectId) || null : null,
      class: t.classId ? this.classes.get(t.classId) || null : null,
    }));
  }

  async getUrgentTasks(): Promise<TaskWithSubject[]> {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const urgentTasks = Array.from(this.tasks.values())
      .filter(t => t.status !== 'Concluído')
      .filter(t => {
        if (!t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        return dueDate <= tomorrow;
      })
      .sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return dateA - dateB;
      });

    return urgentTasks.map(t => ({
      ...t,
      subject: t.subjectId ? this.subjects.get(t.subjectId) || null : null,
      class: t.classId ? this.classes.get(t.classId) || null : null,
    }));
  }

  // Grades
  async getGrades(): Promise<GradeWithSubject[]> {
    const grades = Array.from(this.grades.values());
    return grades.map(g => ({
      ...g,
      subject: this.subjects.get(g.subjectId)!,
    })).filter(g => g.subject);
  }

  async getGrade(id: string): Promise<GradeWithSubject | undefined> {
    const grade = this.grades.get(id);
    if (!grade) return undefined;

    const subject = this.subjects.get(grade.subjectId);
    if (!subject) return undefined;

    return { ...grade, subject };
  }

  async createGrade(grade: InsertGrade): Promise<Grade> {
    const id = randomUUID();
    const newGrade: Grade = {
      ...grade,
      id,
      createdAt: new Date(),
    };
    this.grades.set(id, newGrade);
    return newGrade;
  }

  async updateGrade(id: string, grade: Partial<InsertGrade>): Promise<Grade | undefined> {
    const existing = this.grades.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...grade };
    this.grades.set(id, updated);
    return updated;
  }

  async deleteGrade(id: string): Promise<boolean> {
    return this.grades.delete(id);
  }

  async getGradesBySubject(subjectId: string): Promise<GradeWithSubject[]> {
    const grades = Array.from(this.grades.values()).filter(g => g.subjectId === subjectId);
    const subject = this.subjects.get(subjectId);
    if (!subject) return [];

    return grades.map(g => ({ ...g, subject }));
  }

  async getRecentGrades(limit: number): Promise<GradeWithSubject[]> {
    const grades = Array.from(this.grades.values())
      .sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime())
      .slice(0, limit);

    return grades.map(g => ({
      ...g,
      subject: this.subjects.get(g.subjectId)!,
    })).filter(g => g.subject);
  }

  async calculateSubjectAverage(subjectId: string): Promise<number | null> {
    const grades = Array.from(this.grades.values()).filter(g => g.subjectId === subjectId);
    if (grades.length === 0) return null;

    const totalWeight = grades.reduce((sum, g) => sum + parseFloat(g.weight), 0);
    if (totalWeight === 0) return null;

    const weightedSum = grades.reduce((sum, g) => {
      const score = parseFloat(g.score);
      const maxScore = parseFloat(g.maxScore);
      const weight = parseFloat(g.weight);
      const normalizedScore = (score / maxScore) * 10; // Normalize to 0-10
      return sum + (normalizedScore * weight);
    }, 0);

    return Math.round((weightedSum / totalWeight) * 100) / 100;
  }

  async calculateOverallAverage(): Promise<number | null> {
    const subjects = Array.from(this.subjects.values());
    const averages = await Promise.all(subjects.map(s => this.calculateSubjectAverage(s.id)));
    const validAverages = averages.filter((avg): avg is number => avg !== null);

    if (validAverages.length === 0) return null;

    const sum = validAverages.reduce((acc, avg) => acc + avg, 0);
    return Math.round((sum / validAverages.length) * 100) / 100;
  }

  // Study Plans
  async getStudyPlans(): Promise<StudyPlan[]> {
    return Array.from(this.studyPlans.values());
  }

  async getStudyPlan(classId: string): Promise<StudyPlan | undefined> {
    return Array.from(this.studyPlans.values()).find(p => p.classId === classId);
  }

  async createOrUpdateStudyPlan(classId: string, planData: Partial<InsertStudyPlan>): Promise<StudyPlan> {
    const existingPlan = await this.getStudyPlan(classId);
    
    if (existingPlan) {
      const updated = { 
        ...existingPlan, 
        ...planData, 
        updatedAt: new Date() 
      };
      this.studyPlans.set(existingPlan.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const newPlan: StudyPlan = {
        id,
        classId,
        preStudy: planData.preStudy || null,
        postStudy: planData.postStudy || null,
        resources: planData.resources || null,
        notes: planData.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.studyPlans.set(id, newPlan);
      return newPlan;
    }
  }
}

export const storage = new MemStorage();
