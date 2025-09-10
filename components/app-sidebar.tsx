"use client"

import { cn } from "@/lib/utils"
import { useUIStore } from "@/stores/ui"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSession, signOut } from "@/lib/auth-client"
import {
  BarChart3,
  Users,
  Megaphone,
  MessageSquare,
  Linkedin,
  Settings,
  Activity,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigationItems = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
      { name: "Leads", href: "/leads", icon: Users },
      { name: "Campaign", href: "/campaigns", icon: Megaphone },
      { name: "Messages", href: "/messages", icon: MessageSquare },
      { name: "LinkedIn Accounts", href: "/linkedin-accounts", icon: Linkedin },
    ],
  },
  {
    title: "Settings",
    items: [{ name: "Setting & Billing", href: "/settings", icon: Settings }],
  },
  {
    title: "Admin Panel",
    items: [
      { name: "Activity logs", href: "/admin/activity", icon: Activity },
      { name: "User logs", href: "/admin/users", icon: FileText },
    ],
  },
]

export function AppSidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { data: session } = useSession()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-card transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white font-bold text-sm">
              L
            </div>
            <span className="font-semibold text-lg">LinkBird</span>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={toggleSidebar} className="h-8 w-8 p-0">
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {navigationItems.map((section) => (
          <div key={section.title} className="mb-6">
            {!sidebarCollapsed && (
              <h3 className="px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {section.title}
              </h3>
            )}
            <nav className="space-y-1 px-2">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 h-10",
                        sidebarCollapsed && "justify-center px-2",
                        isActive && "bg-blue-50 text-blue-700 hover:bg-blue-100",
                      )}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* User Section */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-600 text-white text-sm">
              {session?.user?.name?.slice(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session?.user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground">Personal</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className={cn("h-8 w-8 p-0", sidebarCollapsed && "ml-0")}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
