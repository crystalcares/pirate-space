/*
          # [Function Security Hardening]
          This migration sets a secure `search_path` for all custom database functions.

          ## Query Description: 
          This operation standardizes the execution context for all functions, ensuring they only search for tables and other objects within the `public` schema. This is a critical security and stability measure that prevents "search path hijacking" and ensures predictable behavior. It does not alter any data or table structures.

          ## Metadata:
          - Schema-Category: "Safe"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true (by altering the functions again)
          
          ## Structure Details:
          - Alters the configuration of existing functions:
            - is_admin
            - get_users_with_details
            - get_admin_exchanges
            - get_top_users_by_volume
            - get_exchange_details
            - get_user_exchanges
          
          ## Security Implications:
          - RLS Status: No change
          - Policy Changes: No
          - Auth Requirements: Admin privileges to alter functions.
          - Enhances security by mitigating search path vulnerabilities.
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Negligible. This is a configuration change.
          */

-- Set a secure search path for all custom functions to prevent potential vulnerabilities.
-- This ensures they operate only within the intended 'public' schema.

ALTER FUNCTION public.is_admin(p_user_id uuid) SET search_path = public;

ALTER FUNCTION public.get_users_with_details() SET search_path = public;

ALTER FUNCTION public.get_admin_exchanges() SET search_path = public;

ALTER FUNCTION public.get_top_users_by_volume() SET search_path = public;

ALTER FUNCTION public.get_exchange_details(p_exchange_id uuid) SET search_path = public;

ALTER FUNCTION public.get_user_exchanges() SET search_path = public;
