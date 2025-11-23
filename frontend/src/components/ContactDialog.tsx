import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MessageCircle, Phone, Send, Loader2, CheckCircle2 } from 'lucide-react'
import type { ContactAttempt } from '@/types'
import { testWhatsAppNotification } from '../services/agenticTools'
import { wakaiApi } from '../services/api'
import { toast } from 'sonner'

interface ContactDialogProps {
  caseId: string
  participantName: string
  participantName2?: string
  onContactSent?: () => void
}

type ContactChannel = ContactAttempt['channel']

const channels: Array<{
  id: ContactChannel
  label: string
  icon: React.ReactNode
  color: string
  bgColor: string
  description: string
}> = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: <MessageCircle className="h-5 w-5" />,
    color: 'text-wakai-green-600',
    bgColor: 'bg-wakai-green-50 hover:bg-wakai-green-100 border-wakai-green-200',
    description: 'Enviar mensaje por WhatsApp',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    icon: <MessageCircle className="h-5 w-5" />,
    color: 'text-wakai-blue-600',
    bgColor: 'bg-wakai-blue-50 hover:bg-wakai-blue-100 border-wakai-blue-200',
    description: 'Enviar mensaje por Telegram',
  },
  {
    id: 'phone',
    label: 'Teléfono',
    icon: <Phone className="h-5 w-5" />,
    color: 'text-wakai-blue-600',
    bgColor: 'bg-wakai-blue-50 hover:bg-wakai-blue-100 border-wakai-blue-200',
    description: 'Realizar llamada telefónica',
  },
]

export function ContactDialog({
  caseId,
  participantName,
  participantName2,
  onContactSent,
}: ContactDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<ContactChannel | null>(null)
  const [selectedParticipant, setSelectedParticipant] = useState<'participant1' | 'participant2'>(
    'participant1'
  )
  const [isSending, setIsSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSendContact = async () => {
    if (!selectedChannel) return
    setIsSending(true)
    setSuccess(false)
    setErrorMsg('')
    try {
      let resp
      if (selectedChannel === 'whatsapp') {
        resp = await testWhatsAppNotification(`Mensaje desde Wakai (${participantName})`)
        if (resp.success) {
          setSuccess(true)
          toast.success('¡Mensaje WhatsApp enviado correctamente!')
        } else {
          throw new Error((resp.error || 'No se pudo enviar WhatsApp') as string)
        }
      } else if (selectedChannel === 'telegram') {
        resp = await wakaiApi.testTelegram()
        if (
          resp &&
          typeof resp === 'object' &&
          ('success' in resp ? (resp as any).success !== false : true)
        ) {
          setSuccess(true)
          toast.success('¡Mensaje Telegram enviado correctamente!')
        } else {
          throw new Error('No se pudo enviar Telegram')
        }
      } else if (selectedChannel === 'phone') {
        resp = await wakaiApi.testOutboundCall(caseId)
        if (
          resp &&
          typeof resp === 'object' &&
          ('success' in resp ? (resp as any).success !== false : true)
        ) {
          setSuccess(true)
          toast.success('¡Llamada telefónica enviada correctamente!')
        } else {
          throw new Error('No se pudo enviar la llamada telefónica')
        }
      }
      if (onContactSent) {
        onContactSent()
      }
      setTimeout(() => {
        setOpen(false)
        setSelectedChannel(null)
        setSuccess(false)
      }, 3000)
    } catch (error: any) {
      setErrorMsg(error.message || 'Error al enviar el contacto.')
      toast.error(error.message || 'Error al enviar el contacto.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-wakai-green-600 hover:bg-wakai-green-700 text-white">
          <Send className="h-4 w-4" />
          Contactar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Contactar Participante</DialogTitle>
          <DialogDescription>
            Selecciona el canal de comunicación y el participante a contactar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Selección de Participante */}
          {participantName2 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-wakai-neutral-700">Participante:</p>
              <div className="grid gap-2">
                <button
                  onClick={() => setSelectedParticipant('participant1')}
                  className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${
                    selectedParticipant === 'participant1'
                      ? 'border-wakai-green-500 bg-wakai-green-50'
                      : 'border-wakai-neutral-200 hover:border-wakai-neutral-300'
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      selectedParticipant === 'participant1'
                        ? 'border-wakai-green-500 bg-wakai-green-500'
                        : 'border-wakai-neutral-300'
                    }`}
                  >
                    {selectedParticipant === 'participant1' && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="font-medium text-wakai-neutral-800">{participantName}</span>
                </button>

                <button
                  onClick={() => setSelectedParticipant('participant2')}
                  className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${
                    selectedParticipant === 'participant2'
                      ? 'border-wakai-green-500 bg-wakai-green-50'
                      : 'border-wakai-neutral-200 hover:border-wakai-neutral-300'
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      selectedParticipant === 'participant2'
                        ? 'border-wakai-green-500 bg-wakai-green-500'
                        : 'border-wakai-neutral-300'
                    }`}
                  >
                    {selectedParticipant === 'participant2' && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="font-medium text-wakai-neutral-800">{participantName2}</span>
                </button>
              </div>
            </div>
          )}

          {/* Selección de Canal */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-wakai-neutral-700">Canal de comunicación:</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {channels.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  disabled={isSending || success}
                  className={`flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-all ${channel.bgColor} ${
                    selectedChannel === channel.id
                      ? 'border-wakai-green-500 ring-2 ring-wakai-green-200'
                      : 'border-transparent'
                  } ${isSending || success ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className={`mt-0.5 ${channel.color}`}>{channel.icon}</div>
                  <div className="flex-1">
                    <p className={`font-medium ${channel.color}`}>{channel.label}</p>
                    <p className="mt-0.5 text-xs text-wakai-neutral-600">{channel.description}</p>
                  </div>
                  {selectedChannel === channel.id && (
                    <CheckCircle2 className="h-5 w-5 text-wakai-green-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Estado de Éxito */}
          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-wakai-green-50 border border-wakai-green-200 p-3">
              <CheckCircle2 className="h-5 w-5 text-wakai-green-600" />
              <p className="text-sm font-medium text-wakai-green-700">
                Contacto enviado exitosamente!
              </p>
            </div>
          )}
          {errorMsg && (
            <div className="mb-2 px-3 py-2 rounded bg-red-50 border border-red-300 text-red-700 animate-pulse">
              {errorMsg}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isSending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSendContact}
            disabled={!selectedChannel || isSending || success}
            className="gap-2 bg-wakai-green-600 hover:bg-wakai-green-700 text-white"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Enviado
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Contactar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
