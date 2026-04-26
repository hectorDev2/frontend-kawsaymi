import type { KnowledgeAnswerSource } from '@/lib/api'

export const TRUSTED_HEALTH_SOURCE_LABEL = 'MINSA / OMS'

export const TRUSTED_HEALTH_SOURCE_PATTERNS = [
  /\bminsa\b/i,
  /ministerio de salud/i,
  /\boms\b/i,
  /organizaci[oó]n mundial de la salud/i,
  /\bwho\b/i,
  /world health organization/i,
] as const

function matchesTrustedHealthSource(value: string | null | undefined) {
  if (!value) return false
  return TRUSTED_HEALTH_SOURCE_PATTERNS.some((pattern) => pattern.test(value))
}

export function isTrustedHealthSource(source: Pick<KnowledgeAnswerSource, 'source' | 'title'>) {
  return matchesTrustedHealthSource(source.source) || matchesTrustedHealthSource(source.title)
}

export function getUntrustedHealthSources(sources: KnowledgeAnswerSource[] | null | undefined) {
  return (sources ?? []).filter((source) => !isTrustedHealthSource(source))
}

export function buildTrustedHealthSourcesInstruction() {
  return [
    'Usá únicamente información respaldada por fuentes sanitarias oficiales y confiables.',
    `Priorizá ${TRUSTED_HEALTH_SOURCE_LABEL} y equivalentes oficiales.`,
    `Si no hay respaldo claro en ${TRUSTED_HEALTH_SOURCE_LABEL}, respondé que no hay evidencia suficiente.`,
  ].join(' ')
}
