/*
  # [Operation Name]
  Create payment_methods table

  ## Query Description: [This migration creates a new table `payment_methods` to store administrator payment details for receiving funds from users. It also enables Row Level Security and sets up policies to allow public read access while restricting write operations to administrators.]

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - Tables Added:
    - `public.payment_methods`: Stores payment method details.
      - `id`: UUID, Primary Key
      - `method`: TEXT, Not Null (e.g., 'PayPal', 'BTC')
      - `detail_type`: TEXT, Not Null (e.g., 'Email', 'Wallet Address')
      - `details`: TEXT, Not Null (e.g., 'admin@example.com', 'bc1q...')
      - `created_at`: TIMESTAMPTZ, default now()

  ## Security Implications:
  - RLS Status: Enabled on `payment_methods`
  - Policy Changes: Yes
    - `Allow public read access`: Allows any user to view payment methods.
    - `Allow admin full access`: Allows users with the 'admin' role to insert, update, and delete payment methods.
  - Auth Requirements: Admin role required for write operations.

  ## Performance Impact:
  - Indexes: Primary key index on `id`.
  - Triggers: None
  - Estimated Impact: Low. New table, no impact on existing queries until it's queried.
*/

-- 1. Create the payment_methods table
create table public.payment_methods (
    id uuid not null default gen_random_uuid(),
    method text not null,
    detail_type text not null,
    details text not null,
    created_at timestamptz not null default now(),
    primary key (id)
);

-- 2. Enable Row Level Security
alter table public.payment_methods enable row level security;

-- 3. Create RLS policies
-- Allow public read access
create policy "Allow public read access"
on public.payment_methods
for select
using (true);

-- Allow admin users to manage payment methods
create policy "Allow admin full access"
on public.payment_methods
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));
