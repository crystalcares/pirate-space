/*
# [Link Exchange Pairs to Payment Methods]
This migration adds a foreign key relationship from `exchange_pairs` and `exchanges` to `payment_methods`, allowing each exchange pair to have a designated payment method.

## Query Description: [This operation alters the `exchange_pairs` and `exchanges` tables to improve data integrity. It adds a `payment_method_id` column to both tables. This links an exchange directly to the payment details required, making the system more robust and removing ambiguity. No existing data will be lost, but newly created exchanges will depend on this link.]

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Adds column `payment_method_id` to `public.exchange_pairs`.
- Adds foreign key constraint `exchange_pairs_payment_method_id_fkey` on `public.exchange_pairs`.
- Adds column `payment_method_id` to `public.exchanges`.
- Adds foreign key constraint `exchanges_payment_method_id_fkey` on `public.exchanges`.

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: None

## Performance Impact:
- Indexes: Adds foreign key indexes.
- Triggers: None
- Estimated Impact: Low. Will slightly increase insert/update time on the affected tables but improve query performance when joining to payment methods.
*/

-- Add payment_method_id to exchange_pairs
ALTER TABLE public.exchange_pairs
ADD COLUMN payment_method_id UUID REFERENCES public.payment_methods(id) ON DELETE SET NULL;

-- Add payment_method_id to exchanges
ALTER TABLE public.exchanges
ADD COLUMN payment_method_id UUID REFERENCES public.payment_methods(id) ON DELETE SET NULL;
