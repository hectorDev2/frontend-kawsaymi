'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Pill, Activity, Heart, Users, AlertCircle, Settings, LogOut, ChevronRight, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Navigation() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  const patientNav = [
    { label: 'Inicio', href: '/dashboard', icon: Home },
    { label: 'Medicamentos', href: '/medications', icon: Pill },
    { label: 'Adherencia', href: '/adherence', icon: Activity },
    { label: 'Mi salud', href: '/health-data', icon: Heart },
    { label: 'Cuidadores', href: '/caregivers', icon: Users },
  ]

  const caregiverNav = [
    { label: 'Inicio', href: '/dashboard', icon: Home },
    { label: 'Pacientes', href: '/patients', icon: Users },
    { label: 'Alertas', href: '/alerts', icon: AlertCircle },
  ]

  const navItems = user?.role === 'PATIENT' ? patientNav : caregiverNav

  // Bottom nav muestra solo los primeros 4 ítems en mobile
  const bottomNavItems = navItems.slice(0, 4)

  const isActive = (href: string) => pathname === href
  const userInitials = (user?.name ?? '?').split(' ').map((w) => w[0]).slice(0, 2).join('')

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <nav className="hidden md:flex md:fixed md:left-0 md:top-0 md:w-64 md:h-screen md:flex-col md:border-r md:border-border bg-card z-30">
        {/* Logo */}
        <div className="p-5 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-brand text-white flex items-center justify-center text-sm font-bold shadow-sm flex-shrink-0">
              KC
            </div>
            <div>
              <p className="font-bold leading-tight">Kawsaymi Care</p>
              <p className="text-xs text-muted-foreground leading-tight">Adherencia a medicamentos</p>
            </div>
          </Link>
        </div>

        {/* Nav items */}
        <div className="flex-1 p-4 overflow-y-auto">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
            {user?.role === 'PATIENT' ? 'Mi salud' : 'Mis pacientes'}
          </p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                  {active && <ChevronRight className="w-4 h-4 ml-auto opacity-60" />}
                </Link>
              )
            })}
          </div>
        </div>

        {/* User footer */}
        <div className="p-4 border-t border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-accent transition-colors text-left">
                <div className="w-9 h-9 rounded-full gradient-brand text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {userInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-56 mb-1">
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2 cursor-pointer py-2.5">
                  <Settings className="w-4 h-4" />
                  Configuración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer py-2.5">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* ── MOBILE TOP BAR ── */}
      <header className="md:hidden sticky top-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl gradient-brand text-white flex items-center justify-center text-sm font-bold">
            KC
          </div>
          <span className="font-bold text-base">Kawsaymi</span>
        </Link>

        {/* Avatar con dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-10 h-10 rounded-full gradient-brand text-white flex items-center justify-center text-sm font-bold">
              {userInitials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2 border-b border-border mb-1">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2 cursor-pointer py-2.5">
                <Settings className="w-4 h-4" />
                Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer py-2.5">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border">
        <div className="flex items-stretch">
          {bottomNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-1 transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-colors ${active ? 'bg-primary/10' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium leading-none">{item.label}</span>
              </Link>
            )
          })}
          {/* Profile tab */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-1 transition-colors ${
                pathname === '/settings' ? 'text-primary' : 'text-muted-foreground'
              }`}>
                <div className={`p-1.5 rounded-xl transition-colors ${pathname === '/settings' ? 'bg-primary/10' : ''}`}>
                  <User className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium leading-none">Perfil</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-56 mb-2">
              <div className="px-3 py-2 border-b border-border mb-1">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer py-2.5">
                  <Settings className="w-4 h-4 mr-2" />
                  Configuración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer py-2.5">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </>
  )
}
