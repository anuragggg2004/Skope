// =============================================
// SKOPE — AI-Powered Career Discovery Platform
// Backend Server (Google Gemini API — FREE)
// =============================================
//
// DEVELOPMENT:
//   Terminal 1: npm run dev       (React on port 5173)
//   Terminal 2: node server.js    (Express on port 3000)
//   Vite proxies /api/* to localhost:3000
//
// PRODUCTION:
//   npm run build
//   node server.js
//   Express serves /dist folder
//
// ENVIRONMENT SETUP:
//   Create .env file with:
//   GEMINI_API_KEY=your_gemini_api_key_here
//   PORT=3000
//
// Get free API key at: https://aistudio.google.com/apikey
// =============================================

import './server/env.js'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Report from './models/Report.js'
import Admin from './models/Admin.js'
import AuditLog from './models/AuditLog.js'
import Feedback from './models/Feedback.js'
import SystemSettings from './models/SystemSettings.js'
import College from './models/College.js'
import User from './models/User.js'
import PasswordResetToken from './models/PasswordResetToken.js'
import fs from 'fs'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import compression from 'compression'
import { z } from 'zod'
import { authenticateUser, signUserToken } from './server/jwtAuth.js'
import { authenticateAdmin, requireRole, signAdminToken, logAudit } from './server/adminAuth.js'
import { sendPasswordResetEmail } from './server/emailService.js'


// =============================================
// LOCAL RAG KNOWLEDGE BASE INITIALIZATION
// =============================================
const kbPath = path.join(process.cwd(), 'data', 'knowledge_base.json')
let knowledgeBase = null
try {
  if (fs.existsSync(kbPath)) {
    knowledgeBase = JSON.parse(fs.readFileSync(kbPath, 'utf8'))
    console.log(`[RAG] Loaded knowledge base successfully. (${knowledgeBase.colleges?.length || 0} colleges, ${knowledgeBase.exams?.length || 0} exams)`)
  } else {
    console.warn(`[RAG] Knowledge base file not found at: ${kbPath}`)
  }
} catch (err) {
  console.error('[RAG] Error loading knowledge base:', err.message)
}

// RAG Retrieval Helper
function retrieveRAGContext(userMessage) {
  if (!knowledgeBase || !userMessage) return ''

  const query = userMessage.toLowerCase()
  const matchedColleges = []
  const matchedExams = []

  // Search colleges
  if (Array.isArray(knowledgeBase.colleges)) {
    for (const col of knowledgeBase.colleges) {
      if (col.keywords && col.keywords.some(kw => query.includes(kw.toLowerCase()))) {
        matchedColleges.push(col)
      }
    }
  }

  // Search exams
  if (Array.isArray(knowledgeBase.exams)) {
    for (const exam of knowledgeBase.exams) {
      if (exam.keywords && exam.keywords.some(kw => query.includes(kw.toLowerCase()))) {
        matchedExams.push(exam)
      }
    }
  }

  if (matchedColleges.length === 0 && matchedExams.length === 0) {
    return ''
  }

  let context = '\n\n[VERIFIED LOCAL RAG CONTEXT - INJECTED TRUTHS]\n'
  context += 'Use the following verified figures for any details in your response. Do not contradict them:\n'

  if (matchedColleges.length > 0) {
    context += '\nColleges Reference Data:\n'
    matchedColleges.forEach(col => {
      context += `- **${col.name}**:\n`
      context += `  * Fees: ${col.fees}\n`
      context += `  * Placements: ${col.placements}\n`
      context += `  * Admission Pathway: ${col.admission}\n`
      context += `  * Student Reddit Verdict: ${col.reddit_verdict}\n`
      context += `  * Caution: ${col.caution}\n`
    })
  }

  if (matchedExams.length > 0) {
    context += '\nEntrance Exams Reference Data:\n'
    matchedExams.forEach(exam => {
      context += `- **${exam.name}**:\n`
      context += `  * Eligibility: ${exam.eligibility}\n`
      context += `  * Format & Structure: ${exam.structure}\n`
      context += `  * Difficulty/Acceptance Rates: ${exam.difficulty}\n`
      context += `  * Accepting Colleges: ${exam.colleges_accepting}\n`
    })
  }

  return context
}

// Connect to MongoDB Atlas (if URI is provided)
const MONGODB_URI = process.env.MONGODB_URI
if (MONGODB_URI && !MONGODB_URI.includes('<password>')) {
  mongoose.connect(MONGODB_URI, { family: 4 })
    .then(async () => {
      console.log('Connected to MongoDB Atlas successfully.')
      await seedAdminData()
    })
    .catch((err) => console.error('MongoDB Atlas connection error:', err))
} else {
  console.log('MongoDB connection skipped: MONGODB_URI is not set or still has <password> placeholder.')
}

// =============================================
// STARTUP SEEDING — Admin, Settings, Colleges
// =============================================
async function seedAdminData() {
  try {
    // Seed founder admin account if none exists
    const adminCount = await Admin.countDocuments()
    if (adminCount === 0) {
      const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'admin123'
      if (!process.env.INITIAL_ADMIN_PASSWORD) {
        console.warn('[Seed] WARNING: INITIAL_ADMIN_PASSWORD env var is not set. Using default weak password!')
      }
      await Admin.create({
        email: 'atiwary253@gmail.com',
        password: adminPassword,
        role: 'founder',
        displayName: 'Anurag Tiwary'
      })
      console.log('[Seed] Founder admin account created: atiwary253@gmail.com')
    }

    // Seed global system settings singleton
    const settingsCount = await SystemSettings.countDocuments()
    if (settingsCount === 0) {
      await SystemSettings.create({ key: 'global' })
      console.log('[Seed] Default system settings created.')
    }

    // Seed colleges from RAG knowledge base
    const collegeCount = await College.countDocuments()
    if (collegeCount === 0 && knowledgeBase?.colleges?.length) {
      const docs = knowledgeBase.colleges.map(c => ({
        name: c.name || 'Unknown',
        state: c.state || '',
        city: c.location || c.city || '',
        type: c.type || 'Other',
        status: c.tier === 'hidden-gem' ? 'hidden_gem' : 'verified',
        importedFromRAG: true
      }))
      await College.insertMany(docs, { ordered: false }).catch(() => {})
      console.log(`[Seed] Seeded ${docs.length} colleges from knowledge base.`)
    }
  } catch (err) {
    console.error('[Seed] Error during startup seeding:', err.message)
  }
}

const app = express()

// Trust reverse proxy (needed for express-rate-limit on Render/proxies)
app.set('trust proxy', 1)

// 1. Enable secure HTTP headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com", "https://www.google.com", "https://www.gstatic.com", "https://apis.google.com", "https://accounts.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://api.fontshare.com", "https://www.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://hoirqrkdgbmvpwutwuwj-all.supabase.co", "https://capsule-render.vercel.app", "https://readme-typing-svg.herokuapp.com", "https://img.shields.io"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com", "https://openrouter.ai", "https://*.googleapis.com", "https://www.googleapis.com", "https://accounts.google.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://api.fontshare.com", "https://cdn.fontshare.com"],
      frameSrc: ["'self'", "https://www.google.com", "https://recaptcha.google.com", "https://accounts.google.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
}))

// 2. Enable response compression (gzip)
app.use(compression())

// 3. Prevent NoSQL query injection attacks
app.use(mongoSanitize())

// 4. Hardened CORS policy
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
]
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    try {
      const url = new URL(origin)
      const hostname = url.hostname
      const isAllowed = 
        allowedOrigins.includes(origin) ||
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.endsWith('.ngrok-free.dev') ||
        hostname.endsWith('anuraggg.tech') ||
        hostname.endsWith('onrender.com')
      if (isAllowed) {
        return callback(null, true)
      }
    } catch {}
    return callback(new Error('CORS policy does not allow access from this origin'), false)
  },
  credentials: true
}))

// 5. Parse request payloads with size limits
app.use(express.json({ limit: '50kb' }))

// 6. Rate Limiting Setup (Standard & AI-specific)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again later.' }
})
app.use('/api/', globalLimiter)

const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI request limit exceeded. Please wait a few minutes before trying again.' }
})
app.use('/api/generate-report', aiLimiter)
app.use('/api/what-if', aiLimiter)
app.use('/api/chat', aiLimiter)
app.use('/api/next-question', aiLimiter)

// Robust JSON parser with regex recovery for AI outputs
function parseAIResponseJSON(text) {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch (err) {
    console.warn('[AI] JSON.parse failed on direct text. Attempting regex extraction...')
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch (subErr) {
        console.error('[AI] Regex JSON extraction failed:', subErr.message)
      }
    }
    throw new Error('Failed to parse AI response as JSON: ' + err.message)
  }
}

// Zod request payload schemas
const AdaptiveQuestionsSchema = z.object({
  answers: z.object({
    q1: z.string().min(1, 'q1 answer is required'),
    q2: z.string().min(1, 'q2 answer is required'),
    q3: z.string().min(1, 'q3 answer is required')
  })
})

const NextQuestionSchema = z.object({
  answers: z.object({
    q1: z.string().min(1),
    q2: z.string().optional(),
    q3: z.string().optional(),
    q4: z.string().optional(),
    q5: z.string().optional()
  }).passthrough(),
  chatHistory: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'model']),
      content: z.string().min(1)
    })
  ).optional()
})

const GenerateReportSchema = z.object({
  phase1: z.object({
    q1: z.string().min(1),
    q2: z.string().min(1),
    q3: z.string().min(1),
    q4: z.string().optional(),
    q5: z.string().optional()
  }).passthrough(),
  phase2: z.record(z.string()).optional(),
  chatHistory: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'model']),
      content: z.string().min(1)
    })
  ).optional(),
  preferences: z.object({
    budget: z.string().min(1),
    cities: z.array(z.string()),
    ai_relevance: z.string().min(1),
    additional_note: z.string().optional()
  }).optional(),
  brutally_honest: z.boolean().optional()
})

const ChatSchema = z.object({
  message: z.string().min(1),
  pathreport: z.record(z.any()),
  history: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'model']),
      content: z.string().min(1)
    })
  ).optional()
})

const WhatIfSchema = z.object({
  scenario: z.string().min(1),
  pathreport: z.record(z.any())
})

const SaveReportSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  reportData: z.record(z.any())
})

const PORT = process.env.PORT || 3000
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const MODELS = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']

// Helper: fetch with retry on 429 (respects Gemini rate limits, but fails fast to fallback)
async function fetchWithRetry(url, options, retries = 2) {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, options)
    if (response.status === 429 && i < retries - 1) {
      // Fail fast for user experience: max 5 seconds wait
      let waitMs = 2000 
      try {
        const errBody = await response.clone().json()
        const retryDetail = errBody?.error?.details?.find(d => d['@type']?.includes('RetryInfo'))
        if (retryDetail?.retryDelay) {
          const parsed = parseInt(retryDetail.retryDelay)
          if (parsed > 0) waitMs = (parsed + 1) * 1000
        }
      } catch {}
      
      // If delay is too long, skip retry and throw to trigger OpenRouter fallback immediately
      if (waitMs > 5000) {
        console.log(`Rate limit delay is too long (${waitMs}ms), failing fast to trigger fallback...`)
        return response
      }

      console.log(`Rate limited, retrying in ${Math.round(waitMs / 1000)}s (attempt ${i + 2}/${retries})...`)
      await new Promise(r => setTimeout(r, waitMs))
      continue
    }
    return response
  }
}

// Centralized runner that tries models in order if rate limited, quota over, or token limit exceeded
async function callAIBase(payload) {
  let lastError = null
  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
    console.log(`[AI] Attempting generation with model: ${model}`)
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (GEMINI_API_KEY) {
        headers['x-goog-api-key'] = GEMINI_API_KEY
      }
      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errText = await response.text()
        console.error(`[AI] Model ${model} returned error status ${response.status}:`, errText)
        lastError = new Error(`Model ${model} returned ${response.status}: ${errText}`)
        continue // Try next model
      }

      const responseBody = await response.json()
      if (!responseBody.candidates || responseBody.candidates.length === 0) {
        console.error(`[AI] Model ${model} returned no candidates:`, JSON.stringify(responseBody))
        lastError = new Error(`Model ${model} returned no candidates`)
        continue // Try next model
      }

      const text = responseBody.candidates[0].content.parts[0].text
      if (!text) {
        console.error(`[AI] Model ${model} returned empty text:`, JSON.stringify(responseBody))
        lastError = new Error(`Model ${model} returned empty text`)
        continue // Try next model
      }

      console.log(`[AI] Successful response from model: ${model}`)
      return text
    } catch (err) {
      console.error(`[AI] Fetch / network error on model ${model}:`, err.message)
      lastError = err
      // Try next model
    }
  }

  // OpenRouter Fallback Integration
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
  if (OPENROUTER_API_KEY) {
    console.log(`[AI] All Gemini models failed or rate-limited. Activating OpenRouter fallback...`)
    try {
      // 1. Extract system instruction and messages from Gemini payload
      const systemPrompt = payload.system_instruction?.parts?.[0]?.text || ""
      const messages = []
      
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt })
      }
      
      // Parse contents from Gemini schema to OpenAI schema
      if (Array.isArray(payload.contents)) {
        payload.contents.forEach(content => {
          const role = content.role === 'model' ? 'assistant' : 'user'
          const text = content.parts?.[0]?.text || ""
          messages.push({ role, content: text })
        })
      }
      
      // 2. Build OpenRouter request payload with fallbacks
      const openRouterModels = [
        'meta-llama/llama-3.3-70b-instruct',
        'google/gemini-2.5-flash',
        'deepseek/deepseek-chat',
        'meta-llama/llama-3.3-70b-instruct:free'
      ]

      let openRouterError = null
      for (const openRouterModel of openRouterModels) {
        console.log(`[AI] Querying OpenRouter model: ${openRouterModel}`)
        try {
          const openRouterPayload = {
            model: openRouterModel,
            messages: messages,
            temperature: payload.generationConfig?.temperature || 0.7
          }
          
          if (payload.generationConfig?.responseMimeType === 'application/json') {
            openRouterPayload.response_format = { type: 'json_object' }
          }
          
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'HTTP-Referer': 'https://anuraggg.tech',
              'X-Title': 'Skope Platform'
            },
            body: JSON.stringify(openRouterPayload)
          })

          if (!response.ok) {
            const errText = await response.text()
            console.error(`[AI] OpenRouter model ${openRouterModel} returned error status ${response.status}:`, errText)
            openRouterError = new Error(`OpenRouter returned status ${response.status}: ${errText}`)
            continue
          }

          const responseBody = await response.json()
          const text = responseBody.choices?.[0]?.message?.content
          if (!text) {
            console.error(`[AI] OpenRouter model ${openRouterModel} returned empty text`)
            openRouterError = new Error(`Empty message returned from OpenRouter model ${openRouterModel}`)
            continue
          }

          console.log(`[AI] Successful response from OpenRouter (${openRouterModel})`)
          return text
        } catch (err) {
          console.error(`[AI] OpenRouter error for model ${openRouterModel}:`, err.message)
          openRouterError = err
        }
      }
      throw openRouterError || new Error("All OpenRouter models failed.")
    } catch (openRouterErr) {
      console.error(`[AI] OpenRouter fallback failed:`, openRouterErr.message)
      lastError = new Error(`Both Gemini and OpenRouter failed. Last OpenRouter error: ${openRouterErr.message}`)
    }
  }

  throw lastError || new Error("All available AI models (Gemini + OpenRouter) failed.")
}

// Reusable Gemini helper (single turn)
async function callAI(systemPrompt, userPrompt, useSearch = false) {
  const payload = {
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 16000
    }
  }

  if (useSearch) {
    payload.tools = [{ googleSearch: {} }]
  } else {
    payload.generationConfig.responseMimeType = 'application/json'
  }

  return await callAIBase(payload)
}

// Reusable Gemini helper (single turn, plain text response)
async function callAIText(systemPrompt, userPrompt) {
  const payload = {
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2000
    }
  }
  return await callAIBase(payload)
}

// Reusable Gemini helper for multi-turn chat
async function callAIChat(systemPrompt, messages) {
  // Convert OpenAI-style messages to Gemini format
  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }))

  const payload = {
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2000
    }
  }
  return await callAIBase(payload)
}

// =============================================
// COLLEGE ELIGIBILITY GUARDRAILS
// =============================================
const COLLEGE_ELIGIBILITY = {
  'IIT': { minJEEAdvancedRank: 15000, minJEEMainPercentile: 97, minBoard: 75, tier: 'aspirational' },
  'NIT_top': { minJEEMainPercentile: 92, minBoard: 75, tier: 'aspirational' },
  'NIT_mid': { minJEEMainPercentile: 82, minBoard: 70, tier: 'realistic' },
  'BITS': { minBITSATScore: 280, minBoard: 75, tier: 'aspirational' },
  'IIIT_top': { minJEEMainPercentile: 92, minBoard: 70, tier: 'aspirational' },
  'DAIICT': { minJEEMainPercentile: 75, minBoard: 70, tier: 'realistic' },
  'central_univ': { minCUETPercentile: 85, minBoard: 75, tier: 'realistic' },
  'private_top': { minBoard: 65, tier: 'safe' },
  'private_mid': { minBoard: 55, tier: 'safe' }
}

function getEligibilityRule(name, type) {
  const n = (name || '').toLowerCase()
  const t = (type || '').toLowerCase()
  if (n.includes('iit') || t.includes('iit')) return COLLEGE_ELIGIBILITY['IIT']
  if (n.includes('bits') || n.includes('birla institute')) return COLLEGE_ELIGIBILITY['BITS']
  if (n.includes('nit ') || t.includes('nit')) {
    if (n.includes('trichy') || n.includes('warangal') || n.includes('surathkal')) return COLLEGE_ELIGIBILITY['NIT_top']
    return COLLEGE_ELIGIBILITY['NIT_mid']
  }
  if (n.includes('iiit ') || t.includes('iiit')) {
    if (n.includes('hyderabad') || n.includes('bangalore') || n.includes('delhi')) return COLLEGE_ELIGIBILITY['IIIT_top']
  }
  if (n.includes('daiict')) return COLLEGE_ELIGIBILITY['DAIICT']
  if (n.includes('vit ') || n.includes('manipal') || n.includes('srm') || n.includes('thapar')) return COLLEGE_ELIGIBILITY['private_top']
  return null
}

function estimateProbability(profile, rule) {
  let score = 100
  if (profile.boardPercentage && profile.boardPercentage < rule.minBoard) {
    score -= (rule.minBoard - profile.boardPercentage) * 3
  }
  if (rule.minJEEMainPercentile && profile.jeePercentile) {
    if (profile.jeePercentile < rule.minJEEMainPercentile) {
      score -= (rule.minJEEMainPercentile - profile.jeePercentile) * 2
    }
  }
  if (rule.minJEEMainPercentile && !profile.jeePercentile) {
    score -= 40
  }
  return Math.max(0, Math.min(100, Math.round(score)))
}

function buildWarning(profile, rule, college) {
  const warnings = []
  if (rule.minBoard && profile.boardPercentage && profile.boardPercentage < rule.minBoard) {
    warnings.push(`Board eligibility cutoff is ${rule.minBoard}%. Your current boards are ${profile.boardPercentage}%.`)
  }
  if (rule.minJEEMainPercentile && (!profile.jeePercentile || profile.jeePercentile < rule.minJEEMainPercentile)) {
    warnings.push(`${college.name} requires JEE Main ~${rule.minJEEMainPercentile}th percentile. ${profile.jeePercentile ? 'Significant gap to close.' : 'Exam score needed.'}`)
  }
  return warnings.join(' ')
}

function validateColleges(colleges, profile) {
  return colleges.map(college => {
    const rule = getEligibilityRule(college.name, college.type)
    if (!rule) {
      return { ...college, classification: 'realistic', admissionProbability: 50, eligibilityWarning: null }
    }
    
    const meetsBoard = !rule.minBoard || (profile.boardPercentage >= rule.minBoard)
    const meetsJEE = !rule.minJEEMainPercentile || (profile.jeePercentile >= rule.minJEEMainPercentile)
    
    if (!meetsBoard || !meetsJEE) {
      return {
        ...college,
        classification: 'aspirational',
        eligibilityWarning: buildWarning(profile, rule, college),
        admissionProbability: estimateProbability(profile, rule),
        isImpossible: true
      }
    }
    
    return {
      ...college,
      classification: rule.tier,
      admissionProbability: estimateProbability(profile, rule),
      isImpossible: false
    }
  })
}

// =============================================
// ENDPOINT 0: POST /api/conversation-start
// =============================================
app.post('/api/conversation-start', async (req, res, next) => {
  try {
    const systemPrompt = `You are opening a conversation with an Indian Class 12 student. Ask exactly ONE question that will give you the most useful information first. The question should be open enough that their answer reveals multiple facts at once. Start with stream, marks, and immediate situation combined. Do NOT ask multiple things. Do NOT greet them with fluff. Get straight to the most useful question.`
    
    const responseText = await callAIText(systemPrompt, 'Generate the first question to start the career counseling session.')
    res.json({ question: responseText.trim().replace(/^"|"$/g, '') })
  } catch (error) {
    next(error)
  }
})

// =============================================
// ENDPOINT 1: POST /api/adaptive-questions
// =============================================
app.post('/api/adaptive-questions', async (req, res, next) => {
  try {
    const parsedBody = AdaptiveQuestionsSchema.parse(req.body)
    const { answers } = parsedBody

    const systemPrompt = `You are an expert Indian college and career counsellor with 20 years of experience. Generate exactly 5 deeply personalized follow-up questions based on the student's initial answers. Questions must feel conversational and specific to what this student said — never generic. Return ONLY valid JSON: { "questions": ["q1", "q2", "q3", "q4", "q5"] }`

    const userPrompt = `A Class 12 Indian student answered:
Stream and subjects: "${answers.q1}"
Hobbies and interests: "${answers.q2}"
Career thoughts: "${answers.q3}"

Generate 5 follow-up questions specific to this student.
If they mentioned a specific interest, dig into it.
If they mentioned confusion, address that tension.
Return as JSON: { "questions": ["...","...","...","...","..."] }`

    const responseText = await callAI(systemPrompt, userPrompt)
    const parsed = parseAIResponseJSON(responseText)
    res.json(parsed)
  } catch (error) {
    next(error)
  }
})

// =============================================
// ENDPOINT 1.5: POST /api/next-question
// =============================================
app.post('/api/next-question', async (req, res, next) => {
  try {
    const parsedBody = NextQuestionSchema.parse(req.body)
    const { answers, chatHistory } = parsedBody

    const systemPrompt = `You are an Indian career counsellor who has seen 10,000 students. You have zero patience for vague answers, false modesty, or students who have not thought about their own lives. You are the mirror they need, not the cheerleader they want.

YOUR TONE: Blunt. Direct. Zero fluff. You speak like a tough older sibling who loves you but will not lie to you. Every sentence must be purposeful.

SOUNDS LIKE:
- 'You said engineering but you have not written a single line of code. Explain that.'
- 'Your marks are 72%. Stop talking about IIT. What is your backup?'
- 'Most people doing MBA end up in Excel all day. Is that what you want?'
- 'You said you like startups. Name one startup founder you follow. Name one startup problem you understand.'
- 'Your parents want stability. What do YOU actually want?'

NEVER SOUNDS LIKE:
- 'Great question!'
- 'You can do it!'
- 'That is interesting.'
- 'All paths are valid!'
- Anything motivational or generic
- 'You have great potential'
- 'With hard work, anything is possible'
- 'You are on the right track'
- 'Great choice'
- 'Excellent foundation'

RULES — NON NEGOTIABLE:
- Ask exactly ONE sharp question. Never two.
- Every question must call out a specific thing THEY said. Never be generic.
- If they are vague, name the vagueness: 'You said you like computers. That means nothing. What specifically?'
- If they give an aspirational answer, challenge the reality: 'You said IIT. What is your JEE percentile right now?'
- Probe these in any order based on what is missing:
  * Have they built, made, or created ANYTHING real outside of schoolwork? Name it.
  * Do they learn on their own or only when forced by syllabus?
  * Is their career choice genuinely theirs or absorbed from parents/peers/society?
  * Will they relocate for opportunity or is geography a hard constraint?
  * What do their ACTUAL marks say about where they stand right now?
- Return ONLY the question text. No preamble. No quotes. No JSON.`

    const historyText = (chatHistory || []).map(msg => `${msg.role === 'assistant' ? 'Counsellor' : 'Student'}: ${msg.content}`).join('\n')

    const userPrompt = `STUDENT INITIAL PROFILE:
Stream and subjects: "${answers.q1}"
Hobbies and interests: "${answers.q2}"
Career thoughts: "${answers.q3}"
Board marks / CUET percentile: "${answers.q4 || 'Not provided'}"
Entrance exams given or planned: "${answers.q5 || 'Not provided'}"

CONVERSATION SO FAR:
${historyText ? historyText : '(No conversation yet. Ask the very first follow-up question based on their profile.)'}

Generate the next ONE question:`

    const responseText = await callAIText(systemPrompt, userPrompt)
    res.json({ question: responseText.trim().replace(/^"|"$/g, '') })
  } catch (error) {
    next(error)
  }
})

// =============================================
// ENDPOINT 2: POST /api/generate-report
// =============================================
app.post('/api/generate-report', async (req, res, next) => {
  try {
    const parsedBody = GenerateReportSchema.parse(req.body)
    const { phase1, phase2, chatHistory, preferences, brutally_honest } = parsedBody

    let phase2Text = ''
    if (chatHistory && chatHistory.length > 0) {
      for (let i = 0; i < chatHistory.length; i += 2) {
        phase2Text += `Q: ${chatHistory[i]?.content}\nA: ${chatHistory[i+1]?.content || ''}\n\n`
      }
    } else if (phase2) {
      phase2Text = Object.entries(phase2)
        .map(([q, a]) => `Q: ${q}\nA: ${a}`)
        .join('\n\n')
    }

    const preferencesText = preferences
      ? `\nSTUDENT PREFERENCES:
Preferred Budget: ${preferences.budget}
Preferred Cities: ${preferences.cities.join(', ')}
AI-era relevance preference: ${preferences.ai_relevance}
${preferences.additional_note ? `Additional notes: ${preferences.additional_note}` : ''}`
      : ''

    let systemPrompt = `You are an Indian career counsellor who has seen 10,000 students make the same mistakes. You are the one person in the room who will tell the truth. No motivation. No generic advice. Just the mirror.

YOUR TONE: Blunt. Direct. Specific. You sound like someone who has earned the right to be honest because they have seen what actually happens to students who choose wrong.

SOUNDS LIKE:
- 'You are not IIT material with 68%. That conversation is over. Here is what actually matters.'
- 'Your parents want a government job. That is a 10-year commitment with no income till age 28. Are you ready for that?'
- 'Everyone will tell you to do engineering. 60% of them end up in IT support or sales. Know this before you sign up.'
- 'This college nobody has heard of has a better placement rate than the famous one you are chasing.'

NEVER:
- 'What a great question!'
- 'You can do it!'
- 'Follow your passion!'
- 'All paths are valid!'
- Generic college praise without specific evidence
- 'You have great potential'
- 'With hard work, anything is possible'
- 'You're on the right track'
- 'Great choice'
- 'Excellent foundation'
- Every positive statement MUST be followed by specific evidence.

MARKS-BASED RESTRICTION — NON-NEGOTIABLE:
- IIT (any campus): ONLY if JEE Advanced rank is very high or likely. If no JEE score is provided or percentile < 97, classify as aspirational with an explicit warning.
- Top NITs: ONLY if JEE percentile > 90. Otherwise aspirational.
- BITS: ONLY if BITSAT score > 280 or student explicitly mentioned taking BITSAT.
- If board percentage < 65%, do NOT include any college requiring JEE Advanced as realistic.
Violating these rules will produce a report that destroys user trust.

COLLEGE SELECTION — STRICT RULES:
Return EXACTLY 15 colleges with this mandatory mix:
1. THREE famous/aspirational colleges realistic for their marks (IIT/NIT/BITS/DU top college). This is for parent confidence.
2. FOUR solid mid-tier colleges with proven placements but less brand name (Thapar, DAIICT, IIIT Hyderabad, PES, Manipal, VIT, Symbiosis, Christ, KIIT, UPES, etc.)
3. FIVE genuine hidden gems — colleges that are genuinely excellent but most students have never heard of. These are NOT second choices. These are often BETTER choices.
4. TWO unconventional options — a path most students in this situation would never think of but which fits them specifically.
5. ONE 'you need to hear this' safety — the college they can realistically get into given their actual marks and budget.

For hidden gems specifically, you MUST mark is_hidden_gem: true and include a reddit_verdict field. The reddit_verdict should be 1 sentence of what students actually say on Reddit/Quora about this place — the real insider opinion.

CRITICAL SPEED OPTIMIZATION RULES:
- Keep all explanations extremely brief and concise.
- For each college: "why_fits" must be exactly 1 short sentence, "caution" must be exactly 1 short sentence, and "reddit_verdict" must be exactly 1 short sentence.
- For each course: "why_this_course" must be exactly 1 short sentence.
- For each career: "why_it_fits" must be exactly 1 short sentence, "reality_check" must be exactly 1-2 short sentences, and "what_nobody_tells_you" must be exactly 1-2 short sentences.
This ensures fast API response times while delivering exactly 15 colleges and 15 courses.

YOUR EXPANDED KNOWLEDGE BASE:

HIDDEN GEM COLLEGES:
- Plaksha University Mohali: New-age tech university backed by 50+ IIT/Wharton alumni. 4-year tech program with project-based learning. Tiny class size. Strong US grad school sends. Reddit says: students actually build things here, not just study for placements.
- DAIICT Gandhinagar: One of the best CS colleges in India that almost nobody outside Gujarat talks about. 100% placement, smaller campus, no ragging culture, strong alumni. Reddit says: if you get this and a random NIT, take DAIICT.
- IIIT Hyderabad: Genuinely research-heavy, produces PhD students who go to top US programs. Famous for NLP and AI research. Reddit says: if you want to do ML research this is better than most IITs.
- Krea University Andhra Pradesh: Liberal arts + data science dual degree. First Indian university to do this properly. Small batches, strong faculty from IITs and US. Reddit says: if you are not a pure engineer mindset, this is the most intellectually alive campus in India.
- IISER Pune/Mohali/Kolkata: The best basic science education in India. IIT-equivalent difficulty of entrance. Produces the best scientists. Reddit says: if you love science for science, not engineering for salary, this is the only answer.
- Azim Premji University Bangalore: For students who care about social impact, policy, education. Tiny, excellent. Wipro founder-funded. Reddit says: this is for students who want to actually change something, not just earn.
- FLAME University Pune: Best liberal arts college outside Delhi. Extremely international in vibe. Reddit says: if you do not know what you want and hate the pressure of a single stream, go here.
- UPES Dehradun: Dominates energy, oil and gas, aviation, logistics careers. 95%+ placement in very niche high-paying sectors. Almost nobody from metros knows about it. Reddit says: if you get energy or aviation management here, your starting salary will shock metro kids.
- SRM Chennai: Yes it is a known name but the main campus Chennai programs are vastly underrated vs the Kattankulathur reputation. Medical + tech dual opportunities. Reddit says: the Chennai campus specific programs are much stronger than what people associate with SRM.
- NISER Bhubaneswar: Like IISER but even less known. Incredible science faculty. Reddit says: admission is brutal but worth it if you clear.
- Manipal Institute of Technology: Consistently underrated by Delhi/Mumbai students. Extremely international campus culture. Strong alumni network in Silicon Valley. Reddit says: if you are okay with South India, this beats most NITs for placements in non-core roles.
- BML Munjal University Haryana: Hero Group funded. Excellent industry connect. Small batch. Reddit says: placement is genuinely good and the Hero Group connection opens doors.
- Shiv Nadar University Greater Noida: Well-funded, research-oriented, IIT faculty quality. Reddit says: massively underrated, scholarship students get IIT-quality education at a fraction of cost.
- OP Jindal Global University Sonipat: Best law and liberal arts college for those not cracking NLU. Strong global faculty. Reddit says: if you want an American-style liberal education in India, this is it.
- TISS Mumbai: The gold standard for social work, HR, public health. Reddit says: HRM from TISS will get you HR roles that MBA students compete for.
- Symbiosis Pune: Multiple strong programs — design, media, law, management. Strong corporate connect. Reddit says: Symbiosis Law School is genuinely competitive with mid-NLUs.
- Pearl Academy Delhi: For design students who do not get NID. Industry-connected, fashion/UX/communication design. Reddit says: placement quality is genuinely good, especially for communication design.
- CEPT University Ahmedabad: The best architecture and planning school most people never think of. Reddit says: if you want to be an urban planner or sustainable architect, this is the only serious option.
- Srishti Manipal Bangalore: Best design college in South India. Experimental, research-led. Reddit says: if you got in here, do not turn it down for a regular engineering college.
- FTII Pune: The most respected film school in India. Alumni are in every major Bollywood and OTT production. Reddit says: hardest to get into but the most transformative if you do.
- Welcomgroup Manipal: The most respected hotel management school after IHM Delhi. Strong international externship placements. Reddit says: best hotel management college if you cannot crack IHM Pusa.
- LNUPE Gwalior: The only government sports science university in India. Produces coaches, sports managers, sports scientists. Reddit says: if you are serious about sports as a career, there is literally no other option.
- ICAR-IARI New Delhi: The best agricultural university in the country. Reddit says: agricultural research roles here pay better than most private sector biology jobs.

HIDDEN EXAMS:
- UCEED: Design entrance for IIT design programs.
- SEED: NIFT-level design entrance.
- IISER IAT: Gets you into one of India's best science institutions.
- NEST: Admission to NISER.
- TISS NET: Social work and HR graduate programs.
- NCHM JEE: Hotel management entrance.
- LSAT India: Law school admission test.
- IPMAT: Integrated MBA program at IIM Indore and Rohtak.
- XAT: Management entrance taken alongside CAT. Very few know that Xavier's programs are genuinely top-tier.
- IIHM eCHAT: Hotel management entrance for IIHM group.
- JGEEBILS: Entrance for JNCASR — one of India's best research institutes.
- CEED: Post-graduation design entrance at IITs.

HIDDEN CAREER FIELDS:
- Actuarial Science: Uses statistics to calculate risk for insurance companies. Starting salary 8-15 LPA. Exam path: Institute of Actuaries. Less than 500 qualified actuaries under 30 in India.
- Geomatics/Geoinformatics Engineering: Satellite mapping, GIS, drone surveys. Used by defence, urban planning, ISRO. Starting salary 6-12 LPA. Almost nobody applies.
- Clinical Data Management: Manages data from drug trials. 100% job guarantee with right certification. Pharma and CRO companies hire thousands. Starting salary 5-9 LPA.
- UX Research: Distinct from UI design. Deep user psychology research for product companies. Starting 8-15 LPA. Very few trained professionals.
- Sound Design: For film, gaming, podcasts, VR. Huge OTT boom demand. FTII and some private institutes offer it.

NEVER recommend a college that does not exist. Filter strictly by budget and city preferences.
Return ONLY valid JSON. No markdown, no text outside the JSON.

PERSONALIZATION MANDATE:
- profile_summary: Must reference at least 3 specific things this student said or did. Must sound like it could ONLY be about this student.
- key_insight: Must contain exactly 1 observation that could ONLY come from this specific conversation, not from a generic career guide.
- For each career: must explain how it solves or connects to a specific thing they said they care about.
- For each college: must reference their specific marks, budget, or stated interest.
- If any section reads generic enough to copy-paste for another student, you have failed.

REALITY CHECK MANDATE:
For each career path, include detailed pros, cons, and reality check guidelines. Do NOT soften.

KEY PERSPECTIVE RULES:
The key_perspective must be 2-4 sentences of dense, specific insight about Indian education/careers for THIS student.
Not motivational. Not generic. Something they did not know.`

    if (brutally_honest) {
      systemPrompt += `\n\nCRITICAL: BRUTALLY HONEST MODE IS ENABLED. You must push back harder, challenge delusional expectations, and point out any gaps or weak preparation scores directly and realistically. Do not sugarcoat any critiques. Speak with absolute candor.`
    }

    const userPrompt = `Student profile:

PHASE 1:
Stream and subjects: "${phase1.q1}"
Interests outside school: "${phase1.q2}"
Career thoughts: "${phase1.q3}"
Board marks / CUET percentile: "${phase1.q4 || 'Not provided'}"
Entrance exams given or planned: "${phase1.q5 || 'Not provided'}"

PHASE 2 ADAPTIVE ANSWERS:
${phase2Text}
${preferencesText}

Return this exact JSON structure:
{
  "profile_metrics": {
    "boardPercentage": 75,
    "jeePercentile": 67,
    "estimatedBudget": 500000
  },
  "preparedness_reality": {
    "score": 38,
    "label": "Underprepared",
    "what_it_means": "A score of 38/100 means your current preparation level does not match your stated goal. The gap is not impossible to close but requires a specific plan.",
    "what_needs_to_change": [
      "Specific change 1",
      "Specific change 2"
    ],
    "timeline": "If current trajectory continues without change, realistic colleges will be private universities."
  },
  "archetype": {
    "name": "One of: The Builder / The Explorer / The Creator / The Strategist / The Analyst / The Innovator / The Connector",
    "description": "2 sentences describing this profile's mindset.",
    "why_match": "1-2 sentences explaining why this student matches this based on their inputs."
  },
  "profile_summary": "4-5 lines referencing at least 3 specific things this student said. Must sound like it could ONLY describe this student.",
  "key_insight": "1 observation that could ONLY come from this conversation. Not generic career advice.",
  "key_perspective": "2-4 sentences of dense insight about Indian education/careers specific to this student's situation. Must make the student think: I did not know that. No motivational cliches.",
  "strengths": ["strength referencing something specific they said or did", "s2", "s3", "s4"],
  "gaps": ["gap with specific context from their conversation", "g2", "g3"],
  "careers": [
    {
      "title": "Career Title",
      "why_it_fits": "exactly 1 sentence explaining how this career connects to their interests",
      "entrance_exams": ["exam1", "exam2 — explain what this is and how hard it is compared to JEE if it is not widely known"],
      "earning_range": "realistic Indian market range (be honest, not optimistic)",
      "reality_check": "exactly 1-2 short sentences naming the blocker/risk. Do not soften.",
      "pros": ["Pro 1", "Pro 2"],
      "cons": ["Cons 1", "Cons 2"],
      "what_nobody_tells_you": "exactly 1-2 short sentences about what this career actually involves day-to-day."
    }
  ],
  "colleges": [
    {
      "name": "Full Official College Name",
      "location": "City Name",
      "type": "IIT/NIT/Central Univ/Private/Deemed",
      "college_tier": "famous / mid-tier / hidden-gem / unconventional / realistic-safety",
      "annual_fee": "e.g. 2.5 Lakhs per year",
      "why_fits": "exactly 1 sentence explaining why this fits them based on marks, budget, and location.",
      "caution": "exactly 1 sentence naming the real downside or trade-off.",
      "is_hidden_gem": false,
      "reddit_verdict": "exactly 1 sentence insider opinion from Reddit/Quora. Not marketing copy.",
      "internet_verdict": "Use Google Search to find out what people are currently saying about this college online in 1-2 sentences. Compare it against our database context.",
      "match_score": 92,
      "match_reasons": ["Reason 1 why it fits", "Reason 2"],
      "classification": "Will be populated by server, leave blank",
      "eligibilityWarning": "Will be populated by server, leave blank",
      "admissionProbability": 0
    }
  ],
  "recommended_courses": [
    {
      "course_name": "Specific degree or specialization name",
      "offered_at": "College Name, City",
      "duration": "4 years",
      "ai_relevance": "AI-proof / AI-augmented / Traditional",
      "why_this_course": "exactly 1 sentence why this specific course fits"
    }
  ],
  "hidden_courses": [
    {
      "course_name": "A course almost no student knows exists",
      "field": "e.g. Actuarial Science / Marine Engineering / Geomatics",
      "offered_at": "Best institute offering it",
      "why_nobody_knows": "Why this field is invisible to most students and parents",
      "market_demand": "How many jobs exist and what companies hire for this",
      "starting_salary": "Realistic starting salary in India",
      "how_to_enter": "Entrance exam or path to get into this field",
      "why_this_student": "Why this specific student should consider it based on what they said"
    }
  ],
  "hidden_careers": [
    {
      "title": "A career almost no student knows exists",
      "what_they_do": "1-2 sentences explaining what they actually do day-to-day.",
      "average_salary": "Realistic starting salary in India",
      "why_enjoy": "Why this specific student would enjoy this career."
    }
  ],
  "emerging_roles": [
    {
      "title": "Role Title",
      "description": "what this role actually does in 1-2 sentences",
      "why_relevant": "why this fits this specific student"
    }
  ],
  "future_self": {
    "career": "The career this simulation is based on (must be one of their top recommended careers)",
    "story": "A 300-500 word immersive day-in-the-life narrative at age 30, e.g. waking up in Bangalore or Mumbai, working in this career, and the tasks/challenges they face. Written in second-person ('You wake up...'). Be highly realistic, sensory, and detailed."
  },
  "confidence_score": {
    "percentage": 78,
    "explanation": "Why their career direction confidence is estimated at this level based on their inputs.",
    "actions": ["Specific action 1 to improve confidence", "Action 2", "Action 3"]
  }
}

COLLEGE SELECTION — MANDATORY:
Return EXACTLY 15 colleges with EXACTLY this mix:
- 3 famous/aspirational (realistic for their marks)
- 4 solid mid-tier with proven placements
- 5 hidden gems the student has probably never heard of (mark is_hidden_gem: true)
- 2 unconventional fits for their specific profile
- 1 realistic safety given their actual marks and budget

CRITICAL INTERNET GROUNDING INSTRUCTION:
For EVERY college you select from the database, YOU MUST use your Google Search capability to find out what the internet is CURRENTLY saying about them (e.g., student reviews, Reddit threads, recent news). Summarize this live internet sentiment in the "internet_verdict" field and compare it to the database context.

Return exactly 3 careers, exactly 15 colleges, exactly 15 regular recommended_courses, exactly 5 hidden_courses, exactly 5 hidden_careers, exactly 2 emerging roles.`

    const responseText = await callAI(systemPrompt, userPrompt, true)
    const parsed = parseAIResponseJSON(responseText)

    // Apply College Guardrails
    if (parsed.colleges && parsed.profile_metrics) {
      parsed.colleges = validateColleges(parsed.colleges, parsed.profile_metrics)
    }

    res.json(parsed)
  } catch (error) {
    next(error)
  }
})

// =============================================
// ENDPOINT 3: POST /api/chat
// =============================================
app.post('/api/chat', async (req, res, next) => {
  try {
    const parsedBody = ChatSchema.parse(req.body)
    const { message, pathreport, history } = parsedBody

    const messages = [
      ...(history || []),
      { role: "user", content: message }
    ]

    const ragContext = retrieveRAGContext(message)

    const systemPrompt = `You are a personal career counsellor for an Indian Class 12 student. You already generated their PathReport which is provided below. You know everything about them. Answer specifically based on their profile — never generic. If they share new information, tell them exactly what changes in their recommendations — name actual colleges and actual exams. Keep responses to 3-5 lines max unless they ask for detail. Sound like a knowledgeable senior who genuinely cares. Be direct, warm, honest. Zero fluff.${ragContext}

STUDENT PATHREPORT:
${JSON.stringify(pathreport)}`

    const responseText = await callAIChat(systemPrompt, messages)
    res.json({ reply: responseText })
  } catch (error) {
    next(error)
  }
})

// =============================================
// ENDPOINT 3.5: POST /api/what-if
// =============================================
app.post('/api/what-if', async (req, res, next) => {
  try {
    const parsedBody = WhatIfSchema.parse(req.body)
    const { scenario, pathreport } = parsedBody

    const systemPrompt = `You are an expert Indian career counsellor. The student has previously generated a PathReport, which is provided below.
The student wants to simulate a 'What-If' scenario: "${scenario}"

Analyze this scenario specifically for this student. Re-evaluate their careers, colleges, recommended courses, and emerging roles based on this scenario.
Return ONLY valid JSON in the exact same schema format as the original PathReport, reflecting ONLY the updated recommendations and calculations. Keep the archetype and profile summary, but customize them if needed to explain the shift. Ensure you return exactly 3 careers, exactly 15 colleges, exactly 15 regular recommended_courses, exactly 5 hidden_courses, exactly 5 hidden_careers, and exactly 2 emerging roles, all adjusted for the scenario.

CRITICAL SPEED OPTIMIZATION: Keep all explanations extremely brief and concise. For each college, the "why_fits", "caution", and "reddit_verdict" must be exactly 1 short sentence. For each course, "why_this_course" must be exactly 1 short sentence.

STUDENT ORIGINAL PATHREPORT:
${JSON.stringify(pathreport)}`

    const userPrompt = `Re-evaluate my PathReport under this scenario: "${scenario}".
What colleges, careers, and courses change? Return ONLY valid JSON in the same schema.`

    const responseText = await callAI(systemPrompt, userPrompt)
    const parsed = parseAIResponseJSON(responseText)
    res.json(parsed)
  } catch (error) {
    next(error)
  }
})

// =============================================
// ENDPOINT 4: POST /api/save-report
// =============================================
app.post('/api/save-report', authenticateUser, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database is currently unavailable. Please try again later.' })
    }

    const parsedBody = SaveReportSchema.parse(req.body)
    const { userId, email, reportData } = parsedBody

    if (req.user.uid !== userId) {
      return res.status(403).json({ error: 'Forbidden: You can only save your own report' })
    }

    // ── TRANSACTION: Save report + sync user record atomically ──
    const session = await mongoose.startSession()
    let savedReport
    try {
      session.startTransaction()

      // 1. Upsert the PathReport
      savedReport = await Report.findOneAndUpdate(
        { userId },
        { email, reportData, updatedAt: new Date() },
        { new: true, upsert: true, session }
      )

      // 2. Sync user record — mark report as generated
      await User.findOneAndUpdate(
        { userId },
        { $set: { email, lastActive: new Date() }, $inc: { reportsGenerated: 1 } },
        { upsert: true, session }
      )

      await session.commitTransaction()
      console.log(`[TX] PathReport saved atomically for: ${email} (${userId})`)
    } catch (txErr) {
      await session.abortTransaction()
      console.error('[TX] Transaction aborted — rolling back:', txErr.message)
      throw txErr
    } finally {
      session.endSession()
    }

    res.json({ success: true, report: savedReport })
  } catch (error) {
    next(error)
  }
})

// =============================================
// ENDPOINT 5: GET /api/get-report/:userId
// =============================================
app.get('/api/get-report/:userId', authenticateUser, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database is currently unavailable. Please try again later.' })
    }

    const { userId } = req.params
    
    // Security: enforce that authenticated user can only access their own data
    if (req.user.uid !== userId) {
      return res.status(403).json({ error: 'Forbidden: You can only access your own report' })
    }

    const report = await Report.findOne({ userId })

    if (!report) {
      return res.json({ success: true, found: false })
    }

    res.json({ success: true, found: true, reportData: report.reportData })
  } catch (error) {
    next(error)
  }
})

// =============================================
// USER AUTH ROUTES (MongoDB + JWT)
// =============================================

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many requests. Please wait 15 minutes and try again.' }
})

// POST /api/auth/signup — Create new account
app.post('/api/auth/signup', authLimiter, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database unavailable. Please try again.' })
    }

    const { email, password, name } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' })
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' })

    const normalEmail = email.toLowerCase().trim()

    // Check for existing account
    const existing = await User.findOne({ email: normalEmail })
    if (existing) return res.status(409).json({ error: 'An account with this email already exists. Please log in.' })

    // Generate a unique userId (standard secure UUID format)
    const { randomUUID } = await import('crypto')
    const uid = randomUUID()

    // Create user — passwordHash pre-save hook hashes it
    const user = new User({
      userId: uid,
      email: normalEmail,
      displayName: (name || '').trim(),
      passwordHash: password,   // pre-save hook bcrypts this
      provider: 'email',
      signupDate: new Date(),
      lastActive: new Date()
    })
    await user.save()

    const token = signUserToken({ uid, email: normalEmail, displayName: user.displayName })

    console.log(`[Auth] New user signed up: ${normalEmail}`)
    res.status(201).json({
      success: true,
      token,
      user: { uid, email: normalEmail, displayName: user.displayName }
    })
  } catch (err) { next(err) }
})

// POST /api/auth/login — Login existing account
app.post('/api/auth/login', authLimiter, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database unavailable. Please try again.' })
    }

    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' })

    const normalEmail = email.toLowerCase().trim()
    const user = await User.findOne({ email: normalEmail })

    if (!user) return res.status(401).json({ error: 'No account found with this email. Please sign up.' })
    if (user.status === 'banned') return res.status(403).json({ error: 'This account has been suspended.' })
    if (!user.passwordHash) return res.status(401).json({ error: 'This account does not have a password set. Please contact support.' })

    const valid = await user.comparePassword(password)
    if (!valid) return res.status(401).json({ error: 'Incorrect password. Please try again.' })

    // Update last active timestamp
    user.lastActive = new Date()
    await user.save()

    const token = signUserToken({ uid: user.userId, email: normalEmail, displayName: user.displayName })

    console.log(`[Auth] User logged in: ${normalEmail}`)
    res.json({
      success: true,
      token,
      user: { uid: user.userId, email: normalEmail, displayName: user.displayName }
    })
  } catch (err) { next(err) }
})

// GET /api/auth/me — Verify token and return current user
app.get('/api/auth/me', authenticateUser, async (req, res, next) => {
  try {
    const user = await User.findOne({ userId: req.user.uid }).select('-passwordHash')
    if (!user) return res.status(404).json({ error: 'User not found.' })
    res.json({ success: true, user })
  } catch (err) { next(err) }
})

// POST /api/auth/forgot-password — Generate token and send reset email
app.post('/api/auth/forgot-password', authLimiter, async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email is required.' })
    const normalEmail = email.toLowerCase().trim()

    // Always return success to prevent email enumeration
    const user = await User.findOne({ email: normalEmail })
    if (!user) {
      return res.json({ success: true, message: 'If an account exists, a reset link has been sent.' })
    }

    // Delete any existing tokens for this user
    await PasswordResetToken.deleteMany({ userId: user.userId })

    // Create new token — expires in 1 hour
    const rawToken = PasswordResetToken.generateToken()
    await PasswordResetToken.create({
      userId: user.userId,
      email: normalEmail,
      token: rawToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)  // 1 hour
    })

    // Build reset URL dynamically from request headers if APP_URL is not set
    const protocol = req.headers['x-forwarded-proto'] || req.protocol
    const host = req.headers['x-forwarded-host'] || req.headers.host
    const dynamicAppUrl = `${protocol}://${host}`
    const appUrl = process.env.APP_URL || dynamicAppUrl
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`

    // Send email
    await sendPasswordResetEmail({
      to: normalEmail,
      resetUrl,
      displayName: user.displayName || ''
    })

    console.log(`[Auth] Password reset email sent to: ${normalEmail}`)
    res.json({ success: true, message: 'A password reset link has been sent to your email.' })
  } catch (err) {
    console.error('[Auth] Forgot password error:', err.message)
    next(err)
  }
})

// POST /api/auth/reset-password/:token — Validate token and set new password
app.post('/api/auth/reset-password/:token', authLimiter, async (req, res, next) => {
  try {
    const { token } = req.params
    const { password } = req.body

    if (!token) return res.status(400).json({ error: 'Reset token is required.' })
    if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' })

    // Find and validate token
    const resetRecord = await PasswordResetToken.findOne({ token })
    if (!resetRecord) return res.status(400).json({ error: 'This reset link is invalid or has already been used.' })
    if (resetRecord.expiresAt < new Date()) {
      await PasswordResetToken.deleteOne({ token })
      return res.status(400).json({ error: 'This reset link has expired. Please request a new one.' })
    }

    // Find user and update password
    const user = await User.findOne({ userId: resetRecord.userId })
    if (!user) return res.status(400).json({ error: 'User not found.' })

    // The pre-save hook in User model will bcrypt this
    user.passwordHash = password
    await user.save()

    // Delete the used token
    await PasswordResetToken.deleteOne({ token })

    console.log(`[Auth] Password reset successful for: ${resetRecord.email}`)
    res.json({ success: true, message: 'Password updated successfully. You can now log in.' })
  } catch (err) { next(err) }
})

// GET /api/auth/verify-reset-token/:token — Check if a reset token is valid (for UI)
app.get('/api/auth/verify-reset-token/:token', async (req, res, next) => {
  try {
    const { token } = req.params
    const record = await PasswordResetToken.findOne({ token })
    if (!record || record.expiresAt < new Date()) {
      return res.json({ valid: false })
    }
    res.json({ valid: true, email: record.email })
  } catch (err) { next(err) }
})

// =============================================
// ADMIN API ROUTES
// =============================================

// Rate limiter for admin auth endpoint
const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts. Please wait.' }
})

// POST /api/admin/login
app.post('/api/admin/login', adminAuthLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const admin = await Admin.findOne({ email: email.toLowerCase() })
    if (!admin || !admin.isActive) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await admin.comparePassword(password)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    admin.lastLogin = new Date()
    await admin.save()

    const token = signAdminToken({ email: admin.email, role: admin.role, displayName: admin.displayName })
    res.json({ success: true, token, admin: { email: admin.email, role: admin.role, displayName: admin.displayName } })
  } catch (err) { next(err) }
})

// POST /api/admin/change-password
app.post('/api/admin/change-password', authenticateAdmin, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password required' })
    }

    const admin = await Admin.findOne({ email: req.admin.email })
    if (!admin) return res.status(404).json({ error: 'Admin not found' })

    const valid = await admin.comparePassword(currentPassword)
    if (!valid) return res.status(400).json({ error: 'Incorrect current password' })

    admin.password = newPassword // pre-save hook will hash it
    await admin.save()

    await logAudit({
      req,
      action: 'CHANGE_PASSWORD',
      resource: 'admin',
      resourceId: admin._id,
      details: { email: admin.email }
    })

    res.json({ success: true, message: 'Password changed successfully' })
  } catch (err) { next(err) }
})

// GET /api/admin/overview
app.get('/api/admin/overview', authenticateAdmin, requireRole('analytics'), async (req, res, next) => {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000)

    const [totalUsers, activeToday, activeWeek, totalReports, recentUsers, recentReports, recentFeedback, settings] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastActive: { $gte: today } }),
      User.countDocuments({ lastActive: { $gte: weekAgo } }),
      Report.countDocuments(),
      User.find().sort({ signupDate: -1 }).limit(10).select('displayName email stream city signupDate'),
      Report.find().sort({ createdAt: -1 }).limit(10).select('email createdAt'),
      Feedback.find({ status: 'new' }).sort({ createdAt: -1 }).limit(5).select('userName type message createdAt priority'),
      SystemSettings.findOne({ key: 'global' })
    ])

    // Signup trend (last 30 days)
    const signupTrend = await User.aggregate([
      { $match: { signupDate: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$signupDate' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])

    // Stream distribution
    const streamDist = await User.aggregate([
      { $group: { _id: '$stream', count: { $sum: 1 } } }
    ])

    res.json({
      metrics: {
        totalUsers,
        activeToday,
        activeWeek,
        totalReports,
        reportsThisWeek: await Report.countDocuments({ createdAt: { $gte: weekAgo } }),
        panicMode: settings?.panicMode || false
      },
      signupTrend,
      streamDistribution: streamDist,
      recentActivity: {
        users: recentUsers,
        reports: recentReports,
        feedback: recentFeedback
      }
    })
  } catch (err) { next(err) }
})

// GET /api/admin/users
app.get('/api/admin/users', authenticateAdmin, requireRole('analytics'), async (req, res, next) => {
  try {
    const { stream, status, search, page = 1, limit = 50 } = req.query
    const query = {}
    if (stream && stream !== 'all') query.stream = stream
    if (status && status !== 'all') query.status = status
    if (search) {
      const re = new RegExp(search, 'i')
      query.$or = [{ displayName: re }, { email: re }, { city: re }]
    }
    const skip = (Number(page) - 1) * Number(limit)
    const [users, total] = await Promise.all([
      User.find(query).sort({ signupDate: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query)
    ])
    res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) })
  } catch (err) { next(err) }
})

// GET /api/admin/users/:id
app.get('/api/admin/users/:id', authenticateAdmin, requireRole('analytics'), async (req, res, next) => {
  try {
    const user = await User.findOne({ userId: req.params.id })
    if (!user) return res.status(404).json({ error: 'User not found' })
    const report = await Report.findOne({ userId: req.params.id }).select('createdAt updatedAt')
    res.json({ success: true, user, hasReport: !!report, reportDate: report?.createdAt })
  } catch (err) { next(err) }
})

// POST /api/admin/users/:id/ban
app.post('/api/admin/users/:id/ban', authenticateAdmin, requireRole('founder'), async (req, res, next) => {
  try {
    const user = await User.findOne({ userId: req.params.id })
    if (!user) return res.status(404).json({ error: 'User not found' })
    const before = { status: user.status }
    user.status = user.status === 'banned' ? 'active' : 'banned'
    await user.save()
    await logAudit({ req, action: user.status === 'banned' ? 'BAN_USER' : 'UNBAN_USER', resource: 'user', resourceId: req.params.id, before, after: { status: user.status } })
    res.json({ success: true, user })
  } catch (err) { next(err) }
})

// DELETE /api/admin/users/:id
app.delete('/api/admin/users/:id', authenticateAdmin, requireRole('founder'), async (req, res, next) => {
  try {
    const user = await User.findOneAndDelete({ userId: req.params.id })
    if (!user) return res.status(404).json({ error: 'User not found' })
    await Report.deleteOne({ userId: req.params.id })
    await logAudit({ req, action: 'DELETE_USER', resource: 'user', resourceId: req.params.id, before: { email: user.email }, after: null })
    res.json({ success: true, message: 'User and associated report deleted' })
  } catch (err) { next(err) }
})

// GET /api/admin/reports
app.get('/api/admin/reports', authenticateAdmin, requireRole('analytics'), async (req, res, next) => {
  try {
    const { search, page = 1, limit = 50 } = req.query
    const query = {}
    if (search) {
      const re = new RegExp(search, 'i')
      query.$or = [{ email: re }, { userId: re }]
    }
    const skip = (Number(page) - 1) * Number(limit)
    const [reports, total] = await Promise.all([
      Report.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).select('userId email createdAt updatedAt'),
      Report.countDocuments(query)
    ])
    res.json({ success: true, reports, total })
  } catch (err) { next(err) }
})

// GET /api/admin/reports/:id
app.get('/api/admin/reports/:id', authenticateAdmin, requireRole('analytics'), async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
    if (!report) return res.status(404).json({ error: 'Report not found' })
    res.json({ success: true, report })
  } catch (err) { next(err) }
})

// PUT /api/admin/reports/:id
app.put('/api/admin/reports/:id', authenticateAdmin, requireRole('founder'), async (req, res, next) => {
  try {
    const old = await Report.findById(req.params.id)
    if (!old) return res.status(404).json({ error: 'Report not found' })
    const updated = await Report.findByIdAndUpdate(req.params.id, { reportData: req.body.reportData, updatedAt: new Date() }, { new: true })
    await logAudit({ req, action: 'EDIT_REPORT', resource: 'report', resourceId: req.params.id, before: { keys: Object.keys(old.reportData || {}) }, after: { keys: Object.keys(req.body.reportData || {}) } })
    res.json({ success: true, report: updated })
  } catch (err) { next(err) }
})

// DELETE /api/admin/reports/:id
app.delete('/api/admin/reports/:id', authenticateAdmin, requireRole('founder'), async (req, res, next) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id)
    if (!report) return res.status(404).json({ error: 'Report not found' })
    await logAudit({ req, action: 'DELETE_REPORT', resource: 'report', resourceId: req.params.id, before: { email: report.email }, after: null })
    res.json({ success: true, message: 'Report deleted' })
  } catch (err) { next(err) }
})

// GET /api/admin/colleges
app.get('/api/admin/colleges', authenticateAdmin, requireRole('content'), async (req, res, next) => {
  try {
    const { state, type, status, search, page = 1, limit = 100 } = req.query
    const query = {}
    if (state && state !== 'all') query.state = new RegExp(state, 'i')
    if (type && type !== 'all') query.type = type
    if (status && status !== 'all') query.status = status
    if (search) query.name = new RegExp(search, 'i')
    const skip = (Number(page) - 1) * Number(limit)
    const [colleges, total] = await Promise.all([
      College.find(query).sort({ name: 1 }).skip(skip).limit(Number(limit)),
      College.countDocuments(query)
    ])
    res.json({ success: true, colleges, total })
  } catch (err) { next(err) }
})

// POST /api/admin/colleges
app.post('/api/admin/colleges', authenticateAdmin, requireRole('content'), async (req, res, next) => {
  try {
    const college = await College.create(req.body)
    await logAudit({ req, action: 'CREATE_COLLEGE', resource: 'college', resourceId: college._id, after: { name: college.name } })
    res.status(201).json({ success: true, college })
  } catch (err) { next(err) }
})

// PUT /api/admin/colleges/:id
app.put('/api/admin/colleges/:id', authenticateAdmin, requireRole('content'), async (req, res, next) => {
  try {
    const old = await College.findById(req.params.id)
    if (!old) return res.status(404).json({ error: 'College not found' })
    const updated = await College.findByIdAndUpdate(req.params.id, req.body, { new: true })
    await logAudit({ req, action: 'EDIT_COLLEGE', resource: 'college', resourceId: req.params.id, before: { name: old.name, status: old.status }, after: { name: updated.name, status: updated.status } })
    res.json({ success: true, college: updated })
  } catch (err) { next(err) }
})

// DELETE /api/admin/colleges/:id
app.delete('/api/admin/colleges/:id', authenticateAdmin, requireRole('founder'), async (req, res, next) => {
  try {
    const college = await College.findByIdAndDelete(req.params.id)
    if (!college) return res.status(404).json({ error: 'College not found' })
    await logAudit({ req, action: 'DELETE_COLLEGE', resource: 'college', resourceId: req.params.id, before: { name: college.name }, after: null })
    res.json({ success: true, message: 'College deleted' })
  } catch (err) { next(err) }
})

// GET /api/admin/analytics
app.get('/api/admin/analytics', authenticateAdmin, requireRole('analytics'), async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const [streamDist, cityDist, dailySignups, totalUsers, totalReports, feedbackByType] = await Promise.all([
      User.aggregate([{ $group: { _id: '$stream', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      User.aggregate([{ $group: { _id: '$city', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
      User.aggregate([
        { $match: { signupDate: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$signupDate' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      User.countDocuments(),
      Report.countDocuments(),
      Feedback.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }])
    ])
    const conversionRate = totalUsers > 0 ? Math.round((totalReports / totalUsers) * 100) : 0
    res.json({ streamDistribution: streamDist, topCities: cityDist, dailySignups, totalUsers, totalReports, conversionRate, feedbackByType })
  } catch (err) { next(err) }
})

// GET /api/admin/feedback
app.get('/api/admin/feedback', authenticateAdmin, requireRole('support'), async (req, res, next) => {
  try {
    const { status, type, priority, page = 1, limit = 50 } = req.query
    const query = {}
    if (status && status !== 'all') query.status = status
    if (type && type !== 'all') query.type = type
    if (priority && priority !== 'all') query.priority = priority
    const skip = (Number(page) - 1) * Number(limit)
    const [feedback, total] = await Promise.all([
      Feedback.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Feedback.countDocuments(query)
    ])
    res.json({ success: true, feedback, total })
  } catch (err) { next(err) }
})

// PUT /api/admin/feedback/:id
app.put('/api/admin/feedback/:id', authenticateAdmin, requireRole('support'), async (req, res, next) => {
  try {
    const { status, priority, internalNotes } = req.body
    const old = await Feedback.findById(req.params.id)
    if (!old) return res.status(404).json({ error: 'Feedback not found' })
    const updates = {}
    if (status) { updates.status = status; if (status === 'resolved') updates.resolvedAt = new Date() }
    if (priority) updates.priority = priority
    if (internalNotes !== undefined) updates.internalNotes = internalNotes
    const updated = await Feedback.findByIdAndUpdate(req.params.id, updates, { new: true })
    await logAudit({ req, action: 'UPDATE_FEEDBACK', resource: 'feedback', resourceId: req.params.id, before: { status: old.status, priority: old.priority }, after: { status: updated.status, priority: updated.priority } })
    res.json({ success: true, feedback: updated })
  } catch (err) { next(err) }
})

// GET /api/admin/settings
app.get('/api/admin/settings', authenticateAdmin, requireRole('founder'), async (req, res, next) => {
  try {
    const settings = await SystemSettings.findOne({ key: 'global' })
    if (!settings) return res.status(404).json({ error: 'Settings not found' })
    const safe = settings.toObject()
    if (safe.geminiApiKey) safe.geminiApiKey = '••••••••' + safe.geminiApiKey.slice(-4)
    if (safe.openRouterApiKey) safe.openRouterApiKey = '••••••••' + safe.openRouterApiKey.slice(-4)
    res.json({ success: true, settings: safe })
  } catch (err) { next(err) }
})

// PUT /api/admin/settings
app.put('/api/admin/settings', authenticateAdmin, requireRole('founder'), async (req, res, next) => {
  try {
    const old = await SystemSettings.findOne({ key: 'global' })
    const allowed = ['aiRateLimitPerTenMin', 'panicMode', 'ragSearchEnabled', 'pdfDownloadEnabled', 'collegeRecommendationsEnabled', 'aiConversationEnabled', 'userSignupsEnabled', 'maxConversationExchanges', 'moderationKeywords', 'adminEmail', 'ipWhitelist']
    const updates = {}
    for (const k of allowed) { if (req.body[k] !== undefined) updates[k] = req.body[k] }
    const updated = await SystemSettings.findOneAndUpdate({ key: 'global' }, updates, { new: true })
    await logAudit({ req, action: 'UPDATE_SETTINGS', resource: 'settings', before: old ? Object.fromEntries(allowed.map(k => [k, old[k]])) : {}, after: updates })
    res.json({ success: true, settings: updated })
  } catch (err) { next(err) }
})

// GET /api/admin/audit-log
app.get('/api/admin/audit-log', authenticateAdmin, requireRole('founder'), async (req, res, next) => {
  try {
    const { adminEmail, action, resource, page = 1, limit = 100 } = req.query
    const query = {}
    if (adminEmail) query.adminEmail = new RegExp(adminEmail, 'i')
    if (action) query.action = new RegExp(action, 'i')
    if (resource && resource !== 'all') query.resource = resource
    const skip = (Number(page) - 1) * Number(limit)
    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      AuditLog.countDocuments(query)
    ])
    res.json({ success: true, logs, total })
  } catch (err) { next(err) }
})

// POST /api/feedback (Public — student feedback submission)
app.post('/api/feedback', async (req, res, next) => {
  try {
    const { userName, email, userId, type, message } = req.body
    if (!message || message.trim().length < 5) return res.status(400).json({ error: 'Message is too short' })
    const fb = await Feedback.create({ userName: userName || 'Anonymous', email: email || '', userId: userId || null, type: type || 'general', message: message.trim() })
    res.status(201).json({ success: true, id: fb._id })
  } catch (err) { next(err) }
})

// POST /api/admin/sync-user — Called after student login to sync user record
app.post('/api/admin/sync-user', authenticateUser, async (req, res, next) => {
  try {
    const { uid, email, displayName, provider } = req.body
    if (!uid || !email) return res.status(400).json({ error: 'uid and email required' })
    await User.findOneAndUpdate(
      { userId: uid },
      { userId: uid, email, displayName: displayName || '', provider: provider || 'email', lastActive: new Date() },
      { upsert: true, new: true }
    )
    res.json({ success: true })
  } catch (err) { next(err) }
})

// =============================================
// SERVE REACT BUILD (Production)
// =============================================
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use(express.static(path.join(__dirname, 'dist')))
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// Centralized Express Error Handling Middleware
app.use((err, req, res, next) => {
  if (err.name === 'ZodError' || err instanceof z.ZodError) {
    const issues = err.errors || err.issues || []
    return res.status(400).json({
      error: 'Invalid request payload format',
      details: issues.map(e => ({ field: e.path.join('.'), message: e.message }))
    })
  }
  
  if (err.status === 400 || err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON payload' })
  }
  
  if (err.name === 'MongooseError' || err.message?.includes('buffering timed out') || err.name === 'MongooseServerSelectionError') {
    return res.status(503).json({
      error: 'Database Connection Error: The database query timed out. Please check if your current IP is whitelisted on your MongoDB Atlas cluster.'
    })
  }

  console.error('[Error Handler] Unhandled error:', err)
  res.status(500).json({ error: 'An unexpected internal server error occurred.' })
})

// =============================================
// SERVER STARTUP + SOCKET.IO + CHANGE STREAMS
// =============================================
import { createServer } from 'http'
import { Server as SocketIO } from 'socket.io'

if (process.env.NODE_ENV !== 'test') {
  const httpServer = createServer(app)

  // Socket.IO — only accept connections from admin dashboard
  const io = new SocketIO(httpServer, {
    cors: { origin: allowedOrigins, credentials: true },
    path: '/socket.io'
  })

  io.on('connection', async (socket) => {
    const token = socket.handshake.auth?.token
    // Only allow valid admin tokens to receive real-time events
    try {
      if (!token) throw new Error('No token')
      const jwt = await import('jsonwebtoken')
      jwt.default.verify(token, process.env.ADMIN_JWT_SECRET)
      console.log('[WS] Admin connected:', socket.id)
      socket.join('admins')
    } catch {
      socket.disconnect(true)
    }
  })

  // ── CHANGE STREAMS (real-time admin events) ──
  // Only start if MongoDB is connected (replica set required)
  mongoose.connection.once('open', () => {
    try {
      // Watch new user signups
      const userStream = User.watch([{ $match: { operationType: 'insert' } }], { fullDocument: 'updateLookup' })
      userStream.on('change', (change) => {
        const doc = change.fullDocument
        io.to('admins').emit('new-signup', {
          email: doc?.email,
          displayName: doc?.displayName,
          stream: doc?.stream,
          city: doc?.city,
          timestamp: new Date().toISOString()
        })
        console.log('[ChangeStream] New signup:', doc?.email)
      })
      userStream.on('error', () => {}) // silently ignore if not replica set

      // Watch new reports generated
      const reportStream = Report.watch([{ $match: { operationType: { $in: ['insert', 'update'] } } }], { fullDocument: 'updateLookup' })
      reportStream.on('change', (change) => {
        const doc = change.fullDocument
        io.to('admins').emit('new-report', {
          email: doc?.email,
          userId: doc?.userId,
          timestamp: new Date().toISOString()
        })
        console.log('[ChangeStream] Report saved:', doc?.email)
      })
      reportStream.on('error', () => {})

      // Watch feedback submissions
      const feedbackStream = Feedback.watch([{ $match: { operationType: 'insert' } }], { fullDocument: 'updateLookup' })
      feedbackStream.on('change', (change) => {
        const doc = change.fullDocument
        io.to('admins').emit('new-feedback', {
          type: doc?.type,
          priority: doc?.priority,
          userName: doc?.userName,
          timestamp: new Date().toISOString()
        })
      })
      feedbackStream.on('error', () => {})

      console.log('[ChangeStream] Real-time event streams active')
    } catch (err) {
      // Change streams require a replica set — Atlas free tier supports this
      console.log('[ChangeStream] Note:', err.message)
    }
  })

  httpServer.listen(PORT, () => {
    console.log(`Skope server running on port ${PORT}`)
  })
}

export default app
