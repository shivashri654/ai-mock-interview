export default async function handler(req, res) {
  try {
    const body = await req.json();
    const { messages } = body;

    const { Groq } = await import('groq-sdk');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // IDHU DHAAN MAGIC PROMPT DA 🔥
    const systemPrompt = {
      role: "system",
      content: `You are a professional AI Mock Interviewer.

      RULES:
      1. If this is the first message, ask: "Hi! Which field or job role are you preparing for? Example: Web Development, Data Science, Marketing, HR, etc."
      2. Once the user tells the field, act as an expert interviewer for THAT SPECIFIC FIELD ONLY.
      3. Ask one question at a time. Mix technical and HR questions.
      4. After user answers, give short feedback: "Good answer" or "You can add this point..." then ask the next question.
      5. Keep replies under 3 lines. Be encouraging.
      6. NEVER ask about React, Python, or any specific tech unless the user mentioned that field.

      Start the interview now.`
    };

    const chat = await groq.chat.completions.create({
      messages: [systemPrompt,...messages],
      model: 'llama-3.1-8b-instant',
    });

    return res.status(200).json({ reply: chat.choices[0].message.content });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
