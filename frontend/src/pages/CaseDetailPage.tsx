import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Calendar,
  Users,
  MessageCircle,
  FileText as ReportIcon,
  Heart,
  Tag,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { ContactAttemptCard } from '@/features/contacts/ContactAttemptCard'
import type { MediationCase, ContactAttempt } from '@/types'
import { wakaiApi } from '@/services/api'
import {
  mapConversationsToContactAttempts,
  mapBackendCaseToMediationCase,
} from '@/services/dataMapper'

function getEmotionalStatusBadge(status?: MediationCase['emotionalStatus']) {
  if (!status) return null
  switch (status) {
    case 'cooperative':
      return <Badge variant="success">Cooperativo</Badge>
    case 'neutral':
      return <Badge variant="neutral">Neutral</Badge>
    case 'unsure':
      return <Badge variant="warning">Inseguro</Badge>
    case 'resistant':
      return <Badge variant="destructive">Resistente</Badge>
  }
}

function getRelationshipTypeConfig(type?: MediationCase['relationshipType']) {
  switch (type) {
    case 'parents':
      return {
        label: 'Padres',
        icon: <Heart className="h-4 w-4" />,
        color: 'text-wakai-green-600',
        bgColor: 'bg-wakai-green-50',
        borderColor: 'border-wakai-green-200',
      }
    case 'caregivers':
      return {
        label: 'Cuidadores',
        icon: <Users className="h-4 w-4" />,
        color: 'text-wakai-blue-600',
        bgColor: 'bg-wakai-blue-50',
        borderColor: 'border-wakai-blue-200',
      }
    case 'guardians':
      return {
        label: 'Tutores',
        icon: <CheckCircle2 className="h-4 w-4" />,
        color: 'text-wakai-amber-600',
        bgColor: 'bg-wakai-amber-50',
        borderColor: 'border-wakai-amber-200',
      }
    default:
      return {
        label: 'Otro',
        icon: <Tag className="h-4 w-4" />,
        color: 'text-wakai-neutral-600',
        bgColor: 'bg-wakai-neutral-50',
        borderColor: 'border-wakai-neutral-200',
      }
  }
}

function getMediationTypeConfig(type?: MediationCase['mediationType']) {
  switch (type) {
    case 'visitation':
      return {
        label: 'Visitas',
        icon: <Calendar className="h-4 w-4" />,
        color: 'text-wakai-green-600',
        bgColor: 'bg-wakai-green-50',
        borderColor: 'border-wakai-green-200',
      }
    case 'communication':
      return {
        label: 'Comunicación',
        icon: <MessageCircle className="h-4 w-4" />,
        color: 'text-wakai-blue-600',
        bgColor: 'bg-wakai-blue-50',
        borderColor: 'border-wakai-blue-200',
      }
    case 'childcare':
      return {
        label: 'Cuidado de hijos',
        icon: <Heart className="h-4 w-4" />,
        color: 'text-wakai-amber-600',
        bgColor: 'bg-wakai-amber-50',
        borderColor: 'border-wakai-amber-200',
      }
    case 'coexistence':
      return {
        label: 'Convivencia',
        icon: <Users className="h-4 w-4" />,
        color: 'text-wakai-green-600',
        bgColor: 'bg-wakai-green-50',
        borderColor: 'border-wakai-green-200',
      }
    default:
      return {
        label: 'Otro',
        icon: <Tag className="h-4 w-4" />,
        color: 'text-wakai-neutral-600',
        bgColor: 'bg-wakai-neutral-50',
        borderColor: 'border-wakai-neutral-200',
      }
  }
}

export function CaseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [caseData, setCaseData] = useState<MediationCase | null>(null)
  const [caseContacts, setCaseContacts] = useState<ContactAttempt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCaseData() {
      try {
        setIsLoading(true)
        setError(null)

        // Use new /api/case/:caseNuc endpoint
        const response = await wakaiApi.getCaseByNuc(id!)

        if (!response.success || !response.case) {
          setError('Caso no encontrado')
          return
        }

        const mappedCase = mapBackendCaseToMediationCase(response.case)
        setCaseData(mappedCase)

        // Load conversations for contact attempts
        try {
          const conversationsResponse = await wakaiApi.getAllConversations()
          const mappedContacts = mapConversationsToContactAttempts(conversationsResponse.data)

          // Get recent contacts for this case (last 3)
          const contacts = mappedContacts
            .filter(c => c.caseId === id)
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 3)

          setCaseContacts(contacts)
        } catch (convError) {
          console.warn('Could not load contact attempts:', convError)
          setCaseContacts([])
        }
      } catch (err) {
        console.error('Error loading case data:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar datos del caso')
      } finally {
        setIsLoading(false)
      }
    }

    loadCaseData()
  }, [id])

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/cases')}
          className="gap-2 cursor-pointer -ml-2"
        >
          <ArrowLeft className="h-4 w-4" /> Casos
        </Button>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
          <p className="text-sm text-neutral-600">Cargando detalles...</p>
        </div>
      </div>
    )
  }

  if (error || !caseData) {
    return (
      <div className="space-y-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/cases')}
          className="gap-2 cursor-pointer -ml-2"
        >
          <ArrowLeft className="h-4 w-4" /> Casos
        </Button>
        <div className="card-elevated rounded-2xl p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-neutral-900">Error</p>
              <p className="text-sm text-neutral-600 mt-1">{error || 'Caso no encontrado'}</p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              className="mt-2 bg-neutral-900 hover:bg-neutral-800 text-white"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/cases')}
            className="gap-2 cursor-pointer -ml-2"
          >
            <ArrowLeft className="h-4 w-4" /> Casos
          </Button>
        </div>
        {getEmotionalStatusBadge(caseData.emotionalStatus)}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-apple-md">
          <Users className="h-8 w-8 text-white" />
        </div>
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-neutral-900">
            {caseData.participantName}
          </h2>
          <p className="mt-1 text-base text-neutral-600">Caso {id}</p>
        </div>
      </div>

      <div className="card-elevated rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-4">Información del Caso</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-neutral-500 mb-1">Participante 1</p>
              <p className="font-semibold text-neutral-900">{caseData.participantName}</p>
              <p className="text-sm text-neutral-600 mt-0.5 font-mono">{caseData.rut}</p>
            </div>
            {caseData.participantName2 && (
              <div>
                <p className="text-sm text-neutral-500 mb-1">Participante 2</p>
                <p className="font-semibold text-neutral-900">{caseData.participantName2}</p>
                {caseData.rut2 && (
                  <p className="text-sm text-neutral-600 mt-0.5 font-mono">{caseData.rut2}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-neutral-500 mb-1">Tipo de Relación</p>
            <p className="font-medium text-neutral-900">
              {getRelationshipTypeConfig(caseData.relationshipType).label}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-500 mb-1">Tipo de Mediación</p>
            <p className="font-medium text-neutral-900">
              {getMediationTypeConfig(caseData.mediationType).label}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm text-neutral-500 mb-1">Próxima Sesión</p>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-neutral-600" />
            <p className="font-medium text-neutral-900">
              {caseData.mediationDate.toLocaleDateString('es-CL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm text-neutral-500 mb-1">Descripción</p>
          <p className="text-neutral-700 leading-relaxed">{caseData.description}</p>
        </div>
      </div>

      <div className="card-elevated rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-neutral-900">Contactos Recientes</h3>
          <Button
            variant="outline"
            onClick={() => navigate(`/cases/${id}/contacts`)}
            className="gap-2 cursor-pointer"
          >
            Ver Todos
          </Button>
        </div>
        {caseContacts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {caseContacts.map(contact => (
              <ContactAttemptCard key={contact.id} attempt={contact} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 mx-auto mb-3">
              <MessageCircle className="h-6 w-6 text-neutral-400" />
            </div>
            <p className="text-sm font-medium text-neutral-600">No hay contactos</p>
            <p className="text-xs text-neutral-500 mt-1">
              Los contactos aparecerán aquí cuando estén disponibles
            </p>
          </div>
        )}
      </div>

      <div className="card-elevated rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-neutral-900">Reporte del Caso</h3>
            <p className="text-sm text-neutral-600 mt-1">
              Accede al reporte completo con análisis e insights
            </p>
          </div>
          <Button
            onClick={() => navigate(`/cases/${id}/report`)}
            className="gap-2 cursor-pointer bg-neutral-900 hover:bg-neutral-800 text-white"
          >
            <ReportIcon className="h-4 w-4" />
            Ver Reporte
          </Button>
        </div>
      </div>
    </div>
  )
}
