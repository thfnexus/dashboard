-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ROLES Table
create table public.roles (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PERMISSIONS Table
create table public.permissions (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROLE PERMISSIONS Join Table
create table public.role_permissions (
  role_id uuid references public.roles(id) on delete cascade not null,
  permission_id uuid references public.permissions(id) on delete cascade not null,
  primary key (role_id, permission_id)
);

-- USERS Table (Extends auth.users, or standalone if managed manually, but better linked)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  name text,
  role text default 'user', -- Simplified role status for the table view
  status text default 'active', -- active, suspended
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Handle user creation trigger (optional but good for sync)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'name', 'user');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Insert some default ROLES
insert into public.roles (name, description) values
('admin', 'Administrator with full access'),
('manager', 'Manager with limited access'),
('user', 'Standard user');

-- Insert some default PERMISSIONS
insert into public.permissions (name) values
('create_user'),
('delete_user'),
('edit_user'),
('view_analytics'),
('manage_roles'),
('manage_settings');

-- Enable RLS
alter table public.users enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;

-- Policies (Simplified for demo: enable all for now or authenticated)
create policy "Enable read access for all users" on public.users for select using (true);
create policy "Enable insert for authenticated users only" on public.users for insert with check (auth.role() = 'authenticated');
create policy "Enable update for users based on email" on public.users for update using (auth.uid() = id);

-- For admins to manage everything, we'd add admin policies, but for this demo:
create policy "Allow all access to authenticated users" on public.roles for all using (auth.role() = 'authenticated');
create policy "Allow all access to authenticated users" on public.permissions for all using (auth.role() = 'authenticated');
create policy "Allow all access to authenticated users" on public.role_permissions for all using (auth.role() = 'authenticated');
