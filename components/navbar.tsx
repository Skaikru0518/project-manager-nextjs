"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LogOut, ChartBar as BarChart3, FolderOpen, Calendar, Menu, X, Shield, PieChart, User, Wallet, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useAuth()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Calendar },
    { href: '/summary', label: 'Summary', icon: BarChart3 },
    { href: '/finance', label: 'Finances', icon: Wallet },
    { href: '/profile', label: 'Profile', icon: User },
  ]

  const adminNavItems = user?.role === 'ADMIN' ? [
    { href: '/admin/summary', label: 'Admin Dashboard', icon: PieChart },
    { href: '/admin', label: 'Admin Panel', icon: Shield },
    { href: '/admin/finances', label: 'User Finances', icon: Wallet },
  ] : []

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <FolderOpen className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="font-bold text-lg sm:text-xl">ProjectTracker</span>
            </Link>

            <div className="hidden md:flex space-x-4">
              {[...navItems, ...adminNavItems].map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {user?.level && (
              <Badge className={`hidden sm:flex ${
                user.level === 'JUNIOR' ? 'bg-blue-100 text-blue-800' :
                user.level === 'MEDIOR' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {user.level}
              </Badge>
            )}
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="hidden sm:inline-flex"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Logout</span>
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t pb-3 pt-2">
            <div className="space-y-1">
              {[...navItems, ...adminNavItems].map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      pathname === item.href
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              <Button
                variant="ghost"
                className="w-full justify-start px-3 py-2 text-base font-medium"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}