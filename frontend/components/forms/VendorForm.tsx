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
import { createClient } from "@/utils/supabase/client"
import { useCurrency } from "@/components/providers/CurrencyProvider"

const formSchema = z.object({
    vendor_name: z.string().min(2, "Vendor name is required"),
    vendor_type: z.string({ message: "Vendor type is required" }),
    location: z.string().optional(),
    contact_person: z.string().optional(),
    phone: z.string().optional(),
    base_price: z.coerce.number().min(0).optional(),
    negotiated_price: z.coerce.number().min(0).optional(),
    payment_terms: z.string().optional(),
    internal_notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface VendorFormProps {
    onSuccess?: () => void
    initialData?: {
        id: string
        vendor_name: string
        vendor_type: string
        location?: string
        contact_person?: string
        phone?: string
        base_price?: number
        negotiated_price?: number
        payment_terms?: string
        internal_notes?: string
    }
}

export function VendorForm({ onSuccess, initialData }: VendorFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const supabase = createClient()
    const { currency } = useCurrency()
    const isEditing = !!initialData

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            vendor_name: initialData?.vendor_name || "",
            vendor_type: initialData?.vendor_type || "",
            location: initialData?.location || "",
            contact_person: initialData?.contact_person || "",
            phone: initialData?.phone || "",
            base_price: initialData?.base_price || 0,
            negotiated_price: initialData?.negotiated_price || 0,
            payment_terms: initialData?.payment_terms || "",
            internal_notes: initialData?.internal_notes || "",
        },
    })

    async function onSubmit(values: FormValues) {
        setIsLoading(true)
        try {
            const payload: any = {
                vendor_name: values.vendor_name,
                vendor_type: values.vendor_type,
                location: values.location || null,
                contact_person: values.contact_person || null,
                phone: values.phone || null,
                base_price: values.base_price || null,
                negotiated_price: values.negotiated_price || null,
                payment_terms: values.payment_terms || null,
                internal_notes: values.internal_notes || null,
            }

            if (isEditing) payload.id = initialData.id

            const response = await fetch('/api/vendors', {
                method: isEditing ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            const result = await response.json()
            if (!response.ok) throw new Error(result.error)

            toast({
                title: isEditing ? "Vendor updated" : "Vendor added successfully",
                description: `${values.vendor_name} has been ${isEditing ? 'updated' : 'added'}.`,
            })

            if (!isEditing) form.reset()
            if (onSuccess) onSuccess()
        } catch (error: any) {
            console.error(error)
            toast({
                variant: "destructive",
                title: isEditing ? "Error updating vendor" : "Error adding vendor",
                description: error?.message || "Something went wrong. Please try again.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="vendor_name" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Vendor Name</FormLabel>
                        <FormControl><Input placeholder="e.g. Grand Resort" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="vendor_type" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Hotel">Hotel</SelectItem>
                                    <SelectItem value="Transport">Transport</SelectItem>
                                    <SelectItem value="Activity">Activity</SelectItem>
                                    <SelectItem value="Local Partner">Local Partner</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="location" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl><Input placeholder="e.g. Goa, India" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="contact_person" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contact Person</FormLabel>
                            <FormControl><Input placeholder="e.g. John Doe" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl><Input placeholder="e.g. +91 9876543210" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="base_price" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Base Price {currency === 'INR' ? '(₹)' : '($)'}</FormLabel>
                            <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="negotiated_price" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Negotiated Price {currency === 'INR' ? '(₹)' : '($)'}</FormLabel>
                            <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                <FormField control={form.control} name="payment_terms" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Payment Terms</FormLabel>
                        <FormControl><Input placeholder="e.g. 50% advance, 50% on arrival" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="internal_notes" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Internal Notes</FormLabel>
                        <FormControl><Textarea placeholder="Any internal notes about this vendor..." {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? "Save Changes" : "Add Vendor"}
                </Button>
            </form>
        </Form>
    )
}
