"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Check, ChevronsUpDown, Trash2, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/utils/supabase/client"
import { useCurrency } from "@/components/providers/CurrencyProvider"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"

const formSchema = z.object({
    destination: z.string().min(2, "Destination required"),
    start_date: z.date({ message: "Start date required" }), // changed from required_error
    end_date: z.date({ message: "End date required" }),
    trip_type: z.string({ message: "Trip type required" }), // changed from required_error
    pax: z.coerce.number().min(1, "At least 1 pax"),

    // Financials
    base_price: z.coerce.number().min(0),
    vendor_cost: z.coerce.number().min(0),

    // Itinerary
    itinerary: z.array(z.object({
        day: z.coerce.number().min(1),
        title: z.string().min(1, "Title required"),
        location: z.string().min(1, "Location required"),
        lat: z.coerce.number(),
        lng: z.coerce.number(),
        status: z.enum(["pending", "completed"]).default("pending")
    })).default([]),

    // Assignments
    captain_id: z.string().optional(),
    vendor_id: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface TripFormProps {
    onSuccess?: () => void
    initialData?: any
}

export function TripForm({ onSuccess, initialData }: TripFormProps) {
    const isEditing = !!initialData
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [captains, setCaptains] = useState<any[]>([])

    const { toast } = useToast()
    const supabase = createClient()
    const { formatAmount } = useCurrency()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            destination: initialData?.destination || "",
            start_date: initialData?.start_date ? new Date(initialData.start_date) : undefined,
            end_date: initialData?.end_date ? new Date(initialData.end_date) : undefined,
            trip_type: initialData?.trip_type || "",
            pax: initialData?.expected_pax || 1,
            base_price: initialData?.total_revenue && initialData?.expected_pax ? Math.round(initialData.total_revenue / initialData.expected_pax) : 0,
            vendor_cost: initialData?.total_cost && initialData?.expected_pax ? Math.round(initialData.total_cost / initialData.expected_pax) : 0,
            captain_id: initialData?.captain_id || undefined,
            vendor_id: "",
            itinerary: initialData?.itinerary || []
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "itinerary"
    })

    // Fetch Captains
    useEffect(() => {
        const fetchCaptains = async () => {
            try {
                const res = await fetch('/api/captains')
                const { data } = await res.json()
                if (data) setCaptains(data.filter((c: any) => c.status === 'Active').map((c: any) => ({ id: c.id, name: c.full_name, status: c.status })))
            } catch (err) {
                console.error('Failed to fetch captains:', err)
            }
        }
        fetchCaptains()
    }, [])

    // Derived Financials
    const basePrice = form.watch("base_price")
    const vendorCost = form.watch("vendor_cost")
    const pax = form.watch("pax")

    // Calculate financials safely
    const revenue = (basePrice || 0) * (pax || 0)
    const cost = (vendorCost || 0) * (pax || 0)
    const margin = revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0
    const profit = revenue - cost

    async function onSubmit(values: FormValues) {
        setIsLoading(true)
        try {
            const payload: any = {
                destination: values.destination,
                start_date: values.start_date.toISOString().split('T')[0],
                end_date: values.end_date.toISOString().split('T')[0],
                trip_type: values.trip_type,
                expected_pax: values.pax,
                total_revenue: revenue,
                total_cost: cost,
                captain_id: values.captain_id || null,
                itinerary: values.itinerary,
            }

            if (isEditing) {
                payload.id = initialData.id
            } else {
                payload.status = 'Upcoming'
                payload.risk_level = 'Low'
            }

            const response = await fetch('/api/trips', {
                method: isEditing ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            const result = await response.json()
            if (!response.ok) throw new Error(result.error)

            toast({ title: isEditing ? "Trip Updated" : "Trip Created", description: `${values.destination} trip ${isEditing ? 'updated' : 'added'}.` })
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

                {/* Step Indicator */}
                <div className="flex items-center gap-2 mb-6">
                    <div className={cn("h-2 flex-1 rounded-full", step >= 1 ? "bg-primary" : "bg-muted")} />
                    <div className={cn("h-2 flex-1 rounded-full", step >= 2 ? "bg-primary" : "bg-muted")} />
                    <div className={cn("h-2 flex-1 rounded-full", step >= 3 ? "bg-primary" : "bg-muted")} />
                    <div className={cn("h-2 flex-1 rounded-full", step >= 4 ? "bg-primary" : "bg-muted")} />
                </div>

                {/* STEP 1: BASIC INFO */}
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <FormField
                            control={form.control}
                            name="destination"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Destination</FormLabel>
                                    <FormControl><Input placeholder="e.g. Goa, Manali" {...field} className="glass-input" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="start_date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Start Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal glass-input", !field.value && "text-muted-foreground")}>
                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="end_date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>End Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal glass-input", !field.value && "text-muted-foreground")}>
                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="trip_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Trip Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="glass-input"><SelectValue placeholder="Select type" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Party">Party Group</SelectItem>
                                                <SelectItem value="Explorer">Explorer</SelectItem>
                                                <SelectItem value="Elderly">Elderly</SelectItem>
                                                <SelectItem value="International">International</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="pax"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Expected Pax</FormLabel>
                                        <FormControl><Input type="number" {...field} className="glass-input" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                )}

                {/* STEP 2: FINANCIALS */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="base_price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price Per Pax (Revenue)</FormLabel>
                                        <FormControl><Input type="number" {...field} className="glass-input" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="vendor_cost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cost Per Pax (Vendor)</FormLabel>
                                        <FormControl><Input type="number" {...field} className="glass-input" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Live Calc Card */}
                        <div className="glass p-4 rounded-xl space-y-2 border-primary/20 bg-primary/5">
                            <h4 className="font-semibold text-sm text-primary">Est. Financials</h4>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground block">Revenue</span>
                                    <span className="font-medium">{formatAmount(revenue)}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Cost</span>
                                    <span className="font-medium">{formatAmount(cost)}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Profit</span>
                                    <span className={cn("font-bold", profit > 0 ? "text-green-600" : "text-red-500")}>
                                        {formatAmount(profit)} ({margin.toFixed(1)}%)
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: ITINERARY */}
                {step === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold">Trip Itinerary Checkpoints</h3>
                            <Button type="button" variant="outline" size="sm" onClick={() => append({ day: fields.length + 1, title: "", location: "", lat: 0, lng: 0, status: "pending" })}>
                                <Plus className="h-4 w-4 mr-1" /> Add Checkpoint
                            </Button>
                        </div>
                        
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                            {fields.length === 0 && <div className="text-sm text-muted-foreground text-center py-4">No checkpoints added.</div>}
                            {fields.map((field, index) => (
                                <div key={field.id} className="relative glass p-4 rounded-xl border border-border/50 space-y-3">
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => remove(index)}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                    
                                    <div className="grid grid-cols-[60px_1fr] gap-3">
                                        <FormField control={form.control} name={`itinerary.${index}.day`} render={({ field }) => (
                                            <FormItem><FormLabel>Day</FormLabel><FormControl><Input type="number" {...field} className="glass-input h-8 text-sm" /></FormControl></FormItem>
                                        )} />
                                        <FormField control={form.control} name={`itinerary.${index}.title`} render={({ field }) => (
                                            <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Arrival, Sightseeing..." {...field} className="glass-input h-8 text-sm" /></FormControl></FormItem>
                                        )} />
                                    </div>
                                    <FormField control={form.control} name={`itinerary.${index}.location`} render={({ field }) => (
                                        <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="City, Landmark" {...field} className="glass-input h-8 text-sm" /></FormControl></FormItem>
                                    )} />
                                    <div className="grid grid-cols-2 gap-3">
                                        <FormField control={form.control} name={`itinerary.${index}.lat`} render={({ field }) => (
                                            <FormItem><FormLabel>Latitude</FormLabel><FormControl><Input type="number" step="any" {...field} className="glass-input h-8 text-sm" /></FormControl></FormItem>
                                        )} />
                                        <FormField control={form.control} name={`itinerary.${index}.lng`} render={({ field }) => (
                                            <FormItem><FormLabel>Longitude</FormLabel><FormControl><Input type="number" step="any" {...field} className="glass-input h-8 text-sm" /></FormControl></FormItem>
                                        )} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Preset templates button */}
                        {fields.length === 0 && (
                            <Button type="button" variant="secondary" className="w-full text-xs" onClick={() => {
                                append({ day: 1, title: "Arrival & Welcome", location: "Manali", lat: 32.2396, lng: 77.1887, status: "pending" })
                                append({ day: 2, title: "Solang Valley Visit", location: "Solang Valley", lat: 32.3166, lng: 77.1583, status: "pending" })
                            }}>
                                Load Sample Itinerary (Manali)
                            </Button>
                        )}
                    </div>
                )}

                {/* STEP 4: ASSIGNMENTS */}
                {step === 4 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <FormField
                            control={form.control}
                            name="captain_id"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Assign Captain</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant="outline" role="combobox" className={cn("w-full justify-between glass-input", !field.value && "text-muted-foreground")}>
                                                    {field.value
                                                        ? captains.find((c) => c.id === field.value)?.name
                                                        : "Select captain"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search captain..." />
                                                <CommandList>
                                                    <CommandEmpty>No captain found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {captains.map((captain) => (
                                                            <CommandItem
                                                                value={captain.name}
                                                                key={captain.id}
                                                                onSelect={() => {
                                                                    form.setValue("captain_id", captain.id)
                                                                }}
                                                            >
                                                                <Check className={cn("mr-2 h-4 w-4", captain.id === field.value ? "opacity-100" : "opacity-0")} />
                                                                {captain.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                {/* ACTIONS */}
                <div className="flex justify-between pt-4 border-t">
                    {step > 1 ? (
                        <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
                    ) : (
                        <div />
                    )}

                    {step < 4 ? (
                        <Button type="button" onClick={() => setStep(step + 1)}>Next</Button>
                    ) : (
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? "Save Changes" : "Create Trip"}
                        </Button>
                    )}
                </div>
            </form>
        </Form>
    )
}
