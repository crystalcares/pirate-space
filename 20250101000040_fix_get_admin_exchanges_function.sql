/*
# [Function Fix] `get_admin_exchanges`
Fixes the `get_admin_exchanges` function to correctly fetch user emails.

## Query Description: [This operation modifies the `get_admin_exchanges` function to join with the `auth.users` table. The previous version incorrectly tried to select the `email` column from the `profiles` table, which caused an error. This change ensures that user emails are correctly retrieved from the authentication schema, aligning it with other data-fetching functions in the application. No data is at risk.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Modifies function: `public.get_admin_exchanges()`

## Security Implications:
- RLS Status: [N/A]
- Policy Changes: [No]
- Auth Requirements: [The function remains protected and can only be executed by users with the 'admin' role.]

## Performance Impact:
- Indexes: [N/A]
- Triggers: [N/A]
- Estimated Impact: [Negligible. Adds one `LEFT JOIN` on an indexed column (`id`).]
*/

create or replace function public.get_admin_exchanges()
returns table (
    id uuid,
    created_at timestamptz,
    exchange_id text,
    from_currency text,
    to_currency text,
    send_amount numeric,
    receive_amount numeric,
    fee_amount numeric,
    fee_details text,
    status text,
    user_id uuid,
    username text,
    email text,
    avatar_url text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin(auth.uid()) then
    raise exception 'Admin privileges required';
  end if;

  return query
  select
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
    e.user_id,
    p.username,
    u.email, -- Correctly fetch email from auth.users
    p.avatar_url
  from
    exchanges as e
    left join profiles as p on e.user_id = p.id
    left join auth.users as u on e.user_id = u.id -- Join with auth.users
  order by
    e.created_at desc;
end;
$$;
