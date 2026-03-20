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
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
    full_name: z.string().min(2, "Name is required"),
    phone: z.string().optional(),
    email: z.string().email("Valid email required").optional().or(z.literal("")),
    city: z.string().optional(),
    communication_score: z.coerce.number().min(1).max(10).optional(),
    confidence_score: z.coerce.number().min(1).max(10).optional(),
    maturity_score: z.coerce.number().min(1).max(10).optional(),
    leadership_potential_score: z.coerce.number().min(1).max(10).optional(),
    interviewer_notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface ApplicantFormProps {
    onSuccess?: () => void
    initialData?: any
}

export function ApplicantForm({ onSuccess, initialData }: ApplicantFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const isEditing = !!initialData

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            full_name: initialData?.full_name || "",
            phone: initialData?.phone || "",
            email: initialData?.email || "",
            city: initialData?.city || "",
            communication_score: initialData?.communication_score || undefined,
            confidence_score: initialData?.confidence_score || undefined,
            maturity_score: initialData?.maturity_score || undefined,
            leadership_potential_score: initialData?.leadership_potential_score || undefined,
            interviewer_notes: initialData?.interviewer_notes || "",
        },
    })

    async function onSubmit(values: FormValues) {
        setIsLoading(true)
        try {
            const payload: any = {
                full_name: values.full_name,
                phone: values.phone || null,
                email: values.email || null,
                city: values.city || null,
                communication_score: values.communication_score || null,
                confidence_score: values.confidence_score || null,
                maturity_score: values.maturity_score || null,
                leadership_potential_score: values.leadership_potential_score || null,
                interviewer_notes: values.interviewer_notes || null,
            }

            if (isEditing) {
                payload.id = initialData.id
            } else {
                payload.founder_round_status = 'Pending'
            }

            const response = await fetch('/api/applicants', {
                method: isEditing ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            const result = await response.json()
            if (!response.ok) throw new Error(result.error)

            toast({
                title: isEditing ? "Applicant updated" : "Applicant added",
                description: `${values.full_name} has been ${isEditing ? 'updated' : 'added to the pipeline'}.`,
            })

            if (!isEditing) form.reset()
            if (onSuccess) onSuccess()
        } catch (error: any) {
            console.error(error)
            toast({
                variant: "destructive",
                title: isEditing ? "Error updating applicant" : "Error adding applicant",
                description: error?.message || "Something went wrong.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Rahul Sharma" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="email@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                    <Input placeholder="+91 9876543210" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Mumbai" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="communication_score"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Communication (1-10)</FormLabel>
                                <FormControl>
                                    <Input type="number" min={1} max={10} placeholder="—" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confidence_score"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confidence (1-10)</FormLabel>
                                <FormControl>
                                    <Input type="number" min={1} max={10} placeholder="—" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="maturity_score"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Maturity (1-10)</FormLabel>
                                <FormControl>
                                    <Input type="number" min={1} max={10} placeholder="—" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="leadership_potential_score"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Leadership (1-10)</FormLabel>
                                <FormControl>
                                    <Input type="number" min={1} max={10} placeholder="—" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="interviewer_notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Interview Notes</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Notes from the interview..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? "Save Changes" : "Add Applicant"}
                </Button>
            </form>
        </Form>
    )
}
