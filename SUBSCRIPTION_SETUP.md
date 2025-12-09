# Subscription System Setup Guide

This guide will help you set up the subscription plan system in your Supabase database.

## Step 1: Run Database Migrations

Execute these SQL scripts in your Supabase SQL Editor in order:

### 1. Main Migration Script
Run the file: `subscription_plans_migration.sql`

This creates:
- `subscription_plans` table with Free, Business, and Premium plans
- `file_analysis_usage` table for tracking monthly usage
- Adds `plan_id` column to `users` table
- Sets up Row Level Security policies
- Updates the `handle_new_user()` trigger to support plan selection

### 2. Helper Function
Run the file: `increment_usage_function.sql`

This creates an atomic function to safely increment file usage counts.

## Step 2: Verify Database Setup

Run this query to verify plans were created:

```sql
SELECT * FROM subscription_plans ORDER BY price_monthly;
```

You should see 3 plans: free ($0), business ($29), and premium ($99).

## Step 3: Test the System

### Test Registration
1. Navigate to `/register`
2. Fill in user details (Step 1)
3. Select a plan (Step 2)
4. Complete registration
5. Verify in Supabase that the user has the correct `plan_id`

### Test File Analysis Limits
1. Log in with a user on the Free plan
2. Navigate to `/dashboard/upload`
3. Check usage indicator shows "0 of 50 files"
4. Upload and analyze files
5. Watch the counter increment
6. Try to analyze 51st file - should be blocked with upgrade message

### Test Usage Tracking
Run this query to see usage:

```sql
SELECT 
  u.email,
  sp.name as plan,
  fau.month_year,
  fau.files_analyzed,
  sp.files_per_month as limit
FROM file_analysis_usage fau
JOIN users u ON u.id = fau.user_id
JOIN subscription_plans sp ON sp.id = u.plan_id
ORDER BY fau.updated_at DESC;
```

## Features Implemented

✅ **Three-tier subscription system**: Free, Business, Premium
✅ **File analysis limits**: 50, 500, 1000 files/month
✅ **Team member limits**: 3, 6, 15 members (enforced in plan config)
✅ **Usage tracking**: Monthly reset with atomic increment
✅ **Registration flow**: Two-step process with plan selection
✅ **Usage indicator**: Visual progress bar with warnings
✅ **Limit enforcement**: API blocks analysis when limit reached
✅ **Pricing page**: Public-facing plan comparison

## API Endpoints

- `POST /api/analyze` - Analyze file (checks usage limits)
- `GET /api/usage` - Get current user's usage stats

## Components Created

- `PlanSelector.tsx` - Plan selection cards for registration
- `UsageIndicator.tsx` - Usage display with progress bar
- `Progress.tsx` - Progress bar UI component

## Files Modified

- `register/page.tsx` - Added two-step registration with plan selection
- `api/analyze/route.ts` - Added usage limit checking and increment
- `dashboard/upload/page.tsx` - Added usage indicator display

## Next Steps (Optional Enhancements)

1. **Team Member Limits**: Update team member routes to enforce `max_team_members`
2. **Plan Upgrade**: Create UI for users to upgrade/downgrade plans
3. **Payment Integration**: Add Stripe for Business/Premium plans
4. **Admin Dashboard**: Show all users' plans and usage statistics
5. **Email Notifications**: Notify users when approaching limits

## Troubleshooting

**Issue**: Registration doesn't save plan
- Check that `handle_new_user()` trigger is recreated with plan support
- Verify plan name is being passed in `user_metadata`

**Issue**: Usage not incrementing
- Run the `increment_usage_function.sql` script
- Check Supabase logs for errors

**Issue**: "Plan not found" errors
- Verify `subscription_plans` table has the 3 default plans
- Check `plan_id` column exists and has foreign key constraint

## Database Schema Reference

```
subscription_plans
- id (uuid, PK)
- name (text, unique) - 'free', 'business', 'premium'
- files_per_month (integer)
- max_team_members (integer)
- price_monthly (numeric)
- features (jsonb)

file_analysis_usage
- id (uuid, PK)  
- user_id (uuid, FK -> users)
- month_year (text) - 'YYYY-MM' format
- files_analyzed (integer)
- unique(user_id, month_year)

users (updated)
+ plan_id (uuid, FK -> subscription_plans)
```
