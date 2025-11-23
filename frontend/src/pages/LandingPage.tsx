import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Scale,
  Heart,
  Users,
  FileText,
  TrendingUp,
  Shield,
  MessageCircle,
  Clock,
  Target,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react'

export function LandingPage() {
  const navigate = useNavigate()

  const features = [
    {
      icon: Users,
      title: 'Gestión de Casos',
      description:
        'Administra todos tus casos de mediación familiar en un solo lugar, con seguimiento completo del estado y progreso.',
      color: 'wakai-green',
      bgColor: 'bg-wakai-green-50',
      iconColor: 'text-wakai-green-600',
      borderColor: 'border-wakai-green-200',
    },
    {
      icon: MessageCircle,
      title: 'Registro de Contactos',
      description:
        'Documenta cada intento de contacto por WhatsApp, teléfono, o presencial con resultados y observaciones.',
      color: 'wakai-blue',
      bgColor: 'bg-wakai-blue-50',
      iconColor: 'text-wakai-blue-600',
      borderColor: 'border-wakai-blue-200',
    },
    {
      icon: Heart,
      title: 'Mapa Emocional',
      description:
        'Visualiza y monitorea los indicadores emocionales de los participantes para facilitar el proceso de mediación.',
      color: 'wakai-amber',
      bgColor: 'bg-wakai-amber-50',
      iconColor: 'text-wakai-amber-600',
      borderColor: 'border-wakai-amber-200',
    },
    {
      icon: FileText,
      title: 'Reportes Detallados',
      description:
        'Genera informes completos con análisis de casos, resumen de contactos e insights para mejores decisiones.',
      color: 'wakai-neutral',
      bgColor: 'bg-wakai-neutral-50',
      iconColor: 'text-wakai-neutral-600',
      borderColor: 'border-wakai-neutral-200',
    },
    {
      icon: TrendingUp,
      title: 'Análisis de Progreso',
      description:
        'Monitorea la evolución de cada caso con métricas claras y visualización del avance hacia acuerdos.',
      color: 'wakai-green',
      bgColor: 'bg-wakai-green-50',
      iconColor: 'text-wakai-green-600',
      borderColor: 'border-wakai-green-200',
    },
    {
      icon: Shield,
      title: 'Información Segura',
      description:
        'Mantén todos los datos de tus casos protegidos con las mejores prácticas de seguridad y privacidad.',
      color: 'wakai-blue',
      bgColor: 'bg-wakai-blue-50',
      iconColor: 'text-wakai-blue-600',
      borderColor: 'border-wakai-blue-200',
    },
  ]

  const benefits = [
    {
      title: 'Interfaz Intuitiva',
      description:
        'Diseño pensado para profesionales de mediación, fácil de usar desde el primer día.',
    },
    {
      title: 'Ahorro de Tiempo',
      description:
        'Reduce el tiempo administrativo y enfócate en lo que realmente importa: las personas.',
    },
    {
      title: 'Visión Completa',
      description: 'Toda la información de tus casos centralizada y accesible cuando la necesites.',
    },
    {
      title: 'Mejor Seguimiento',
      description:
        'No pierdas ningún detalle con historial completo de contactos y evolución emocional.',
    },
  ]

  const stats = [
    { value: '100%', label: 'Centrado en Mediación' },
    { value: '24/7', label: 'Acceso Continuo' },
    { value: 'Rápido', label: 'Implementación' },
    { value: 'Seguro', label: 'Datos Protegidos' },
  ]

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-wakai-blue-50 via-wakai-green-50 to-wakai-amber-50 px-6 py-16 md:px-12 md:py-24 lg:py-32">
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-white/80 p-6 shadow-lg backdrop-blur-sm">
              <Scale className="h-16 w-16 text-wakai-green-600 md:h-20 md:w-20" />
            </div>
          </div>

          <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Plataforma de Gestión de Mediación
          </Badge>

          <h1 className="mb-6 text-4xl font-bold leading-tight text-wakai-neutral-900 md:text-5xl lg:text-6xl">
            Wakai: Acuerdos que{' '}
            <span className="bg-gradient-to-r from-wakai-green-600 to-wakai-blue-600 bg-clip-text text-transparent">
              Transforman Vidas
            </span>
          </h1>

          <p className="mb-8 text-lg leading-relaxed text-wakai-neutral-600 md:text-xl">
            La herramienta integral para centros de mediación en Chile. Gestiona casos familiares,
            registra contactos, monitorea emociones y genera reportes, todo en una plataforma
            diseñada para promover la paz y el entendimiento.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="group bg-wakai-green-600 px-8 py-6 text-lg hover:bg-wakai-green-700"
              onClick={() => navigate('/cases')}
            >
              Comenzar Ahora
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 px-8 py-6 text-lg hover:bg-wakai-neutral-50"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Conocer Más
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="rounded-xl border border-wakai-neutral-200 bg-white/60 p-4 backdrop-blur-sm"
              >
                <div className="text-2xl font-bold text-wakai-green-600 md:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-wakai-neutral-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-wakai-green-200/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-wakai-blue-200/30 blur-3xl" />
      </section>

      {/* Features Section */}
      <section id="features" className="space-y-8">
        <div className="text-center">
          <Badge variant="outline" className="mb-4 px-4 py-1.5">
            <Target className="mr-1.5 h-3.5 w-3.5" />
            Funcionalidades
          </Badge>
          <h2 className="text-3xl font-bold text-wakai-neutral-800 md:text-4xl">
            Todo lo que necesitas para gestionar tus mediaciones
          </h2>
          <p className="mt-3 text-lg text-wakai-neutral-600">
            Herramientas diseñadas específicamente para profesionales de mediación familiar
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className={`group border-2 ${feature.borderColor} transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
              >
                <CardHeader className={`${feature.bgColor} rounded-t-lg`}>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-lg bg-white p-2.5 shadow-sm">
                      <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="space-y-8 rounded-2xl bg-gradient-to-br from-wakai-green-50 to-wakai-blue-50 p-8 md:p-12">
        <div className="text-center">
          <Badge variant="outline" className="mb-4 bg-white px-4 py-1.5">
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            Beneficios
          </Badge>
          <h2 className="text-3xl font-bold text-wakai-neutral-800 md:text-4xl">
            ¿Por qué elegir Wakai?
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex gap-4 rounded-xl border border-wakai-green-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <div className="flex-shrink-0">
                <div className="rounded-full bg-wakai-green-100 p-2">
                  <CheckCircle2 className="h-6 w-6 text-wakai-green-600" />
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-wakai-neutral-800">
                  {benefit.title}
                </h3>
                <p className="leading-relaxed text-wakai-neutral-600">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="space-y-8">
        <div className="text-center">
          <Badge variant="outline" className="mb-4 px-4 py-1.5">
            <Clock className="mr-1.5 h-3.5 w-3.5" />
            Proceso
          </Badge>
          <h2 className="text-3xl font-bold text-wakai-neutral-800 md:text-4xl">
            Comienza en 3 simples pasos
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Card className="border-2 border-wakai-blue-200 text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-wakai-blue-100">
                <span className="text-2xl font-bold text-wakai-blue-600">1</span>
              </div>
              <CardTitle>Registra tu Caso</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Ingresa la información básica del caso de mediación y los participantes
                involucrados.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 border-wakai-green-200 text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-wakai-green-100">
                <span className="text-2xl font-bold text-wakai-green-600">2</span>
              </div>
              <CardTitle>Documenta Contactos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Registra cada intento de contacto y las observaciones emocionales relevantes.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 border-wakai-amber-200 text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-wakai-amber-100">
                <span className="text-2xl font-bold text-wakai-amber-600">3</span>
              </div>
              <CardTitle>Genera Reportes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Obtén insights valiosos y reportes completos para guiar el proceso de mediación.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-wakai-green-600 to-wakai-blue-600 px-8 py-16 text-center text-white md:px-12">
        <div className="relative z-10">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            ¿Listo para transformar tu proceso de mediación?
          </h2>
          <p className="mb-8 text-lg opacity-90 md:text-xl">
            Únete a Wakai y lleva tus casos de mediación al siguiente nivel
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              className="group px-8 py-6 text-lg"
              onClick={() => navigate('/cases')}
            >
              Ir a Casos
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white bg-transparent px-8 py-6 text-lg text-white hover:bg-white/10"
            >
              <Phone className="mr-2 h-5 w-5" />
              Contactar
            </Button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      </section>

      {/* Footer */}
      <footer className="border-t border-wakai-neutral-200 pt-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Scale className="h-8 w-8 text-wakai-green-600" />
              <span className="text-xl font-bold text-wakai-neutral-800">Wakai</span>
            </div>
            <p className="text-sm leading-relaxed text-wakai-neutral-600">
              Plataforma de gestión de mediación familiar diseñada para centros de mediación en
              Chile. Promoviendo acuerdos pacíficos sin ganadores ni perdedores.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-wakai-neutral-800">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm text-wakai-neutral-600">
              <li>
                <button
                  onClick={() => navigate('/cases')}
                  className="transition-colors hover:text-wakai-green-600"
                >
                  Casos
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/contacts')}
                  className="transition-colors hover:text-wakai-green-600"
                >
                  Contactos
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/emotional-map')}
                  className="transition-colors hover:text-wakai-green-600"
                >
                  Mapa Emocional
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-wakai-neutral-800">Contacto</h3>
            <ul className="space-y-3 text-sm text-wakai-neutral-600">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-wakai-green-600" />
                <span>contacto@wakai.cl</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-wakai-green-600" />
                <span>+56 9 1234 5678</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-wakai-green-600" />
                <span>Santiago, Chile</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-wakai-neutral-200 pt-8 text-center text-sm text-wakai-neutral-600">
          <p>© 2025 Wakai. Todos los derechos reservados.</p>
          <p className="mt-2">
            Wakai (和解) - Concepto japonés de acuerdo mutuo sin ganador ni perdedor
          </p>
        </div>
      </footer>
    </div>
  )
}
