"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Map as MapIcon,
    Users,
    CheckSquare,
    BarChart3,
    Store,
    Activity,
    Bot,
    Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"

const mobileNavItems = [
    { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
    { icon: MapIcon, label: "Trips", href: "/trips" },
    { icon: Users, label: "Captains", href: "/captains" },
    { icon: CheckSquare, label: "Tasks", href: "/tasks" },
    { icon: BarChart3, label: "Reports", href: "/reports" },
]

export function MobileNav() {
    const pathname = usePathname()

    // Don't show on login page
    if (pathname === "/login") return null

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden surface-lowest border-t border-border/50 safe-bottom">
            <div className="flex items-center justify-around h-16 px-2">
                {mobileNavItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-xl transition-all duration-200",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div className={cn(
                                "flex items-center justify-center w-10 h-6 rounded-full transition-all duration-200",
                                isActive ? "bg-primary/10 w-12" : ""
                            )}>
                                <item.icon className={cn("h-5 w-5 transition-all", isActive && "scale-110")} />
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium transition-all leading-none",
                                isActive ? "opacity-100 font-semibold" : "opacity-70"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
