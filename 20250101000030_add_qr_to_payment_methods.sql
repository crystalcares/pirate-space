/*
# [Feature] Add QR Code URL to Payment Methods
This migration adds a new column `qr_code_url` to the `payment_methods` table to store an optional URL for a QR code image, allowing users to scan for payment.

## Query Description:
- This is a non-destructive `ALTER TABLE` operation that adds a new nullable column.
- Existing data will not be affected. The `qr_code_url` for existing payment methods will be `NULL`.
- No data loss is expected.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (The column can be dropped)

## Structure Details:
- Table Modified: `public.payment_methods`
- Column Added: `qr_code_url` (Type: `TEXT`, Nullable: `true`)

## Security Implications:
- RLS Status: Unchanged.
- Policy Changes: No.
- Auth Requirements: Admin privileges required to run `ALTER TABLE`.

## Performance Impact:
- Indexes: None added.
- Triggers: None added.
- Estimated Impact: Negligible performance impact on read/write operations.
*/
ALTER TABLE public.payment_methods
ADD COLUMN qr_code_url TEXT;
