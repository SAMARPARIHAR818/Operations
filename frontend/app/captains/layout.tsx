import { AppShell } from "@/components/layout/AppShell"

export default function CaptainsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <AppShell>{children}</AppShell>
}
