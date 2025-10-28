/*
# [Create Function to Get User Details]
This function securely retrieves a list of all users with their profile information, email, creation date, and roles.

## Query Description:
This operation creates a new PostgreSQL function named `get_users_with_details`.
- It is a `SECURITY DEFINER` function, meaning it runs with the privileges of the user that created it (the database owner), allowing it to safely query the `auth.users` table, which is normally restricted.
- It performs a `LEFT JOIN` from `auth.users` to `public.profiles` to include profile data like username and avatar URL.
- It aggregates user roles from `public.user_roles` and `public.roles` into a JSON array for each user.
- This function is read-only and does not modify any data. It's designed to provide a comprehensive user list for the admin panel.

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: true (The function can be dropped)

## Structure Details:
- Function Created: `public.get_users_with_details()`

## Security Implications:
- RLS Status: Not applicable to function creation itself. The function bypasses RLS on `auth.users` due to `SECURITY DEFINER`.
- Policy Changes: No
- Auth Requirements: The function is defined to be callable by the `authenticated` role, making it accessible to logged-in users (intended for admins).

## Performance Impact:
- Indexes: The query within the function will benefit from standard indexes on `auth.users.id` and `public.profiles.id`.
- Triggers: None
- Estimated Impact: Low. The query is efficient for a moderate number of users.
*/

CREATE OR REPLACE FUNCTION public.get_users_with_details()
RETURNS TABLE (
    id uuid,
    username text,
    avatar_url text,
    email text,
    created_at timestamptz,
    roles json
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
    SELECT
        u.id,
        p.username,
        p.avatar_url,
        u.email,
        u.created_at,
        COALESCE(
            (
                SELECT json_agg(json_build_object('name', r.name))
                FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = u.id
            ),
            '[]'::json
        ) AS roles
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id;
$$;

-- Grant access to the function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_users_with_details() TO authenticated;
