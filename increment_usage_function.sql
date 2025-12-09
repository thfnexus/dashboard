-- Database function to increment file usage atomically
create or replace function increment_file_usage(p_user_id uuid, p_month_year text)
returns void as $$
begin
  insert into public.file_analysis_usage (user_id, month_year, files_analyzed)
  values (p_user_id, p_month_year, 1)
  on conflict (user_id, month_year)
  do update set 
    files_analyzed = file_analysis_usage.files_analyzed + 1,
    updated_at = now();
end;
$$ language plpgsql security definer;
