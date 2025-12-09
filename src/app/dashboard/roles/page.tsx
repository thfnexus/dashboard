import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Shield } from "lucide-react"
import { AddRoleDialog } from "@/components/roles/AddRoleDialog"
import { EditRoleDialog } from "@/components/roles/EditRoleDialog"

export default async function RolesPage() {
    const supabase = await createClient()
    const { data: roles } = await supabase.from("roles").select("*").order("name")

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Roles</h2>
                <AddRoleDialog />
            </div>

            <div className="rounded-md border bg-card text-card-foreground">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Role Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles?.map((role) => (
                            <TableRow key={role.id}>
                                <TableCell className="font-medium flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-muted-foreground" />
                                    {role.name}
                                </TableCell>
                                <TableCell>{role.description}</TableCell>
                                <TableCell className="text-right">
                                    <EditRoleDialog role={role} />
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!roles || roles.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    No roles found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
