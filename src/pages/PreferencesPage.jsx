import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, getStoredToken } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import ProgressBar from '../components/ProgressBar'
import LoadingDots from '../components/LoadingDots'

const budgetOptions = [
  { label: 'Under ₹1 Lakh/year', value: 'under_1l' },
  { label: '₹1–3 Lakhs/year', value: '1l_3l' },
  { label: '₹3–5 Lakhs/year', value: '3l_5l' },
  { label: '₹5–10 Lakhs/year', value: '5l_10l' },
  { label: '₹10–20 Lakhs/year', value: '10l_20l' },
  { label: '₹20 Lakhs+/year', value: '20l_plus' },
  { label: 'Budget is flexible', value: 'flexible' },
]

const popularCities = [
  'Delhi/NCR', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Chandigarh',
  'Lucknow', 'Bhopal', 'Kota', 'Manipal', 'Pilani',
  'Any city is fine'
]

export default function PreferencesPage() {
  const navigate = useNavigate()
  const { user, setPathReport } = useAuth()
  const [budget, setBudget] = useState('')
  const [selectedCities, setSelectedCities] = useState([])
  const [customCity, setCustomCity] = useState('')
  const [aiRelevance, setAiRelevance] = useState('')
  const [additionalNote, setAdditionalNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(90)
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0)

  const loadingMessages = [
    'Analysing your preferences',
    'Filtering colleges by budget & city',
    'Checking AI-relevant courses',
    'Matching entrance exams',
    'Writing your PathReport'
  ]

  // Redirect if no form data
  useEffect(() => {
    const phase1 = sessionStorage.getItem('skope_phase1')
    if (!phase1) {
      navigate('/form')
    }
  }, [navigate])

  // Cycle loading messages
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMsgIndex(prev => (prev + 1) % loadingMessages.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [loading])

  const toggleCity = (city) => {
    if (city === 'Any city is fine') {
      setSelectedCities(prev =>
        prev.includes(city) ? [] : ['Any city is fine']
      )
      return
    }
    setSelectedCities(prev => {
      const filtered = prev.filter(c => c !== 'Any city is fine')
      return filtered.includes(city)
        ? filtered.filter(c => c !== city)
        : [...filtered, city]
    })
  }

  const addCustomCity = () => {
    const trimmed = customCity.trim()
    if (trimmed && !selectedCities.includes(trimmed)) {
      setSelectedCities(prev => [...prev.filter(c => c !== 'Any city is fine'), trimmed])
      setCustomCity('')
    }
  }

  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false)
  const [loadingStepsProgress, setLoadingStepsProgress] = useState([0, 0, 0, 0, 0])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const handleSubmit = async () => {
    if (!budget) {
      setError('Please select your budget range.')
      return
    }
    if (selectedCities.length === 0) {
      setError('Please select at least one city preference.')
      return
    }
    if (!aiRelevance) {
      setError('Please tell us about your AI course preference.')
      return
    }

    setLoading(true)
    setError('')
    setShowLoadingOverlay(true)
    setLoadingStepsProgress([0, 0, 0, 0, 0])
    setCurrentStepIndex(0)

    let currentStep = 0
    let progressArr = [0, 0, 0, 0, 0]

    let apiResultReceived = false
    let apiResultData = null
    let apiError = null

    // Start API request in parallel
    const brutally_honest = sessionStorage.getItem('brutally_honest') === 'true'
    const phase1 = JSON.parse(sessionStorage.getItem('skope_phase1') || '{}')
    const chatHistory = JSON.parse(sessionStorage.getItem('skope_chatHistory') || '[]')

    const preferences = {
      budget: budgetOptions.find(b => b.value === budget)?.label || budget,
      cities: selectedCities,
      ai_relevance: aiRelevance,
      additional_note: additionalNote
    }

    fetch('/api/generate-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phase1, chatHistory, preferences, brutally_honest })
    }).then(async (res) => {
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to generate report.')
      }
      return res.json()
    }).then((data) => {
      apiResultData = data
      apiResultReceived = true
    }).catch((err) => {
      apiError = err
      apiResultReceived = true
    })

    const handleReportCompletion = (data, error) => {
      setShowLoadingOverlay(false)
      setLoading(false)
      if (error) {
        setError(error.message)
        return
      }
      sessionStorage.setItem('pathreport', JSON.stringify(data))
      sessionStorage.setItem('skope_preferences', JSON.stringify(preferences))
      if (setPathReport) setPathReport(data)

      if (user && !user.isAnonymous) {
        const token = getStoredToken()
        if (token) {
          fetch('/api/save-report', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              userId: user.uid,
              email: user.email,
              reportData: data
            })
          }).catch(e => console.error('Background report save failed:', e))
        }
      }

      setProgress(100)
      navigate('/result')
    }

    const interval = setInterval(() => {
      // If API results have loaded, fast-forward the progress!
      const stepIncrement = apiResultReceived ? 50 : 12;

      if (currentStep < 5) {
        progressArr[currentStep] += stepIncrement
        if (progressArr[currentStep] >= 100) {
          progressArr[currentStep] = 100
          if (currentStep < 4) {
            currentStep += 1
            setCurrentStepIndex(currentStep)
          } else {
            // Reached final step -> wait for API if not ready
            if (apiResultReceived) {
              clearInterval(interval)
              handleReportCompletion(apiResultData, apiError)
            } else {
              progressArr[4] = 99
            }
          }
        }
        setLoadingStepsProgress([...progressArr])
      } else {
        if (apiResultReceived) {
          clearInterval(interval)
          handleReportCompletion(apiResultData, apiError)
        }
      }
    }, 100)
  }

  return (
    <>
      <div className="grid-bg" />
      <div className="orb-1" />
      <div className="orb-2" />
      <div className="page-wrapper pt-[80px]">
        <Navbar />
        <ProgressBar progress={progress} />

        <div className="max-w-[640px] mx-auto px-6 py-12 sm:py-16 max-sm:px-5 max-sm:py-8">
          <div className="animate-fadeUp">
            {/* Step Tag */}
            <span className="font-dm text-[12px] font-medium text-blue uppercase tracking-[1.5px] block mb-3">
              Almost There
            </span>

            {/* Title */}
            <h2 className="font-sora text-[28px] sm:text-[32px] font-semibold text-white mb-3">
              Let's get practical.
            </h2>

            {/* Subtitle */}
            <p className="font-dm text-[14px] text-[rgba(240,242,255,0.45)] leading-relaxed mb-10">
              These details help Skope recommend colleges you can actually afford, in cities you'd actually live in, with courses that actually matter in 2025 and beyond.
            </p>

            {/* Q1 — Budget */}
            <div className="mb-8">
              <label className="font-dm text-[14px] text-white font-medium block mb-3">
                What's your annual education budget? <span className="text-[rgba(240,242,255,0.35)] font-normal">(tuition + hostel + living)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {budgetOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setBudget(opt.value)}
                    className={`font-dm text-[13px] px-3 py-2.5 rounded-[10px] border cursor-pointer transition-all duration-200 text-left
                      ${budget === opt.value
                        ? 'bg-[rgba(108,99,255,0.15)] border-[#6c63ff] text-white'
                        : 'bg-navy3 border-[rgba(108,99,255,0.15)] text-[rgba(240,242,255,0.5)] hover:border-[rgba(108,99,255,0.3)]'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Q2 — Cities */}
            <div className="mb-8">
              <label className="font-dm text-[14px] text-white font-medium block mb-3">
                Which cities are you open to studying in? <span className="text-[rgba(240,242,255,0.35)] font-normal">(select multiple)</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {popularCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => toggleCity(city)}
                    className={`font-dm text-[12px] px-3 py-1.5 rounded-full border cursor-pointer transition-all duration-200
                      ${selectedCities.includes(city)
                        ? 'bg-[rgba(108,99,255,0.15)] border-[#6c63ff] text-white'
                        : 'bg-navy3 border-[rgba(108,99,255,0.15)] text-[rgba(240,242,255,0.5)] hover:border-[rgba(108,99,255,0.3)]'
                      }`}
                  >
                    {selectedCities.includes(city) && <span className="mr-1">✓</span>}
                    {city}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 bg-navy3 border border-[rgba(108,99,255,0.15)] rounded-[10px] px-4 py-2 text-white font-dm text-[13px] outline-none focus:border-[#6c63ff] transition-colors placeholder:text-[rgba(240,242,255,0.25)]"
                  placeholder="Add another city..."
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomCity()}
                />
                <button
                  onClick={addCustomCity}
                  className="font-dm text-[12px] font-medium bg-navy3 border border-[rgba(108,99,255,0.15)] text-blue px-4 py-2 rounded-[10px] cursor-pointer hover:border-[#6c63ff] transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Q3 — AI Relevance */}
            <div className="mb-8">
              <label className="font-dm text-[14px] text-white font-medium block mb-3">
                How important is it that your course stays relevant in the AI era?
              </label>
              {[
                { value: 'very_important', label: 'Very important — I want a career AI can\'t replace', emoji: '🛡️' },
                { value: 'combine_with_ai', label: 'I want to combine my field with AI/tech', emoji: '🤖' },
                { value: 'somewhat', label: 'Somewhat — but I\'ll adapt as needed', emoji: '🔄' },
                { value: 'not_worried', label: 'Not worried — I\'m pursuing what I love regardless', emoji: '❤️' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setAiRelevance(opt.value)}
                  className={`w-full font-dm text-[13px] px-4 py-3 rounded-[10px] border cursor-pointer transition-all duration-200 text-left mb-2 flex items-center gap-3
                    ${aiRelevance === opt.value
                      ? 'bg-[rgba(108,99,255,0.15)] border-[#6c63ff] text-white'
                      : 'bg-navy3 border-[rgba(108,99,255,0.15)] text-[rgba(240,242,255,0.5)] hover:border-[rgba(108,99,255,0.3)]'
                    }`}
                >
                  <span className="text-[18px]">{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            {/* Q4 — Anything else (optional) */}
            <div className="mb-8">
              <label className="font-dm text-[14px] text-white font-medium block mb-2">
                Anything else we should know? <span className="text-[rgba(240,242,255,0.35)] font-normal">(optional)</span>
              </label>
              <textarea
                className="w-full glass-card border-[rgba(255,255,255,0.1)] rounded-[12px] px-4 py-3.5 text-white font-dm text-[14px] outline-none focus:border-purple focus:shadow-[0_0_15px_rgba(108,99,255,0.2)] transition-all placeholder:text-[rgba(240,242,255,0.25)] resize-y"
                rows={2}
                style={{ minHeight: '60px' }}
                placeholder="e.g. I have a scholarship, parents prefer government colleges, I want to stay close to home..."
                value={additionalNote}
                onChange={(e) => setAdditionalNote(e.target.value)}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="font-dm text-[13px] text-[#ff6b6b] mb-4">{error}</p>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full font-sora text-[15px] font-semibold bg-gradient-to-r from-blue to-purple text-white py-3.5 rounded-full border-none cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(108,99,255,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-4"
            >
              Generate My PathReport →
            </button>
          </div>
        </div>
      </div>

      {/* Discovery Loading Screen Overlay */}
      {showLoadingOverlay && (
        <div className="fixed inset-0 z-50 bg-[#0A0A0F]/95 backdrop-blur-[24px] flex items-center justify-center p-6 animate-fadeIn">
          <div className="max-w-[480px] w-full glass-card p-8 rounded-[24px] border border-[rgba(108,99,255,0.15)] flex flex-col gap-6 shadow-[0_20px_50px_rgba(108,99,255,0.15)] hover:transform-none">
            <div className="text-center mb-2">
              <h3 className="font-sora text-[22px] font-bold text-white mb-2">Analyzing Your Career Vibe</h3>
              <p className="font-dm text-[13px] text-[rgba(240,242,255,0.45)]">Generating your personalized Career Vibe and PathReport...</p>
            </div>

            <div className="flex flex-col gap-5">
              {[
                'Understanding your interests...',
                'Identifying hidden strengths...',
                'Matching careers...',
                'Analyzing college fit...',
                'Finding opportunities...'
              ].map((label, idx) => {
                const stepProgress = loadingStepsProgress[idx]
                const isActive = idx === currentStepIndex
                const isCompleted = idx < currentStepIndex
                return (
                  <div key={idx} className="flex flex-col gap-1.5 opacity-90">
                    <div className="flex items-center justify-between font-dm text-[13px]">
                      <span className={isActive ? 'text-[#6c63ff] font-semibold' : isCompleted ? 'text-[#22d3a0]' : 'text-[rgba(240,242,255,0.3)]'}>
                        {label}
                      </span>
                      <span className={`font-mono text-[12px] ${isActive ? 'text-[#6c63ff]' : isCompleted ? 'text-[#22d3a0]' : 'text-[rgba(240,242,255,0.3)]'}`}>
                        {stepProgress}%
                      </span>
                    </div>
                    <div className="h-[6px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-100 ease-out rounded-full bg-gradient-to-r ${
                          isCompleted
                            ? 'from-[#22d3a0] to-[#22d3a0]'
                            : 'from-[#6c63ff] to-[#4f8ef7]'
                        }`}
                        style={{ width: `${stepProgress}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
