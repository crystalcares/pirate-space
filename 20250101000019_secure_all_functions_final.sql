/*
# [Security Hardening] Final Function Security Patch
This migration applies a security patch to all known custom database functions to resolve the "Function Search Path Mutable" warning. It explicitly sets the `search_path` for each function, preventing potential hijacking attacks where a malicious user could create objects in other schemas to alter function behavior.

## Query Description: 
This operation alters existing function configurations. It is a non-destructive, safe change that only modifies function metadata. There is no risk to existing data.

## Metadata:
- Schema-Category: ["Safe", "Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: true (by altering the function again to remove the setting)

## Structure Details:
- Modifies `is_admin(uuid)` function.
- Modifies `get_users_with_details()` function.
- Modifies `handle_new_user()` function.

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: Admin privileges to alter functions.
- Mitigates: "Function Search Path Mutable" security warning.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible performance impact.
*/

-- Secure the is_admin function
ALTER FUNCTION public.is_admin(user_id uuid)
SET search_path = 'public';

-- Secure the get_users_with_details function
ALTER FUNCTION public.get_users_with_details()
SET search_path = 'public';

-- Secure the handle_new_user trigger function
ALTER FUNCTION public.handle_new_user()
SET search_path = 'public';
