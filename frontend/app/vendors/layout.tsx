import { AppShell } from "@/components/layout/AppShell"

export default function VendorsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <AppShell>{children}</AppShell>
}
