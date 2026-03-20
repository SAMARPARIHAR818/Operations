"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { teamMembers } from "./teamData"
import { Anchor, UserCheck, FileSearch, Phone, CheckCircle2, ArrowRight, Star, Plus, Send, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CaptainApplicant {
    id: string
    name: string
    location: string
    appliedDate: string
    stage: "Application" | "Screening" | "Interview" | "Trial Trip" | "Onboarded"
    assignedTo: string
    experience: string
    rating: number
    notes: string
}

const stages = ["Application", "Screening", "Interview", "Trial Trip", "Onboarded"] as const
const stageIcon: Record<string, any> = {
    "Application": FileSearch, "Screening": Phone, "Interview": UserCheck, "Trial Trip": Anchor, "Onboarded": CheckCircle2
}
const stageColor: Record<string, string> = {
    "Application": "bg-gray-400", "Screening": "bg-blue-400", "Interview": "bg-amber-400", "Trial Trip": "bg-purple-400", "Onboarded": "bg-green-500"
}

const initialApplicants: CaptainApplicant[] = [
    { id: "a1", name: "Deepak Negi", location: "Shimla", appliedDate: "Mar 12", stage: "Trial Trip", assignedTo: "1", experience: "5 yrs trekking guide", rating: 4.5, notes: "Excellent Himalayan route knowledge. Trial on Spiti trip Apr 20." },
    { id: "a2", name: "Ravi Bhat", location: "Srinagar", appliedDate: "Mar 15", stage: "Interview", assignedTo: "2", experience: "3 yrs tour operator", rating: 0, notes: "Interview scheduled for Mar 22. Kashmir & Ladakh routes." },
    { id: "a3", name: "Meena Kumari", location: "Udaipur", appliedDate: "Mar 10", stage: "Screening", assignedTo: "2", experience: "4 yrs hotel management", rating: 0, notes: "Strong hospitality background. Needs field experience assessment." },
    { id: "a4", name: "Kiran Joshi", location: "Dehradun", appliedDate: "Mar 18", stage: "Application", assignedTo: "5", experience: "2 yrs adventure sports", rating: 0, notes: "Rafting and camping specialist. Rishikesh based." },
    { id: "a5", name: "Sonam Wangchuk", location: "Leh", appliedDate: "Mar 8", stage: "Onboarded", assignedTo: "1", experience: "7 yrs local guide", rating: 4.8, notes: "✅ Onboarded on Mar 19. Assigned to Leh Ladakh trip Apr 15." },
    { id: "a6", name: "Pooja Thapa", location: "Darjeeling", appliedDate: "Mar 14", stage: "Interview", assignedTo: "5", experience: "3 yrs tea estate tours", rating: 0, notes: "Interview completed. Strong candidate for NE India routes." },
]

export function OnboardingPipeline() {
    const { toast } = useToast()
    const [applicants, setApplicants] = useState<CaptainApplicant[]>(initialApplicants)
    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [selectedApplicant, setSelectedApplicant] = useState<CaptainApplicant | null>(null)

    // Add form
    const [formName, setFormName] = useState("")
    const [formLocation, setFormLocation] = useState("")
    const [formExperience, setFormExperience] = useState("")
    const [formNotes, setFormNotes] = useState("")
    const [formAssignedTo, setFormAssignedTo] = useState("")

    // Load from API
    useEffect(() => {
        fetch("/api/pipeline")
            .then(r => r.json())
            .then(res => {
                if (res.data && res.data.length > 0) {
                    const mapped = res.data.map((a: any) => ({
                        id: a.id,
                        name: a.name,
                        location: a.location || "",
                        appliedDate: new Date(a.applied_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                        stage: a.stage,
                        assignedTo: a.assigned_to || "1",
                        experience: a.experience || "",
                        rating: a.rating || 0,
                        notes: a.notes || "",
                    }))
                    setApplicants(mapped)
                }
            })
            .catch(() => {})
    }, [])

    const advanceStage = async (applicant: CaptainApplicant) => {
        const currentIdx = stages.indexOf(applicant.stage)
        if (currentIdx >= stages.length - 1) return
        const nextStage = stages[currentIdx + 1]

        setApplicants(prev => prev.map(a =>
            a.id === applicant.id ? { ...a, stage: nextStage } : a
        ))

        try {
            await fetch("/api/pipeline", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: applicant.id, stage: nextStage }),
            })
        } catch (e) {}

        toast({
            title: `🚀 ${applicant.name} moved to ${nextStage}`,
            description: nextStage === "Onboarded" ? "Captain has been fully onboarded!" : `Advancing to the ${nextStage} stage.`,
        })
    }

    const addApplicant = async () => {
        if (!formName || !formLocation) {
            toast({ title: "⚠️ Missing fields", description: "Name and location are required." })
            return
        }

        const newApplicant: CaptainApplicant = {
            id: `a-${Date.now()}`,
            name: formName,
            location: formLocation,
            appliedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            stage: "Application",
            assignedTo: formAssignedTo || "1",
            experience: formExperience,
            rating: 0,
            notes: formNotes,
        }

        setApplicants(prev => [newApplicant, ...prev])

        try {
            const res = await fetch("/api/pipeline", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formName,
                    location: formLocation,
                    experience: formExperience,
                    notes: formNotes,
                    assigned_to: formAssignedTo || null,
                    stage: "Application",
                }),
            })
            const data = await res.json()
            if (data.data?.[0]?.id) {
                setApplicants(prev => prev.map(a => a.id === newApplicant.id ? { ...a, id: data.data[0].id } : a))
            }
        } catch (e) {}

        toast({ title: "✅ Applicant Added", description: `${formName} has been added to the pipeline.` })
        setAddDialogOpen(false)
        setFormName(""); setFormLocation(""); setFormExperience(""); setFormNotes(""); setFormAssignedTo("")
    }

    const updateNotes = async (id: string, notes: string) => {
        setApplicants(prev => prev.map(a => a.id === id ? { ...a, notes } : a))
        try {
            await fetch("/api/pipeline", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, notes }),
            })
        } catch (e) {}
    }

    const updateRating = async (id: string, rating: number) => {
        setApplicants(prev => prev.map(a => a.id === id ? { ...a, rating } : a))
        try {
            await fetch("/api/pipeline", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, rating }),
            })
        } catch (e) {}
        toast({ title: "⭐ Rating Updated" })
    }

    const openEdit = (applicant: CaptainApplicant) => {
        setSelectedApplicant(applicant)
        setEditDialogOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Captain Onboarding Pipeline</h3>
                <div className="flex gap-2">
                    <div className="flex gap-2 text-xs">
                        {stages.map(s => (
                            <span key={s} className="flex items-center gap-1">
                                <span className={`h-2.5 w-2.5 rounded-full ${stageColor[s]}`} />
                                {applicants.filter(a => a.stage === s).length} {s}
                            </span>
                        ))}
                    </div>
                    <Button size="sm" className="rounded-full h-8 gap-1" onClick={() => setAddDialogOpen(true)}>
                        <Plus className="h-3 w-3" /> Add Applicant
                    </Button>
                </div>
            </div>

            {/* Pipeline Funnel */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {stages.map((stage, idx) => {
                    const count = applicants.filter(a => a.stage === stage).length
                    const Icon = stageIcon[stage]
                    return (
                        <div key={stage} className="flex items-center gap-2">
                            <Card className={`min-w-[160px] rounded-2xl border-none shadow-ambient surface-lowest ${stage === "Onboarded" ? "ring-1 ring-green-200" : ""}`}>
                                <CardContent className="p-4 text-center">
                                    <Icon className={`h-5 w-5 mx-auto mb-1.5 ${stage === "Onboarded" ? "text-green-600" : "text-[#0d4f53]"}`} />
                                    <div className="text-xl font-bold">{count}</div>
                                    <div className="text-[11px] text-muted-foreground">{stage}</div>
                                </CardContent>
                            </Card>
                            {idx < stages.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                        </div>
                    )
                })}
            </div>

            {/* Applicant Cards */}
            <div className="space-y-3">
                {applicants.map(applicant => {
                    const assignee = teamMembers.find(m => m.id === applicant.assignedTo)
                    const Icon = stageIcon[applicant.stage]
                    const stageIdx = stages.indexOf(applicant.stage)
                    return (
                        <Card key={applicant.id} className="rounded-2xl border-none shadow-ambient surface-lowest hover:shadow-lg transition-all">
                            <CardContent className="p-5">
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-11 w-11 border-2 border-white shadow-sm">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${applicant.name}`} />
                                        <AvatarFallback>{applicant.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-sm cursor-pointer hover:text-[#0d4f53]" onClick={() => openEdit(applicant)}>{applicant.name}</h4>
                                            <Badge variant="outline" className="text-[10px] rounded-full">
                                                <span className={`h-1.5 w-1.5 rounded-full mr-1 ${stageColor[applicant.stage]}`} />
                                                {applicant.stage}
                                            </Badge>
                                            {applicant.rating > 0 && (
                                                <span className="flex items-center gap-0.5 text-amber-500 text-xs">
                                                    <Star className="h-3 w-3 fill-current" /> {applicant.rating}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">{applicant.location} · {applicant.experience} · Applied {applicant.appliedDate}</p>
                                        <p className="text-xs text-muted-foreground mt-1 italic">&quot;{applicant.notes}&quot;</p>

                                        <div className="flex gap-1 mt-3">
                                            {stages.map((s, i) => (
                                                <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= stageIdx ? stageColor[applicant.stage] : "bg-muted/40"}`} />
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                Managed by: {assignee && <>
                                                    <Avatar className="h-4 w-4 inline"><AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${assignee.name}`} /></Avatar>
                                                    {assignee.name.split(" ")[0]}
                                                </>}
                                            </span>
                                            <div className="flex gap-2">
                                                {applicant.stage !== "Onboarded" && (
                                                    <Button size="sm" className="h-6 text-[10px] rounded-full gap-1" onClick={() => advanceStage(applicant)}>
                                                        Move to {stages[stageIdx + 1]} <ArrowRight className="h-2.5 w-2.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Add Applicant Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>Add Captain Applicant</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div>
                            <label className="text-sm font-medium">Full Name *</label>
                            <Input className="mt-1.5" placeholder="e.g. Deepak Negi" value={formName} onChange={e => setFormName(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Location *</label>
                            <Input className="mt-1.5" placeholder="e.g. Shimla, Himachal Pradesh" value={formLocation} onChange={e => setFormLocation(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Experience</label>
                            <Input className="mt-1.5" placeholder="e.g. 5 yrs trekking guide" value={formExperience} onChange={e => setFormExperience(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Assign To</label>
                            <select value={formAssignedTo} onChange={e => setFormAssignedTo(e.target.value)}
                                className="w-full mt-1.5 p-2 rounded-lg border text-sm bg-white">
                                <option value="">Select team member...</option>
                                {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name} — {m.role}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Notes</label>
                            <Input className="mt-1.5" placeholder="Any notes about the applicant..." value={formNotes} onChange={e => setFormNotes(e.target.value)} />
                        </div>
                        <Button className="w-full gap-2" onClick={addApplicant}>
                            <Send className="h-4 w-4" /> Add to Pipeline
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Applicant Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>{selectedApplicant?.name} — Details</DialogTitle>
                    </DialogHeader>
                    {selectedApplicant && (
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedApplicant.name}`} />
                                    <AvatarFallback>{selectedApplicant.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-semibold">{selectedApplicant.name}</h4>
                                    <p className="text-xs text-muted-foreground">{selectedApplicant.location} · {selectedApplicant.experience}</p>
                                </div>
                                <Badge variant="outline" className="ml-auto rounded-full">
                                    <span className={`h-1.5 w-1.5 rounded-full mr-1 ${stageColor[selectedApplicant.stage]}`} />
                                    {selectedApplicant.stage}
                                </Badge>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Rating</label>
                                <div className="flex gap-1 mt-1.5">
                                    {[1, 2, 3, 4, 5].map(r => (
                                        <button key={r} onClick={() => {
                                            updateRating(selectedApplicant.id, r)
                                            setSelectedApplicant(prev => prev ? { ...prev, rating: r } : null)
                                        }}>
                                            <Star className={`h-6 w-6 ${r <= selectedApplicant.rating ? "text-amber-500 fill-current" : "text-gray-300"}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Notes</label>
                                <textarea className="w-full mt-1.5 p-2 rounded-lg border text-sm bg-white min-h-[80px]"
                                    value={selectedApplicant.notes}
                                    onChange={e => setSelectedApplicant(prev => prev ? { ...prev, notes: e.target.value } : null)}
                                />
                                <Button size="sm" className="mt-1 text-xs" onClick={() => {
                                    if (selectedApplicant) {
                                        updateNotes(selectedApplicant.id, selectedApplicant.notes)
                                        toast({ title: "📝 Notes saved" })
                                    }
                                }}>
                                    Save Notes
                                </Button>
                            </div>

                            {selectedApplicant.stage !== "Onboarded" && (
                                <Button className="w-full gap-2" onClick={() => {
                                    advanceStage(selectedApplicant)
                                    const nextIdx = stages.indexOf(selectedApplicant.stage) + 1
                                    if (nextIdx < stages.length) setSelectedApplicant(prev => prev ? { ...prev, stage: stages[nextIdx] } : null)
                                }}>
                                    Move to {stages[stages.indexOf(selectedApplicant.stage) + 1]} <ArrowRight className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
