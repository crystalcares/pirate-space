/*
# [Security Enhancement] Secure Function Search Paths
This migration hardens the security of existing database functions by explicitly setting their `search_path`. This mitigates the "Function Search Path Mutable" security warning by preventing potential attackers from manipulating the function execution context.

## Query Description:
This operation alters existing functions to set a secure `search_path`. It does not modify the logic or data of the functions themselves. It is a safe, non-destructive security enhancement.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Alters `public.is_admin(uuid)`
- Alters `public.get_users_with_details()`

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: Admin privileges to alter functions.
- Fixes: Resolves the "Function Search Path Mutable" security advisory.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible performance impact.
*/

-- Secure the is_admin function by setting a non-mutable search path.
ALTER FUNCTION public.is_admin(user_id uuid)
SET search_path = "$user", public, extensions;

-- Secure the get_users_with_details function by setting a non-mutable search path.
ALTER FUNCTION public.get_users_with_details()
SET search_path = "$user", public, extensions;
