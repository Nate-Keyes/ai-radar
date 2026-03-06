import OpenAI from 'openai'
import type { Category } from './sources'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export interface SummarizeResult {
  summary: string
  category: Category
}

const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  launch: 'a new product, tool, or model launch/release',
  news: 'general AI industry news, company announcements, or business updates',
  update: 'an update, improvement, or new version of an existing product',
  research: 'academic research, papers, technical findings, or benchmarks',
}

export async function summarizeItem(
  title: string,
  rawContent: string,
  hintCategory: Category
): Promise<SummarizeResult> {
  const categoryOptions = Object.entries(CATEGORY_DESCRIPTIONS)
    .map(([key, desc]) => `- ${key}: ${desc}`)
    .join('\n')

  const prompt = `You are an AI news editor for AI Radar, a feed of AI tool launches, news, and research.

Given the following article, do two things:
1. Write a concise 1–2 sentence summary (max 200 characters) suitable for a news feed card.
2. Classify it into exactly one category.

Categories:
${categoryOptions}

Article title: ${title}
Article content: ${rawContent.slice(0, 1500)}

Respond in this exact JSON format (no markdown, no extra text):
{"summary":"...","category":"launch|news|update|research"}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.choices[0]?.message?.content ?? ''
    const parsed = JSON.parse(text) as { summary: string; category: Category }

    const validCategories: Category[] = ['launch', 'news', 'update', 'research']
    const category = validCategories.includes(parsed.category) ? parsed.category : hintCategory

    return {
      summary: parsed.summary?.slice(0, 300) ?? title,
      category,
    }
  } catch (err) {
    console.error('[summarize] OpenAI error:', err)
    return {
      summary: title,
      category: hintCategory,
    }
  }
}
