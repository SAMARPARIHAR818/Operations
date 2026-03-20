import { Applicant, ApplicantCard } from "@/components/applicants/ApplicantCard"
import { Badge } from "@/components/ui/badge"

const stages = ["New Application", "Screening", "Interview", "Reference Check", "Offer", "Rejected"]

// Mock data
const applicants: Applicant[] = [
    { id: "1", name: "Alice Wonderland", role: "Captain", score: 85, appliedDate: "2 days ago", status: "New Application" },
    { id: "2", name: "Bob Builder", role: "Captain", score: 92, appliedDate: "1 week ago", status: "Screening" },
    { id: "3", name: "Charlie Chaplin", role: "Captain", score: 78, appliedDate: "3 days ago", status: "New Application" },
    { id: "4", name: "David Beckham", role: "Captain", score: 95, appliedDate: "2 weeks ago", status: "Interview" },
    { id: "5", name: "Eve Polastri", role: "Captain", score: 88, appliedDate: "1 month ago", status: "Offer" },
]

export function ApplicantKanban() {
    return (
        <div className="flex h-full gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => (
                <div key={stage} className="min-w-[280px] flex flex-col bg-muted/30 rounded-xl p-3 h-full">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="font-semibold text-sm">{stage}</h3>
                        <Badge variant="secondary" className="text-xs">
                            {applicants.filter(a => a.status === stage).length}
                        </Badge>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                        {applicants
                            .filter(a => a.status === stage)
                            .map(applicant => (
                                <ApplicantCard key={applicant.id} applicant={applicant} />
                            ))
                        }
                    </div>
                </div>
            ))}
        </div>
    )
}
