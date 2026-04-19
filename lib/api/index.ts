/**
 * Punto de entrada único de la API.
 *
 * Para usar mock:  NEXT_PUBLIC_USE_MOCK=true  (o no definir API_URL)
 * Para usar real:  NEXT_PUBLIC_USE_MOCK=false  + NEXT_PUBLIC_API_URL=https://kawsaymi-care-backend.onrender.com
 */

import { mockApi } from './mock'
import { httpApi } from './http'

const useMock =
  process.env.NEXT_PUBLIC_USE_MOCK === 'true' ||
  !process.env.NEXT_PUBLIC_API_URL

export const api = useMock ? mockApi : httpApi

export * from './types'
