"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Map as MapIcon,
    Users,
    FileText,
    Store,
    Activity,
    CheckSquare,
    BarChart3,
    Bot,
    Settings,
    LogOut,
    Shield
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BokettoPinIcon, BokettoWordmark } from "@/components/ui/BoketttoLogo"

export const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: MapIcon, label: "Trips", href: "/trips" },
    { icon: Users, label: "Captains", href: "/captains" },
    { icon: Store, label: "Vendors", href: "/vendors" },
    { icon: Activity, label: "Live Monitoring", href: "/monitoring" },
    { icon: CheckSquare, label: "Tasks", href: "/tasks" },
    { icon: BarChart3, label: "Reports", href: "/reports" },
    { icon: Bot, label: "AI Assistant", href: "/ai-assistant" },
    { icon: Shield, label: "Team Hub", href: "/team" },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="hidden md:flex h-full w-64 flex-col surface-low text-foreground">
            <div className="flex h-16 items-center px-6">
                <div className="flex items-center gap-3">
                    <BokettoPinIcon size={34} className="text-[#0d4f53]" />
                    <BokettoWordmark height={34} className="text-[#0d4f53]" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="grid gap-1 px-3">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-primary/10 text-primary shadow-ambient translate-x-1"
                                        : "text-muted-foreground hover:surface-lowest hover:text-foreground hover:translate-x-1"
                                )}
                            >
                                <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Bottom actions - tonal separation via spacing, no border */}
            <div className="mt-auto p-4 pt-2">
                <div className="surface-mid rounded-2xl p-3 mb-3">
                    <p className="text-xs font-semibold text-foreground mb-1">Upgrade to Pro</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">Unlock all professional features</p>
                </div>
                <nav className="grid gap-1">
                    <Link
                        href="/settings"
                        className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-container-high hover:text-foreground text-muted-foreground"
                        )}
                    >
                        <Settings className="h-4 w-4" />
                        Settings
                    </Link>
                    <Button variant="ghost" className="justify-start gap-3 px-3 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl">
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </nav>
            </div>
        </div>
    )
}
