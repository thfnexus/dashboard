"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import type { PlanId } from "@/lib/plans"

interface EditUserDialogProps {
    user: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const [formData, setFormData] = useState({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "user",
        status: user.status || "active",
        plan_id: user.plan_id || ""
    })
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
    const [plans, setPlans] = useState<any[]>([])
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            // Fetch current user role
            const { data: { user: currentUser } } = await supabase.auth.getUser()
            if (currentUser) {
                const { data } = await supabase.from('users').select('role').eq('id', currentUser.id).single()
                setCurrentUserRole(data?.role || 'user')
            }

            // Fetch available plans
            const { data: plansData } = await supabase
                .from('subscription_plans')
                .select('*')
                .order('price_monthly', { ascending: true })

            if (plansData) {
                setPlans(plansData)
            }
        }
        fetchData()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch(`/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!res.ok) throw new Error('Failed to update user')

            onOpenChange(false)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Failed to update user")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Make changes to the user profile here.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="edit-name" className="text-right text-sm font-medium">
                            Name
                        </label>
                        <input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="edit-email" className="text-right text-sm font-medium">
                            Email
                        </label>
                        <input
                            id="edit-email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="edit-role" className="text-right text-sm font-medium">
                            Role
                        </label>
                        <select
                            id="edit-role"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            disabled={currentUserRole !== 'admin'}
                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="edit-status" className="text-right text-sm font-medium">
                            Status
                        </label>
                        <select
                            id="edit-status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="edit-plan" className="text-right text-sm font-medium">
                            Plan
                        </label>
                        <select
                            id="edit-plan"
                            value={formData.plan_id}
                            onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                            disabled={currentUserRole !== 'admin'}
                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed capitalize"
                        >
                            {plans.map((plan) => (
                                <option key={plan.id} value={plan.id}>
                                    {plan.name.charAt(0).toUpperCase() + plan.name.slice(1)} (${plan.price_monthly}/mo - {plan.files_per_month} files)
                                </option>
                            ))}
                        </select>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
