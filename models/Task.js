import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ['baixa', 'média', 'alta'],
    default: 'média'
  },
  status: {
    type: String,
    enum: ['pendente', 'em_progresso', 'concluída'],
    default: 'pendente'
  },
  type: {
    type: String,
    enum: ['estudo', 'prova', 'trabalho', 'apresentação', 'relatório'],
    default: 'estudo'
  },
  estimatedHours: {
    type: Number,
    min: 0
  },
  actualHours: {
    type: Number,
    min: 0
  },
  notes: {
    type: String,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Middleware para atualizar completedAt quando completed for true
taskSchema.pre('save', function(next) {
  if (this.completed && !this.completedAt) {
    this.completedAt = new Date();
    this.status = 'concluída';
  } else if (!this.completed) {
    this.completedAt = undefined;
  }
  next();
});

export default mongoose.model('Task', taskSchema);