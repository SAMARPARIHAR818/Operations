"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
    location: z.string().min(2, { message: "Location is required." }),
    status: z.string().default("Active"),
    total_trips: z.coerce.number().default(0),
    rating: z.coerce.number().min(0).max(5).default(5.0),
    bio: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface CaptainFormProps {
    onSuccess?: () => void
    initialData?: {
        id: string
        full_name: string
        email: string
        phone: string
        city: string
        status: string
        captain_overall_score: number
        total_trips_completed: number
        internal_notes?: string
    }
}

export function CaptainForm({ onSuccess, initialData }: CaptainFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const isEditing = !!initialData

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: initialData?.full_name || "",
            email: initialData?.email || "",
            phone: initialData?.phone || "",
            location: initialData?.city || "",
            status: initialData?.status || "Active",
            total_trips: initialData?.total_trips_completed || 0,
            rating: initialData?.captain_overall_score || 5.0,
            bio: initialData?.internal_notes || "",
        },
    })

    async function onSubmit(values: FormValues) {
        setIsLoading(true)
        try {
            const payload: any = {
                full_name: values.name,
                email: values.email,
                phone: values.phone,
                city: values.location,
                status: values.status,
                captain_overall_score: values.rating,
                total_trips_completed: values.total_trips,
                internal_notes: values.bio || null,
            }

            if (isEditing) payload.id = initialData.id

            const response = await fetch('/api/captains', {
                method: isEditing ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            const result = await response.json()
            if (!response.ok) throw new Error(result.error)

            toast({
                title: isEditing ? "Captain updated" : "Captain added successfully",
                description: `${values.name} has been ${isEditing ? 'updated' : 'added to the roster'}.`,
            })

            if (!isEditing) form.reset()
            if (onSuccess) onSuccess()
        } catch (error: any) {
            console.error(error)
            toast({
                variant: "destructive",
                title: isEditing ? "Error updating captain" : "Error adding captain",
                description: error?.message || "Something went wrong. Please try again.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl><Input placeholder="e.g. John Doe" {...field} className="glass-input" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="location" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Home Base / Location</FormLabel>
                            <FormControl><Input placeholder="e.g. Mumbai, India" {...field} className="glass-input" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl><Input placeholder="john@example.com" {...field} className="glass-input" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl><Input placeholder="+91 98765 43210" {...field} className="glass-input" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <FormField control={form.control} name="status" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{isEditing ? "Status" : "Initial Status"}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="glass-input"><SelectValue placeholder="Select status" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                    <SelectItem value="Suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="rating" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{isEditing ? "Rating" : "Initial Rating"}</FormLabel>
                            <FormControl><Input type="number" step="0.1" max="5" {...field} className="glass-input" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="total_trips" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{isEditing ? "Total Trips" : "Past Trips"}</FormLabel>
                            <FormControl><Input type="number" {...field} className="glass-input" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                <FormField control={form.control} name="bio" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Skills / Bio</FormLabel>
                        <FormControl><Textarea placeholder="Enter specific skills, languages, or notes..." className="resize-none glass-input" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-white min-w-[120px]">
                        {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEditing ? "Saving..." : "Adding..."}</>) : (isEditing ? "Save Changes" : "Add Captain")}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
