import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const jakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-jakarta",
    weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
    title: "Boketto Ops OS",
    description: "Operations Operating System",
};

import { AIAssistant } from "@/components/ai/AIAssistant";
import { CurrencyProvider } from "@/components/providers/CurrencyProvider";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={cn(jakarta.variable, jakarta.className, "min-h-screen bg-background antialiased")}>
                <CurrencyProvider>
                    {children}
                    <AIAssistant />
                </CurrencyProvider>
            </body>
        </html>
    );
}
