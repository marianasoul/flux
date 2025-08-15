import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const taskStatusEnum = pgEnum('task_status', ['Pendente', 'Em Andamento', 'Concluído']);
export const classTypeEnum = pgEnum('class_type', ['Aula Expositiva', 'Laboratório', 'SBE', 'TBL']);
export const dayOfWeekEnum = pgEnum('day_of_week', ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']);

// Subjects table
export const subjects = pgTable("subjects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code"),
  color: text("color").notNull().default('#2563EB'),
  semester: integer("semester").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Classes table (fixed weekly schedule)
export const classes = pgTable("classes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: varchar("subject_id").notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  dayOfWeek: dayOfWeekEnum("day_of_week").notNull(),
  startTime: text("start_time").notNull(), // Format: "HH:MM"
  endTime: text("end_time").notNull(), // Format: "HH:MM"
  type: classTypeEnum("type").notNull(),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tasks table (dynamic study tasks)
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  subjectId: varchar("subject_id").references(() => subjects.id, { onDelete: 'cascade' }),
  classId: varchar("class_id").references(() => classes.id, { onDelete: 'set null' }),
  status: taskStatusEnum("status").notNull().default('Pendente'),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Grades table
export const grades = pgTable("grades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: varchar("subject_id").notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  examName: text("exam_name").notNull(),
  score: decimal("score", { precision: 4, scale: 2 }).notNull(),
  maxScore: decimal("max_score", { precision: 4, scale: 2 }).notNull().default('10.00'),
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull().default('1.00'), // Weight as percentage
  examDate: timestamp("exam_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertSubjectSchema = createInsertSchema(subjects).omit({
  id: true,
  createdAt: true,
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGradeSchema = createInsertSchema(grades).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertGrade = z.infer<typeof insertGradeSchema>;

export type Subject = typeof subjects.$inferSelect;
export type Class = typeof classes.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Grade = typeof grades.$inferSelect;

// Extended types for API responses
export type ClassWithSubject = Class & {
  subject: Subject;
};

export type TaskWithSubject = Task & {
  subject: Subject | null;
  class: Class | null;
};

export type GradeWithSubject = Grade & {
  subject: Subject;
};

export type SubjectWithStats = Subject & {
  completedTasks: number;
  totalTasks: number;
  averageGrade: number | null;
  weeklyClasses: number;
};
