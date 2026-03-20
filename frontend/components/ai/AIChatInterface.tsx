"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot, Send, User } from "lucide-react"
import { useState } from "react"
import { Card } from "@/components/ui/card"

type Message = {
    id: string
    role: 'user' | 'assistant'
    content: string
}

export function AIChatInterface() {
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'Hello! I am your Operations Copilot. How can I help you today?' }
    ])

    const handleSend = () => {
        if (!input.trim()) return

        const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input }
        setMessages(prev => [...prev, userMessage])
        setInput('')

        // Mock AI response
        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm a demo bot for now, but I can help you find trips, check captain status, or draft emails."
            }
            setMessages(prev => [...prev, aiMessage])
        }, 1000)
    }

    return (
        <Card className="flex flex-col h-[600px] shadow-sm">
            <div className="p-4 border-b bg-muted/50 flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <div>
                    <h3 className="font-semibold text-sm">Ops Copilot</h3>
                    <p className="text-xs text-muted-foreground">Powered by Gemini</p>
                </div>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <Avatar className="h-8 w-8">
                                {message.role === 'assistant' ? (
                                    <div className="bg-primary h-full w-full flex items-center justify-center text-primary-foreground">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                ) : (
                                    <AvatarImage src="/avatars/01.png" />
                                )}
                                {message.role === 'user' && <AvatarFallback>ME</AvatarFallback>}
                            </Avatar>

                            <div className={`rounded-lg px-3 py-2 max-w-[80%] text-sm ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                {message.content}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            <div className="p-4 border-t flex gap-2">
                <Input
                    placeholder="Ask about trips, captains, or risks..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button size="icon" onClick={handleSend}>
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </Card>
    )
}
