import mongoose from 'mongoose'

const SystemSettingsSchema = new mongoose.Schema({
  // Singleton settings doc (always only one)
  key: {
    type: String,
    default: 'global',
    unique: true,
    index: true
  },
  // API Controls
  geminiApiKey: {
    type: String,
    default: ''
  },
  openRouterApiKey: {
    type: String,
    default: ''
  },
  aiRateLimitPerTenMin: {
    type: Number,
    default: 15
  },
  panicMode: {
    type: Boolean,
    default: false
  },
  // Feature Flags
  ragSearchEnabled: {
    type: Boolean,
    default: true
  },
  pdfDownloadEnabled: {
    type: Boolean,
    default: true
  },
  collegeRecommendationsEnabled: {
    type: Boolean,
    default: true
  },
  aiConversationEnabled: {
    type: Boolean,
    default: true
  },
  userSignupsEnabled: {
    type: Boolean,
    default: true
  },
  // Moderation
  maxConversationExchanges: {
    type: Number,
    default: 20
  },
  moderationKeywords: {
    type: [String],
    default: []
  },
  // Admin
  adminEmail: {
    type: String,
    default: 'atiwary253@gmail.com'
  },
  ipWhitelist: {
    type: [String],
    default: []
  }
}, { timestamps: true })

export default mongoose.model('SystemSettings', SystemSettingsSchema)
