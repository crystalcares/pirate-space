/*
# [Fix] Correct RLS Policies for Exchanges and Profiles
This migration enables Row Level Security (RLS) on the `exchanges` and `profiles` tables and creates the necessary policies to ensure users can access their own data and admins have full access. This resolves the "failed to fetch exchanges" error.

## Query Description:
This script performs the following actions:
1.  **Enables RLS** on `public.exchanges` and `public.profiles`.
2.  **Creates SELECT policies** on `exchanges` allowing users to view their own exchanges and admins to view all.
3.  **Creates INSERT policy** on `exchanges` for any logged-in user.
4*  **Creates SELECT policy** on `profiles` allowing any logged-in user to view all profiles (for features like seeing usernames on exchanges).
5.  **Creates UPDATE policy** on `profiles` allowing users to update their own profile.
6.  **Creates ADMIN policies** granting full access to admins on both tables.

This operation is non-destructive and essential for data security. No data will be lost.

## Metadata:
- Schema-Category: ["Structural", "Safe"]
- Impact-Level: ["Medium"]
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Tables affected: `public.exchanges`, `public.profiles`
- RLS policies will be created and enabled.

## Security Implications:
- RLS Status: Enabled on `exchanges` and `profiles`.
- Policy Changes: Yes, new policies are added to control data access.
- Auth Requirements: Policies rely on `auth.uid()` and the `public.is_admin()` function.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible. RLS adds a small overhead to queries, but it is necessary for security.
*/

-- 1. Enable RLS on the exchanges table
ALTER TABLE public.exchanges ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist to prevent errors
DROP POLICY IF EXISTS "Allow individual user select access on exchanges" ON public.exchanges;
DROP POLICY IF EXISTS "Allow admin select access on exchanges" ON public.exchanges;
DROP POLICY IF EXISTS "Allow individual user insert access on exchanges" ON public.exchanges;
DROP POLICY IF EXISTS "Allow admin full access on exchanges" ON public.exchanges;

DROP POLICY IF EXISTS "Allow public read access on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual user update access on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin full access on profiles" ON public.profiles;


-- 4. Create policies for the 'exchanges' table
CREATE POLICY "Allow individual user select access on exchanges"
ON public.exchanges FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow admin select access on exchanges"
ON public.exchanges FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Allow individual user insert access on exchanges"
ON public.exchanges FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admin full access on exchanges"
ON public.exchanges FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));


-- 5. Create policies for the 'profiles' table
CREATE POLICY "Allow public read access on profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true); -- Allows any authenticated user to see profile info like usernames.

CREATE POLICY "Allow individual user update access on profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow admin full access on profiles"
ON public.profiles FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));
