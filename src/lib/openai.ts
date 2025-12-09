import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export interface AnalysisResult {
    summary: string
    keywords: string[]
    keyPoints: string[]
    actionItems: string[]
}

/**
 * Analyze document text using OpenAI
 */
export async function analyzeDocument(text: string): Promise<AnalysisResult> {
    try {
        const prompt = `Analyze the following document and provide:
1. A concise summary (2-3 sentences)
2. Key keywords (5-8 words)
3. Main key points (3-5 bullet points)
4. Action items if any (tasks or next steps)

Document:
${text.substring(0, 8000)} // Limit to avoid token limits

Respond in JSON format:
{
  "summary": "...",
  "keywords": ["...", "..."],
  "keyPoints": ["...", "..."],
  "actionItems": ["...", "..."]
}`

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a document analysis assistant. Provide clear, concise analysis in JSON format.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.5,
            max_tokens: 1000
        })

        const responseText = completion.choices[0]?.message?.content || '{}'

        // Parse JSON response
        const result = JSON.parse(responseText)

        return {
            summary: result.summary || 'No summary available',
            keywords: result.keywords || [],
            keyPoints: result.keyPoints || [],
            actionItems: result.actionItems || []
        }
    } catch (error) {
        console.error('OpenAI analysis error:', error)
        throw new Error('Failed to analyze document')
    }
}
