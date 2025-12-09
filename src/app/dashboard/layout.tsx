import { Sidebar } from "@/components/layout/Sidebar"
import { MobileSidebar } from "@/components/layout/MobileSidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen">
            {/* Mobile Sidebar Trigger & Drawer */}
            <MobileSidebar />

            {/* Sidebar - hidden on mobile, visible on md+ */}
            <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0">
                <Sidebar />
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen bg-muted/20">
                {/* Mobile Header would go here (Navbar) */}
                <div className="p-8 flex-1">
                    {children}
                </div>
            </main>
        </div>
    )
}
