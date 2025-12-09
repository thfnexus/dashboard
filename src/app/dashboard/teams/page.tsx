import { createClient } from "@/lib/supabase/server"
import { TeamCard } from "@/components/teams/TeamCard"
import { CreateTeamDialog } from "@/components/teams/CreateTeamDialog"
import { Input } from "@/components/ui/input"

export default async function TeamsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const supabase = await createClient()
    const params = await searchParams

    // Get current user role
    const { data: { user } } = await supabase.auth.getUser()
    let currentUserRole = 'user'
    if (user) {
        const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
        currentUserRole = data?.role || 'user'
    }

    // Fetch teams based on role
    let teams: any[] = []


    if (currentUserRole === 'user' && user) {
        // User: only teams they're a member of
        const { data } = await supabase
            .from("team_members")
            .select(`
                team_id,
                teams (
                    id,
                    name,
                    description,
                    created_by,
                    created_at,
                    users:created_by (name),
                    team_members (id)
                )
            `)
            .eq("user_id", user.id)

        teams = data?.map(item => {
            const teamData = item.teams as any
            return {
                ...teamData,
                created_by_name: teamData?.users?.name
            }
        }).filter(Boolean) || []
    } else {
        const { data } = await supabase
            .from("teams")
            .select(`
                *,
                users:created_by (name),
                team_members (id)
            `)
            .order("created_at", { ascending: false })

        teams = data?.map((team: any) => ({
            ...team,
            created_by_name: team.users?.name
        })) || []
    }

    // Apply search filter
    if (params.q) {
        teams = teams.filter(team =>
            team.name?.toLowerCase().includes(params.q!.toLowerCase()) ||
            team.description?.toLowerCase().includes(params.q!.toLowerCase())
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Teams</h2>
                    <p className="text-muted-foreground">
                        {currentUserRole === 'user'
                            ? 'Your team workspaces'
                            : 'Manage team workspaces and members'}
                    </p>
                </div>
                {(currentUserRole === 'admin' || currentUserRole === 'manager') && (
                    <CreateTeamDialog />
                )}
            </div>

            {/* Search Bar */}
            <form action="/dashboard/teams" method="get" className="max-w-sm">
                <Input
                    type="search"
                    name="q"
                    placeholder="Search teams..."
                    defaultValue={params.q}
                />
            </form>

            {/* Teams Grid */}
            {teams.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground mb-4">
                        {currentUserRole === 'user'
                            ? "You're not a member of any teams yet."
                            : "No teams created yet. Create your first team to get started!"}
                    </p>
                    {(currentUserRole === 'admin' || currentUserRole === 'manager') && (
                        <CreateTeamDialog />
                    )}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {teams.map((team) => (
                        <TeamCard
                            key={team.id}
                            team={team}
                            currentUserRole={currentUserRole}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
