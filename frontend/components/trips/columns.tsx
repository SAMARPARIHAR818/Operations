"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

// This type is used to define the shape of our data.
export type Trip = {
    id: string
    destination: string
    startDate: string
    endDate: string
    captain: string
    type: "Party" | "Explorer" | "Elderly" | "International"
    pax: number
    profitMargin: number
    riskLevel: "Low" | "Medium" | "High"
    status: "Upcoming" | "Live" | "Completed" | "Cancelled"
}

export const columns: ColumnDef<Trip>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "destination",
        header: "Destination",
        cell: ({ row }) => <div className="font-medium">{row.getValue("destination")}</div>,
    },
    {
        accessorKey: "startDate",
        header: "Date",
        cell: ({ row }) => {
            return <div className="text-muted-foreground text-sm">{row.getValue("startDate")}</div>
        }
    },
    {
        accessorKey: "captain",
        header: "Captain",
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => <div className="truncate">{row.getValue("type")}</div>,
    },
    {
        accessorKey: "pax",
        header: "Pax",
    },
    {
        accessorKey: "profitMargin",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Margin
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const margin = parseFloat(row.getValue("profitMargin"))
            return (
                <div className={`font-medium ${margin > 20 ? "text-green-600" : margin < 10 ? "text-red-500" : "text-yellow-600"}`}>
                    {margin}%
                </div>
            )
        },
    },
    {
        accessorKey: "riskLevel",
        header: "Risk",
        cell: ({ row }) => {
            const risk = row.getValue("riskLevel") as string
            return (
                <Badge variant={risk === "High" ? "destructive" : risk === "Medium" ? "secondary" : "outline"}
                    className={risk === "Medium" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" : risk === "Low" ? "bg-green-100 text-green-800 hover:bg-green-100 border-transparent" : ""}
                >
                    {risk}
                </Badge>
            )
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant="outline">{row.getValue("status")}</Badge>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const trip = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(trip.id)}
                        >
                            Copy Trip ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/trips/${trip.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Log Monitoring</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
