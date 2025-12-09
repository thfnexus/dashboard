"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function RecentUsers() {
    const [users, setUsers] = useState<any[]>([])
    const supabase = createClient()

    useEffect(() => {
        async function fetchUsers() {
            const { data } = await supabase
                .from('users')
                .select('name, email, avatar_url')
                .order('created_at', { ascending: false })
                .limit(5)

            if (data) setUsers(data)
        }
        fetchUsers()
    }, [])

    return (
        <div className="space-y-8">
            {users.map((user, i) => (
                <div key={i} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar_url} alt="Avatar" />
                        <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="ml-auto font-medium">
                        {/* Could show role or status or date */}
                    </div>
                </div>
            ))}
            {users.length === 0 && <p className="text-sm text-muted-foreground">No recent users found.</p>}
        </div>
    )
}
