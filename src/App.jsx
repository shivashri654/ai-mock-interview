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
    topics: '',
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

  // AI KU VAAI KUDUKUM FUNCTION 🔊 PUDHUSA
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

  // USER VOICE FUNCTION 🎤
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Browser la Voice support illa da. Chrome la try pannu')
      return
    }

    const recognition = new window.webkitSpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setListening(true)

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setUserAnswer(prev => prev? prev + ' ' + transcript : transcript)
      setListening(false)
    }

    recognition.onerror = (event) => {
      console.error('Voice Error:', event.error)
      setListening(false)
      if(event.error === 'not-allowed') {
        alert('Mic Permission kuduka sollu da. Site settings la Allow pannu')
      }
    }

    recognition.onend = () => setListening(false)
    recognition.start()
  }

  // UN OPENAI API CALL FUNCTION INGA PODU - PLACEHOLDER
  const callOpenAI = async (prompt) => {
    // NEE UN API KEY + FETCH CODE INGA PODANUM
    return `Score: 8.5/10
Strengths:
- Clear communication skills
- Good real-world examples

Weaknesses:
- Need more technical depth
- Explain concepts slower

Tip: Use STAR method (Situation, Task, Action, Result) for behavioral questions`
  }

  // SUBMIT ANSWER FUNCTION
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return

    setLoading(true)
    window.speechSynthesis.cancel() // AI pesa try panna stop pannu

    const newConversation = [...conversation, { role: 'user', text: userAnswer }]
    setConversation(newConversation)
    setUserAnswer('')

    setTimeout(() => {
      const aiResponse = 'That\'s a good answer! Next question: Explain React hooks.'
      setConversation([...newConversation, {
        role: 'ai',
        text: aiResponse
      }])
      speakText(aiResponse) // AI AH PESAVA VAI DA 🔥
      setLoading(false)
    }, 1500)
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
      const response = await callOpenAI(prompt)
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

  // HOME/SETUP PAGE
  if (currentPage === 'home') {
    return (
      <div className="setup-container">
        <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle">
          {darkMode? '☀️ Light' : '🌙 Dark'}
        </button>

        <h1>Setup Interview</h1>
        <button onClick={() => setCurrentPage('interview')}>Start Interview</button>
      </div>
    )
  }

  // INTERVIEW PAGE - FULL SCREEN UI UPDATE PANNIRUKEN 🔥
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
