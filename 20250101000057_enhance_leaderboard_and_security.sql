/*
# [Enhance Leaderboard and Harden Function Security]
This migration enhances the "Featured Exchangers" functionality by linking it to user profiles and improves database security by setting a fixed search_path for all functions.

## Query Description:
- **Leaderboard Enhancement**: Adds a `user_id` column to the `top_traders` table. This allows you to feature registered users on the leaderboard directly, pulling their name and avatar automatically. This is a non-destructive change and will not affect existing manually-added exchangers.
- **Security Hardening**: Addresses the "Function Search Path Mutable" security advisory by explicitly setting the `search_path` for all custom database functions. This prevents potential vectors for unauthorized schema access and is a recommended security best practice.

## Metadata:
- Schema-Category: ["Structural", "Safe"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: true

## Structure Details:
- **Table Modified**: `public.top_traders`
  - **Column Added**: `user_id` (UUID, nullable, FK to `public.profiles.id`)
- **Functions Modified**:
  - `get_admin_exchanges()`
  - `get_exchange_details(uuid)`
  - `get_top_users_by_volume()`
  - `get_user_exchanges()`
  - `get_users_with_details()`
  - `is_admin(uuid)`

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: Admin privileges to run ALTER statements.
- This migration *improves* security by hardening database functions against search path hijacking attacks.

## Performance Impact:
- Indexes: A foreign key index will be automatically created on `top_traders.user_id`.
- Triggers: None
- Estimated Impact: Negligible performance impact.
*/

-- Add user_id to top_traders to link to profiles
ALTER TABLE public.top_traders
ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.top_traders.user_id IS 'Link to the user profile if the featured exchanger is a registered user.';


-- Harden functions by setting a secure search_path
-- This addresses the "Function Search Path Mutable" security warning.
ALTER FUNCTION public.get_admin_exchanges() SET search_path = 'public';
ALTER FUNCTION public.get_exchange_details(p_exchange_id uuid) SET search_path = 'public';
ALTER FUNCTION public.get_top_users_by_volume() SET search_path = 'public';
ALTER FUNCTION public.get_user_exchanges() SET search_path = 'public';
ALTER FUNCTION public.get_users_with_details() SET search_path = 'public';
ALTER FUNCTION public.is_admin(p_user_id uuid) SET search_path = 'public';
