// Minimal client-side event bus to keep pages in sync after mutations.

export type DataChangeType =
  | 'auth'
  | 'user'
  | 'medications'
  | 'events'
  | 'adherence'
  | 'health'

const EVENT_NAME = 'kw:data:changed'

export function emitDataChanged(type: DataChangeType) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { type } }))
}

export function onDataChanged(cb: (type: DataChangeType) => void) {
  if (typeof window === 'undefined') return () => {}

  const handler = (e: Event) => {
    const ce = e as CustomEvent
    const type = ce?.detail?.type as DataChangeType | undefined
    if (type) cb(type)
  }

  window.addEventListener(EVENT_NAME, handler as EventListener)
  return () => window.removeEventListener(EVENT_NAME, handler as EventListener)
}
