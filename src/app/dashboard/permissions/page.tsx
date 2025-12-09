import { createClient } from "@/lib/supabase/server"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

// Need to create Checkbox component first, wait, I'll use standard input for now or define Checkbox

export default async function PermissionsPage() {
    const supabase = await createClient()

    // Fetch data
    const { data: roles } = await supabase.from("roles").select("*").order("name")
    const { data: permissions } = await supabase.from("permissions").select("*").order("name")
    const { data: rolePermissions } = await supabase.from("role_permissions").select("*")

    // Matrix logic helper
    const isChecked = (roleId: string, permId: string) => {
        return rolePermissions?.some(rp => rp.role_id === roleId && rp.permission_id === permId)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Permissions Matrix</h2>
                <Button>Save Changes</Button>
            </div>

            <div className="overflow-x-auto rounded-md border bg-card">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted/50 border-b">
                        <tr>
                            <th className="px-6 py-3 font-medium">Permission</th>
                            {roles?.map(role => (
                                <th key={role.id} className="px-6 py-3 font-medium text-center">{role.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {permissions?.map(perm => (
                            <tr key={perm.id} className="border-b last:border-0 hover:bg-muted/50">
                                <td className="px-6 py-4 font-medium">{perm.name}</td>
                                {roles?.map(role => (
                                    <td key={`${role.id}-${perm.id}`} className="px-6 py-4 text-center">
                                        <input
                                            type="checkbox"
                                            defaultChecked={isChecked(role.id, perm.id)}
                                            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                                            // Make this interactive with client component later for real updates
                                            disabled
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="text-xs text-muted-foreground">* This matrix is read-only in this demo. Real implementation would require Client Component for toggling.</p>
        </div>
    )
}
