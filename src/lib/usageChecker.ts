import { createClient } from "@/lib/supabase/server";

interface UsageStatus {
    allowed: boolean;
    current: number;
    limit: number;
    planName: string;
}

/**
 * Check if user can analyze more files this month
 */
export async function canAnalyzeFile(userId: string): Promise<UsageStatus> {
    const supabase = await createClient();

    // Get user's plan
    const { data: user } = await supabase
        .from('users')
        .select('plan_id, subscription_plans(name, files_per_month)')
        .eq('id', userId)
        .single();

    if (!user || !user.subscription_plans) {
        return {
            allowed: false,
            current: 0,
            limit: 0,
            planName: 'unknown'
        };
    }

    const plan = user.subscription_plans as any;
    const limit = plan.files_per_month;
    const planName = plan.name;

    // Get current month usage
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

    const { data: usage } = await supabase
        .from('file_analysis_usage')
        .select('files_analyzed')
        .eq('user_id', userId)
        .eq('month_year', currentMonth)
        .single();

    const current = usage?.files_analyzed || 0;

    return {
        allowed: current < limit,
        current,
        limit,
        planName
    };
}

/**
 * Increment usage count for current month
 */
export async function incrementUsage(userId: string): Promise<void> {
    const supabase = await createClient();
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

    // Try to update existing record, or insert new one
    const { error } = await supabase.rpc('increment_file_usage', {
        p_user_id: userId,
        p_month_year: currentMonth
    });

    if (error) {
        // Fallback: use upsert
        const { data: existing } = await supabase
            .from('file_analysis_usage')
            .select('files_analyzed')
            .eq('user_id', userId)
            .eq('month_year', currentMonth)
            .single();

        if (existing) {
            await supabase
                .from('file_analysis_usage')
                .update({
                    files_analyzed: existing.files_analyzed + 1,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId)
                .eq('month_year', currentMonth);
        } else {
            await supabase
                .from('file_analysis_usage')
                .insert({
                    user_id: userId,
                    month_year: currentMonth,
                    files_analyzed: 1
                });
        }
    }
}

/**
 * Get current usage for the month
 */
export async function getCurrentUsage(userId: string): Promise<{ current: number; limit: number; planName: string }> {
    const supabase = await createClient();
    const currentMonth = new Date().toISOString().slice(0, 7);

    // Get user's plan
    const { data: user } = await supabase
        .from('users')
        .select('plan_id, subscription_plans(name, files_per_month)')
        .eq('id', userId)
        .single();

    const plan = user?.subscription_plans as any;
    const limit = plan?.files_per_month || 0;
    const planName = plan?.name || 'free';

    // Get current usage
    const { data: usage } = await supabase
        .from('file_analysis_usage')
        .select('files_analyzed')
        .eq('user_id', userId)
        .eq('month_year', currentMonth)
        .single();

    return {
        current: usage?.files_analyzed || 0,
        limit,
        planName
    };
}
