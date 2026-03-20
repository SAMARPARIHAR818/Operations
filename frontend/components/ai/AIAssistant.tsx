"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, Send, X, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Message = {
    role: "user" | "assistant"
    content: string
}

export function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hello! I am Boketto AI. How can I help you optimize operations today?" }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    async function handleSend() {
        if (!input.trim()) return

        const userMsg: Message = { role: "user", content: input }
        setMessages(prev => [...prev, userMsg])
        setInput("")
        setIsLoading(true)

        try {
            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMsg] })
            })

            const data = await res.json()
            if (data.error) throw new Error(data.error)

            setMessages(prev => [...prev, { role: "assistant", content: data.response }])
        } catch (error) {
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again or check your API key." }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            {/* Floating Trigger */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl transition-all duration-300 z-50",
                    isOpen ? "rotate-90 scale-0 opacity-0" : "scale-100 opacity-100"
                )}
            >
                <Bot className="h-7 w-7" />
            </Button>

            {/* Chat Window */}
            <div
                className={cn(
                    "fixed bottom-6 right-6 w-[400px] h-[600px] bg-background border rounded-2xl shadow-2xl flex flex-col transition-all duration-300 z-50 overflow-hidden glass-card",
                    isOpen ? "translate-y-0 opacity-100" : "translate-y-[120%] opacity-0 pointer-events-none"
                )}
            >
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b bg-primary/5">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">Boketto Co-Pilot</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] text-muted-foreground">Online</span>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                        <X className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex w-full",
                                    m.role === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                                        m.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-br-none"
                                            : "bg-muted rounded-bl-none"
                                    )}
                                >
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-3">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t bg-background/50 backdrop-blur">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            handleSend()
                        }}
                        className="flex gap-2"
                    >
                        <Input
                            placeholder="Ask about risks, tasks, or simulate..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="rounded-full bg-background border-muted-foreground/20"
                        />
                        <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="rounded-full h-10 w-10 shrink-0">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </>
    )
}
