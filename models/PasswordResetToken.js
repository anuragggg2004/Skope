import mongoose from 'mongoose'
import crypto from 'crypto'

const PasswordResetTokenSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    // Automatically delete expired tokens from MongoDB
    index: { expireAfterSeconds: 0 }
  }
}, { timestamps: true })

// Generate a secure random token
PasswordResetTokenSchema.statics.generateToken = function () {
  return crypto.randomBytes(32).toString('hex')
}

export default mongoose.model('PasswordResetToken', PasswordResetTokenSchema)
