export type Category = 'launch' | 'news' | 'update' | 'research'
export type Topic = 'design' | 'models' | 'product' | 'research' | 'industry'

export interface Source {
  name: string
  url: string
  category: Category
  topic: Topic
}

export const RSS_SOURCES: Source[] = [
  {
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog/rss.xml',
    category: 'news',
    topic: 'models',
  },
  {
    name: 'Anthropic News',
    url: 'https://www.anthropic.com/rss.xml',
    category: 'news',
    topic: 'models',
  },
  {
    name: 'Google DeepMind',
    url: 'https://deepmind.google/blog/rss.xml',
    category: 'research',
    topic: 'models',
  },
  {
    name: 'Hugging Face Blog',
    url: 'https://huggingface.co/blog/feed.xml',
    category: 'update',
    topic: 'models',
  },
  {
    name: 'Mistral AI Blog',
    url: 'https://mistral.ai/rss',
    category: 'launch',
    topic: 'models',
  },
  {
    name: 'Stability AI Blog',
    url: 'https://stability.ai/blog/rss.xml',
    category: 'launch',
    topic: 'design',
  },
  {
    name: 'a16z AI',
    url: 'https://a16z.com/ai/feed/',
    category: 'news',
    topic: 'industry',
  },
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    category: 'news',
    topic: 'industry',
  },
  {
    name: 'VentureBeat AI',
    url: 'https://venturebeat.com/category/ai/feed/',
    category: 'news',
    topic: 'industry',
  },
  {
    name: 'The Batch (DeepLearning.AI)',
    url: 'https://www.deeplearning.ai/the-batch/feed/',
    category: 'research',
    topic: 'research',
  },
  {
    name: 'Papers With Code',
    url: 'https://paperswithcode.com/rss',
    category: 'research',
    topic: 'research',
  },
  {
    name: 'Hacker News AI',
    url: 'https://hnrss.org/newest?q=AI+OR+LLM+OR+GPT+OR+Claude+OR+machine+learning&points=50',
    category: 'news',
    topic: 'industry',
  },
  {
    name: 'Product Hunt AI',
    url: 'https://www.producthunt.com/feed?category=artificial-intelligence',
    category: 'launch',
    topic: 'design',
  },
]
