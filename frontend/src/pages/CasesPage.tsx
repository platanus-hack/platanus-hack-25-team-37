import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, User, Loader2, AlertCircle, Circle, CircleDot, CheckCircle2 } from 'lucide-react'
import type { MediationCase, ContactAttempt } from '@/types'
import { wakaiApi } from '@/services/api'
import {
  mapConversationsToContactAttempts,
  mapBackendCasesToMediationCases,
} from '@/services/dataMapper'

function getStatusBadge(status: MediationCase['status']) {
  switch (status) {
    case 'completed':
      return <Badge variant="success">Completado</Badge>
    case 'in-progress':
      return <Badge variant="warning">En Progreso</Badge>
    case 'scheduled':
      return <Badge variant="neutral">Programado</Badge>
    case 'cancelled':
      return <Badge variant="destructive">Cancelado</Badge>
  }
}

type ContactProgress = 'no-contact' | 'in-progress' | 'contacted'

function calculateContactProgress(caseId: string, contacts: ContactAttempt[]): ContactProgress {
  const caseContacts = contacts.filter(c => c.caseId === caseId)

  if (caseContacts.length === 0) {
    return 'no-contact'
  }

  const hasSuccessful = caseContacts.some(c => c.result === 'successful')

  if (hasSuccessful) {
    return 'contacted'
  }

  return 'in-progress'
}

function getContactProgressIndicator(progress: ContactProgress) {
  switch (progress) {
    case 'no-contact':
      return (
        <div className="flex items-center gap-2">
          <Circle className="h-5 w-5 text-red-500 fill-red-500" />
          <span className="text-sm font-medium text-red-700">Sin Contacto</span>
        </div>
      )
    case 'in-progress':
      return (
        <div className="flex items-center gap-2">
          <CircleDot className="h-5 w-5 text-amber-500" />
          <span className="text-sm font-medium text-amber-700">En Proceso</span>
        </div>
      )
    case 'contacted':
      return (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500 fill-green-500" />
          <span className="text-sm font-medium text-green-700">Contactado</span>
        </div>
      )
  }
}

export function CasesPage() {
  const navigate = useNavigate()
  const [cases, setCases] = useState<MediationCase[]>([])
  const [contacts, setContacts] = useState<ContactAttempt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCases() {
      try {
        setIsLoading(true)
        setError(null)

        // Use new /api/cases endpoint
        const response = await wakaiApi.getAllCases()
        const mappedCases = mapBackendCasesToMediationCases(response.cases)

        // Sort by date, most recent first
        mappedCases.sort((a, b) => b.mediationDate.getTime() - a.mediationDate.getTime())

        setCases(mappedCases)

        // Load conversations for contact attempts
        try {
          const conversationsResponse = await wakaiApi.getAllConversations()
          const mappedContacts = mapConversationsToContactAttempts(conversationsResponse.data)
          setContacts(mappedContacts)
        } catch (convError) {
          console.warn('Could not load contact attempts:', convError)
          setContacts([])
        }
      } catch (err) {
        console.error('Error loading cases:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar casos')
      } finally {
        setIsLoading(false)
      }
    }

    loadCases()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-neutral-900">Casos</h2>
          <p className="mt-2 text-base text-neutral-600">
            {cases.length} {cases.length === 1 ? 'caso' : 'casos'} de mediación
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
          <p className="text-sm text-neutral-600">Cargando casos...</p>
        </div>
      ) : error ? (
        <div className="card-elevated rounded-2xl p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-neutral-900">Error al cargar casos</p>
              <p className="text-sm text-neutral-600 mt-1">{error}</p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              className="mt-2 bg-neutral-900 hover:bg-neutral-800 text-white"
            >
              Reintentar
            </Button>
          </div>
        </div>
      ) : cases.length === 0 ? (
        <div className="card-elevated rounded-2xl p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <User className="h-8 w-8 text-neutral-400" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-neutral-900">No hay casos</p>
              <p className="text-sm text-neutral-600 mt-1">
                Los casos aparecerán aquí cuando estén disponibles
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {cases.map(mediationCase => {
            const contactProgress = calculateContactProgress(mediationCase.id, contacts)
            return (
              <div
                key={mediationCase.id}
                onClick={() => navigate(`/cases/${mediationCase.id}`)}
                className="card-elevated rounded-2xl p-6 cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-apple-sm flex-shrink-0">
                      <User className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-lg text-neutral-900 truncate">
                          {mediationCase.participantName}
                        </h3>
                        {getStatusBadge(mediationCase.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-600">
                        <span className="font-mono">{mediationCase.rut}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {mediationCase.mediationDate.toLocaleDateString('es-CL', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getContactProgressIndicator(contactProgress)}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400">
                      →
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
