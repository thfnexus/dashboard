"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Calendar, User } from "lucide-react"
import { TeamDetailsDialog } from "./TeamDetailsDialog"
import { useState } from "react"

interface TeamCardProps {
    team: any
    currentUserRole: string
}

export function TeamCard({ team, currentUserRole }: TeamCardProps) {
    const [detailsOpen, setDetailsOpen] = useState(false)

    const memberCount = team.team_members?.length || 0
    const createdDate = new Date(team.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })

    return (
        <>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setDetailsOpen(true)}>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl">{team.name}</CardTitle>
                            <CardDescription className="line-clamp-2">
                                {team.description || "No description provided"}
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="ml-2">
                            <Users className="mr-1 h-3 w-3" />
                            {memberCount}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{team.created_by_name || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{createdDate}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <TeamDetailsDialog
                teamId={team.id}
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                currentUserRole={currentUserRole}
            />
        </>
    )
}
