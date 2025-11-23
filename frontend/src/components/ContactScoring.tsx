import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  Target,
  Calendar,
  MessageCircle,
  Smile,
  Meh,
  Frown,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { wakaiApi } from '@/services/api'
import type { ContactScoringResponse } from '@/types/backend'

interface ContactScoringProps {
  caseNuc: string | number
}

interface ScoringMetrics {
  totalAttempts: number
  successRate: number
  channelDiversity: number
  totalChannels: number
  daysSinceLastContact: number
  sentimentScore: 'positive' | 'neutral' | 'negative'
  overallScore: number
  insights?: string[]
  scoreBreakdown: {
    tasaExito: { weight: number; points: number }
    diversidadCanales: { weight: number; points: number }
    recencia: { weight: number; points: number }
    cantidadIntentos: { weight: number; points: number }
  }
}

function mapBackendResponseToMetrics(response: ContactScoringResponse): ScoringMetrics {
  const { metrics } = response

  // Calculate days since last contact
  let daysSinceLastContact: number
  if (metrics.totalAttempts === 0 || !metrics.lastContact) {
    daysSinceLastContact = Infinity
  } else {
    const lastContactDate = new Date(metrics.lastContact)
    const days = Math.floor((Date.now() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24))
    // Handle invalid dates
    daysSinceLastContact = isNaN(days) ? Infinity : Math.max(0, days)
  }

  // Map sentiment from backend format to component format
  const sentimentMap: Record<string, 'positive' | 'neutral' | 'negative'> = {
    Positive: 'positive',
    Neutral: 'neutral',
    Negative: 'negative',
  }
  const sentimentScore = sentimentMap[metrics.sentiment] || 'neutral'

  return {
    totalAttempts: metrics.totalAttempts,
    successRate: metrics.successRate,
    channelDiversity: metrics.channelsUsed,
    totalChannels: metrics.totalChannels,
    daysSinceLastContact,
    sentimentScore,
    overallScore: metrics.scoreGeneral,
    insights: metrics.insights,
    scoreBreakdown: metrics.scoreBreakdown,
  }
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-green-600'
  if (score >= 40) return 'text-amber-600'
  return 'text-red-600'
}

function getScoreBadgeVariant(score: number): 'success' | 'warning' | 'destructive' {
  if (score >= 70) return 'success'
  if (score >= 40) return 'warning'
  return 'destructive'
}

function getSentimentIcon(sentiment: 'positive' | 'neutral' | 'negative') {
  switch (sentiment) {
    case 'positive':
      return <Smile className="h-5 w-5 text-green-600" />
    case 'neutral':
      return <Meh className="h-5 w-5 text-amber-600" />
    case 'negative':
      return <Frown className="h-5 w-5 text-red-600" />
  }
}

function getSentimentLabel(sentiment: 'positive' | 'neutral' | 'negative') {
  switch (sentiment) {
    case 'positive':
      return 'Positivo'
    case 'neutral':
      return 'Neutral'
    case 'negative':
      return 'Necesita Atención'
  }
}

export function ContactScoring({ caseNuc }: ContactScoringProps) {
  const [metrics, setMetrics] = useState<ScoringMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadScoring() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await wakaiApi.getContactScoring(caseNuc)
        if (response.success) {
          const mappedMetrics = mapBackendResponseToMetrics(response)
          setMetrics(mappedMetrics)
        } else {
          setError('No se pudo cargar el scoring de contacto')
        }
      } catch (err) {
        console.error('Error loading contact scoring:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar scoring')
      } finally {
        setIsLoading(false)
      }
    }

    loadScoring()
  }, [caseNuc])

  if (isLoading) {
    return (
      <Card className="border-2 border-wakai-green-200 bg-gradient-to-br from-white to-wakai-green-50">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-wakai-green-600" />
        </CardContent>
      </Card>
    )
  }

  if (error || !metrics) {
    return (
      <Card className="border-2 border-wakai-green-200 bg-gradient-to-br from-white to-wakai-green-50">
        <CardContent className="flex items-center justify-center py-12 gap-3">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <p className="text-sm text-neutral-600">{error || 'Error al cargar scoring'}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-wakai-green-200 bg-gradient-to-br from-white to-wakai-green-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-wakai-green-600" />
              Scoring de Contacto
            </CardTitle>
            <CardDescription>Métricas de engagement y efectividad</CardDescription>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(metrics.overallScore)}`}>
              {metrics.overallScore}
            </div>
            <Badge
              variant={getScoreBadgeVariant(metrics.overallScore)}
              className="mt-1 shadow-xl animate-pulse text-xl px-4 py-2"
            >
              Score General
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Total Attempts */}
          <div className="rounded-lg bg-white border border-wakai-neutral-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-wakai-blue-100">
                <Target className="h-5 w-5 text-wakai-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-wakai-neutral-800">{metrics.totalAttempts}</p>
                <p className="text-xs text-wakai-neutral-600">Intentos Totales</p>
              </div>
            </div>
          </div>

          {/* Success Rate */}
          <div className="rounded-lg bg-white border border-wakai-neutral-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-wakai-green-100">
                <TrendingUp className="h-5 w-5 text-wakai-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-wakai-neutral-800">
                  {metrics.successRate.toFixed(0)}%
                </p>
                <p className="text-xs text-wakai-neutral-600">Tasa de Éxito</p>
              </div>
            </div>
          </div>

          {/* Channel Diversity */}
          <div className="rounded-lg bg-white border border-wakai-neutral-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-wakai-amber-100">
                <MessageCircle className="h-5 w-5 text-wakai-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-wakai-neutral-800">
                  {metrics.channelDiversity}/{metrics.totalChannels}
                </p>
                <p className="text-xs text-wakai-neutral-600">Canales Usados</p>
              </div>
            </div>
          </div>

          {/* Recency */}
          <div className="rounded-lg bg-white border border-wakai-neutral-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-wakai-purple-100">
                <Calendar className="h-5 w-5 text-wakai-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-wakai-neutral-800">
                  {metrics.daysSinceLastContact === Infinity
                    ? 'N/A'
                    : `${metrics.daysSinceLastContact}d`}
                </p>
                <p className="text-xs text-wakai-neutral-600">Último Contacto</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sentiment */}
        <div className="rounded-lg bg-white border border-wakai-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getSentimentIcon(metrics.sentimentScore)}
              <div>
                <p className="font-semibold text-wakai-neutral-800">Sentimiento General</p>
                <p className="text-sm text-wakai-neutral-600">
                  Basado en tasa de éxito y engagement
                </p>
              </div>
            </div>
            <Badge
              variant={
                metrics.sentimentScore === 'positive'
                  ? 'success'
                  : metrics.sentimentScore === 'neutral'
                    ? 'warning'
                    : 'destructive'
              }
            >
              {getSentimentLabel(metrics.sentimentScore)}
            </Badge>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="rounded-lg bg-wakai-neutral-50 border border-wakai-neutral-200 p-3">
          <p className="text-xs font-semibold text-wakai-neutral-700 mb-2">Cálculo del Score:</p>
          <div className="space-y-1 text-xs text-wakai-neutral-600">
            <div className="flex justify-between">
              <span>
                Tasa de éxito ({Math.round(metrics.scoreBreakdown.tasaExito.weight * 100)}%)
              </span>
              <span className="font-medium">
                {Math.round(metrics.scoreBreakdown.tasaExito.points)} pts
              </span>
            </div>
            <div className="flex justify-between">
              <span>
                Diversidad de canales (
                {Math.round(metrics.scoreBreakdown.diversidadCanales.weight * 100)}%)
              </span>
              <span className="font-medium">
                {Math.round(metrics.scoreBreakdown.diversidadCanales.points)} pts
              </span>
            </div>
            <div className="flex justify-between">
              <span>Recencia ({Math.round(metrics.scoreBreakdown.recencia.weight * 100)}%)</span>
              <span className="font-medium">
                {Math.round(metrics.scoreBreakdown.recencia.points)} pts
              </span>
            </div>
            <div className="flex justify-between">
              <span>
                Cantidad de intentos (
                {Math.round(metrics.scoreBreakdown.cantidadIntentos.weight * 100)}%)
              </span>
              <span className="font-medium">
                {Math.round(metrics.scoreBreakdown.cantidadIntentos.points)} pts
              </span>
            </div>
          </div>
        </div>
        {/* Mejora score, badges, insights, colores, tipografía: */}
        {Array.isArray(metrics.insights) && metrics.insights.length > 0 && (
          <div className="flex items-center gap-2 bg-wakai-green-50 border border-wakai-green-200 rounded-lg p-2 my-3">
            <Sparkles className="h-5 w-5 text-wakai-green-600 animate-bounce" />
            <ul className="list-disc list-inside text-wakai-green-900">
              {metrics.insights.map((insight, idx) => (
                <li key={idx}>{insight}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
