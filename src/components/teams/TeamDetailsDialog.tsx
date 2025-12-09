"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Trash2, Plus, Edit } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TeamDetailsDialogProps {
    teamId: string
    open: boolean
    onOpenChange: (open: boolean) => void
    currentUserRole: string
}

export function TeamDetailsDialog({ teamId, open, onOpenChange, currentUserRole }: TeamDetailsDialogProps) {
    const [team, setTeam] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [addMemberOpen, setAddMemberOpen] = useState(false)
    const [users, setUsers] = useState<any[]>([])
    const [selectedUserId, setSelectedUserId] = useState("")
    const [selectedRole, setSelectedRole] = useState("member")
    const router = useRouter()

    useEffect(() => {
        if (open) {
            loadTeam()
            loadUsers()
        }
    }, [open, teamId])

    const loadTeam = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/teams/${teamId}`)
            if (res.ok) {
                const data = await res.json()
                setTeam(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const loadUsers = async () => {
        try {
            const res = await fetch('/api/users')
            if (res.ok) {
                const data = await res.json()
                setUsers(data)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleAddMember = async () => {
        if (!selectedUserId) return

        try {
            const res = await fetch(`/api/teams/${teamId}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: selectedUserId, teamRole: selectedRole })
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error)
            }

            setAddMemberOpen(false)
            setSelectedUserId("")
            setSelectedRole("member")
            loadTeam()
        } catch (error: any) {
            alert(error.message || "Failed to add member")
        }
    }

    const handleRemoveMember = async (userId: string) => {
        if (!confirm('Remove this member from the team?')) return

        try {
            const res = await fetch(`/api/teams/${teamId}/members?userId=${userId}`, {
                method: 'DELETE'
            })

            if (!res.ok) throw new Error('Failed to remove member')

            loadTeam()
        } catch (error) {
            alert("Failed to remove member")
        }
    }

    const canManageMembers = currentUserRole === 'admin' || currentUserRole === 'manager'

    const availableUsers = users.filter(u =>
        !team?.team_members?.some((m: any) => m.users?.id === u.id)
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{team?.name}</DialogTitle>
                    <DialogDescription>
                        {team?.description || "No description"}
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Team Members</h3>
                            {canManageMembers && (
                                <Button onClick={() => setAddMemberOpen(!addMemberOpen)} size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Member
                                </Button>
                            )}
                        </div>

                        {addMemberOpen && (
                            <div className="border rounded-lg p-4 space-y-3">
                                <Label>Select User</Label>
                                <select
                                    className="w-full border rounded px-3 py-2"
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                >
                                    <option value="">Choose a user...</option>
                                    {availableUsers.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>

                                <Label>Team Role</Label>
                                <select
                                    className="w-full border rounded px-3 py-2"
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                >
                                    <option value="member">Member</option>
                                    <option value="manager">Manager</option>
                                    {currentUserRole === 'admin' && <option value="admin">Admin</option>}
                                </select>

                                <Button onClick={handleAddMember} disabled={!selectedUserId}>
                                    Add to Team
                                </Button>
                            </div>
                        )}

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Team Role</TableHead>
                                    <TableHead>Joined</TableHead>
                                    {canManageMembers && <TableHead className="text-right">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {team?.team_members?.map((member: any) => (
                                    <TableRow key={member.id}>
                                        <TableCell className="font-medium">{member.users?.name}</TableCell>
                                        <TableCell>{member.users?.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={member.team_role === 'admin' ? 'default' : 'secondary'}>
                                                {member.team_role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(member.joined_at).toLocaleDateString()}</TableCell>
                                        {canManageMembers && (
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveMember(member.users?.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                                {team?.team_members?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            No members yet
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
