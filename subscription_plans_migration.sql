-- Enable UUID extension (if not already enabled)
create extension if not exists "uuid-ossp";

-- Subscription Plans Table
create table public.subscription_plans (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  files_per_month integer not null,
  max_team_members integer not null,
  price_monthly numeric(10,2) not null,
  features jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default plans
insert into public.subscription_plans (name, files_per_month, max_team_members, price_monthly, features) values
('free', 50, 3, 0.00, '["50 file analyses per month", "Up to 3 team members", "Basic analytics", "Email support"]'::jsonb),
('business', 500, 6, 29.00, '["500 file analyses per month", "Up to 6 team members", "Advanced analytics", "Priority email support", "API access"]'::jsonb),
('premium', 1000, 15, 99.00, '["1000 file analyses per month", "Up to 15 team members", "Advanced analytics", "24/7 priority support", "API access", "Custom integrations"]'::jsonb);

-- Add plan_id to users table
alter table public.users add column if not exists plan_id uuid references public.subscription_plans(id);

-- Set default plan for existing users
update public.users set plan_id = (select id from public.subscription_plans where name = 'free') where plan_id is null;

-- Usage Tracking Table
create table public.file_analysis_usage (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  month_year text not null, -- Format: 'YYYY-MM'
  files_analyzed integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, month_year)
);

-- Enable RLS
alter table public.subscription_plans enable row level security;
alter table public.file_analysis_usage enable row level security;

-- Policies for subscription_plans
create policy "Plans visible to all authenticated users" on public.subscription_plans for select using (auth.role() = 'authenticated');

-- Policies for file_analysis_usage
create policy "Users can view their own usage" on public.file_analysis_usage for select using (auth.uid() = user_id);
create policy "System can insert usage" on public.file_analysis_usage for insert with check (true);
create policy "System can update usage" on public.file_analysis_usage for update using (true);

-- Update handle_new_user function to set default plan
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, role, plan_id)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'name', 
    'user',
    (select id from public.subscription_plans where name = coalesce(new.raw_user_meta_data->>'plan', 'free'))
  );
  return new;
end;
$$ language plpgsql security definer;
