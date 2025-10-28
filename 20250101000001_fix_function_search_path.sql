/*
# [Fix Function Search Path]
This migration updates existing functions to explicitly set the `search_path`. This is a security best practice to prevent search path hijacking attacks, addressing the "Function Search Path Mutable" warning.

## Query Description: This operation modifies two existing functions: `is_admin` and `handle_new_user`. It alters their definitions to include `SET search_path = public`, which ensures that they always execute with a predictable schema search path. This change is non-destructive and does not affect any existing data. It enhances the security and stability of the database functions.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by reverting to the previous function definitions)

## Structure Details:
- Functions affected:
  - `public.is_admin(uuid)`
  - `public.handle_new_user()`

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: Unchanged
- Mitigates: Search path hijacking vulnerability.

## Performance Impact:
- Indexes: None
- Triggers: Unchanged
- Estimated Impact: Negligible performance impact.
*/

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from user_roles ur
    join roles r on ur.role_id = r.id
    where ur.user_id = is_admin.user_id and r.name = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_first_user boolean;
begin
  -- Insert into public.profiles
  insert into public.profiles (id, username, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');

  -- Check if this is the first user
  select count(*) = 1 into is_first_user from auth.users;

  -- If it is the first user, grant admin role
  if is_first_user then
    insert into public.user_roles (user_id, role_id)
    values (new.id, (select id from public.roles where name = 'admin'));
  end if;

  return new;
end;
$$;
