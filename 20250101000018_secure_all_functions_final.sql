/*
  # [FINAL SECURITY FIX] Secure All Functions
  This migration applies a secure search_path to all custom database functions to resolve the 'Function Search Path Mutable' security warning. This is a non-destructive operation.

  ## Query Description:
  This operation modifies the configuration of existing database functions (`is_admin`, `get_users_with_details`) to enhance security. It does not alter data or table structures. It is a safe and recommended change.

  ## Metadata:
  - Schema-Category: "Safe"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - Functions affected: `public.is_admin(uuid)`, `public.get_users_with_details()`

  ## Security Implications:
  - RLS Status: Unchanged
  - Policy Changes: No
  - Auth Requirements: None
  - Mitigates: 'Function Search Path Mutable' vulnerability.

  ## Performance Impact:
  - Indexes: None
  - Triggers: None
  - Estimated Impact: Negligible.
*/

ALTER FUNCTION public.is_admin(user_id uuid)
SET search_path = public;

ALTER FUNCTION public.get_users_with_details()
SET search_path = public;
