/*
          # [Structural] Create tables for dynamic content
          [This migration creates new tables to store the content for the Features, How It Works, and FAQ sections of the landing page. It also seeds these tables with the current hardcoded content.]

          ## Query Description: [This operation creates three new tables: `features`, `how_it_works_steps`, and `faq_items`. It enables Row Level Security on them and sets policies to allow public read access and full admin access. It is a non-destructive operation but essential for the new dynamic content feature.]
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Tables Added: `public.features`, `public.how_it_works_steps`, `public.faq_items`
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes (New policies for new tables)
          - Auth Requirements: Admin role required for write operations.
          
          ## Performance Impact:
          - Indexes: Primary key indexes added automatically.
          - Triggers: None
          - Estimated Impact: Negligible performance impact.
          */

-- Features Table
CREATE TABLE public.features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "order" INT NOT NULL DEFAULT 0,
    icon TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read features" ON public.features FOR SELECT USING (true);
CREATE POLICY "Admins can manage features" ON public.features FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- How It Works Steps Table
CREATE TABLE public.how_it_works_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "order" INT NOT NULL DEFAULT 0,
    icon TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.how_it_works_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read steps" ON public.how_it_works_steps FOR SELECT USING (true);
CREATE POLICY "Admins can manage steps" ON public.how_it_works_steps FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- FAQ Items Table
CREATE TABLE public.faq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "order" INT NOT NULL DEFAULT 0,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read faqs" ON public.faq_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage faqs" ON public.faq_items FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));


-- Seed initial data
INSERT INTO public.features ("order", icon, title, description) VALUES
(1, 'Zap', 'Fast Transactions', 'Our ticket-based system ensures your trades are processed swiftly by verified exchangers.'),
(2, 'ShieldCheck', 'Verified & Secure', 'Trade with confidence. All exchangers are vetted, and every transaction is monitored for safety.'),
(3, 'Globe', 'Global Access', 'Exchange between PayPal, INR, and Crypto from anywhere in the world, anytime.');

INSERT INTO public.how_it_works_steps ("order", icon, title, description) VALUES
(1, 'LogIn', 'Join the Discord', 'Become a part of our growing community to get started.'),
(2, 'Ticket', 'Create an Exchange Ticket', 'Open a ticket specifying your trade requirements.'),
(3, 'Users', 'Verified Exchanger Joins', 'A trusted exchanger will be assigned to handle your trade.'),
(4, 'CheckCircle', 'Trade Completed', 'Finalize your trade securely and receive your funds.');

INSERT INTO public.faq_items ("order", question, answer) VALUES
(1, 'What is Pirate.Exchange?', 'Pirate.Exchange is a secure, human-based digital exchange that operates on Discord. We facilitate P2P (peer-to-peer) trades between PayPal, INR, and various cryptocurrencies through a verified ticket system.'),
(2, 'Is it safe to trade here?', 'Absolutely. Safety is our top priority. All exchangers are thoroughly vetted, and our support team monitors transactions to ensure a secure trading environment for all users.'),
(3, 'What are the fees?', 'We pride ourselves on transparency. Our fee structure is minimal and competitive. You will be informed of any applicable fees by the exchanger before you commit to a trade.'),
(4, 'How long does a typical trade take?', 'Most trades are completed within minutes. The duration depends on the payment method and the responsiveness of both parties, but our system is designed for speed and efficiency.'),
(5, 'What payment methods are supported?', 'We primarily support PayPal, INR (via UPI, Bank Transfer), and a wide range of popular cryptocurrencies. Our list of supported methods is constantly expanding based on community feedback.');
