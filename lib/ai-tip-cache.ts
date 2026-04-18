type TipCacheEntry = {
  suggestion: string
  createdAt: number
}

const PREFIX = 'kw_ai_tip:v1:'
const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 días

function canUseStorage() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

function norm(v: string | undefined | null) {
  return (v ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
}

export function buildTipCacheKey(input: {
  medicationId?: string
  medicationName: string
  dose?: string
  conditions?: string[]
}) {
  if (input.medicationId) return `${PREFIX}id:${input.medicationId}`

  const name = norm(input.medicationName)
  const dose = norm(input.dose)
  const cond = (input.conditions ?? []).map(norm).filter(Boolean).sort().join(',')
  return `${PREFIX}req:${encodeURIComponent(`${name}|${dose}|${cond}`)}`
}

export function getCachedTip(key: string, ttlMs = DEFAULT_TTL_MS): string | null {
  if (!canUseStorage()) return null
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const data = JSON.parse(raw) as Partial<TipCacheEntry>
    if (!data?.suggestion || !data?.createdAt) return null
    if (Date.now() - data.createdAt > ttlMs) {
      localStorage.removeItem(key)
      return null
    }
    return data.suggestion
  } catch {
    return null
  }
}

export function setCachedTip(key: string, suggestion: string) {
  if (!canUseStorage()) return
  try {
    const entry: TipCacheEntry = { suggestion, createdAt: Date.now() }
    localStorage.setItem(key, JSON.stringify(entry))
  } catch {
    // ignore quota / serialization errors
  }
}
