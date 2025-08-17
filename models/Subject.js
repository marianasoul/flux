import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  workload: {
    type: Number,
    required: true,
    min: 0
  },
  color: {
    type: String,
    default: '#3b82f6'
  },
  semester: {
    type: String,
    default: '2024.1'
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Subject', subjectSchema);