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

// Hash password before save (async pre-hook, no next() needed)
AdminSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

// Compare password helper
AdminSchema.methods.comparePassword = function (plaintext) {
  return bcrypt.compare(plaintext, this.password)
}

export default mongoose.model('Admin', AdminSchema)
