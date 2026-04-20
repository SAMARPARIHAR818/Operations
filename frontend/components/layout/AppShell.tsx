"use client"

import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"
import { MobileNav } from "@/components/layout/MobileNav"

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen surface-base font-sans">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
                    {children}
                </main>
            </div>
            <MobileNav />
        </div>
    )
}
