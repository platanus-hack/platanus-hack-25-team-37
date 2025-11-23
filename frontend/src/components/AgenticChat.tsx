import { useEffect, useRef } from 'react'
import { ChatKit, useChatKit } from '@openai/chatkit-react'
import { handleClientTool } from '@/services/agenticTools'

const CHATKIT_API_URL =
  import.meta.env.VITE_CHATKIT_API_URL || 'https://wakai-backend.josebmxfredes.workers.dev/api/chatkit'

/**
 * AgenticChat component - AI assistant with access to mediation case data
 *
 * Features:
 * - Query mediation cases (readonly)
 * - Get call information
 * - Navigate to cases
 * - Send notifications
 * - Provide actionable insights
 */
export function AgenticChat() {
  const chatRef = useRef<HTMLDivElement>(null)

  // Get client secret from backend
  const getClientSecret = async (currentClientSecret: string | null): Promise<string> => {
    try {
      if (!currentClientSecret) {
        // Initial session startup
        const res = await fetch(`${CHATKIT_API_URL}/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!res.ok) {
          throw new Error(`Failed to start ChatKit session: ${res.statusText}`)
        }

        const data = await res.json()
        return data.client_secret
      }

      // Token refresh before expiration
      const res = await fetch(`${CHATKIT_API_URL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentClientSecret }),
      })

      if (!res.ok) {
        throw new Error(`Failed to refresh ChatKit token: ${res.statusText}`)
      }

      const data = await res.json()
      return data.client_secret
    } catch (error) {
      console.error('Error getting client secret:', error)
      throw error
    }
  }

  const { control } = useChatKit({
    api: {
      getClientSecret,
    },
    locale: 'es',
    theme: {
      colorScheme: 'light',
      radius: 'round',
      density: 'normal',
      typography: {
        baseSize: 15,
      },
      color: {
        accent: {
          primary: '#10B981', // wakai-green-500
          level: 2,
        },
      },
    },
    startScreen: {
      greeting: '¿En qué puedo ayudarte hoy?',
      prompts: [
        {
          label: 'Ver todos los casos',
          prompt: 'Muéstrame todos los casos de mediación con sus estados actuales',
          icon: 'notebook',
        },
        {
          label: 'Buscar un caso',
          prompt: 'Buscar un caso específico por nombre o RUT',
          icon: 'search',
        },
        {
          label: 'Enviar notificaciones',
          prompt: 'Enviar notificaciones a los contactos pendientes',
          icon: 'mail',
        },
        {
          label: 'Resumen de casos',
          prompt: 'Dame un resumen del estado de todos los casos',
          icon: 'analytics',
        },
      ],
    },
    composer: {
      placeholder: 'Pregunta sobre casos de mediación...',
    },
    header: {
      enabled: true,
      title: {
        enabled: true,
        text: 'Asistente Wakai',
      },
    },
    history: {
      enabled: true,
      showDelete: true,
      showRename: true,
    },
    threadItemActions: {
      feedback: true,
      retry: true,
    },
    disclaimer: {
      text: 'Este asistente puede cometer errores. Verifica la información importante.',
      highContrast: false,
    },
    onClientTool: async toolCall => {
      console.log('Client tool called:', toolCall)
      return await handleClientTool(toolCall)
    },
  })

  useEffect(() => {
    // Log when ChatKit is ready
    const handleReady = () => {
      console.log('ChatKit is ready')
    }

    const handleError = (event: CustomEvent<{ error: Error }>) => {
      console.error('ChatKit error:', event.detail.error)
    }

    const chatElement = chatRef.current?.querySelector('openai-chatkit')
    if (chatElement) {
      chatElement.addEventListener('chatkit.ready', handleReady as EventListener)
      chatElement.addEventListener('chatkit.error', handleError as EventListener)

      return () => {
        chatElement.removeEventListener('chatkit.ready', handleReady as EventListener)
        chatElement.removeEventListener('chatkit.error', handleError as EventListener)
      }
    }
  }, [])

  return (
    <div ref={chatRef} className="h-full w-full flex flex-col">
      <ChatKit control={control} />
    </div>
  )
}
