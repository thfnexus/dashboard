"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    Shield,
    Key,
    BarChart3,
    Users2,
    Settings,
    Upload,
    LogOut,
    UserCircle,
    CreditCard
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Users",
        href: "/dashboard/users",
        icon: Users,
    },
    {
        title: "Roles",
        href: "/dashboard/roles",
        icon: Shield,
    },
    {
        title: "Permissions",
        href: "/dashboard/permissions",
        icon: Key,
    },
    {
        title: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
    },
    {
        title: "Teams",
        href: "/dashboard/teams",
        icon: Users2,
    },
    {
        title: "Upload Data",
        href: "/dashboard/upload",
        icon: Upload,
    },
    {
        title: "Pricing",
        href: "/pricing",
        icon: CreditCard,
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
]

export function Sidebar({ className, onNavigate }: { className?: string, onNavigate?: () => void }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [role, setRole] = useState<string | null>(null)
    const [userEmail, setUserEmail] = useState<string>('')
    const [userName, setUserName] = useState<string>('')

    useEffect(() => {
        const checkRole = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setIsLoggedIn(true)
                // Set user email
                setUserEmail(user.email || '')

                // Set user name from user metadata or extract from email
                const displayName = user.user_metadata?.full_name ||
                    user.user_metadata?.name ||
                    user.email?.split('@')[0] ||
                    'User'
                setUserName(displayName)

                // Fetch role from database
                const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
                setRole(data?.role || 'user')
            } else {
                setIsLoggedIn(false)
            }
        }
        checkRole()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    const filteredItems = sidebarItems.filter(item => {
        if (['Roles', 'Permissions'].includes(item.title)) {
            return role === 'admin'
        }
        if (item.title === 'Users') {
            return role === 'admin' || role === 'manager'
        }
        return true
    })

    return (
        <div className={cn("flex flex-col h-full border-r bg-card", className)}>
            <div className="p-6 border-b">
                <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2 font-bold text-xl">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                        T
                    </div>
                    <span>THF DataSuite</span>
                </Link>
            </div>

            <div className="flex-1 py-4 overflow-y-auto">
                <nav className="space-y-1 px-2">
                    {filteredItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                pathname === item.href
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.title}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="p-4 border-t">
                {isLoggedIn ? (
                    <>
                        <div className="flex items-center gap-3 px-3 py-2 mb-2">
                            <UserCircle className="w-8 h-8 text-muted-foreground" />
                            <div className="text-sm">
                                <p className="font-medium">{userName || 'User'}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[140px]" title={userEmail}>{userEmail || 'user@example.com'}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </>
                ) : (
                    <Link
                        href="/login"
                        className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                    >
                        <LogOut className="w-4 h-4 rotate-180" />
                        Login
                    </Link>
                )}
                <div className="mt-4 px-3">
                    <ThemeToggle />
                </div>
            </div>
        </div>
    )
}

function ThemeToggle() {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <button
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground w-full justify-center border rounded-md py-1"
            >
                <span className="opacity-0">Toggle Theme</span>
            </button>
        )
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground w-full justify-center border rounded-md py-1"
        >
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
    )
}
