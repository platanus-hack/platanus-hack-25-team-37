import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'
import { wakaiApi, type CaseReport } from '@/services/api'

export function CaseReportPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState<CaseReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    wakaiApi
      .getCaseReport(id)
      .then(res => {
        if (!res.success || !res.reporte) {
          setError('No se pudo obtener el reporte del caso.')
          setReport(null)
        } else {
          setReport(res.reporte)
        }
      })
      .catch(() => {
        setError('No se pudo obtener el reporte del caso.')
        setReport(null)
      })
      .finally(() => setIsLoading(false))
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
          <p className="text-sm text-neutral-600">Cargando reporte...</p>
        </div>
      </div>
    )
  }

  if (error || !report) {
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
              <p className="text-lg font-semibold text-neutral-900">Error al cargar reporte</p>
              <p className="text-sm text-neutral-600 mt-1">{error || 'Reporte no disponible'}</p>
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

  const safeField = (val?: string | number | null) => {
    if (val === null || val === undefined) {
      return <span className="text-neutral-400">No informado</span>
    }
    if (typeof val === 'number') {
      return val.toLocaleString('es-CL')
    }
    return val.trim() !== '' ? val : <span className="text-neutral-400">No informado</span>
  }

  const formatFecha = (fechaIso?: string) => {
    if (!fechaIso) return 'No informado'
    const d = new Date(fechaIso)
    if (isNaN(d.getTime())) return 'Fecha inválida'
    return d.toLocaleString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatFieldName = (fieldName: string) => {
    // Convert camelCase to Title Case with spaces
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/cases')}
          className="gap-2 cursor-pointer -ml-2"
        >
          <ArrowLeft className="h-4 w-4" /> Casos
        </Button>
        <span className="text-neutral-400">/</span>
        <span className="text-neutral-600">Reporte {report.nuc}</span>
      </div>

      <div>
        <h2 className="text-4xl font-bold tracking-tight text-neutral-900">Reporte del Caso</h2>
        <p className="mt-2 text-base text-neutral-600">Información detallada del caso</p>
      </div>

      <div className="card-elevated rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-neutral-900 mb-4">Resumen</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-neutral-500 mb-1">N° NUC</p>
            <p className="font-medium text-neutral-900">{safeField(report.nuc)}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500 mb-1">Fecha y hora de mediación</p>
            <p className="font-medium text-neutral-900">{formatFecha(report.fechaHoraMediacion)}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500 mb-1">Materia</p>
            <p className="font-medium text-neutral-900">{safeField(report.materia)}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500 mb-1">Tipo de sesión</p>
            <p className="font-medium text-neutral-900">{safeField(report.tipoSesion)}</p>
          </div>
        </div>
      </div>

      {report.solicitante && (
        <div className="card-elevated rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-neutral-900 mb-4">Solicitante</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-500 mb-1">Nombre</p>
              <p className="font-medium text-neutral-900">{safeField(report.solicitante.nombre)}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500 mb-1">Sexo</p>
              <p className="font-medium text-neutral-900">{safeField(report.solicitante.sexo)}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500 mb-1">Dirección</p>
              <p className="font-medium text-neutral-900">
                {safeField(report.solicitante.direccion)}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-500 mb-1">Comuna</p>
              <p className="font-medium text-neutral-900">{safeField(report.solicitante.comuna)}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500 mb-1">Región</p>
              <p className="font-medium text-neutral-900">{safeField(report.solicitante.region)}</p>
            </div>
            {report.solicitante.confirmacionAsistencia !== undefined && (
              <div>
                <p className="text-sm text-neutral-500 mb-1">Confirmación Asistencia</p>
                <p className="font-medium text-neutral-900">
                  {safeField(report.solicitante.confirmacionAsistencia)}
                </p>
              </div>
            )}
            {report.solicitante.dudasOSolicitudes !== undefined && (
              <div className="col-span-2">
                <p className="text-sm text-neutral-500 mb-1">Dudas/Solicitudes</p>
                <p className="font-medium text-neutral-900">
                  {safeField(report.solicitante.dudasOSolicitudes)}
                </p>
              </div>
            )}
            {report.solicitante.datosAdicionalesEntregados !== undefined && (
              <div className="col-span-2">
                <p className="text-sm text-neutral-500 mb-1">Datos Adicionales Entregados</p>
                <p className="font-medium text-neutral-900">
                  {safeField(report.solicitante.datosAdicionalesEntregados)}
                </p>
              </div>
            )}
            {report.solicitante.alertasAgente !== undefined && (
              <div className="col-span-2">
                <p className="text-sm text-neutral-500 mb-1">Alertas Agente</p>
                <p className="font-medium text-neutral-900">
                  {safeField(report.solicitante.alertasAgente)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {report.solicitado && (
        <div className="card-elevated rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-neutral-900 mb-4">Solicitado</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-500 mb-1">Nombre</p>
              <p className="font-medium text-neutral-900">{safeField(report.solicitado.nombre)}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500 mb-1">Sexo</p>
              <p className="font-medium text-neutral-900">{safeField(report.solicitado.sexo)}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500 mb-1">Dirección</p>
              <p className="font-medium text-neutral-900">
                {safeField(report.solicitado.direccion)}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-500 mb-1">Comuna</p>
              <p className="font-medium text-neutral-900">{safeField(report.solicitado.comuna)}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500 mb-1">Región</p>
              <p className="font-medium text-neutral-900">{safeField(report.solicitado.region)}</p>
            </div>
            {report.solicitado.confirmacionAsistencia !== undefined && (
              <div>
                <p className="text-sm text-neutral-500 mb-1">Confirmación Asistencia</p>
                <p className="font-medium text-neutral-900">
                  {safeField(report.solicitado.confirmacionAsistencia)}
                </p>
              </div>
            )}
            {report.solicitado.dudasOSolicitudes !== undefined && (
              <div className="col-span-2">
                <p className="text-sm text-neutral-500 mb-1">Dudas/Solicitudes</p>
                <p className="font-medium text-neutral-900">
                  {safeField(report.solicitado.dudasOSolicitudes)}
                </p>
              </div>
            )}
            {report.solicitado.observacionesContacto !== undefined && (
              <div className="col-span-2">
                <p className="text-sm text-neutral-500 mb-1">Observaciones Contacto</p>
                <p className="font-medium text-neutral-900">
                  {safeField(report.solicitado.observacionesContacto)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {report.datosAdicionales && Object.keys(report.datosAdicionales).length > 0 && (
        <div className="card-elevated rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-neutral-900 mb-4">Datos Adicionales</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(report.datosAdicionales).map(([key, val]) => (
              <div key={key}>
                <p className="text-sm text-neutral-500 mb-1">{formatFieldName(key)}</p>
                <p className="font-medium text-neutral-900">{safeField(val)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
