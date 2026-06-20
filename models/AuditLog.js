import mongoose from 'mongoose'

const AuditLogSchema = new mongoose.Schema({
  adminEmail: {
    type: String,
    required: true,
    index: true
  },
  adminRole: {
    type: String,
    default: 'unknown'
  },
  action: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    required: true,
    index: true
  },
  resourceId: {
    type: String,
    default: null
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  before: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  after: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  ipAddress: {
    type: String,
    default: 'unknown'
  }
}, { timestamps: true })

export default mongoose.model('AuditLog', AuditLogSchema)
