"use client"

import { Bell, Plus, Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { sidebarItems } from "@/components/layout/Sidebar"
import { usePathname } from "next/navigation"
import { BokettoPinIcon, BokettoWordmark } from "@/components/ui/BoketttoLogo"
import { useCurrency } from "@/components/providers/CurrencyProvider"

export function Topbar() {
    const pathname = usePathname()
    const { currency, setCurrency } = useCurrency()

    return (
        <header className="flex h-14 md:h-16 items-center justify-between surface-lowest px-3 md:px-6 gap-2">
            {/* Left: Hamburger (mobile) + Logo (mobile) + Search (desktop) */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 shrink-0">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0 surface-low">
                        <div className="flex h-16 items-center px-6">
                            <div className="flex items-center gap-3">
                                <BokettoPinIcon size={30} className="text-[#0d4f53]" />
                                <BokettoWordmark height={30} className="text-[#0d4f53]" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto py-4">
                            <nav className="grid gap-1 px-2">
                                {sidebarItems.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-container-high hover:text-foreground",
                                                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                                            )}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            {item.label}
                                        </Link>
                                    )
                                })}
                            </nav>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Mobile logo */}
                <div className="flex md:hidden items-center gap-2">
                    <BokettoPinIcon size={26} className="text-[#0d4f53]" />
                    <BokettoWordmark height={22} className="text-[#0d4f53]" />
                </div>

                {/* Desktop search */}
                <div className="relative w-full max-w-sm hidden md:block">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search trips, captains, tasks..."
                        className="w-full surface-low pl-9 rounded-full border-0 focus-visible:ring-1 focus-visible:ring-ring/40 md:w-[300px] lg:w-[300px]"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
                {/* Currency toggle — hidden on small screens */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex font-semibold text-sm rounded-full surface-low border border-border/50 transition-colors hover:bg-surface-container-high"
                    onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
                >
                    {currency === 'INR' ? '🇮🇳 INR' : '🇺🇸 USD'}
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="sm" className="gap-1.5 gradient-primary text-white border-0 rounded-xl hover:brightness-110 transition-all h-8 md:h-9 px-2.5 md:px-3">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline text-sm">Quick Add</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="surface-lowest rounded-xl border-0 shadow-ambient">
                        <DropdownMenuItem>New Trip</DropdownMenuItem>
                        <DropdownMenuItem>New Captain</DropdownMenuItem>
                        <DropdownMenuItem>New Vendor</DropdownMenuItem>
                        <DropdownMenuItem>New Task</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-surface-container-high rounded-xl h-9 w-9">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-secondary" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 md:h-9 md:w-9 rounded-full p-0">
                            <Avatar className="h-8 w-8 md:h-9 md:w-9 border-2 border-surface">
                                <AvatarImage src="/avatars/01.png" alt="@admin" />
                                <AvatarFallback className="bg-primary-fixed text-primary text-sm font-semibold">AD</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="surface-lowest rounded-xl border-0 shadow-ambient">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
                            className="sm:hidden"
                        >
                            Switch to {currency === 'INR' ? 'USD 🇺🇸' : 'INR 🇮🇳'}
                        </DropdownMenuItem>
                        <DropdownMenuItem>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
