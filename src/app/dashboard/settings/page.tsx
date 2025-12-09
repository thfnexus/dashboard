"use client"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [userId, setUserId] = useState("")
    const supabase = createClient()
    const router = useRouter()
    const { theme, setTheme } = useTheme()

    // Fetch user data on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserId(user.id)
                setEmail(user.email || "")

                // Fetch user name from database
                const { data: userData } = await supabase
                    .from('users')
                    .select('name')
                    .eq('id', user.id)
                    .single()

                if (userData) {
                    setName(userData.name || "")
                }
            }
        }
        fetchUserData()
    }, [])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Update user name in database
            const { error } = await supabase
                .from('users')
                .update({ name: name })
                .eq('id', userId)

            if (error) throw error

            // Update user metadata in auth as well
            await supabase.auth.updateUser({
                data: { name: name }
            })

            alert("Settings saved successfully!")
            // Refresh to update sidebar
            router.refresh()
        } catch (error: any) {
            console.error('Error updating profile:', error)
            alert("Failed to save settings: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium">Settings</h3>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>
                            Update your personal information.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <input
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your Name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <input
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled
                                    value={email}
                                />
                                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                            </div>
                            <Button disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Application</CardTitle>
                        <CardDescription>
                            System preferences.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium">Dark Mode</label>
                                <p className="text-xs text-muted-foreground">Enable dark mode for the dashboard.</p>
                            </div>
                            <Switch
                                checked={theme === 'dark'}
                                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium">Notifications</label>
                                <p className="text-xs text-muted-foreground">Receive email alerts for new signups.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
