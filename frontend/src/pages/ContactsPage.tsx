import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageCircle, Phone, Mail, Users, Loader2, AlertCircle } from 'lucide-react'
import type { ContactAttempt } from '@/types'
import { wakaiApi } from '@/services/api'

// TEMP PATCH: define type for actual API response
interface RawContact {
  id: string
  phone_number: string
  status: string
  created_at: string
  updated_at: string
  last_message: string
  last_sender: string
  last_message_at: string
  tieneMensajes: boolean
}

// TEMP PATCH: map backend data format (id, phone_number, ...) to ContactAttempt[]
function mapRawContactsToContactAttempts(data: RawContact[]): ContactAttempt[] {
  return data.map(item => {
    return {
      id: item.id || item.phone_number || Math.random().toString(),
      caseId: item.id || 'unknown',
      channel: 'phone',
      date: new Date(item.updated_at || item.created_at || Date.now()),
      result: item.tieneMensajes ? 'successful' : 'no-answer',
      notes: item.last_message || '',
      participantName: item.phone_number || undefined,
    }
  })
}

function getChannelIcon(channel: ContactAttempt['channel']) {
  switch (channel) {
    case 'whatsapp':
      return <MessageCircle className="h-4 w-4" />
    case 'telegram':
      return <MessageCircle className="h-4 w-4" />
    case 'phone':
      return <Phone className="h-4 w-4" />
    case 'email':
      return <Mail className="h-4 w-4" />
    case 'in-person':
      return <Users className="h-4 w-4" />
  }
}

function getResultBadge(result: ContactAttempt['result']) {
  switch (result) {
    case 'successful':
      return <Badge variant="success">Exitoso</Badge>
    case 'scheduled':
      return <Badge variant="warning">Programado</Badge>
    case 'no-answer':
      return <Badge variant="neutral">Sin Respuesta</Badge>
    case 'declined':
      return <Badge variant="destructive">Rechazado</Badge>
  }
}

function getChannelColor(channel: ContactAttempt['channel']) {
  switch (channel) {
    case 'whatsapp':
      return 'bg-wakai-green-100 text-wakai-green-600'
    case 'telegram':
      return 'bg-wakai-blue-100 text-wakai-blue-600'
    case 'phone':
      return 'bg-wakai-blue-100 text-wakai-blue-600'
    case 'email':
      return 'bg-wakai-amber-100 text-wakai-amber-600'
    case 'in-person':
      return 'bg-wakai-neutral-100 text-wakai-neutral-600'
  }
}

export function ContactsPage() {
  const [contacts, setContacts] = useState<ContactAttempt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadContacts() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await wakaiApi.getAllConversations()
        // The API type is wrong, but the real response is RawContact[], so cast it using unknown first
        const mappedContacts = mapRawContactsToContactAttempts(
          response.data as unknown as RawContact[]
        )

        // Sort by date, most recent first
        mappedContacts.sort((a, b) => b.date.getTime() - a.date.getTime())

        setContacts(mappedContacts)
      } catch (err) {
        console.error('Error loading contacts:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar contactos')
      } finally {
        setIsLoading(false)
      }
    }

    loadContacts()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-neutral-900">Contactos</h2>
          <p className="mt-2 text-base text-neutral-600">
            {contacts.length} {contacts.length === 1 ? 'intento' : 'intentos'} de contacto
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
          <p className="text-sm text-neutral-600">Cargando contactos...</p>
        </div>
      ) : error ? (
        <div className="card-elevated rounded-2xl p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-neutral-900">Error al cargar contactos</p>
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
      ) : contacts.length === 0 ? (
        <div className="card-elevated rounded-2xl p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <MessageCircle className="h-8 w-8 text-neutral-400" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-neutral-900">No hay contactos</p>
              <p className="text-sm text-neutral-600 mt-1">
                Los contactos aparecerán aquí cuando estén disponibles
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {contacts.map(contact => (
            <div key={contact.id} className="card-elevated rounded-2xl p-6">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${getChannelColor(contact.channel)} flex-shrink-0`}
                  >
                    {getChannelIcon(contact.channel)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-lg text-neutral-900 truncate">
                        {contact.participantName || 'Sin número'}
                      </p>
                      {getResultBadge(contact.result)}
                    </div>
                    {contact.notes && contact.notes.trim() !== '' && (
                      <p className="text-sm text-neutral-600 truncate">{contact.notes}</p>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-neutral-700">
                    {contact.date.toLocaleDateString('es-CL')}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {contact.date.toLocaleTimeString('es-CL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
