/*
# [Function] Secure `get_users_with_details`

This migration re-creates the `get_users_with_details` function to include a fixed `search_path`. This is a critical security measure to prevent search path hijacking vulnerabilities.

## Query Description:
This operation safely replaces the existing function with a more secure version. It does not alter any table data and is reversible by re-running the previous migration file for this function.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Function: `public.get_users_with_details()`

## Security Implications:
- RLS Status: Not Applicable
- Policy Changes: No
- Auth Requirements: The function is `SECURITY DEFINER` and requires appropriate permissions to execute. This change hardens its security.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible.
*/
create or replace function public.get_users_with_details()
returns table (
    id uuid,
    username text,
    avatar_url text,
    email text,
    created_at timestamptz,
    roles jsonb
)
language plpgsql
security definer
set search_path = public
as $$
begin
    return query
    select
        p.id,
        p.username,
        p.avatar_url,
        u.email,
        u.created_at,
        coalesce(
            (
                select jsonb_agg(jsonb_build_object('name', r.name))
                from public.user_roles ur
                join public.roles r on ur.role_id = r.id
                where ur.user_id = p.id
            ),
            '[]'::jsonb
        ) as roles
    from
        public.profiles p
    join
        auth.users u on p.id = u.id;
end;
$$;
