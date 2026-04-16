'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Home, Pill, Activity, Heart, Users, AlertCircle, Settings, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export function Navigation() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  const patientNav = [
    { label: 'Inicio', href: '/', icon: Home },
    { label: 'Mis medicamentos', href: '/medications', icon: Pill },
    { label: 'Cumplimiento', href: '/adherence', icon: Activity },
    { label: 'Datos de salud', href: '/health-data', icon: Heart },
    { label: 'Mis cuidadores', href: '/caregivers', icon: Users },
  ]

  const caregiverNav = [
    { label: 'Inicio', href: '/', icon: Home },
    { label: 'Lista de pacientes', href: '/patients', icon: Users },
    { label: 'Alertas', href: '/alerts', icon: AlertCircle },
  ]

  const navItems = user?.role === 'patient' ? patientNav : caregiverNav

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
          >
            <Icon className="w-4 h-4" />
            {item.label}
          </Link>
        )
      })}
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:fixed md:left-0 md:top-0 md:w-64 md:h-screen md:bg-card md:border-r md:border-border md:flex md:flex-col md:p-4 md:gap-4">
        <Link href="/" className="flex items-center gap-2 px-2 py-2 font-bold text-lg">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm">
            KC
          </div>
          Kawsaymi Care
        </Link>
        <div className="flex-1 space-y-1 mt-8">
          <NavLinks />
        </div>
        <div className="space-y-2 border-t border-border pt-4 mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs mr-2">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">{user?.firstName}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configuración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="md:hidden sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs">
              KC
            </div>
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="space-y-4 mt-8">
                <NavLinks />
                <div className="border-t border-border pt-4 mt-4 space-y-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs mr-2">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium">{user?.firstName}</div>
                          <div className="text-xs text-muted-foreground">{user?.email}</div>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/settings">Configuración</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        Cerrar sesión
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  )
}
