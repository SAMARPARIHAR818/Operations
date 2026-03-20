"use client"

import { useEffect, useState } from "react"
import { VendorCard } from "@/components/vendors/VendorCard"
import { VendorForm } from "@/components/forms/VendorForm"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Pencil } from "lucide-react"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

const sampleVendors = [
    { vendor_name: "Himalayan Heights Resort", vendor_type: "Hotel", location: "Leh, Ladakh", contact_person: "Tashi Namgyal", phone: "+91 94191 00001", base_price: 8500, negotiated_price: 6800, payment_terms: "50% advance, 50% on check-in", internal_notes: "Premium property. Mountain view rooms. Oxygen support available." },
    { vendor_name: "Ladakh Adventure Co.", vendor_type: "Activity", location: "Leh, Ladakh", contact_person: "Stanzin Dorje", phone: "+91 94191 00002", base_price: 5000, negotiated_price: 3800, payment_terms: "Full advance", internal_notes: "River rafting, ATV rides, Pangong excursions." },
    { vendor_name: "Snow Leopard Transport", vendor_type: "Transport", location: "Leh, Ladakh", contact_person: "Rinchen Kumar", phone: "+91 94191 00003", base_price: 12000, negotiated_price: 9500, payment_terms: "30% advance, 70% on trip completion", internal_notes: "Fleet of 15 Tempo Travellers and Innovas. Reliable on Khardung La passes." },
    { vendor_name: "Spiti Valley Camps", vendor_type: "Hotel", location: "Spiti Valley", contact_person: "Mohan Thakur", phone: "+91 98160 00004", base_price: 4500, negotiated_price: 3200, payment_terms: "Full advance", internal_notes: "Luxury camps at Chandratal. Seasonal: June to September." },
    { vendor_name: "Rajasthan Heritage Tours", vendor_type: "Local Partner", location: "Jaipur", contact_person: "Deepak Rathore", phone: "+91 97829 00005", base_price: 3500, negotiated_price: 2800, payment_terms: "50% advance", internal_notes: "Heritage walks, camel safaris, village experiences." },
    { vendor_name: "Kerala Backwater Cruises", vendor_type: "Activity", location: "Alleppey", contact_person: "Thomas Kurian", phone: "+91 94470 00006", base_price: 15000, negotiated_price: 11000, payment_terms: "Full advance 7 days prior", internal_notes: "Premium houseboats with AC. Includes meals." },
]

export default function VendorsPage() {
    const [vendors, setVendors] = useState<any[]>([])
    const [search, setSearch] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const [editingVendor, setEditingVendor] = useState<any>(null)
    const { toast } = useToast()

    const fetchVendors = async () => {
        try {
            const res = await fetch('/api/vendors')
            const { data } = await res.json()
            if (data) setVendors(data)
        } catch (err) {
            console.error('Failed to fetch vendors:', err)
        }
    }

    useEffect(() => { fetchVendors() }, [])

    const seedSampleData = async () => {
        try {
            for (const vendor of sampleVendors) {
                await fetch('/api/vendors', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(vendor),
                })
            }
            toast({ title: "Sample data added", description: "6 sample vendors have been created." })
            fetchVendors()
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Failed to seed sample data." })
        }
    }

    const filtered = vendors.filter(v =>
        (v.vendor_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (v.location || '').toLowerCase().includes(search.toLowerCase()) ||
        (v.vendor_type || '').toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Vendors</h2>
                    <p className="text-muted-foreground">Manage your vendor partnerships.</p>
                </div>
                <div className="flex items-center gap-2">
                    {vendors.length === 0 && (
                        <Button variant="outline" onClick={seedSampleData} className="gap-2">
                            Seed Sample Data
                        </Button>
                    )}
                    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setEditingVendor(null) }}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 shadow-lg">
                                <Plus className="h-4 w-4" /> Add Vendor
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingVendor ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
                            </DialogHeader>
                            <VendorForm
                                initialData={editingVendor || undefined}
                                onSuccess={() => {
                                    setIsOpen(false)
                                    setEditingVendor(null)
                                    fetchVendors()
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search vendors..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    {vendors.length === 0 ? "No vendors yet. Add your first vendor!" : "No vendors match your search."}
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filtered.map((vendor) => (
                        <div key={vendor.id} className="relative group">
                            <VendorCard
                                vendor={{
                                    id: vendor.id,
                                    name: vendor.vendor_name,
                                    type: vendor.vendor_type || 'Other',
                                    location: vendor.location || 'Unknown',
                                    reliabilityScore: vendor.reliability_score ?? 0,
                                    status: vendor.risk_flag ? 'Blacklisted' : 'Active',
                                    contact: vendor.phone || vendor.contact_person || 'N/A',
                                }}
                            />
                            <Button
                                size="sm"
                                variant="secondary"
                                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 rounded-full shadow-lg"
                                onClick={() => {
                                    setEditingVendor(vendor)
                                    setIsOpen(true)
                                }}
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
