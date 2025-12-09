"use client"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sidebar } from "./Sidebar"
import { usePathname } from "next/navigation"

export function MobileSidebar() {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()

    // Close on path change automatically
    useEffect(() => {
        setOpen(false)
    }, [pathname])

    if (open) {
        return (
            <>
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setOpen(false)}
                />
                {/* Drawer */}
                <div className="fixed inset-y-0 left-0 w-3/4 sm:w-1/2 z-50 bg-card border-r shadow-lg transition-transform duration-300 ease-in-out md:hidden flex flex-col">
                    <div className="absolute right-4 top-4">
                        <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <Sidebar className="border-none" onNavigate={() => setOpen(false)} />
                </div>
            </>
        )
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-30"
            onClick={() => setOpen(true)}
        >
            <Menu className="h-6 w-6" />
        </Button>
    )
}
