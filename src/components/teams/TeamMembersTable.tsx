"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EditTeamMemberDialog } from "./EditTeamMemberDialog"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface TeamMembersTableProps {
    members: any[]
    currentUserRole: string
}

export function TeamMembersTable({ members, currentUserRole }: TeamMembersTableProps) {
    const router = useRouter()
    const [deleting, setDeleting] = useState<string | null>(null)

    const canEdit = (memberRole: string) => {
        if (currentUserRole === 'admin') return true
        if (currentUserRole === 'manager' && memberRole === 'user') return true
        return false
    }

    const canDelete = (memberRole: string) => {
        if (currentUserRole === 'admin') return true
        if (currentUserRole === 'manager' && memberRole === 'user') return true
        return false
    }

    const handleDelete = async (userId: string, memberRole: string) => {
        if (!canDelete(memberRole)) return

        const confirmed = confirm('Are you sure you want to remove this team member?')
        if (!confirmed) return

        setDeleting(userId)
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: 'DELETE'
            })

            if (!res.ok) throw new Error('Failed to delete user')

            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Failed to delete user')
        } finally {
            setDeleting(null)
        }
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            case 'manager': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            case 'user': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            default: return ''
        }
    }

    const getStatusBadgeColor = (status: string) => {
        return status === 'active'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }

    return (
        <div className="rounded-md border bg-card text-card-foreground overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        {currentUserRole !== 'user' && (
                            <TableHead className="text-right">Actions</TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {members.map((member) => (
                        <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.name || 'N/A'}</TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell>
                                <Badge className={getRoleBadgeColor(member.role)}>
                                    {member.role}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge className={getStatusBadgeColor(member.status || 'active')}>
                                    {member.status || 'active'}
                                </Badge>
                            </TableCell>
                            <TableCell>{new Date(member.created_at).toLocaleDateString()}</TableCell>
                            {currentUserRole !== 'user' && (
                                <TableCell className="text-right space-x-2">
                                    {canEdit(member.role) && (
                                        <EditTeamMemberDialog
                                            member={member}
                                            currentUserRole={currentUserRole}
                                        />
                                    )}
                                    {canDelete(member.role) && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(member.id, member.role)}
                                            disabled={deleting === member.id}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                    {members.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No team members found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
