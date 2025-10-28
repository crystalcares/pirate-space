/*
# [Feature] Add Recipient Wallet Address to Exchanges
This migration adds a `recipient_wallet_address` column to the `exchanges` table to store the user's destination wallet address for receiving cryptocurrency.

## Query Description:
This operation adds a new `TEXT` column named `recipient_wallet_address` to the `public.exchanges` table. This column is nullable as some exchange types might not require it, although it will be essential for most P2P and fiat-to-crypto transactions. Existing RLS policies for users and admins on the `exchanges` table will automatically apply to this new column, ensuring data security is maintained.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table Modified: `public.exchanges`
- Column Added: `recipient_wallet_address` (TEXT, NULL)

## Security Implications:
- RLS Status: Enabled
- Policy Changes: No
- Auth Requirements: Existing policies for `exchanges` table will cover this new column. Users can insert and view their own data; admins have full access.

## Performance Impact:
- Indexes: None added.
- Triggers: None added.
- Estimated Impact: Negligible. Adding a nullable column to an existing table is a fast metadata-only change in PostgreSQL.
*/

ALTER TABLE public.exchanges
ADD COLUMN recipient_wallet_address TEXT;

COMMENT ON COLUMN public.exchanges.recipient_wallet_address IS 'The destination wallet address provided by the user for receiving the crypto.';
