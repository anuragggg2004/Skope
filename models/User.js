import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  displayName: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    required: true,
    index: true
  },
  stream: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'banned'],
    default: 'active',
    index: true
  },
  signupDate: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  reportsGenerated: {
    type: Number,
    default: 0
  },
  pdfDownloaded: {
    type: Boolean,
    default: false
  },
  conversationCount: {
    type: Number,
    default: 0
  },
  provider: {
    type: String,
    enum: ['email', 'google', 'anonymous'],
    default: 'email'
  }
}, { timestamps: true })

export default mongoose.model('User', UserSchema)
