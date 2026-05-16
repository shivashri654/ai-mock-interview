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

  // SCORE CARD STATES - PUDHUSA ADD PANNIRUKEN
  const [score, setScore] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [showScorePage, setShowScorePage] = useState(false)

  const handleLogin = () => {
    if (name && email) {
      setCurrentPage('home')
    }
  }

  // UN OPENAI API CALL FUNCTION INGA PODU - PLACEHOLDER
  const callOpenAI = async (prompt) => {
    // NEE UN API KEY + FETCH CODE INGA PODANUM
    // TEMPORARY MOCK RESPONSE FOR TESTING
    return `Score: 8.5/10
Strengths:
- Clear communication skills
- Good real-world examples

Weaknesses:
- Need more technical depth
- Explain concepts slower

Tip: Use STAR method (Situation, Task, Action, Result) for behavioral questions`
  }

  // SUBMIT ANSWER FUNCTION - UN OLD CODE IRUNDHA ADHA VAI
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return

    setLoading(true)

    // User message add pannu
    const newConversation = [...conversation, { role: 'user', text: userAnswer }]
    setConversation(newConversation)
    setUserAnswer('')

    // AI RESPONSE - UN OLD API CALL INGA IRUKUM
    // TEMPORARY MOCK:
    setTimeout(() => {
      setConversation([...newConversation, {
        role: 'ai',
        text: 'That\'s a good answer! Next question: Explain React hooks.'
      }])
      setLoading(false)
    }, 1500)
  }

  // END INTERVIEW + SCORE FUNCTION - PUDHUSA
  const handleEndInterview = async () => {
    setLoading(true)

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

  // SCORE PAGE - PUDHUSA ADD PANNIRUKEN
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

  // HOME/SETUP PAGE - UN CODE INGA PODU
  if (currentPage === 'home') {
    return (
      <div className="setup-container">
        <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle">
          {darkMode? '☀️ Light' : '🌙 Dark'}
        </button>

        <h1>Setup Interview</h1>
        {/* UN OLD SETUP FORM CODE INGA PODU */}
        <button onClick={() => setCurrentPage('interview')}>Start Interview</button>
      </div>
    )
  }

  // INTERVIEW PAGE - END INTERVIEW BUTTON ADD PANNIRUKEN
  if (currentPage === 'interview') {
    return (
      <div className="interview-container">
        <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle">
          {darkMode? '☀️ Light' : '🌙 Dark'}
        </button>

        <h1>AI Mock Interview</h1>

        {/* CONVERSATION DISPLAY */}
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

          {/* LOADING SKELETON */}
          {loading && (
            <div className="ai-msg skeleton-wrapper">
              <strong>AI: </strong>
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          )}
        </div>

        {/* END INTERVIEW BUTTON - PUDHUSA */}
        {conversation.length > 2 &&!loading && (
          <button
            onClick={handleEndInterview}
            className="end-interview-btn"
            disabled={loading}
          >
            🏁 End Interview & Get Score
          </button>
        )}

        {/* INPUT AREA */}
        <div className="input-area">
          <textarea
            placeholder="Type your answer..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={loading}
          />
          <button
            onClick={handleSubmitAnswer}
            disabled={loading ||!userAnswer}
          >
            {loading? 'Sending...' : 'Submit'}
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default App