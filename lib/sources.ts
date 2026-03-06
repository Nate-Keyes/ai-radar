export type Category = 'launch' | 'news' | 'update' | 'research'

export interface Source {
  name: string
  url: string
  category: Category
}

export const RSS_SOURCES: Source[] = [
  {
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog/rss.xml',
    category: 'news',
  },
  {
    name: 'Anthropic News',
    url: 'https://www.anthropic.com/rss.xml',
    category: 'news',
  },
  {
    name: 'Google DeepMind',
    url: 'https://deepmind.google/blog/rss.xml',
    category: 'research',
  },
  {
    name: 'Hugging Face Blog',
    url: 'https://huggingface.co/blog/feed.xml',
    category: 'update',
  },
  {
    name: 'Mistral AI Blog',
    url: 'https://mistral.ai/rss',
    category: 'launch',
  },
  {
    name: 'Stability AI Blog',
    url: 'https://stability.ai/blog/rss.xml',
    category: 'launch',
  },
  {
    name: 'a16z AI',
    url: 'https://a16z.com/ai/feed/',
    category: 'news',
  },
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    category: 'news',
  },
  {
    name: 'VentureBeat AI',
    url: 'https://venturebeat.com/category/ai/feed/',
    category: 'news',
  },
  {
    name: 'The Batch (DeepLearning.AI)',
    url: 'https://www.deeplearning.ai/the-batch/feed/',
    category: 'research',
  },
  {
    name: 'Papers With Code',
    url: 'https://paperswithcode.com/rss',
    category: 'research',
  },
  {
    name: 'Hacker News AI',
    url: 'https://hnrss.org/newest?q=AI+OR+LLM+OR+GPT+OR+Claude+OR+machine+learning&points=50',
    category: 'news',
  },
  {
    name: 'Product Hunt AI',
    url: 'https://www.producthunt.com/feed?category=artificial-intelligence',
    category: 'launch',
  },
]
