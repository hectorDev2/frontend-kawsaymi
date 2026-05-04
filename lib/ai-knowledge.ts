import type { KnowledgeMatch } from '@/lib/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://kawsaymi-care-backend.onrender.com' 
    : 'http://localhost:3001')

export interface KnowledgeSearchResult {
  matches: KnowledgeMatch[]
}

export async function searchKnowledge(query: string, k = 3): Promise<KnowledgeSearchResult> {
  try {
    const res = await fetch(`${API_URL}/knowledge/search?q=${encodeURIComponent(query)}&k=${k}`)
    if (!res.ok) {
      console.error('Knowledge search failed:', res.status)
      return { matches: [] }
    }
    return res.json()
  } catch (error) {
    console.error('Knowledge search error:', error)
    return { matches: [] }
  }
}

export function extractContextFromMatches(matches: KnowledgeMatch[], maxChars = 1500): string {
  if (!matches || matches.length === 0) return ''
  
  const contents = matches
    .map(m => m.content)
    .filter(Boolean)
    .join('\n\n')
  
  if (contents.length > maxChars) {
    return contents.slice(0, maxChars) + '...'
  }
  return contents
}