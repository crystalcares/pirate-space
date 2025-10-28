/*
# [Fix Testimonials RLS Policies]
This migration corrects the Row Level Security (RLS) policies for the `testimonials` table to resolve an issue where admins could not add new testimonials due to schema cache errors.

## Query Description:
This script will:
1. Enable Row Level Security on the `testimonials` table if it's not already enabled.
2. Remove any existing, potentially incorrect, policies on the table to ensure a clean setup.
3. Create a new policy to allow public, anonymous read access to all testimonials. This is safe as testimonials are public content.
4. Create new policies to allow users with the 'admin' role to insert, update, and delete testimonials.
This ensures that the public can view testimonials, while only administrators can manage them, fixing the "column not found" error in the admin panel. No data will be lost, but access rules will be reset and redefined.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table affected: `public.testimonials`
- Operations: `ALTER TABLE`, `DROP POLICY`, `CREATE POLICY`

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes. All existing policies on `testimonials` will be replaced.
- Auth Requirements: Policies rely on the `is_admin(auth.uid())` function to check for admin privileges.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible. RLS policy checks have a very small overhead.
*/

-- 1. Enable RLS on the testimonials table
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Allow public read access" ON public.testimonials;
DROP POLICY IF EXISTS "Allow admin access" ON public.testimonials;
DROP POLICY IF EXISTS "Allow admin insert" ON public.testimonials;
DROP POLICY IF EXISTS "Allow admin update" ON public.testimonials;
DROP POLICY IF EXISTS "Allow admin delete" ON public.testimonials;

-- 3. Create policy for public read access
CREATE POLICY "Allow public read access"
ON public.testimonials
FOR SELECT
USING (true);

-- 4. Create policies for admin management
CREATE POLICY "Allow admin insert"
ON public.testimonials
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Allow admin update"
ON public.testimonials
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Allow admin delete"
ON public.testimonials
FOR DELETE
USING (is_admin(auth.uid()));
