/*
  # [SECURITY] Secure All Function Search Paths
  [This migration hardens all existing database functions by setting a non-mutable `search_path`. This mitigates the risk of search path hijacking attacks, as flagged by the Supabase security advisor, and resolves the "Function Search Path Mutable" warning.]

  ## Query Description: [This operation alters the configuration of existing functions (`is_admin`, `get_users_with_details`) to set a fixed `search_path` to `public`. It is a non-destructive security enhancement that does not change function logic or affect any data. This is the final and safe method to apply this security setting.]
  
  ## Metadata:
  - Schema-Category: ["Security", "Structural"]
  - Impact-Level: ["Low"]
  - Requires-Backup: false
  - Reversible: true
  
  ## Structure Details:
  - Functions affected: `is_admin(uuid)`, `get_users_with_details()`
  
  ## Security Implications:
  - RLS Status: [No Change]
  - Policy Changes: [No]
  - Auth Requirements: [None]
  
  ## Performance Impact:
  - Indexes: [None]
  - Triggers: [None]
  - Estimated Impact: [Negligible. This is a metadata change to function configuration.]
*/

ALTER FUNCTION public.is_admin(user_id uuid) SET search_path = public;

ALTER FUNCTION public.get_users_with_details() SET search_path = public;
