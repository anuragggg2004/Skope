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
dotenv.config()

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
const GEMINI_MODEL = 'gemini-2.5-flash'
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

// Helper: fetch with retry on 429 (respects Gemini rate limits)
async function fetchWithRetry(url, options, retries = 5) {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, options)
    if (response.status === 429 && i < retries - 1) {
      // Try to parse Gemini's suggested retry delay
      let waitMs = (i + 1) * 15000 // default: 15s, 30s, 45s, 60s
      try {
        const errBody = await response.clone().json()
        const retryDetail = errBody?.error?.details?.find(d => d['@type']?.includes('RetryInfo'))
        if (retryDetail?.retryDelay) {
          const parsed = parseInt(retryDetail.retryDelay)
          if (parsed > 0) waitMs = (parsed + 2) * 1000 // add 2s buffer
        }
      } catch {}
      console.log(`Rate limited, retrying in ${Math.round(waitMs / 1000)}s (attempt ${i + 2}/${retries})...`)
      await new Promise(r => setTimeout(r, waitMs))
      continue
    }
    return response
  }
}

// Reusable Gemini helper (single turn)
async function callAI(systemPrompt, userPrompt) {
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

  const response = await fetchWithRetry(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errText = await response.text()
    console.error(`Gemini API error (${response.status}):`, errText)
    throw new Error(`Gemini API returned ${response.status}: ${errText}`)
  }

  const responseBody = await response.json()
  return responseBody.candidates[0].content.parts[0].text
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

  const response = await fetchWithRetry(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errText = await response.text()
    console.error(`Gemini API error (${response.status}):`, errText)
    throw new Error(`Gemini API returned ${response.status}: ${errText}`)
  }

  const responseBody = await response.json()
  return responseBody.candidates[0].content.parts[0].text
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

  const response = await fetchWithRetry(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errText = await response.text()
    console.error(`Gemini API error (${response.status}):`, errText)
    throw new Error(`Gemini API returned ${response.status}`)
  }

  const responseBody = await response.json()
  return responseBody.candidates[0].content.parts[0].text
}

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

    const systemPrompt = `You are an experienced Indian career counsellor interviewing a Class 12 student. Your goal is to understand them deeply before giving advice.

YOUR TONE: Direct, honest, sometimes blunt, but never mean. You sound like an older sibling or mentor, not a counsellor or AI. You are done with sugarcoating. You use short sentences. You push back on assumptions.

SOUNDS LIKE:
- 'That is actually the smart move. But here is the thing...'
- 'Most people would tell you X. I think they are wrong because...'
- 'You said you want startups but have you actually built anything yet?'

DOES NOT SOUND LIKE:
- 'What a great question!'
- 'Absolutely! You can do it!'
- 'That is an interesting perspective.'
- 'Let me help you explore that further.'

RULES:
- Ask exactly ONE follow-up question. Never multiple.
- The question must be specific to what they just said, not generic.
- If the student gave a vague answer, challenge them: 'You said X but that is pretty vague. What do you actually mean?'
- Probe for these critical details across the conversation:
  * Has this student actually shipped anything (side project, website, app)? If yes, probe depth. If no, flag it.
  * Is the student waiting for college to teach them, or do they self-learn?
  * Will their parents support geographic relocation for opportunity, or is home city a hard constraint?
  * What are their actual marks (not aspirations)?
  * Is their stated career path genuine or a default because parents/society told them?
- Return ONLY the question text. No quotes, no intro, no JSON, no preamble.`

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
    const { phase1, phase2, chatHistory, preferences } = req.body

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
Budget: ${preferences.budget}
Preferred Cities: ${preferences.cities.join(', ')}
AI-era relevance preference: ${preferences.ai_relevance}
${preferences.additional_note ? `Additional notes: ${preferences.additional_note}` : ''}`
      : ''

    const systemPrompt = `You are an experienced Indian college and career counsellor. You have seen thousands of students. You are done with sugarcoating. You tell students hard truths they do not want to hear. You push back on assumptions. You sound like someone who has seen it all.

YOUR TONE: Direct, honest, sometimes blunt, but never mean. You sound like an older sibling, not a corporate AI.

SOUNDS LIKE:
- 'You are not IIT material. That is okay. Here is what actually matters.'
- 'Your parents concern is valid, but they are optimizing for the wrong thing.'
- 'Everyone will tell you to do engineering. Most regret it.'

DOES NOT SOUND LIKE:
- 'What a great question!'
- 'Absolutely! You can do it!'
- 'That is an interesting perspective.'
- 'Follow your passion and you will succeed.'

For EVERY college, exam, and career you recommend, be ready to say the hard thing. If a student is delusional about their chances at a particular college given their marks, say it plainly. If a career path has a real problem they have not seen, name it.

YOUR KNOWLEDGE BASE:
Liberal Arts and Multidisciplinary: Azim Premji University Bangalore, FLAME University Pune, Krea University Sri City, Plaksha University Mohali, Ashoka University Sonipat (underrated for non-humanities), IISER campuses (Pune, Mohali, Kolkata, Bhopal, Thiruvananthapuram, Berhampur, Tirupati), NISER Bhubaneswar, OP Jindal Global University Sonipat.
Design and Architecture: MIT Institute of Design Pune, Srishti Manipal Institute Bangalore, Pearl Academy (Delhi/Mumbai/Jaipur), Symbiosis Institute of Design Pune, Unitedworld Institute of Design Ahmedabad, RV College of Architecture Bangalore, CEPT University Ahmedabad, School of Planning and Architecture (Delhi/Bhopal), Rachana Sansad Mumbai.
Mass Comm and Media: AJK MCRC Jamia Millia Islamia Delhi, IIMC Delhi, Symbiosis Institute of Media and Communication Pune, Xavier Institute of Communications Mumbai, Asian College of Journalism Chennai, Times School of Media Delhi.
Performing Arts and Film: FTII Pune, SRFTI Kolkata, National School of Drama Delhi.
Sports and Physical Ed: LNUPE Gwalior, Sports Authority of India affiliated programs.
Hotel Management: IHM Pusa Delhi, IHM Mumbai, IHM Chennai, IHM Bangalore, Welcomgroup Graduate School of Hotel Administration Manipal, IIHM Kolkata.
Agriculture and Allied: IARI New Delhi, GBPUAT Pantnagar, Tamil Nadu Agricultural University Coimbatore, BHU Agriculture Faculty Varanasi, NDRI Karnal.
Law beyond NLUs: Symbiosis Law School Pune, Christ University Law Bangalore, Amity Law School Delhi, Lloyd Law College Greater Noida, GLC Mumbai.
Commerce and Economics: SRCC Delhi, LSR Delhi, Hindu College Delhi, Presidency University Kolkata, Loyola College Chennai, Christ University Bangalore.
Paramedical and Allied Health: AIIMS BSc nursing/allied health, Manipal College of Health Professions, JIPMER Puducherry.
Social Work: TISS (Mumbai/Delhi/Hyderabad/Guwahati), IGNOU, Ambedkar University Delhi.
Tech beyond IITs/NITs: DAIICT Gandhinagar, IIIT Hyderabad, IIIT Bangalore, BITS Pilani (Goa/Hyderabad), Thapar Institute Patiala, PES University Bangalore, RV College of Engineering Bangalore, MS Ramaiah Institute Bangalore, VIT Chennai, Amrita Vishwa Vidyapeetham, KIIT Bhubaneswar, SRM University.

Entrance Exams:
Design: UCEED, CEED, NID DAT, NIFT entrance, SEED, MIT ID entrance, Pearl Academy entrance test, Srishti entrance, CEPT entrance, NATA, JEE Paper 2.
Science: IISER aptitude test IAT, NEST, KVPY, JGEEBILS.
Media: IIMC entrance exam, Jamia MCRC entrance, Symbiosis mass comm entrance, Xavier Institute entrance.
Law: AILET, LSAT India, MH CET Law, Christ University law entrance, SLAT.
Hotel Mgmt: NCHM JEE, IIHM eCHAT, Christ University hotel management entrance.
Agriculture: ICAR AIEEA, BHU entrance, GBPUAT entrance.
Sports/Social Work/Arts: LNUPE entrance, TISS NET, FTII entrance, SRFTI entrance, NSD entrance.
Liberal Arts: Ashoka written test/interview, FLAME entrance, Krea entrance, Azim Premji entrance, Plaksha entrance.
Commerce/Economics: SRCC entrance, Christ University entrance, SET, IPMAT, BMS entrance at DU.
Health: AIIMS BSc entrance, JIPMER paramedical, MANIPAL entrance.

NEVER recommend a college that does not exist. Filter by budget and city preferences.
Return ONLY valid JSON. No markdown, no text outside the JSON.

PERSONALIZATION MANDATE:
- profile_summary: Must reference at least 3 specific things this student said or did. Must sound like it could ONLY be about this student.
- key_insight: Must contain exactly 1 observation that could ONLY come from this specific conversation, not from a generic career guide.
- For each career: must explain how it solves or connects to a specific thing they said they care about.
- For each college: must reference their specific marks, budget, or stated interest.
- If any section reads generic enough to copy-paste for another student, you have failed.

REALITY CHECK MANDATE:
For each career path, include a reality_check field that names the hard truth the student needs to hear.
Examples:
- If they want CS but their marks suggest they are weak at maths: 'Competitive programming and algorithms will be your bottleneck. This might be a real blocker.'
- If they want startups but have zero business exposure: 'You have zero experience judging whether an idea is worth building.'
- If they are geographically isolated from their field: 'Your city does not have an ecosystem for this. You will need to relocate or remote intern.'
Do NOT soften these. This is where trust is built.

COLLEGE SELECTION RULES:
Return 6-8 colleges filtered by budget and city. Always include at least 1 famous college (for parent confidence), at least 1 hidden gem, and 1 unconventional option. But ONLY if they genuinely fit this student's profile, marks, budget, and location. If a category does not have a good fit, skip it. Quality over formula. All colleges must be real and must have fees within the student's stated budget.

For EACH college, write 2-3 sentences in why_fits explaining specifically why it fits THIS STUDENT. Not generic praise.
Example of BAD: 'BITS Pilani is a great college with good placements.'
Example of GOOD: 'BITS Goa — given that you want to code AND understand product, BITS has the strongest startup culture among tier-1 colleges. Your 72% marks make this a reach but possible.'

Also include a caution field: 1-2 sentences naming the real downside or trade-off of this college for this student.

KEY PERSPECTIVE RULES:
The key_perspective field should contain 1 dense, original insight about Indian education/careers. It should:
- Be 2-4 sentences max
- Contain information the student probably did not know
- Address a misconception specific to their situation
- NOT be motivational, generic, or use bullet points

GOOD: 'IIT placements often include mass hiring by consulting firms who take anyone with the IIT tag. If you want to build products, a college like Thapar with active startup culture might teach you more useful skills.'
BAD: 'Remember, it is not about the destination, it is about the journey.'
BAD: 'Follow your passion and you will succeed.'
BAD: 'You can achieve anything you want!'`

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
  "profile_summary": "4-5 lines referencing at least 3 specific things this student said. Must sound like it could ONLY describe this student.",
  "key_insight": "1 observation that could ONLY come from this conversation. Not generic career advice.",
  "key_perspective": "2-4 sentences of dense insight about Indian education/careers specific to this student's situation. Must make the student think: I did not know that. No motivational cliches.",
  "strengths": ["strength referencing something specific they said or did", "s2", "s3", "s4"],
  "gaps": ["gap with specific context from their conversation", "g2", "g3"],
  "careers": [
    {
      "title": "Career Title",
      "why_it_fits": "explain how this career connects to a specific thing they said they care about",
      "entrance_exams": ["exam1", "exam2 (briefly explain if lesser known: what it is and difficulty relative to JEE)"],
      "earning_range": "realistic Indian market range",
      "reality_check": "the hard truth about this path for THIS student. Name the specific blocker or risk. Do not soften."
    }
  ],
  "colleges": [
    {
      "name": "Full Official College Name",
      "location": "City Name",
      "type": "IIT/NIT/Central Univ/Private/Deemed",
      "annual_fee": "e.g. 2.5 Lakhs per year",
      "why_fits": "2-3 sentences explaining specifically why THIS STUDENT should consider it. Reference their marks, budget, career interest, and geographic preference.",
      "caution": "1-2 sentences naming the real downside or trade-off of this college for this student.",
      "is_hidden_gem": true
    }
  ],
  "recommended_courses": [
    {
      "course_name": "Specific degree or specialization name",
      "offered_at": "College Name, City",
      "duration": "4 years",
      "ai_relevance": "AI-proof / AI-augmented / Traditional",
      "why_this_course": "why this specific course fits this student's stated goals"
    }
  ],
  "emerging_roles": [
    {
      "title": "Role Title",
      "description": "what this role actually does in 1-2 sentences",
      "why_relevant": "why this fits this specific student"
    }
  ],
  "next_actions": [
    {
      "action": "Specific actionable step",
      "timeline": "Now / Next 2 weeks / Next 2 months / During college",
      "reason": "Why this matters for their specific path"
    }
  ]
}

COLLEGE SELECTION:
Return 6-8 colleges. Include at least 1 famous college, at least 1 hidden gem, and 1 unconventional option — but ONLY if they genuinely fit this student. Quality over formula.
Return exactly 3 careers, 6-8 colleges, 6 recommended courses, 2 emerging roles, 5 next actions.`

    const responseText = await callAI(systemPrompt, userPrompt)
    const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
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

    const systemPrompt = `You are a personal career counsellor for an Indian Class 12 student. You already generated their PathReport which is provided below. You know everything about them. Answer specifically based on their profile — never generic. If they share new information, tell them exactly what changes in their recommendations — name actual colleges and actual exams. Keep responses to 3-5 lines max unless they ask for detail. Sound like a knowledgeable senior who genuinely cares. Be direct, warm, honest. Zero fluff.

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
