/*
# [Operation Name]
Recreate is_admin function and dependent policies

## Query Description:
This script addresses a migration failure by safely recreating the `is_admin` function. It first removes all Row Level Security (RLS) policies that depend on the function, then drops and recreates the function with a secure definition (`SECURITY DEFINER` and a fixed `search_path`). Finally, it reinstates all the RLS policies to ensure the application's security model remains intact. This is a critical structural change but is designed to be non-destructive to data.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "High"
- Requires-Backup: true
- Reversible: false

## Structure Details:
- Drops and recreates the function: `public.is_admin(uuid)`
- Drops and recreates policies on tables: `roles`, `user_roles`, `app_config`, `exchange_pairs`, `features`, `how_it_works_steps`, `faq_items`, `exchanges`, `payment_methods`

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes (recreation of multiple policies)
- Auth Requirements: This operation strengthens RLS by making the core `is_admin` function more secure.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible performance impact after migration.
*/

-- Step 1: Drop all dependent policies from the error message
DROP POLICY IF EXISTS "Admins can manage roles." ON public.roles;
DROP POLICY IF EXISTS "Admins can manage user_roles." ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage app config." ON public.app_config;
DROP POLICY IF EXISTS "Admins can manage exchange pairs." ON public.exchange_pairs;
DROP POLICY IF EXISTS "Admins can manage features" ON public.features;
DROP POLICY IF EXISTS "Admins can manage steps" ON public.how_it_works_steps;
DROP POLICY IF EXISTS "Admins can manage faqs" ON public.faq_items;
DROP POLICY IF EXISTS "Allow admin full access" ON public.exchanges;
DROP POLICY IF EXISTS "Allow admin full access" ON public.payment_methods;

-- Also drop other policies on these tables that might exist to ensure a clean slate
DROP POLICY IF EXISTS "Users can view roles." ON public.roles;
DROP POLICY IF EXISTS "Users can view their own roles." ON public.user_roles;
DROP POLICY IF EXISTS "Public can read all" ON public.app_config;
DROP POLICY IF EXISTS "Public can read all" ON public.exchange_pairs;
DROP POLICY IF EXISTS "Public can read all" ON public.features;
DROP POLICY IF EXISTS "Public can read all" ON public.how_it_works_steps;
DROP POLICY IF EXISTS "Public can read all" ON public.faq_items;
DROP POLICY IF EXISTS "Public can read all" ON public.exchanges;


-- Step 2: Drop the problematic function
DROP FUNCTION IF EXISTS public.is_admin(user_id uuid);


-- Step 3: Recreate the function with a secure definition
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = is_admin.user_id AND r.name = 'admin'
  );
$$;

-- Grant execute permissions on the new function
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;


-- Step 4: Recreate all the necessary policies
-- App Config
CREATE POLICY "Admins can manage app config." ON public.app_config FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Public can read all" ON public.app_config FOR SELECT
  USING (true);

-- Exchange Pairs
CREATE POLICY "Admins can manage exchange pairs." ON public.exchange_pairs FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Public can read all" ON public.exchange_pairs FOR SELECT
  USING (true);

-- Features
CREATE POLICY "Admins can manage features" ON public.features FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Public can read all" ON public.features FOR SELECT
  USING (true);

-- How It Works Steps
CREATE POLICY "Admins can manage steps" ON public.how_it_works_steps FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Public can read all" ON public.how_it_works_steps FOR SELECT
  USING (true);

-- FAQ Items
CREATE POLICY "Admins can manage faqs" ON public.faq_items FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Public can read all" ON public.faq_items FOR SELECT
  USING (true);

-- Exchanges
CREATE POLICY "Allow admin full access" ON public.exchanges FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Public can read all" ON public.exchanges FOR SELECT
  USING (true);
  
-- Payment Methods
CREATE POLICY "Allow admin full access" ON public.payment_methods FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Roles
CREATE POLICY "Admins can manage roles." ON public.roles FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Users can view roles." ON public.roles FOR SELECT
  USING (true);

-- User Roles
CREATE POLICY "Admins can manage user_roles." ON public.user_roles FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Users can view their own roles." ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);
