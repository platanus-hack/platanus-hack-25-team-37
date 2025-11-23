import { Link, Outlet, useLocation } from 'react-router-dom'
import { Scale } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SimpleChat } from './SimpleChat'

export function MainLayout() {
  const location = useLocation()

  const navItems = [
    { path: '/cases', label: 'Casos' },
    { path: '/contacts', label: 'Contactos' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      <nav className="sticky top-0 z-50 glass border-b border-black/5">
        <div className="mx-auto px-8">
          <div className="flex h-14 items-center justify-between">
            <Link
              to="/cases"
              className="flex items-center gap-3 transition-all duration-300 hover:opacity-70 cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-apple-sm">
                <Scale className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-semibold tracking-tight text-neutral-900">Wakai</h1>
              </div>
            </Link>

            <div className="flex gap-2">
              {navItems.map(item => {
                const isActive = location.pathname.startsWith(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-200 cursor-pointer',
                      isActive
                        ? 'bg-neutral-900 text-white shadow-apple-sm'
                        : 'text-neutral-600 hover:bg-neutral-100/80 hover:text-neutral-900'
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-3.5rem)]">
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-8 py-8">
            <Outlet />
          </div>
        </main>

        <aside className="w-[400px] glass-card border-l border-black/5">
          <SimpleChat />
        </aside>
      </div>
    </div>
  )
}
