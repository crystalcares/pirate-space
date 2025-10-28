/*
          # [Fix] Recreate get_users_with_details function
          This migration fixes an error that occurs when trying to modify the return type of an existing function. It safely drops the old function before creating the new, corrected version.

          ## Query Description:
          - This operation first removes the existing `get_users_with_details` function to avoid conflicts.
          - It then recreates the function with the correct return columns (`id`, `username`, `avatar_url`, `email`, `created_at`, `roles`) and security settings (`SECURITY DEFINER`, `search_path`).
          - This change is non-destructive to user data and is required to make the User Management feature in the admin panel work correctly.

          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: false

          ## Structure Details:
          - Drops function: `public.get_users_with_details`
          - Creates function: `public.get_users_with_details`

          ## Security Implications:
          - RLS Status: Not applicable
          - Policy Changes: No
          - Auth Requirements: The function is `SECURITY DEFINER` to safely access `auth.users`.
          - The `search_path` is explicitly set to `public` to mitigate security risks.

          ## Performance Impact:
          - Indexes: Not applicable
          - Triggers: Not applicable
          - Estimated Impact: Negligible. This is a metadata change.
          */

-- Drop the existing function to allow for recreation with a new signature.
DROP FUNCTION IF EXISTS public.get_users_with_details();

-- Recreate the function with the correct return type and security settings.
CREATE FUNCTION public.get_users_with_details()
RETURNS TABLE (
    id uuid,
    username text,
    avatar_url text,
    email text,
    created_at timestamptz,
    roles jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        p.id,
        p.username,
        p.avatar_url,
        u.email,
        u.created_at,
        COALESCE(
            (
                SELECT jsonb_agg(jsonb_build_object('name', r.name))
                FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = p.id
            ),
            '[]'::jsonb
        ) as roles
    FROM
        public.profiles p
    JOIN
        auth.users u ON p.id = u.id;
$$;
