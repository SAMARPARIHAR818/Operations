"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Camera } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/utils/supabase/client"

const formSchema = z.object({
    log_date: z.string(),
    morning_update: z.boolean(),
    wakeup_call: z.boolean(),
    vendor_coordination: z.boolean(),
    complaint_count: z.coerce.number().min(0),
    sentiment_score: z.coerce.number().min(1).max(10),
    ops_rating: z.coerce.number().min(1).max(10),
    notes: z.string().optional(),
    proof_file: z.any().optional(),
})

export function MonitoringForm({ tripId, onSuccess }: { tripId: string, onSuccess?: () => void }) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const supabase = createClient()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            log_date: new Date().toISOString().split('T')[0],
            morning_update: false,
            wakeup_call: false,
            vendor_coordination: false,
            complaint_count: 0,
            sentiment_score: 8,
            ops_rating: 8,
            notes: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            let proof_photo_url = null

            // Upload Proof
            if (values.proof_file instanceof FileList && values.proof_file.length > 0) {
                const file = values.proof_file[0]
                const fileExt = file.name.split('.').pop()
                const fileName = `monitoring/${tripId}/${Date.now()}.${fileExt}`

                const { error: uploadError } = await supabase.storage
                    .from('trip-documents')
                    .upload(fileName, file)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('trip-documents')
                    .getPublicUrl(fileName)

                proof_photo_url = publicUrl
            }

            const { error } = await supabase.from('trip_monitoring_logs').insert([{
                trip_id: tripId,
                log_date: values.log_date,
                morning_update: values.morning_update,
                wakeup_call: values.wakeup_call,
                vendor_coordination: values.vendor_coordination,
                complaint_count: values.complaint_count,
                sentiment_score: values.sentiment_score,
                ops_rating: values.ops_rating,
                notes: values.notes,
                proof_photo_url: proof_photo_url
            }])

            if (error) throw error

            toast({ title: "Log Submitted", description: "Daily monitoring log saved." })
            form.reset()
            if (onSuccess) onSuccess()
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="log_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl><Input type="date" {...field} className="glass-input" /></FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="complaint_count"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Complaints</FormLabel>
                                <FormControl><Input type="number" {...field} className="glass-input" /></FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="morning_update"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-card/40">
                                <div className="space-y-0.5">
                                    <FormLabel>Morning Update</FormLabel>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="wakeup_call"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-card/40">
                                <div className="space-y-0.5">
                                    <FormLabel>Wakeup Call</FormLabel>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="vendor_coordination"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-card/40">
                                <div className="space-y-0.5">
                                    <FormLabel>Vendor Sync</FormLabel>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="sentiment_score"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Guest Sentiment (1-10): {field.value}</FormLabel>
                                <FormControl>
                                    <Slider min={1} max={10} step={1} defaultValue={[field.value]} onValueChange={(vals) => field.onChange(vals[0])} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="proof_file"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Activity Proof (Photo)</FormLabel>
                            <FormControl>
                                <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} className="glass-input" />
                            </FormControl>
                            <FormDescription>Upload a photo from the location.</FormDescription>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Daily Notes</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Any issues or highlights..." {...field} className="glass-input" />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Log
                </Button>
            </form>
        </Form>
    )
}
