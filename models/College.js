import mongoose from 'mongoose'

const CollegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  state: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: '',
    index: true
  },
  type: {
    type: String,
    enum: ['IIT', 'NIT', 'IIIT', 'Central University', 'Private', 'Deemed', 'Design', 'Law', 'Management', 'Medical', 'Other'],
    default: 'Other'
  },
  websiteUrl: {
    type: String,
    default: ''
  },
  courses: {
    type: [String],
    default: []
  },
  cutoffRank: {
    type: Number,
    default: null
  },
  avgPlacementPct: {
    type: Number,
    default: null
  },
  avgSalaryLPA: {
    type: Number,
    default: null
  },
  reviewScore: {
    type: Number,
    default: null,
    min: 1,
    max: 5
  },
  keyStrengths: {
    type: String,
    default: ''
  },
  hiddenGemNote: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['verified', 'unverified', 'hidden_gem', 'unconventional'],
    default: 'unverified',
    index: true
  },
  whyRecommended: {
    type: [String],
    default: []
  },
  timesRecommended: {
    type: Number,
    default: 0
  },
  // Imported from RAG knowledge base?
  importedFromRAG: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

export default mongoose.model('College', CollegeSchema)
