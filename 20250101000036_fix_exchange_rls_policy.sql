/*
          # [Fix Exchange RLS Policies]
          This migration corrects the Row Level Security (RLS) policies for the `exchanges` table to resolve data fetching errors.

          ## Query Description: 
          This script resets and recreates the security policies on the `public.exchanges` table. It ensures that:
          1. Authenticated users can view and manage their own exchanges.
          2. Anonymous users (not logged in) can view exchanges they've just created (where `user_id` is NULL). This is critical for the post-creation exchange page to work.
          3. Administrators have full access to view and manage all exchanges.
          This operation is safe and does not risk any existing data.

          ## Metadata:
          - Schema-Category: "Safe"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Affects Table: `public.exchanges`
          - Operations: `DROP POLICY`, `CREATE POLICY`
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          - Auth Requirements: Policies are defined for `anon`, `authenticated`, and `admin` roles.
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Negligible. RLS lookups are highly optimized.
          */

-- Drop existing policies on the exchanges table to ensure a clean slate.
DROP POLICY IF EXISTS "Allow admins full access" ON public.exchanges;
DROP POLICY IF EXISTS "Allow users to create exchanges" ON public.exchanges;
DROP POLICY IF EXISTS "Allow users to view their own or anonymous exchanges" ON public.exchanges;
DROP POLICY IF EXISTS "Allow users to update their own exchanges" ON public.exchanges;

-- Ensure RLS is enabled on the table.
ALTER TABLE public.exchanges ENABLE ROW LEVEL SECURITY;

-- Create policy for Admins to have unrestricted access.
CREATE POLICY "Allow admins full access"
ON public.exchanges
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Create policy for users to create exchanges.
-- Allows authenticated users to create exchanges for themselves.
-- Also allows anonymous users to create exchanges where user_id is NULL.
CREATE POLICY "Allow users to create exchanges"
ON public.exchanges
FOR INSERT
WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL AND auth.role() = 'anon'));

-- Create policy for viewing exchanges.
-- Allows authenticated users to see their own exchanges.
-- Allows ANYONE (including anonymous users) to see exchanges that do not have a user_id.
CREATE POLICY "Allow users to view their own or anonymous exchanges"
ON public.exchanges
FOR SELECT
USING ((auth.uid() = user_id) OR (user_id IS NULL));

-- Create policy for updating exchanges.
-- Only allows authenticated users to update an exchange they own.
CREATE POLICY "Allow users to update their own exchanges"
ON public.exchanges
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
