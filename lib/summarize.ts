import OpenAI from 'openai'
import type { Category, Topic } from './sources'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export interface SummarizeResult {
  summary: string
  category: Category
  topic: Topic
}

const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  launch: 'a new product, tool, or model launch/release',
  news: 'general AI industry news, company announcements, or business updates',
  update: 'an update, improvement, or new version of an existing product',
  research: 'academic research, papers, technical findings, or benchmarks',
}

const TOPIC_DESCRIPTIONS: Record<Topic, string> = {
  design: 'AI tools for UI/UX, prototyping, generative design, creative workflows, image/video generation',
  models: 'foundation model releases, benchmarks, capability announcements, model architecture',
  product: 'AI in product planning, roadmaps, competitive landscape, features, product strategy',
  research: 'user research, academic papers, AI studies, methodologies, technical findings',
  industry: 'company news, funding, partnerships, policy, regulations, general AI business news',
}

export async function summarizeItem(
  title: string,
  rawContent: string,
  hintCategory: Category,
  hintTopic: Topic
): Promise<SummarizeResult> {
  const categoryOptions = Object.entries(CATEGORY_DESCRIPTIONS)
    .map(([key, desc]) => `- ${key}: ${desc}`)
    .join('\n')

  const topicOptions = Object.entries(TOPIC_DESCRIPTIONS)
    .map(([key, desc]) => `- ${key}: ${desc}`)
    .join('\n')

  const prompt = `You are an AI news editor for AI Radar, a feed for digital product designers, PMs, and researchers.

Given the following article, do three things:
1. Write a concise 1–2 sentence summary (max 200 characters) suitable for a news feed card.
2. Classify it into exactly one category (what type of content it is).
3. Classify it into exactly one topic (what the content is about, for the target audience).

Categories:
${categoryOptions}

Topics:
${topicOptions}

Article title: ${title}
Article content: ${rawContent.slice(0, 1500)}

Respond in this exact JSON format (no markdown, no extra text):
{"summary":"...","category":"launch|news|update|research","topic":"design|models|product|research|industry"}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.choices[0]?.message?.content ?? ''
    const parsed = JSON.parse(text) as { summary: string; category: Category; topic: Topic }

    const validCategories: Category[] = ['launch', 'news', 'update', 'research']
    const validTopics: Topic[] = ['design', 'models', 'product', 'research', 'industry']

    const category = validCategories.includes(parsed.category) ? parsed.category : hintCategory
    const topic = validTopics.includes(parsed.topic) ? parsed.topic : hintTopic

    return {
      summary: parsed.summary?.slice(0, 300) ?? title,
      category,
      topic,
    }
  } catch (err) {
    console.error('[summarize] OpenAI error:', err)
    return {
      summary: title,
      category: hintCategory,
      topic: hintTopic,
    }
  }
}
