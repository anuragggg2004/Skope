import mongoose from 'mongoose'

const FeedbackSchema = new mongoose.Schema({
  userName: {
    type: String,
    default: 'Anonymous'
  },
  email: {
    type: String,
    default: ''
  },
  userId: {
    type: String,
    default: null
  },
  type: {
    type: String,
    enum: ['bug', 'feature_request', 'general', 'complaint', 'ai_quality', 'college_issue', 'ui_ux'],
    default: 'general'
  },
  message: {
    type: String,
    required: true,
    maxlength: 2000
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['new', 'reviewed', 'in_progress', 'resolved', 'dismissed'],
    default: 'new',
    index: true
  },
  internalNotes: {
    type: String,
    default: ''
  },
  resolvedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true })

export default mongoose.model('Feedback', FeedbackSchema)
