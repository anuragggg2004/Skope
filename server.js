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

import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Report from './models/Report.js'
import fs from 'fs'
dotenv.config()

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
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas successfully.'))
    .catch((err) => console.error('MongoDB Atlas connection error:', err))
} else {
  console.log('MongoDB connection skipped: MONGODB_URI is not set or still has <password> placeholder.')
}

const app = express()
app.use(cors())
app.use(express.json())

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
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`
    console.log(`[AI] Attempting generation with model: ${model}`)
    try {
      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      maxOutputTokens: 16000,
      responseMimeType: 'application/json'
    }
  }

  if (useSearch) {
    payload.tools = [{ googleSearch: {} }]
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
app.post('/api/conversation-start', async (req, res) => {
  try {
    const systemPrompt = `You are opening a conversation with an Indian Class 12 student. Ask exactly ONE question that will give you the most useful information first. The question should be open enough that their answer reveals multiple facts at once. Start with stream, marks, and immediate situation combined. Do NOT ask multiple things. Do NOT greet them with fluff. Get straight to the most useful question.`
    
    const responseText = await callAIText(systemPrompt, 'Generate the first question to start the career counseling session.')
    res.json({ question: responseText.trim().replace(/^"|"$/g, '') })
  } catch (error) {
    console.error('Error in /api/conversation-start:', error)
    res.status(500).json({ error: 'Failed to start conversation.' })
  }
})

// =============================================
// ENDPOINT 1: POST /api/adaptive-questions
// =============================================
app.post('/api/adaptive-questions', async (req, res) => {
  try {
    const { answers } = req.body

    if (!answers || !answers.q1 || !answers.q2 || !answers.q3) {
      return res.status(400).json({ error: 'All three answers are required.' })
    }

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
    const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    res.json(parsed)
  } catch (error) {
    console.error('Error in /api/adaptive-questions:', error)
    res.status(500).json({ error: 'Failed to generate adaptive questions. Please try again.' })
  }
})

// =============================================
// ENDPOINT 1.5: POST /api/next-question
// =============================================
app.post('/api/next-question', async (req, res) => {
  try {
    const { answers, chatHistory } = req.body

    if (!answers) {
      return res.status(400).json({ error: 'Phase 1 answers are required.' })
    }

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
    console.error('Error in /api/next-question:', error)
    res.status(500).json({ error: 'Failed to generate next question.' })
  }
})

// =============================================
// ENDPOINT 2: POST /api/generate-report
// =============================================
app.post('/api/generate-report', async (req, res) => {
  try {
    const { phase1, phase2, chatHistory, preferences, brutally_honest } = req.body

    if (!phase1) {
      return res.status(400).json({ error: 'Phase1 data is required.' })
    }

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
    const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)

    // Apply College Guardrails
    if (parsed.colleges && parsed.profile_metrics) {
      parsed.colleges = validateColleges(parsed.colleges, parsed.profile_metrics)
    }

    res.json(parsed)
  } catch (error) {
    console.error('Error in /api/generate-report:', error)
    res.status(500).json({ error: 'Failed to generate PathReport. Please try again.' })
  }
})

// =============================================
// ENDPOINT 3: POST /api/chat
// =============================================
app.post('/api/chat', async (req, res) => {
  try {
    const { message, pathreport, history } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' })
    }

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
    console.error('Error in /api/chat:', error)
    res.status(500).json({ error: 'Failed to get a response. Please try again.' })
  }
})

// =============================================
// ENDPOINT 3.5: POST /api/what-if
// =============================================
app.post('/api/what-if', async (req, res) => {
  try {
    const { scenario, pathreport } = req.body

    if (!scenario || !pathreport) {
      return res.status(400).json({ error: 'scenario and pathreport are required.' })
    }

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
    const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    res.json(parsed)
  } catch (error) {
    console.error('Error in /api/what-if:', error)
    res.status(500).json({ error: 'Failed to simulate scenario. Please try again.' })
  }
})

// =============================================
// ENDPOINT 4: POST /api/save-report
// =============================================
app.post('/api/save-report', async (req, res) => {
  try {
    const { userId, email, reportData } = req.body

    if (!userId || !email || !reportData) {
      return res.status(400).json({ error: 'userId, email, and reportData are required.' })
    }

    // Upsert (update if exists, insert if new)
    const report = await Report.findOneAndUpdate(
      { userId },
      { email, reportData, updatedAt: Date.now() },
      { new: true, upsert: true }
    )

    console.log(`PathReport saved successfully for user: ${email} (${userId})`)
    res.json({ success: true, report })
  } catch (error) {
    console.error('Error in /api/save-report:', error)
    res.status(500).json({ error: 'Failed to save PathReport.' })
  }
})

// =============================================
// ENDPOINT 5: GET /api/get-report/:userId
// =============================================
app.get('/api/get-report/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    if (!userId) {
      return res.status(400).json({ error: 'userId is required.' })
    }

    const report = await Report.findOne({ userId })

    if (!report) {
      return res.json({ success: true, found: false })
    }

    res.json({ success: true, found: true, reportData: report.reportData })
  } catch (error) {
    console.error('Error in /api/get-report:', error)
    res.status(500).json({ error: 'Failed to fetch PathReport.' })
  }
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

app.listen(PORT, () => {
  console.log(`Skope server running on port ${PORT}`)
})
