// Shared team data & types used across all Team Hub tabs

export interface TeamMember {
    id: string
    name: string
    role: string
    department: "Operations" | "Sales" | "Marketing" | "Finance" | "Support" | "Leadership"
    email: string
    phone: string
    avatar: string
    status: "Online" | "Busy" | "On Leave" | "Offline"
    joinDate: string
    location: string
    tasksCompleted: number
    tasksPending: number
    tasksOverdue: number
    onTimeRate: number
    tripsManaged: number
    rating: number
    currentTask: string
    recentActivity: string
    activityTime: string
    specialization: string
    salary?: number
    revenueGenerated?: number
    avgResponseTime?: string
    customerSatisfaction?: number
    vendorsManaged?: string[]
    weeklyHours?: Record<string, number>
}

export const teamMembers: TeamMember[] = [
    {
        id: "1", name: "Samar Parihar", role: "Founder & CEO", department: "Leadership",
        email: "samar@boketto.in", phone: "+91 98765 00001", avatar: "SP",
        status: "Online", joinDate: "2024-01-01", location: "New Delhi",
        tasksCompleted: 156, tasksPending: 4, tasksOverdue: 0, onTimeRate: 98,
        tripsManaged: 45, rating: 5.0, currentTask: "Reviewing Q1 financials",
        recentActivity: "Approved Leh Ladakh trip budget", activityTime: "5m ago",
        specialization: "Strategy, Business Development",
        salary: 0, revenueGenerated: 0, avgResponseTime: "N/A", customerSatisfaction: 0,
        vendorsManaged: [],
        weeklyHours: { "Trip Planning": 4, "Strategy": 12, "HR": 3, "Finance": 5, "Sales": 6, "Meetings": 10 }
    },
    {
        id: "2", name: "Ananya Verma", role: "Head of Operations", department: "Operations",
        email: "ananya@boketto.in", phone: "+91 98765 00002", avatar: "AV",
        status: "Online", joinDate: "2024-03-15", location: "New Delhi",
        tasksCompleted: 234, tasksPending: 8, tasksOverdue: 1, onTimeRate: 94,
        tripsManaged: 67, rating: 4.8, currentTask: "Coordinating Spiti Valley logistics",
        recentActivity: "Assigned captain for Rajasthan Heritage trip", activityTime: "12m ago",
        specialization: "Logistics, Vendor Management, Route Planning",
        salary: 85000, revenueGenerated: 0, avgResponseTime: "15m", customerSatisfaction: 4.7,
        vendorsManaged: ["Himalayan Heights Resort", "Snow Leopard Transport", "Spiti Valley Camps"],
        weeklyHours: { "Trip Planning": 15, "Vendor Mgmt": 8, "Crisis Mgmt": 3, "Reporting": 4, "Meetings": 5, "Admin": 5 }
    },
    {
        id: "3", name: "Rohan Kapoor", role: "Sales Manager", department: "Sales",
        email: "rohan@boketto.in", phone: "+91 98765 00003", avatar: "RK",
        status: "Busy", joinDate: "2024-06-01", location: "Mumbai",
        tasksCompleted: 189, tasksPending: 12, tasksOverdue: 2, onTimeRate: 88,
        tripsManaged: 34, rating: 4.5, currentTask: "Following up on corporate leads",
        recentActivity: "Closed deal for 20-pax Goa retreat", activityTime: "30m ago",
        specialization: "Corporate Sales, Group Bookings, B2B",
        salary: 65000, revenueGenerated: 1850000, avgResponseTime: "8m", customerSatisfaction: 4.4,
        vendorsManaged: [],
        weeklyHours: { "Lead Follow-up": 12, "Client Calls": 8, "Proposals": 6, "Meetings": 5, "Reporting": 3, "Admin": 2 }
    },
    {
        id: "4", name: "Priya Mehta", role: "Marketing Lead", department: "Marketing",
        email: "priya@boketto.in", phone: "+91 98765 00004", avatar: "PM",
        status: "Online", joinDate: "2024-04-20", location: "Bangalore",
        tasksCompleted: 145, tasksPending: 6, tasksOverdue: 0, onTimeRate: 96,
        tripsManaged: 12, rating: 4.7, currentTask: "Creating Instagram reels for Ladakh",
        recentActivity: "Published blog: '10 Hidden Gems in Spiti Valley'", activityTime: "1h ago",
        specialization: "Social Media, Content Strategy, Branding",
        salary: 60000, revenueGenerated: 0, avgResponseTime: "N/A", customerSatisfaction: 0,
        vendorsManaged: [],
        weeklyHours: { "Content Creation": 15, "Social Media": 8, "SEO/Blog": 5, "Campaign Mgmt": 4, "Analytics": 3, "Meetings": 3 }
    },
    {
        id: "5", name: "Vikrant Sharma", role: "Operations Coordinator", department: "Operations",
        email: "vikrant@boketto.in", phone: "+91 98765 00005", avatar: "VS",
        status: "Online", joinDate: "2024-08-10", location: "Jaipur",
        tasksCompleted: 98, tasksPending: 7, tasksOverdue: 1, onTimeRate: 91,
        tripsManaged: 23, rating: 4.4, currentTask: "Updating vendor contracts for Q2",
        recentActivity: "Booked emergency transport for Rishikesh group", activityTime: "45m ago",
        specialization: "Vendor Relations, Ground Operations, Emergency Response",
        salary: 45000, revenueGenerated: 0, avgResponseTime: "20m", customerSatisfaction: 4.3,
        vendorsManaged: ["Ladakh Adventure Co.", "Rajasthan Heritage Tours", "Kerala Backwater Cruises"],
        weeklyHours: { "Trip Planning": 10, "Vendor Mgmt": 12, "Emergency": 4, "Documentation": 5, "Meetings": 3, "Admin": 4 }
    },
    {
        id: "6", name: "Neha Gupta", role: "Finance & Accounts", department: "Finance",
        email: "neha@boketto.in", phone: "+91 98765 00006", avatar: "NG",
        status: "Offline", joinDate: "2024-05-15", location: "New Delhi",
        tasksCompleted: 178, tasksPending: 3, tasksOverdue: 0, onTimeRate: 99,
        tripsManaged: 0, rating: 4.9, currentTask: "Reconciling vendor payments for March",
        recentActivity: "Processed payroll for all captains", activityTime: "2h ago",
        specialization: "Accounting, Vendor Payments, Payroll, Tax Compliance",
        salary: 55000, revenueGenerated: 0, avgResponseTime: "N/A", customerSatisfaction: 0,
        vendorsManaged: [],
        weeklyHours: { "Invoicing": 10, "Payroll": 6, "Reconciliation": 8, "Tax/Compliance": 4, "Reporting": 6, "Admin": 4 }
    },
    {
        id: "7", name: "Amit Tiwari", role: "Customer Support Lead", department: "Support",
        email: "amit@boketto.in", phone: "+91 98765 00007", avatar: "AT",
        status: "Busy", joinDate: "2024-07-01", location: "Pune",
        tasksCompleted: 312, tasksPending: 15, tasksOverdue: 3, onTimeRate: 85,
        tripsManaged: 0, rating: 4.3, currentTask: "Resolving escalation for Trip #3045",
        recentActivity: "Resolved complaint: room upgrade for Goa guests", activityTime: "20m ago",
        specialization: "Customer Relations, Crisis Management, Feedback",
        salary: 45000, revenueGenerated: 0, avgResponseTime: "4m", customerSatisfaction: 4.1,
        vendorsManaged: [],
        weeklyHours: { "Tickets": 18, "Escalations": 6, "Feedback": 4, "Knowledge Base": 3, "Meetings": 3, "Training": 2 }
    },
    {
        id: "8", name: "Kavya Reddy", role: "Sales Executive", department: "Sales",
        email: "kavya@boketto.in", phone: "+91 98765 00008", avatar: "KR",
        status: "On Leave", joinDate: "2024-09-15", location: "Hyderabad",
        tasksCompleted: 67, tasksPending: 4, tasksOverdue: 0, onTimeRate: 92,
        tripsManaged: 18, rating: 4.6, currentTask: "On annual leave",
        recentActivity: "Sent proposals to 5 new wedding groups", activityTime: "Yesterday",
        specialization: "Wedding Groups, Honeymoon Packages, Premium Clients",
        salary: 40000, revenueGenerated: 980000, avgResponseTime: "6m", customerSatisfaction: 4.6,
        vendorsManaged: [],
        weeklyHours: { "Lead Follow-up": 10, "Client Calls": 10, "Proposals": 8, "Site Visits": 4, "Meetings": 4, "Admin": 2 }
    },
]

// ─── Task Data ───
export interface StaffTask {
    id: string
    title: string
    assigneeId: string
    priority: "Critical" | "High" | "Medium" | "Low"
    status: "To Do" | "In Progress" | "Review" | "Done"
    dueDate: string
    category: string
    tripLinked?: string
    estimatedHours?: number
    actualHours?: number
}

export const allTasks: StaffTask[] = [
    { id: "t1", title: "Finalize Leh Ladakh itinerary", assigneeId: "2", priority: "Critical", status: "In Progress", dueDate: "Mar 22", category: "Trip Planning", tripLinked: "Leh Ladakh", estimatedHours: 6, actualHours: 4 },
    { id: "t2", title: "Send welcome kits to Goa group", assigneeId: "5", priority: "High", status: "To Do", dueDate: "Mar 23", category: "Operations", tripLinked: "Goa Beach Retreat", estimatedHours: 2 },
    { id: "t3", title: "Follow up with 8 warm leads", assigneeId: "3", priority: "High", status: "In Progress", dueDate: "Mar 21", category: "Sales", estimatedHours: 4, actualHours: 2 },
    { id: "t4", title: "Post weekly Instagram stories", assigneeId: "4", priority: "Medium", status: "In Progress", dueDate: "Mar 21", category: "Marketing", estimatedHours: 3, actualHours: 1 },
    { id: "t5", title: "Process March vendor invoices", assigneeId: "6", priority: "High", status: "In Progress", dueDate: "Mar 25", category: "Finance", estimatedHours: 8, actualHours: 3 },
    { id: "t6", title: "Resolve Rajasthan hotel overbooking", assigneeId: "2", priority: "Critical", status: "To Do", dueDate: "Today", category: "Crisis", tripLinked: "Rajasthan Heritage", estimatedHours: 2 },
    { id: "t7", title: "Update Spiti Valley safety protocols", assigneeId: "5", priority: "Medium", status: "Review", dueDate: "Mar 24", category: "Compliance", tripLinked: "Spiti Valley", estimatedHours: 3, actualHours: 3 },
    { id: "t8", title: "Negotiate Q2 rates with Snow Leopard Transport", assigneeId: "2", priority: "Medium", status: "To Do", dueDate: "Mar 28", category: "Vendor Mgmt", estimatedHours: 4 },
    { id: "t9", title: "Prepare April trip revenue forecast", assigneeId: "6", priority: "Medium", status: "To Do", dueDate: "Mar 30", category: "Finance", estimatedHours: 6 },
    { id: "t10", title: "Respond to 12 pending customer queries", assigneeId: "7", priority: "High", status: "In Progress", dueDate: "Today", category: "Support", estimatedHours: 4, actualHours: 2 },
    { id: "t11", title: "Create Ladakh trip highlight reel", assigneeId: "4", priority: "Low", status: "To Do", dueDate: "Apr 2", category: "Content", estimatedHours: 5 },
    { id: "t12", title: "Onboard 2 new captain applicants", assigneeId: "1", priority: "Medium", status: "In Progress", dueDate: "Mar 25", category: "HR", estimatedHours: 4, actualHours: 1 },
    { id: "t13", title: "Close deal with TechCorp for 30-pax retreat", assigneeId: "3", priority: "Critical", status: "In Progress", dueDate: "Mar 22", category: "Sales", estimatedHours: 8, actualHours: 5 },
    { id: "t14", title: "Audit captain performance scores", assigneeId: "1", priority: "Low", status: "To Do", dueDate: "Apr 5", category: "Review", estimatedHours: 3 },
    { id: "t15", title: "Set up Ladakh emergency contacts list", assigneeId: "5", priority: "High", status: "To Do", dueDate: "Mar 24", category: "Safety", tripLinked: "Leh Ladakh", estimatedHours: 2 },
]

// ─── Style Helpers ───
export const statusDot: Record<string, string> = {
    "Online": "bg-green-500",
    "Busy": "bg-amber-500",
    "On Leave": "bg-blue-400",
    "Offline": "bg-gray-400",
}

export const priorityColor: Record<string, { bg: string; text: string; dot: string }> = {
    "Critical": { bg: "bg-red-500/10", text: "text-red-600", dot: "bg-red-500" },
    "High": { bg: "bg-orange-500/10", text: "text-orange-600", dot: "bg-orange-500" },
    "Medium": { bg: "bg-blue-500/10", text: "text-blue-600", dot: "bg-blue-500" },
    "Low": { bg: "bg-gray-500/10", text: "text-gray-500", dot: "bg-gray-400" },
}

export const taskStatusColor: Record<string, { bg: string; text: string }> = {
    "To Do": { bg: "bg-gray-100", text: "text-gray-600" },
    "In Progress": { bg: "bg-blue-50", text: "text-blue-600" },
    "Review": { bg: "bg-amber-50", text: "text-amber-600" },
    "Done": { bg: "bg-green-50", text: "text-green-600" },
}

export const deptColor: Record<string, string> = {
    "Operations": "bg-teal-500",
    "Sales": "bg-violet-500",
    "Marketing": "bg-pink-500",
    "Finance": "bg-emerald-500",
    "Support": "bg-orange-500",
    "Leadership": "bg-[#0d4f53]",
}
