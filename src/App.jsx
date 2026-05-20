import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // DARK MODE STATES
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('darkMode') === 'true'
    setDarkMode(saved)
  }, [])

  useEffect(() => {
    document.body.className = darkMode? 'dark' : 'light'
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  // Page routing: 'login', 'home', 'interview'
  const [currentPage, setCurrentPage] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  // Interview Setup States
  const [interviewConfig, setInterviewConfig] = useState({
    role: '',
    company: '',
    experience: '',
    topics: 'React',
    difficulty: 'Medium'
  })

  // Interview States
  const [conversation, setConversation] = useState([])
  const [userAnswer, setUserAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  // VOICE STATE - USER KU 🎤
  const [listening, setListening] = useState(false)

  // AI VOICE STATE - PUDHUSA 🔊
  const [speaking, setSpeaking] = useState(false)

  // SCORE CARD STATES
  const [score, setScore] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [showScorePage, setShowScorePage] = useState(false)

  const handleLogin = () => {
    if (name && email) {
      setCurrentPage('home')
    }
  }

  // AI KU VAAI KUDUKUM FUNCTION 🔊
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.95
      utterance.pitch = 1
      utterance.lang = 'en-US'

      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => setSpeaking(false)

      window.speechSynthesis.speak(utterance)
    }
  }

  // USER VOICE FUNCTION 🎤 - UPDATED
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) &&!('SpeechRecognition' in window)) {
      alert('Voice support illa da. Chrome la HTTPS la try pannu')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setListening(true)
    }

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      if (finalTranscript) {
        setUserAnswer(prev => prev? prev + ' ' + finalTranscript : finalTranscript)
      } else if (interimTranscript) {
        setUserAnswer(prev => {
          const baseText = prev.split(' [typing...]')[0]
          return baseText + ' [typing...] ' + interimTranscript
        })
      }
    }

    recognition.onerror = (event) => {
      console.error('Voice Error:', event.error)
      setListening(false)
      if (event.error === 'not-allowed') {
        alert('Mic Permission kuduka sollu da. Browser settings la Allow pannu')
      } else if (event.error === 'no-speech') {
        alert('Onnum pesa maatinga da. Marubadiyum try pannu')
      }
    }

    recognition.onend = () => {
      setListening(false)
      setUserAnswer(prev => prev.replace(' [typing...] ', ' ').replace(' [typing...]', ''))
    }

    recognition.start()
  }

  // ✅ PUDHU FUNCTION: INTERVIEW START PANNA
  const handleStartInterview = async () => {
    setConversation([]) // 1. Pazhaya chat ah kalichiru
    setCurrentPage('interview') // 2. Interview page ku po
    await startAIInterview() // 3. AI ku "hi" anupi start pannu
  }

  // ✅ PUDHU FUNCTION: AI AH EZHUPPA
  const startAIInterview = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'hi' }] // AI ku "hi" anuprom
        })
      })
      const data = await res.json()
      const aiFirstMsg = { role: 'ai', text: data.reply }
      setConversation([aiFirstMsg]) // AI oda first msg ah kaatu
      speakText(data.reply) // AI pesa vaikkum
    } catch (err) {
      console.error(err)
      setConversation([{
        role: 'ai',
        text: 'Hi! Which field or job role are you preparing for? Example: Web Development, Data Science, Marketing, HR, etc.'
      }])
    }
    setLoading(false)
  }

  // ✅ UPDATED: SENTIMENT + CONTENT ANALYSIS + HR SUGGESTION AI
  const callOpenAI = async (userAnswer, history) => {
    const lastQuestions = history.filter(m => m.role === 'ai').map(m => m.text).slice(-3)

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
         ...history.map(m => ({
            role: m.role === 'ai'? 'assistant' : 'user',
            content: m.text
          })),
          { role: 'user', content: userAnswer }
        ]
      })
    })

    const data = await res.json()
    return data.reply
  }

  // ✅ UPDATED: SUBMIT ANSWER
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || loading) return

    setLoading(true)
    window.speechSynthesis.cancel()

    const newConversation = [...conversation, { role: 'user', text: userAnswer }]
    setConversation(newConversation)
    setUserAnswer('')

    try {
      const aiResponse = await callOpenAI(userAnswer, newConversation)

      const updatedConversation = [...newConversation, {
        role: 'ai',
        text: aiResponse
      }]
      setConversation(updatedConversation)
      speakText(aiResponse)
    } catch (err) {
      console.error(err)
      setConversation([...newConversation, {
        role: 'ai',
        text: 'Sorry, error occurred. Please try again.'
      }])
    }

    setLoading(false)
  }

  // END INTERVIEW + SCORE FUNCTION
  const handleEndInterview = async () => {
    setLoading(true)
    window.speechSynthesis.cancel()

    const fullConversation = conversation.map(msg =>
      `${msg.role === 'user'? 'Candidate' : 'Interviewer'}: ${msg.text}`
    ).join('\n\n')

    const prompt = `You are an expert interviewer. Based on this interview, give me:
1. Score out of 10 - only number
2. 2 Strengths
3. 2 Weaknesses
4. 1 Tip to improve

Interview:
${fullConversation}

Format:
Score: X/10
Strengths:...
Weaknesses:...
Tip:...`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await res.json()
      const response = data.reply

      const scoreMatch = response.match(/Score:\s*(\d+\.?\d*)\/10/i)
      const extractedScore = scoreMatch? scoreMatch[1] : '0'
      setScore(extractedScore)
      setFeedback(response)
      setShowScorePage(true)
    } catch (error) {
      console.error('Error:', error)
      setScore('0')
      setFeedback('Error calculating score. Please try again.')
      setShowScorePage(true)
    }

    setLoading(false)
  }

  // LOGIN PAGE
  if (currentPage === 'login') {
    return (
      <div className="login-container">
        <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle">
          {darkMode? '☀️ Light' : '🌙 Dark'}
        </button>

        <h1>AI Mock Interview</h1>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    )
  }

  // SCORE PAGE - REWARD SYSTEM 🏆
  if (showScorePage) {
    return (
      <div className="score-container">
        <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle">
          {darkMode? '☀️ Light' : '🌙 Dark'}
        </button>

        <div className="score-card">
          <h1>🎉 Interview Complete!</h1>

          <div className="score-circle">
            <span className="score-number">{score}</span>
            <span className="score-total">/10</span>
          </div>

          {parseFloat(score) >= 8.5 && (
            <p className="badge-text">🏆 You earned a Gold Badge!</p>
          )}
          {parseFloat(score) >= 7 && parseFloat(score) < 8.5 && (
            <p className="badge-text">🥈 You earned a Silver Badge!</p>
          )}

          <div className="feedback-box">
            <pre>{feedback}</pre>
          </div>

          <button
            onClick={() => {
              setShowScorePage(false)
              setConversation([])
              setScore(null)
              setCurrentPage('home')
            }}
            className="restart-btn"
          >
            🔄 Start New Interview
          </button>
        </div>
      </div>
    )
  }

  // HOME/SETUP PAGE - ✅ IDHU DHAAN MAATHUNOM
  if (currentPage === 'home') {
    return (
      <div className="setup-container">
        <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle">
          {darkMode? '☀️ Light' : '🌙 Dark'}
        </button>

        <h1>Setup Interview</h1>
        <button onClick={handleStartInterview}>Start Interview</button>
      </div>
    )
  }

  // INTERVIEW PAGE
  if (currentPage === 'interview') {
    return (
      <div className="interview-container">
        <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle">
          {darkMode? '☀️ Light' : '🌙 Dark'}
        </button>

        <h1>AI Mock Interview {speaking && '🔊'}</h1>

        <div className="chat-box">
          {conversation.map((msg, index) => (
            <div
              key={index}
              className={msg.role === 'user'? 'user-msg' : 'ai-msg'}
            >
              <strong>{msg.role === 'user'? 'You: ' : 'AI: '}</strong>
              {msg.text}
            </div>
          ))}

          {loading && (
            <div className="ai-msg skeleton-wrapper">
              <strong>AI: </strong>
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          )}
        </div>

        {conversation.length > 2 &&!loading && (
          <button
            onClick={handleEndInterview}
            className="end-interview-btn"
            disabled={loading}
          >
            🏁 End Interview & Get Score
          </button>
        )}

        <div className="input-area">
          <textarea
            placeholder="Type your answer or click Speak..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={loading}
            rows={4}
          />

          <div className="button-group">
            <button
              onClick={startListening}
              disabled={listening || loading}
              className="voice-btn"
            >
              {listening? '🔴 Listening...' : '🎤 Speak'}
            </button>

            <button
              onClick={handleSubmitAnswer}
              disabled={loading ||!userAnswer}
              className="submit-btn"
            >
              {loading? 'Sending...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default App
