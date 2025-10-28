/*
          # [Operation Name]
          Secure Function Search Paths

          ## Query Description: This operation secures the recently created database functions by explicitly setting their `search_path`. This prevents potential security vulnerabilities where a malicious user could temporarily create objects (like tables or functions) in a different schema to intercept data. It follows security best practices and resolves the "Function Search Path Mutable" warning.

          ## Metadata:
          - Schema-Category: "Security"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Security Implications:
          - RLS Status: Not Applicable
          - Policy Changes: No
          - Auth Requirements: None
          */
ALTER FUNCTION public.get_admin_exchanges() SET search_path = 'public';
ALTER FUNCTION public.get_user_exchanges() SET search_path = 'public';
ALTER FUNCTION public.get_exchange_details(uuid) SET search_path = 'public';
