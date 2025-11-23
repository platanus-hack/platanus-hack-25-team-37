import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MessageCircle, Phone, Loader2, AlertCircle } from 'lucide-react'
import { ContactAttemptCard } from '@/features/contacts/ContactAttemptCard'
import { ContactDialog } from '@/components/ContactDialog'
import { ContactScoring } from '@/components/ContactScoring'
import type { MediationCase, ContactAttempt } from '@/types'
import { wakaiApi } from '@/services/api'
import {
  mapConversationsToContactAttempts,
  mapBackendCaseToMediationCase,
} from '@/services/dataMapper'

export function CaseContactsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [caseData, setCaseData] = useState<MediationCase | null>(null)
  const [allContacts, setAllContacts] = useState<ContactAttempt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
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

          // Filter contacts for this case
          const caseContacts = mappedContacts
            .filter(c => c.caseId === id)
            .sort((a, b) => b.date.getTime() - a.date.getTime())

          setAllContacts(caseContacts)
        } catch (convError) {
          console.warn('Could not load contact attempts:', convError)
          setAllContacts([])
        }
      } catch (err) {
        console.error('Error loading case contacts:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar contactos del caso')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id])

  // Group contacts by channel
  const whatsappContacts = allContacts.filter(c => c.channel === 'whatsapp')
  const telegramContacts = allContacts.filter(c => c.channel === 'telegram')
  const phoneContacts = allContacts.filter(c => c.channel === 'phone')

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Button
          variant="ghost"
          onClick={() => navigate(`/cases/${id}`)}
          className="gap-2 cursor-pointer -ml-2"
        >
          <ArrowLeft className="h-4 w-4" /> Caso
        </Button>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
          <p className="text-sm text-neutral-600">Cargando contactos...</p>
        </div>
      </div>
    )
  }

  if (error || !caseData) {
    return (
      <div className="space-y-8">
        <Button
          variant="ghost"
          onClick={() => navigate(`/cases/${id}`)}
          className="gap-2 cursor-pointer -ml-2"
        >
          <ArrowLeft className="h-4 w-4" /> Caso
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
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate(`/cases/${id}`)}
          className="gap-2 cursor-pointer -ml-2"
        >
          <ArrowLeft className="h-4 w-4" /> Caso
        </Button>
        <span className="text-neutral-400">/</span>
        <span className="text-neutral-600">Contactos</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-neutral-900">Contactos del Caso</h2>
          <p className="mt-2 text-base text-neutral-600">
            {caseData.participantName}
            {caseData.participantName2 && ` y ${caseData.participantName2}`} · {allContacts.length}{' '}
            {allContacts.length === 1 ? 'contacto' : 'contactos'}
          </p>
        </div>
        <ContactDialog
          caseId={caseData.id}
          participantName={caseData.participantName}
          participantName2={caseData.participantName2}
        />
      </div>

      <ContactScoring caseNuc={id!} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-elevated rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="h-5 w-5 text-neutral-600" />
            <h3 className="font-semibold text-neutral-900">WhatsApp</h3>
            <span className="ml-auto text-sm text-neutral-500">{whatsappContacts.length}</span>
          </div>
          <div className="space-y-3">
            {whatsappContacts.length > 0 ? (
              whatsappContacts.map(contact => (
                <ContactAttemptCard key={contact.id} attempt={contact} />
              ))
            ) : (
              <p className="text-sm text-neutral-400 text-center py-4">Sin contactos</p>
            )}
          </div>
        </div>

        <div className="card-elevated rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="h-5 w-5 text-neutral-600" />
            <h3 className="font-semibold text-neutral-900">Teléfono</h3>
            <span className="ml-auto text-sm text-neutral-500">{phoneContacts.length}</span>
          </div>
          <div className="space-y-3">
            {phoneContacts.length > 0 ? (
              phoneContacts.map(contact => (
                <ContactAttemptCard key={contact.id} attempt={contact} />
              ))
            ) : (
              <p className="text-sm text-neutral-400 text-center py-4">Sin contactos</p>
            )}
          </div>
        </div>

        <div className="card-elevated rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="h-5 w-5 text-neutral-600" />
            <h3 className="font-semibold text-neutral-900">Telegram</h3>
            <span className="ml-auto text-sm text-neutral-500">{telegramContacts.length}</span>
          </div>
          <div className="space-y-3">
            {telegramContacts.length > 0 ? (
              telegramContacts.map(contact => (
                <ContactAttemptCard key={contact.id} attempt={contact} />
              ))
            ) : (
              <p className="text-sm text-neutral-400 text-center py-4">Sin contactos</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
