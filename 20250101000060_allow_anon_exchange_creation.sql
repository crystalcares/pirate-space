/*
          # [Allow Anonymous Exchange Creation]
          This migration adds a Row Level Security (RLS) policy to the `exchanges` table to allow anonymous (guest) users to create new exchange records. This is the final step required to make the "Exchange" and "Buy/Sell" buttons fully functional for all users, as it permits the initial transaction to be inserted into the database without requiring a user to be logged in.

          ## Query Description: [This operation grants `INSERT` permissions on the `exchanges` table to the `anon` role. It is a necessary change for the public-facing exchange functionality to work as intended. The policy does not grant read, update, or delete permissions, maintaining security over existing data.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          - Table: `public.exchanges`
          - Policy Added: `Allow anonymous users to create exchanges`
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes, INSERT policy added for `anon` role.]
          - Auth Requirements: [None for creating an exchange.]
          
          ## Performance Impact:
          - Indexes: [Not Affected]
          - Triggers: [Not Affected]
          - Estimated Impact: [Negligible performance impact.]
          */
-- Enable RLS on the table if it's not already enabled
ALTER TABLE public.exchanges ENABLE ROW LEVEL SECURITY;

-- Create the policy to allow anonymous users to insert into the exchanges table
CREATE POLICY "Allow anonymous users to create exchanges"
ON public.exchanges
FOR INSERT
TO anon
WITH CHECK (true);
