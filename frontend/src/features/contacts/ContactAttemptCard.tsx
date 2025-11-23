import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Phone, Users } from 'lucide-react'
import type { ContactAttempt } from '@/types'

interface ContactAttemptCardProps {
  attempt: ContactAttempt
}

function getResultBadge(result: ContactAttempt['result']) {
  switch (result) {
    case 'successful':
    case 'positive-disposition':
      return <Badge variant="success">Exitoso</Badge>
    case 'scheduled':
      return <Badge variant="warning">Programado</Badge>
    case 'no-answer':
      return <Badge variant="neutral">Sin Respuesta</Badge>
    case 'declined':
    case 'refused':
      return <Badge variant="destructive">Rechazado</Badge>
  }
}

function getChannelConfig(channel: ContactAttempt['channel']) {
  switch (channel) {
    case 'whatsapp':
      return {
        icon: <MessageCircle className="h-4 w-4" />,
        label: 'WhatsApp',
        color: 'text-wakai-green-600',
        bgColor: 'bg-wakai-green-50',
      }
    case 'telegram':
      return {
        icon: <MessageCircle className="h-4 w-4" />,
        label: 'Telegram',
        color: 'text-wakai-blue-600',
        bgColor: 'bg-wakai-blue-50',
      }
    case 'phone':
      return {
        icon: <Phone className="h-4 w-4" />,
        label: 'Teléfono',
        color: 'text-wakai-blue-600',
        bgColor: 'bg-wakai-blue-50',
      }
    case 'in-person':
      return {
        icon: <Users className="h-4 w-4" />,
        label: 'Presencial',
        color: 'text-wakai-neutral-600',
        bgColor: 'bg-wakai-neutral-50',
      }
    case 'email':
      return {
        icon: <MessageCircle className="h-4 w-4" />,
        label: 'Email',
        color: 'text-wakai-neutral-600',
        bgColor: 'bg-wakai-neutral-50',
      }
    default:
      return {
        icon: <MessageCircle className="h-4 w-4" />,
        label: 'Otro',
        color: 'text-wakai-neutral-600',
        bgColor: 'bg-wakai-neutral-50',
      }
  }
}

export function ContactAttemptCard({ attempt }: ContactAttemptCardProps) {
  const channelConfig = getChannelConfig(attempt.channel)

  if (!channelConfig) {
    return null
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        {/* Header with channel and result */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full ${channelConfig.bgColor}`}
            >
              <span className={channelConfig.color}>{channelConfig.icon}</span>
            </div>
            <span className={`text-xs font-medium ${channelConfig.color}`}>
              {channelConfig.label}
            </span>
          </div>
          {getResultBadge(attempt.result)}
        </div>

        {/* Date and time */}
        <div className="space-y-1">
          <p className="text-xs text-wakai-neutral-500">
            {attempt.date.toLocaleDateString('es-CL', {
              day: 'numeric',
              month: 'short',
            })}
          </p>
          <p className="text-xs text-wakai-neutral-400">
            {attempt.date.toLocaleTimeString('es-CL', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })}
          </p>
        </div>

        {/* Participant name */}
        {attempt.participantName && (
          <p className="text-xs font-medium text-wakai-neutral-600">{attempt.participantName}</p>
        )}

        {/* Notes */}
        {attempt.notes && (
          <p className="text-sm text-wakai-neutral-700 mt-2 leading-relaxed">{attempt.notes}</p>
        )}
      </CardContent>
    </Card>
  )
}
