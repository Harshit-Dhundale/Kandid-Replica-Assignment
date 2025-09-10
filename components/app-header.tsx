"use client"

import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { Fragment } from "react"

interface BreadcrumbItem {
  label: string
  href?: string
}

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []

  // Map route segments to readable labels
  const segmentLabels: Record<string, string> = {
    dashboard: "Dashboard",
    leads: "Leads",
    campaigns: "Campaign",
    messages: "Messages",
    "linkedin-accounts": "LinkedIn Accounts",
    settings: "Settings",
    admin: "Admin Panel",
    activity: "Activity logs",
    users: "User logs",
  }

  segments.forEach((segment, index) => {
    // Handle dynamic segments (UUIDs)
    if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      // For campaign details, we'll show a placeholder name
      // In a real app, you'd fetch the actual campaign name
      if (segments[index - 1] === "campaigns") {
        breadcrumbs.push({ label: "Just Herbs" })
      }
      return
    }

    const label = segmentLabels[segment] || segment
    breadcrumbs.push({ label })
  })

  return breadcrumbs
}

export function AppHeader() {
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumbs(pathname)

  if (breadcrumbs.length === 0) return null

  return (
    <header className="h-16 border-b bg-background px-6 flex items-center">
      <nav className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((item, index) => (
          <Fragment key={index}>
            {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            <span
              className={index === breadcrumbs.length - 1 ? "text-foreground font-medium" : "text-muted-foreground"}
            >
              {item.label}
            </span>
          </Fragment>
        ))}
      </nav>
    </header>
  )
}
