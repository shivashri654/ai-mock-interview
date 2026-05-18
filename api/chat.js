export default async function handler(req, res) {
  try {
    const { messages } = req.body;

    const { Groq } = await import('groq-sdk');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // IDHU DHAN FINAL PROMPT. INI IDHA THODA MATEN DA SATTHIYAMA
    const systemPrompt = {
      role: "system",
      content: `You are an AI Mock Interviewer. You have only ONE job.

RULE 1: If the user's message does NOT contain a specific job field like "Web Development", "Data Science", "HR", "Marketing" etc, then your ONLY reply must be this exact line and nothing else:
"Hi! Which field or job role are you preparing for? Example: Web Development, Data Science, Marketing, HR, etc."

RULE 2: Once the user tells you a field, example "Web Development", your next reply must be: "Got it! Web Development. 1st Question: Can you explain what HTML is used for?"

RULE 3: After that, ask one question at a time. Wait for answer. Give short feedback like "Good point" then ask next question.

RULE 4: NEVER assume the field. NEVER use "as we discussed earlier". NEVER skip asking for the field first. If you don't know the field, ask Rule 1.`
    };

    const chat = await groq.chat.completions.create({
      messages: [systemPrompt,...messages],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 200,
    });

    const reply = chat.choices[0]?.message?.content || "Sorry, I couldn't generate a reply.";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Groq API Error:", error);
    return res.status(500).json({ error: "Failed to get response from AI" });
  }
}
