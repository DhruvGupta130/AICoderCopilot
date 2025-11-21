import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string

if (!apiKey) {
  console.warn('Missing Gemini API key. Set VITE_GEMINI_API_KEY')
}

const genAI = new GoogleGenerativeAI(apiKey || '')

export async function generateCode(prompt: string, language: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const system = `You are a code generation assistant. Write high-quality, idiomatic ${language} code. 
Return ONLY code, no explanations, no backticks.`
  const fullPrompt = `${system}\n\nTask: ${prompt}`
  const res = await model.generateContent(fullPrompt)
  const text = res.response.text() || ''
  // Ensure no backticks
  return text.replace(/^```[a-zA-Z]*\n?|```$/g, '').trim()
}
