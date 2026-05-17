export async function POST(req) {
  const { messages } = await req.json()
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    return Response.json({ reply: 'API Key missing in Vercel da. Settings la Environment Variables check pannu.' })
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ 
      model: 'gpt-4o-mini', 
      messages: messages, 
      temperature: 0.7, 
      max_tokens: 200 
    })
  })
  
  const data = await response.json()
  return Response.json({ reply: data.choices[0].message.content })
}
