import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['founder', 'analytics', 'support', 'content'],
    default: 'support'
  },
  displayName: {
    type: String,
    default: ''
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

// Hash password before save
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare password helper
AdminSchema.methods.comparePassword = function (plaintext) {
  return bcrypt.compare(plaintext, this.password)
}

export default mongoose.model('Admin', AdminSchema)
