import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

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
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    default: null  // null for future OAuth or guest users
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
    enum: ['email', 'anonymous'],
    default: 'email'
  }
}, { timestamps: true })

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('passwordHash') || !this.passwordHash) return
  // Only hash if it doesn't look like an already-hashed value
  if (this.passwordHash.startsWith('$2')) return
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12)
})

// Compare plain password to stored hash
UserSchema.methods.comparePassword = async function (plainPassword) {
  if (!this.passwordHash) return false
  return bcrypt.compare(plainPassword, this.passwordHash)
}

export default mongoose.model('User', UserSchema)
