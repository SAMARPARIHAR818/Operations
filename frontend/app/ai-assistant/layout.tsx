import { AppShell } from "@/components/layout/AppShell"

export default function AIAssistantLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <AppShell>{children}</AppShell>
}
