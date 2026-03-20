"use client"

import { useEffect, useState } from "react"
import { Search, Filter, Plus, Mail, Phone, MapPin, Star, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CaptainForm } from "@/components/forms/CaptainForm"
import { ApplicantForm } from "@/components/forms/ApplicantForm"
import { ApplicantCard } from "@/components/applicants/ApplicantCard"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

const sampleCaptains = [
    { full_name: "Arjun Mehra", email: "arjun.mehra@boketto.in", phone: "+91 98765 43210", city: "Leh, Ladakh", status: "Active", captain_overall_score: 4.8, total_trips_completed: 32, internal_notes: "Expert on Leh-Ladakh routes. Speaks Hindi, English, Ladakhi." },
    { full_name: "Priya Sharma", email: "priya.sharma@boketto.in", phone: "+91 87654 32109", city: "Manali", status: "Active", captain_overall_score: 4.9, total_trips_completed: 45, internal_notes: "Specializes in Spiti Valley and Manali trips. First-aid certified." },
    { full_name: "Vikram Singh", email: "vikram.singh@boketto.in", phone: "+91 76543 21098", city: "Jaipur", status: "Active", captain_overall_score: 4.6, total_trips_completed: 28, internal_notes: "Rajasthan heritage circuit expert. Multilingual guide." },
    { full_name: "Tenzin Dorje", email: "tenzin.dorje@boketto.in", phone: "+91 65432 10987", city: "Gangtok", status: "Active", captain_overall_score: 4.7, total_trips_completed: 19, internal_notes: "Northeast India specialist. Trekking and adventure focus." },
    { full_name: "Rahul Nair", email: "rahul.nair@boketto.in", phone: "+91 54321 09876", city: "Kochi", status: "Inactive", captain_overall_score: 4.3, total_trips_completed: 15, internal_notes: "Kerala backwaters and Munnar expert. Currently on break." },
]

const applicantStages: { key: string; label: string }[] = [
    { key: "Pending", label: "Pending Review" },
    { key: "Approved", label: "Approved" },
    { key: "Rejected", label: "Rejected" },
]

export default function CaptainsPage() {
    // Captains State
    const [captains, setCaptains] = useState<any[]>([])
    const [loadingCaptains, setLoadingCaptains] = useState(true)
    const [isCaptainDialogOpen, setIsCaptainDialogOpen] = useState(false)
    const [editingCaptain, setEditingCaptain] = useState<any>(null)
    const [search, setSearch] = useState("")
    
    // Applicants State
    const [applicants, setApplicants] = useState<any[]>([])
    const [isApplicantDialogOpen, setIsApplicantDialogOpen] = useState(false)
    const [editingApplicant, setEditingApplicant] = useState<any>(null)

    const { toast } = useToast()

    // Fetch Data
    const fetchCaptains = async () => {
        setLoadingCaptains(true)
        try {
            const res = await fetch('/api/captains')
            const { data } = await res.json()
            if (data) setCaptains(data)
        } catch (err) {
            console.error('Failed to fetch captains:', err)
        }
        setLoadingCaptains(false)
    }

    const fetchApplicants = async () => {
        try {
            const res = await fetch('/api/applicants')
            const { data } = await res.json()
            if (data) setApplicants(data)
        } catch (err) {
            console.error('Failed to fetch applicants:', err)
        }
    }

    useEffect(() => { 
        fetchCaptains()
        fetchApplicants()
    }, [])

    const seedSampleData = async () => {
        try {
            for (const captain of sampleCaptains) {
                await fetch('/api/captains', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(captain),
                })
            }
            toast({ title: "Sample data added", description: "5 sample captains have been created." })
            fetchCaptains()
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Failed to seed sample data." })
        }
    }

    const filteredCaptains = captains.filter(c =>
        (c.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.city || '').toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="flex flex-col h-full space-y-6 p-6 min-h-screen bg-muted/20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Captains Roster</h1>
                    <p className="text-muted-foreground mt-1">Manage your active field operations team and hiring pipeline.</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Add Captain Dialog */}
                    <Dialog open={isCaptainDialogOpen} onOpenChange={(open) => { setIsCaptainDialogOpen(open); if (!open) setEditingCaptain(null) }}>
                        <DialogTrigger asChild>
                            <Button className="shadow-lg hover:shadow-xl transition-all">
                                <Plus className="mr-2 h-4 w-4" />
                                Hire New Captain
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] glass-card">
                            <DialogHeader>
                                <DialogTitle>{editingCaptain ? "Edit Captain" : "Hire New Captain"}</DialogTitle>
                                <DialogDescription>
                                    {editingCaptain ? "Update the captain's details." : "Directly add a new confirmed captain to the roster."}
                                </DialogDescription>
                            </DialogHeader>
                            <CaptainForm
                                initialData={editingCaptain || undefined}
                                onSuccess={() => {
                                    setIsCaptainDialogOpen(false)
                                    setEditingCaptain(null)
                                    fetchCaptains()
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                    {/* Add Applicant Dialog */}
                    <Dialog open={isApplicantDialogOpen} onOpenChange={(open) => { setIsApplicantDialogOpen(open); if (!open) setEditingApplicant(null); }}>
                        <DialogTrigger asChild>
                            <Button variant="secondary" className="shadow-sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Applicant
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto glass-card">
                            <DialogHeader>
                                <DialogTitle>{editingApplicant ? "Edit Applicant" : "Add New Applicant"}</DialogTitle>
                            </DialogHeader>
                            <ApplicantForm initialData={editingApplicant || undefined} onSuccess={() => {
                                setIsApplicantDialogOpen(false)
                                setEditingApplicant(null)
                                fetchApplicants()
                            }} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs defaultValue="roster" className="flex-1 flex flex-col h-full">
                <TabsList className="bg-background/50 backdrop-blur self-start mb-4">
                    <TabsTrigger value="roster">Active Roster</TabsTrigger>
                    <TabsTrigger value="pipeline">Hiring Pipeline</TabsTrigger>
                </TabsList>

                <TabsContent value="roster" className="flex-1 mt-0">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search captains by name or location..."
                                className="pl-8 bg-white/50 backdrop-blur-sm border-white/20"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="bg-white/50 backdrop-blur-sm border-white/20 gap-2">
                            <Filter className="h-4 w-4" /> Filter
                        </Button>
                        {captains.length === 0 && !loadingCaptains && (
                            <Button variant="outline" onClick={seedSampleData} className="gap-2 border-primary/20 bg-primary/5 text-primary">
                                Auto-Fill Sample Data
                            </Button>
                        )}
                    </div>

                    <Card className="glass-card border-none">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-white/10">
                                        <TableHead className="w-[300px]">Captain</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Rating</TableHead>
                                        <TableHead>Trips</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingCaptains ? (
                                        Array(5).fill(0).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-[150px]" /><Skeleton className="h-3 w-[100px]" /></div></div></TableCell>
                                                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                                                <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : filteredCaptains.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                                No captains found. Switch to the Pipeline tab to hire applicants or click "Add New Captain".
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredCaptains.map((captain) => (
                                            <TableRow key={captain.id} className="hover:bg-white/50 transition-colors border-white/10">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${captain.full_name}`} />
                                                            <AvatarFallback>{(captain.full_name || '??').substring(0, 2).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-semibold text-foreground">{captain.full_name}</div>
                                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Mail className="h-3 w-3" /> {captain.email || 'No Email'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={`
                                                        ${captain.status === 'Active' ? 'bg-green-500/10 text-green-600 border-green-200' : ''}
                                                        ${captain.status === 'Suspended' ? 'bg-red-500/10 text-red-600 border-red-200' : ''}
                                                        ${captain.status === 'Inactive' ? 'bg-gray-500/10 text-gray-600 border-gray-200' : ''}
                                                    `}>
                                                        {captain.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <MapPin className="h-3 w-3" /> {captain.city || 'Unknown'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 font-medium text-amber-600">
                                                        <Star className="h-3.5 w-3.5 fill-current" />
                                                        {captain.captain_overall_score != null ? captain.captain_overall_score : 'N/A'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium">{captain.total_trips_completed ?? 0}</span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="hover:bg-primary/10 hover:text-primary"
                                                            onClick={() => {
                                                                setEditingCaptain(captain)
                                                                setIsCaptainDialogOpen(true)
                                                            }}
                                                        >
                                                            <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pipeline" className="flex-1 mt-0 h-full overflow-hidden">
                    <div className="flex h-full gap-4 overflow-x-auto pb-4">
                        {applicantStages.map((stage) => {
                            const stageApplicants = applicants.filter(a => a.founder_round_status === stage.key)
                            return (
                                <div key={stage.key} className="min-w-[320px] max-w-[320px] flex flex-col bg-muted/30 border border-border/50 rounded-xl p-3 h-full">
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <h3 className="font-semibold text-sm">{stage.label}</h3>
                                        <Badge variant="secondary" className="text-xs">
                                            {stageApplicants.length}
                                        </Badge>
                                    </div>
                                    <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                                        {stageApplicants.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-10 text-center px-4 border-2 border-dashed border-border/50 rounded-lg">
                                                <p className="text-xs text-muted-foreground">No applicants in this stage</p>
                                            </div>
                                        ) : (
                                            stageApplicants.map(applicant => (
                                                <div key={applicant.id} className="relative group">
                                                    <ApplicantCard
                                                        applicant={{
                                                            id: applicant.id,
                                                            name: applicant.full_name,
                                                            role: "Captain",
                                                            score: applicant.applicant_score ?? 0,
                                                            appliedDate: new Date(applicant.created_at).toLocaleDateString(),
                                                            status: applicant.founder_round_status,
                                                        }}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 rounded-full shadow-md"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingApplicant(applicant);
                                                            setIsApplicantDialogOpen(true);
                                                        }}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
