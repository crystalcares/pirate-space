/*
          # [Fix Duplicate Policy and Harden Security]
          This migration script resolves a "policy already exists" error and hardens database security.

          ## Query Description: [This script performs two main actions:
          1. It safely recreates the security policy that allows anonymous users to create exchanges, preventing duplicate policy errors.
          2. It secures all existing database functions by setting a fixed `search_path`, resolving the "Function Search Path Mutable" security warnings.]
          
          ## Metadata:
          - Schema-Category: ["Structural", "Safe"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          - Affects policy: "Allow anonymous users to create exchanges" on table `exchanges`.
          - Affects functions: `get_admin_exchanges`, `get_exchange_details`, `get_top_users_by_volume`, `get_user_exchanges`, `get_users_with_details`, `is_admin`.
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes]
          - Auth Requirements: [None]
          
          ## Performance Impact:
          - Indexes: [None]
          - Triggers: [None]
          - Estimated Impact: [Low. Function and policy definitions are updated.]
          */

-- Safely drop and recreate the policy to allow anonymous users to create exchanges
DROP POLICY IF EXISTS "Allow anonymous users to create exchanges" ON public.exchanges;
CREATE POLICY "Allow anonymous users to create exchanges"
ON public.exchanges
FOR INSERT
TO anon
WITH CHECK (true);

-- Harden all database functions by setting a secure search_path

CREATE OR REPLACE FUNCTION public.get_admin_exchanges()
RETURNS TABLE(id uuid, created_at timestamp with time zone, exchange_id text, from_currency text, to_currency text, send_amount numeric, receive_amount numeric, fee_amount numeric, fee_details text, status text, recipient_wallet_address text, user_id uuid, username text, email text, avatar_url text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.created_at,
        e.exchange_id,
        e.from_currency,
        e.to_currency,
        e.send_amount,
        e.receive_amount,
        e.fee_amount,
        e.fee_details,
        e.status,
        e.recipient_wallet_address,
        e.user_id,
        p.username,
        u.email,
        p.avatar_url
    FROM
        public.exchanges e
    LEFT JOIN
        auth.users u ON e.user_id = u.id
    LEFT JOIN
        public.profiles p ON e.user_id = p.id
    ORDER BY
        e.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_exchange_details(p_exchange_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    exchange_data json;
    payment_data json;
BEGIN
    SELECT row_to_json(e)
    INTO exchange_data
    FROM public.exchanges e
    WHERE e.id = p_exchange_id;

    SELECT row_to_json(pm)
    INTO payment_data
    FROM public.payment_methods pm
    JOIN public.exchanges e ON pm.id = e.payment_method_id
    WHERE e.id = p_exchange_id;

    RETURN json_build_object(
        'exchange_data', exchange_data,
        'payment_data', payment_data
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_top_users_by_volume()
RETURNS TABLE(user_id uuid, username text, avatar_url text, total_volume numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.user_id,
    p.username,
    p.avatar_url,
    sum(e.send_amount) AS total_volume
  FROM public.exchanges e
  JOIN public.profiles p ON e.user_id = p.id
  WHERE e.status = 'completed' AND e.user_id IS NOT NULL
  GROUP BY e.user_id, p.username, p.avatar_url
  ORDER BY total_volume DESC
  LIMIT 10;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_exchanges()
RETURNS json[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  requesting_user_id UUID := auth.uid();
BEGIN
  RETURN ARRAY(
    SELECT row_to_json(t)
    FROM (
      SELECT *
      FROM public.exchanges
      WHERE user_id = requesting_user_id
      ORDER BY created_at DESC
    ) t
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_users_with_details()
RETURNS TABLE(id uuid, username text, email text, avatar_url text, created_at timestamp with time zone, roles json)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can access this data';
  END IF;
  
  RETURN QUERY
  SELECT
    p.id,
    p.username,
    u.email,
    p.avatar_url,
    u.created_at,
    (
      SELECT json_agg(json_build_object('name', r.name))
      FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = p.id
    ) as roles
  FROM public.profiles p
  JOIN auth.users u ON p.id = u.id;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid)
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
    WHERE ur.user_id = p_user_id AND r.name = 'admin'
  );
END;
$$;
