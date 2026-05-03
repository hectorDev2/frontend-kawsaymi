'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

interface Source {
  id: string
  title: string | null
  page: number
  score: number
  category?: string | null
}

export default function KnowledgeChatPage() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sources, setSources] = useState<Source[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setLoading(true)
    setError(null)
    setAnswer(null)
    setSources([])

    try {
      const response = await api.knowledgeAnswer({
        q: question,
        k: 6,
        scoreMin: 0.5
      })

      setAnswer(response.answer)
      setSources(response.sources.map(s => ({
        id: s.id,
        title: s.title || s.source.replace('local:', ''),
        page: s.page,
        score: s.score,
        category: s.category
      })))
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Error al obtener respuesta')
    } finally {
      setLoading(false)
    }
  }

  const exampleQuestions = [
    '¿Qué medicamentos hay para hipertensión?',
    '¿Cuáles son las enfermedades cardiovasculares más comunes?',
    '¿Qué tratamiento hay para diabetes tipo 2?',
    '¿Medicamentos para EPOC?',
  ]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Asistente Médico IA
        </h1>
        <p className="text-gray-600">
          Consultá nuestra base de conocimiento médico con IA. Las respuestas se basan en documentos médicos verificados.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ej: ¿Qué medicamentos hay para hipertensión?"
            className="w-full p-4 pr-32 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Consultando...
              </span>
            ) : (
              'Preguntar'
            )}
          </button>
        </div>
      </form>

      {exampleQuestions.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">Ejemplos de preguntas:</p>
          <div className="flex flex-wrap gap-2">
            {exampleQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => setQuestion(q)}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                disabled={loading}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-red-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {answer && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
              </svg>
              Respuesta:
            </h2>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{answer}</p>
            </div>
          </div>

          {sources.length > 0 && (
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10a7.968 7.968 0 00-3.5-.804 7.962 7.962 0 00-4.5 1.385z" />
                </svg>
                Fuentes:
              </h3>
              <ul className="space-y-2">
                {sources.map((source) => (
                  <li
                    key={source.id}
                    className="flex items-start gap-3 text-sm text-gray-600 bg-white p-3 rounded border border-gray-200"
                  >
                    <span className="font-mono text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {source.id}
                    </span>
                    <div className="flex-1">
                      <span className="font-medium">{source.title}</span>
                      <span className="text-gray-400 mx-2">•</span>
                      <span>pág. {source.page}</span>
                      {source.category && (
                        <>
                          <span className="text-gray-400 mx-2">•</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            {source.category}
                          </span>
                        </>
                      )}
                      <span className="text-gray-400 mx-2">•</span>
                      <span className="text-gray-400">score: {source.score.toFixed(2)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-yellow-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Esta información es orientativa y <strong>no reemplaza la consulta médica profesional</strong>. Siempre consultá con un profesional de la salud para diagnóstico y tratamiento.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!answer && !loading && !error && (
        <div className="text-center py-12 text-gray-400">
          <svg className="mx-auto h-16 w-16 mb-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p>Hacé una pregunta para comenzar</p>
        </div>
      )}
    </div>
  )
}
