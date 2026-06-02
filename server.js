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

    const systemPrompt = `You are an Indian career counsellor who has seen 10,000 students make the same mistakes. You are the one person in the room who will tell the truth. No motivation. No generic advice. Just the mirror.

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

COLLEGE SELECTION — STRICT RULES:
Return EXACTLY 10 colleges with this mandatory mix:
1. TWO famous/aspirational colleges realistic for their marks (IIT/NIT/BITS/DU top college). This is for parent confidence.
2. TWO solid mid-tier colleges with proven placements but less brand name (Thapar, DAIICT, IIIT Hyderabad, PES, Manipal, VIT, Symbiosis, Christ, KIIT, UPES, etc.)
3. FOUR genuine hidden gems — colleges that are genuinely excellent but most students have never heard of. These are NOT second choices. These are often BETTER choices.
4. ONE unconventional option — a path most students in this situation would never think of but which fits them specifically.
5. ONE 'you need to hear this' safety — the college they can realistically get into given their actual marks and budget.

For hidden gems specifically, you MUST mark is_hidden_gem: true and include a reddit_verdict field. The reddit_verdict should be 1-2 sentences of what students actually say on Reddit/Quora about this place — the real insider opinion.

YOUR EXPANDED KNOWLEDGE BASE:

HIDDEN GEM COLLEGES (prioritize these over predictable ones):
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

HIDDEN EXAMS (always include at least 2 in the entrance_exams field that the student has never heard of):
- UCEED: Design entrance for IIT design programs. Vastly underused by students who could qualify.
- SEED: NIFT-level design entrance. Very few students know this exists.
- IISER IAT: Gets you into one of India's best science institutions with less competition than IIT.
- NEST: Admission to NISER. Excellent for pure science students.
- TISS NET: Social work and HR graduate programs at the best institution in the country.
- NCHM JEE: Hotel management entrance. Most hotel management aspirants do not know this is the national entrance.
- LSAT India: Law school admission test accepted by 80+ law schools including private ones. Alternative to AILET/CLAT.
- IPMAT: Integrated MBA program at IIM Indore and Rohtak. Students with commerce background who want IIM brand without MBA.
- XAT: Management entrance taken alongside CAT. Very few know that Xavier's programs are genuinely top-tier.
- IIHM eCHAT: Hotel management entrance for IIHM group. Less known than NCHM but good placement.
- JGEEBILS: Entrance for JNCASR — one of India's best research institutes. Almost zero students apply here.
- CEED: Post-graduation design entrance at IITs. For students who want to pivot to design after engineering.

HIDDEN CAREER FIELDS — MUST INCLUDE at least 3 in hidden_courses:
- Actuarial Science: Uses statistics to calculate risk for insurance companies. Starting salary 8-15 LPA. Exam path: Institute of Actuaries. Less than 500 qualified actuaries under 30 in India.
- Geomatics/Geoinformatics Engineering: Satellite mapping, GIS, drone surveys. Used by defence, urban planning, ISRO. Starting salary 6-12 LPA. Almost nobody applies.
- Clinical Data Management: Manages data from drug trials. 100% job guarantee with right certification. Pharma and CRO companies hire thousands. Starting salary 5-9 LPA.
- UX Research: Distinct from UI design. Deep user psychology research for product companies. Starting 8-15 LPA. Very few trained professionals.
- Sound Design: For film, gaming, podcasts, VR. Huge OTT boom demand. FTII and some private institutes offer it.
- Marine Engineering: Works on ships. 80-90% on-shore salary while at sea. Starting after training: 50,000-1L USD equivalent.
- Sports Science and Biomechanics: Injury prevention, performance coaching for athletes. Growing field in India post-Olympics push.
- Computational Linguistics: Builds language models and NLP tools. Extremely rare skillset. Companies like Google, Microsoft, Sarvam hire directly from college.
- Fashion Technology: Distinct from fashion design. Supply chain, production, tech. NIFT offers it. Starting 5-8 LPA.
- Landscape Architecture: Designs public spaces, urban parks, resorts. CEPT offers it. Very few in India. Starting 5-8 LPA.
- Agricultural Technology/Precision Farming: Uses drones and sensors for farming. Massive government push. Startups like DeHaat, AgroStar hiring aggressively.
- Occupational Therapy: Allied health field. Massive shortage in India. Starting 4-7 LPA with 100% placement in hospitals and rehab centers.

NEVER recommend a college that does not exist. Filter strictly by budget and city preferences.
Return ONLY valid JSON. No markdown, no text outside the JSON.

PERSONALIZATION MANDATE:
- profile_summary: Must reference at least 3 specific things this student said or did. Must sound like it could ONLY be about this student.
- key_insight: Must contain exactly 1 observation that could ONLY come from this specific conversation, not from a generic career guide.
- For each career: must explain how it solves or connects to a specific thing they said they care about.
- For each college: must reference their specific marks, budget, or stated interest.
- If any section reads generic enough to copy-paste for another student, you have failed.

REALITY CHECK MANDATE:
For each career path, include a reality_check field that names the hard truth.
Do NOT soften these. This is where trust is built.

KEY PERSPECTIVE RULES:
The key_perspective must be 2-4 sentences of dense, specific insight about Indian education/careers for THIS student.
Not motivational. Not generic. Something they did not know.

GOOD: 'IIT placements often include mass hiring by consulting firms who take anyone with the IIT tag. If you want to build products, a college like Thapar with active startup culture might teach you more useful skills.'
BAD: 'Follow your passion and you will succeed.'`

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
      "entrance_exams": ["exam1", "exam2 — explain what this is and how hard it is compared to JEE if it is not widely known"],
      "earning_range": "realistic Indian market range (be honest, not optimistic)",
      "reality_check": "the hard truth about this path for THIS student. Name the specific blocker or risk. Do not soften."
    }
  ],
  "colleges": [
    {
      "name": "Full Official College Name",
      "location": "City Name",
      "type": "IIT/NIT/Central Univ/Private/Deemed",
      "college_tier": "famous / mid-tier / hidden-gem / unconventional / realistic-safety",
      "annual_fee": "e.g. 2.5 Lakhs per year",
      "why_fits": "2-3 sentences explaining specifically why THIS STUDENT should consider it. Reference their marks, budget, career interest, and geographic preference.",
      "caution": "1-2 sentences naming the real downside or trade-off of this college for this student.",
      "is_hidden_gem": false,
      "reddit_verdict": "What students on Reddit/Quora actually say about this college. 1-2 sentences of real insider opinion. Not marketing copy."
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
  "emerging_roles": [
    {
      "title": "Role Title",
      "description": "what this role actually does in 1-2 sentences",
      "why_relevant": "why this fits this specific student"
    }
  ]
}

COLLEGE SELECTION — MANDATORY:
Return EXACTLY 10 colleges with EXACTLY this mix:
- 2 famous/aspirational (realistic for their marks)
- 2 solid mid-tier with proven placements
- 4 hidden gems the student has probably never heard of (mark is_hidden_gem: true)
- 1 unconventional fit for their specific profile
- 1 realistic safety given their actual marks and budget

Return exactly 3 careers, exactly 10 colleges, exactly 8 regular recommended_courses, exactly 5 hidden_courses, exactly 2 emerging roles.`

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
