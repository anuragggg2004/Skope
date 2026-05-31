import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
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
    setProgress(92)
    setLoadingMsgIndex(0)

    try {
      const phase1 = JSON.parse(sessionStorage.getItem('skope_phase1'))
      const chatHistory = JSON.parse(sessionStorage.getItem('skope_chatHistory'))

      const preferences = {
        budget: budgetOptions.find(b => b.value === budget)?.label || budget,
        cities: selectedCities,
        ai_relevance: aiRelevance,
        additional_note: additionalNote
      }

      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase1, chatHistory, preferences })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to generate report.')
      }

      const data = await res.json()
      sessionStorage.setItem('pathreport', JSON.stringify(data))
      if (setPathReport) setPathReport(data)

      // Save report to MongoDB in the background if the user is authenticated
      if (user) {
        try {
          fetch('/api/save-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.uid,
              email: user.email,
              reportData: data
            })
          }).catch(e => console.error('Background report save failed:', e))
        } catch (saveErr) {
          console.error('Failed to initiate report save:', saveErr)
        }
      }

      setProgress(100)
      setTimeout(() => navigate('/result'), 400)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <>
      <div className="grid-bg" />
      <div className="orb-1" />
      <div className="orb-2" />
      <div className="page-wrapper">
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
                        ? 'bg-[rgba(79,142,247,0.15)] border-blue text-white'
                        : 'bg-navy3 border-[rgba(79,142,247,0.15)] text-[rgba(240,242,255,0.5)] hover:border-[rgba(79,142,247,0.3)]'
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
                        ? 'bg-[rgba(79,142,247,0.15)] border-blue text-white'
                        : 'bg-navy3 border-[rgba(79,142,247,0.15)] text-[rgba(240,242,255,0.5)] hover:border-[rgba(79,142,247,0.3)]'
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
                  className="flex-1 bg-navy3 border border-[rgba(79,142,247,0.15)] rounded-[10px] px-4 py-2 text-white font-dm text-[13px] outline-none focus:border-blue transition-colors placeholder:text-[rgba(240,242,255,0.25)]"
                  placeholder="Add another city..."
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomCity()}
                />
                <button
                  onClick={addCustomCity}
                  className="font-dm text-[12px] font-medium bg-navy3 border border-[rgba(79,142,247,0.15)] text-blue px-4 py-2 rounded-[10px] cursor-pointer hover:border-blue transition-colors"
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
                      ? 'bg-[rgba(79,142,247,0.15)] border-blue text-white'
                      : 'bg-navy3 border-[rgba(79,142,247,0.15)] text-[rgba(240,242,255,0.5)] hover:border-[rgba(79,142,247,0.3)]'
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
                  className="w-full glass-card border-[rgba(255,255,255,0.1)] rounded-[12px] px-4 py-3.5 text-white font-dm text-[14px] outline-none focus:border-purple focus:shadow-[0_0_15px_rgba(139,92,246,0.2)] transition-all placeholder:text-[rgba(240,242,255,0.25)] resize-y"
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
                className="w-full font-sora text-[15px] font-semibold bg-gradient-to-r from-blue to-purple text-white py-3.5 rounded-full border-none cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  {loadingMessages[loadingMsgIndex]} <LoadingDots />
                </span>
              ) : (
                'Generate My PathReport →'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
