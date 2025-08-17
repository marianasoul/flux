import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
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
  professor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professor'
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  location: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['Teórica', 'Prática', 'Seminário', 'Laboratório'],
    default: 'Teórica'
  },
  materials: [{
    name: String,
    url: String
  }],
  attended: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Lesson', lessonSchema);