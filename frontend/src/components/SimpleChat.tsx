import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { handleClientTool } from '@/services/agenticTools'

const CHAT_API_URL =
  import.meta.env.VITE_CHAT_API_URL || 'https://wakai-backend.josebmxfredes.workers.dev/api/chat'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

export function SimpleChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy el Asistente Wakai. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', response.status, errorText)
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`)
      }

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError)
        throw new Error('La respuesta del servidor no es válida')
      }

      // Validate response structure
      if (!data) {
        throw new Error('La respuesta del servidor está vacía')
      }

      // Handle tool calls (new OpenAI format: tool_calls array)
      if (data.tool_calls && Array.isArray(data.tool_calls) && data.tool_calls.length > 0) {
        try {
          // Process first tool call
          const toolCall = data.tool_calls[0]
          const functionCall = toolCall.function

          if (!functionCall || !functionCall.name) {
            throw new Error('Formato de tool call inválido')
          }

          // Parse function arguments safely
          let functionParams = {}
          if (functionCall.arguments) {
            if (typeof functionCall.arguments === 'string') {
              try {
                functionParams = JSON.parse(functionCall.arguments)
              } catch (parseError) {
                console.error('Error parsing function arguments:', parseError)
                functionParams = {}
              }
            } else if (typeof functionCall.arguments === 'object') {
              functionParams = functionCall.arguments
            }
          }

          const toolResult = await handleClientTool({
            name: functionCall.name,
            params: functionParams,
          })

          console.log('Tool result:', toolResult)

          // Send function result back to get final response
          const functionResponse = await fetch(CHAT_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: [
                ...messages,
                userMessage,
                {
                  role: 'assistant',
                  content: data.content || null,
                  tool_calls: data.tool_calls,
                },
                {
                  role: 'tool',
                  tool_call_id: toolCall.id,
                  name: functionCall.name,
                  content: JSON.stringify(toolResult),
                },
              ],
            }),
          })

          if (!functionResponse.ok) {
            throw new Error(`Error al procesar función: ${functionResponse.statusText}`)
          }

          const functionData = await functionResponse.json()
          console.log('Function response data:', functionData)

          // Try to extract meaningful content from the response
          let responseContent =
            functionData?.message ||
            functionData?.content ||
            functionData?.text ||
            functionData?.choices?.[0]?.message?.content ||
            functionData?.choices?.[0]?.message?.text

          // If no formatted message, create a summary from tool result
          if (
            !responseContent ||
            responseContent.trim() === '' ||
            responseContent === 'He ejecutado la acción solicitada.'
          ) {
            if (toolResult.success && toolResult.data) {
              // Format the data for display based on the function called
              try {
                let formattedData = ''

                if (functionCall.name === 'get_all_cases' && Array.isArray(toolResult.data)) {
                  formattedData = `Encontré ${toolResult.data.length} caso(s) de mediación:\n\n`
                  toolResult.data.slice(0, 5).forEach((item: any, index: number) => {
                    formattedData += `${index + 1}. Caso ${item.caseNuc || item.id || 'N/A'}\n`
                  })
                  if (toolResult.data.length > 5) {
                    formattedData += `\n... y ${toolResult.data.length - 5} caso(s) más.`
                  }
                } else if (functionCall.name === 'get_case_by_id' && toolResult.data) {
                  const caseData = Array.isArray(toolResult.data)
                    ? toolResult.data[0]
                    : toolResult.data
                  formattedData = `Información del caso:\n\n`
                  if (caseData.caseNuc) formattedData += `ID: ${caseData.caseNuc}\n`
                  if (caseData.userType) formattedData += `Tipo: ${caseData.userType}\n`
                  if (caseData.source) formattedData += `Fuente: ${caseData.source}\n`
                  if (caseData.conversation) {
                    const convPreview = caseData.conversation.substring(0, 200)
                    formattedData += `Conversación: ${convPreview}${caseData.conversation.length > 200 ? '...' : ''}\n`
                  }
                } else if (functionCall.name === 'send_notifications' && toolResult.data) {
                  const notifData = toolResult.data as any
                  formattedData = `Resultado del envío de notificaciones:\n\n`

                  if (notifData.message) {
                    formattedData += `📋 ${notifData.message}\n\n`
                  }

                  formattedData += `📊 Resumen:\n`
                  formattedData += `  • Casos procesados: ${notifData.casesCount || 0}\n`
                  formattedData += `  • Notificaciones enviadas: ${notifData.notificationsSent || 0} ✅\n`
                  formattedData += `  • Notificaciones fallidas: ${notifData.notificationsFailed || 0} ❌\n\n`

                  if (notifData.results && Array.isArray(notifData.results)) {
                    const failed = notifData.results.filter((r: any) => !r.sent)
                    const successful = notifData.results.filter((r: any) => r.sent)

                    if (failed.length > 0) {
                      formattedData += `❌ Notificaciones fallidas (${failed.length}):\n`
                      failed.forEach((result: any, index: number) => {
                        const recipientType =
                          result.recipient === 'applicant'
                            ? 'Solicitante'
                            : result.recipient === 'respondent'
                              ? 'Demandado'
                              : result.recipient || 'Desconocido'
                        formattedData += `  ${index + 1}. Caso ${result.caseNuc || 'N/A'} - ${recipientType} (Chat ID: ${result.chatId || 'N/A'})\n`
                      })
                      formattedData += `\n`
                    }

                    if (successful.length > 0) {
                      formattedData += `✅ Notificaciones enviadas (${successful.length}):\n`
                      successful.forEach((result: any, index: number) => {
                        const recipientType =
                          result.recipient === 'applicant'
                            ? 'Solicitante'
                            : result.recipient === 'respondent'
                              ? 'Demandado'
                              : result.recipient || 'Desconocido'
                        formattedData += `  ${index + 1}. Caso ${result.caseNuc || 'N/A'} - ${recipientType} (Chat ID: ${result.chatId || 'N/A'})\n`
                      })
                    }

                    if (failed.length > 0) {
                      formattedData += `\n💡 Posibles causas de fallo:\n`
                      formattedData += `  • Problemas de conectividad con Telegram/WhatsApp\n`
                      formattedData += `  • Chat ID inválido o no encontrado\n`
                      formattedData += `  • El destinatario no tiene el bot agregado\n`
                      formattedData += `  • Límites de rate limiting del servicio de mensajería\n`
                    }
                  }
                } else {
                  // Generic formatting
                  const dataStr = JSON.stringify(toolResult.data, null, 2)
                  if (dataStr.length > 1000) {
                    formattedData = `Datos obtenidos (${Array.isArray(toolResult.data) ? toolResult.data.length : 1} elemento(s)):\n\n${dataStr.substring(0, 1000)}...\n\n[Mostrando primeros 1000 caracteres]`
                  } else {
                    formattedData = `Datos obtenidos:\n\n${dataStr}`
                  }
                }

                responseContent = formattedData
              } catch (e) {
                console.error('Error formatting data:', e)
                responseContent = `Datos obtenidos: ${JSON.stringify(toolResult.data)}`
              }
            } else if (toolResult.error) {
              responseContent = `Error: ${toolResult.error}`
            } else {
              responseContent =
                'He ejecutado la acción solicitada, pero no se recibieron datos del servidor.'
            }
          }

          const assistantMessage: Message = {
            role: 'assistant',
            content: responseContent,
            timestamp: new Date(),
          }
          setMessages(prev => [...prev, assistantMessage])
        } catch (toolError) {
          console.error('Error handling tool call:', toolError)
          const errorMessage: Message = {
            role: 'assistant',
            content: `Error al ejecutar la función: ${toolError instanceof Error ? toolError.message : 'Error desconocido'}`,
            timestamp: new Date(),
          }
          setMessages(prev => [...prev, errorMessage])
        }
      }
      // Handle legacy function_call format (backward compatibility)
      else if (data.function_call) {
        try {
          // Parse function arguments safely
          let functionParams = {}
          if (data.function_call.arguments) {
            if (typeof data.function_call.arguments === 'string') {
              try {
                functionParams = JSON.parse(data.function_call.arguments)
              } catch (parseError) {
                console.error('Error parsing function arguments:', parseError)
                functionParams = {}
              }
            } else if (typeof data.function_call.arguments === 'object') {
              functionParams = data.function_call.arguments
            }
          }

          const toolResult = await handleClientTool({
            name: data.function_call.name || 'unknown',
            params: functionParams,
          })

          // Send function result back to get final response
          const functionResponse = await fetch(CHAT_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: [
                ...messages,
                userMessage,
                {
                  role: 'assistant',
                  content: null,
                  function_call: data.function_call,
                },
                {
                  role: 'function',
                  name: data.function_call.name,
                  content: JSON.stringify(toolResult),
                },
              ],
            }),
          })

          if (!functionResponse.ok) {
            throw new Error(`Error al procesar función: ${functionResponse.statusText}`)
          }

          const functionData = await functionResponse.json()
          const assistantMessage: Message = {
            role: 'assistant',
            content:
              functionData?.message ||
              functionData?.content ||
              'He ejecutado la acción solicitada.',
            timestamp: new Date(),
          }
          setMessages(prev => [...prev, assistantMessage])
        } catch (toolError) {
          console.error('Error handling function call:', toolError)
          const errorMessage: Message = {
            role: 'assistant',
            content: `Error al ejecutar la función: ${toolError instanceof Error ? toolError.message : 'Error desconocido'}`,
            timestamp: new Date(),
          }
          setMessages(prev => [...prev, errorMessage])
        }
      } else {
        // Regular message response
        const assistantMessage: Message = {
          role: 'assistant',
          content:
            data.message || data.content || data.text || 'No se recibió respuesta del servidor.',
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: `Lo siento, hubo un error al procesar tu mensaje: ${error instanceof Error ? error.message : 'Error desconocido'}. Por favor intenta de nuevo.`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const suggestedPrompts = [
    'Muéstrame todos los casos',
    'Buscar un caso específico',
    'Enviar notificaciones',
    'Dame un resumen',
  ]

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">Asistente Wakai</h3>
            <p className="text-xs text-neutral-500">Mediación Familiar</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-neutral-100 text-neutral-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="mt-1 text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString('es-CL', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-neutral-100 rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-neutral-600" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts (only show when no messages yet) */}
        {messages.length === 1 && !isLoading && (
          <div className="mt-6 space-y-2">
            <p className="text-xs text-neutral-500 font-medium">Sugerencias:</p>
            <div className="grid grid-cols-2 gap-2">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInput(prompt)}
                  className="rounded-lg border border-neutral-200 px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-neutral-200 px-6 py-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu mensaje..."
            disabled={isLoading}
            className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          Este asistente puede cometer errores. Verifica la información importante.
        </p>
      </div>
    </div>
  )
}
