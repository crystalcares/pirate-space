/*
# [Fix] Recreate is_admin function and dependent policies
This migration script safely updates the `is_admin` function by temporarily dropping and then recreating the Row Level Security (RLS) policies that depend on it. This is necessary to modify the function's definition to include a secure `search_path`, resolving the "Function Search Path Mutable" security warning.

## Query Description:
This operation performs the following steps in a single transaction:
1. Drops all RLS policies that rely on the `is_admin` function.
2. Drops the old `is_admin` function.
3. Creates a new, secure version of the `is_admin` function with a fixed `search_path`.
4. Recreates all the previously dropped RLS policies to restore the application's security model.
This process ensures that the admin-only tables remain protected throughout the update.

## Metadata:
- Schema-Category: ["Structural", "Security"]
- Impact-Level: "High"
- Requires-Backup: true
- Reversible: false

## Structure Details:
- **Function Dropped:** `public.is_admin(uuid)`
- **Function Created:** `public.is_admin(uuid)` (with `SET search_path`)
- **Policies Dropped & Re-created:**
  - `Admins can manage roles.` on `roles`
  - `Admins can manage user_roles.` on `user_roles`
  - `Admins can manage app config.` on `app_config`
  - `Admins can manage exchange pairs.` on `exchange_pairs`
  - `Admins can manage features` on `features`
  - `Admins can manage steps` on `how_it_works_steps`
  - `Admins can manage faqs` on `faq_items`
  - `Allow admin full access` on `exchanges`

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes (Policies are dropped and immediately recreated)
- Auth Requirements: This script modifies functions and policies that are core to the application's authorization logic.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Low. The operation is very fast and only affects schema, not data.
*/

-- Step 1: Drop dependent policies
DROP POLICY "Admins can manage roles." ON public.roles;
DROP POLICY "Admins can manage user_roles." ON public.user_roles;
DROP POLICY "Admins can manage app config." ON public.app_config;
DROP POLICY "Admins can manage exchange pairs." ON public.exchange_pairs;
DROP POLICY "Admins can manage features" ON public.features;
DROP POLICY "Admins can manage steps" ON public.how_it_works_steps;
DROP POLICY "Admins can manage faqs" ON public.faq_items;
DROP POLICY "Allow admin full access" ON public.exchanges;

-- Step 2: Drop the old function
DROP FUNCTION public.is_admin(user_id uuid);

-- Step 3: Create the new, secure function
CREATE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = is_admin.user_id AND r.name = 'admin'
  );
END;
$$;

-- Step 4: Re-create the policies
CREATE POLICY "Admins can manage roles." ON public.roles FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage user_roles." ON public.user_roles FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage app config." ON public.app_config FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage exchange pairs." ON public.exchange_pairs FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage features" ON public.features FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage steps" ON public.how_it_works_steps FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage faqs" ON public.faq_items FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Allow admin full access" ON public.exchanges FOR ALL USING (public.is_admin(auth.uid()));
