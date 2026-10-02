-- ==============================================================================
-- OMNIBEY / OMNIMAIL MASTER DATABASE SCHEMA
-- Production-Ready, Modular Architecture with RLS and Audit Logging
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. User Roles & Enums
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method_type AS ENUM ('binance', 'bkash', 'nagad', 'rocket', 'upay');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status_type AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE credit_transaction_type AS ENUM ('purchase', 'bonus', 'usage', 'refund', 'admin_adjustment');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE email_status_type AS ENUM ('active', 'expired', 'archived', 'deleted');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone_number TEXT,
  role user_role DEFAULT 'user' NOT NULL,
  credits INTEGER DEFAULT 50 NOT NULL CHECK (credits >= 0),
  google_account_email TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for profile queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 4. Email Providers Table (Pluggable: OmniBey, Gmail, Outlook, etc.)
CREATE TABLE IF NOT EXISTS public.email_providers (
  id TEXT PRIMARY KEY, -- 'omnibey', 'gmail', 'outlook'
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  is_default BOOLEAN DEFAULT FALSE NOT NULL,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

INSERT INTO public.email_providers (id, name, is_active, is_default, config)
VALUES ('omnibey', 'OmniBey Edge Provider', TRUE, TRUE, '{"domain": "mail.omnibey.com"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 5. Email Addresses (Generated Temporary Inboxes)
CREATE TABLE IF NOT EXISTS public.email_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Nullable for anonymous guests
  session_token TEXT, -- For guest tracking
  email_address TEXT UNIQUE NOT NULL,
  provider_id TEXT REFERENCES public.email_providers(id) DEFAULT 'omnibey' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status email_status_type DEFAULT 'active' NOT NULL,
  usage_count INTEGER DEFAULT 0 NOT NULL,
  message_count INTEGER DEFAULT 0 NOT NULL,
  last_message_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_email_addresses_user_id ON public.email_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_email_addresses_address ON public.email_addresses(email_address);
CREATE INDEX IF NOT EXISTS idx_email_addresses_expires_at ON public.email_addresses(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_addresses_session ON public.email_addresses(session_token);

-- 6. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mailbox_id UUID REFERENCES public.email_addresses(id) ON DELETE CASCADE NOT NULL,
  recipient TEXT NOT NULL,
  sender TEXT NOT NULL,
  sender_domain TEXT,
  subject TEXT DEFAULT '(No Subject)' NOT NULL,
  body_text TEXT,
  body_html TEXT,
  detected_otp TEXT,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  raw_headers JSONB DEFAULT '{}'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_messages_mailbox_id ON public.messages(mailbox_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient);
CREATE INDEX IF NOT EXISTS idx_messages_received_at ON public.messages(received_at DESC);

-- 7. Email Usage Sessions & History
CREATE TABLE IF NOT EXISTS public.email_usage_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  mailbox_id UUID REFERENCES public.email_addresses(id) ON DELETE CASCADE,
  user_reported_service TEXT, -- e.g. "Discord", "GitHub"
  observed_sender_domain TEXT, -- e.g. "discord.com"
  message_count INTEGER DEFAULT 0,
  otp_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_activity TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_usage_sessions_user_id ON public.email_usage_sessions(user_id);

-- 8. Email Events (Analytics & AI Telemetry)
CREATE TABLE IF NOT EXISTS public.email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  mailbox_id UUID REFERENCES public.email_addresses(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- email_created, email_copied, email_received, email_opened, otp_detected, email_expired, email_deleted
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_email_events_type ON public.email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_created_at ON public.email_events(created_at DESC);

-- 9. Credit Packages
CREATE TABLE IF NOT EXISTS public.credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  credits INTEGER NOT NULL,
  bonus_credits INTEGER DEFAULT 0 NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Seed Initial Packages
INSERT INTO public.credit_packages (name, price, currency, credits, bonus_credits, description, sort_order)
VALUES 
  ('Starter Box', 5.00, 'USD', 250, 25, 'Perfect for light personal testing and verifications', 1),
  ('Pro QA Pack', 15.00, 'USD', 1000, 150, 'Recommended for regular developers and QA engineers', 2),
  ('Enterprise Scale', 45.00, 'USD', 4000, 800, 'High volume package for automated suites and teams', 3)
ON CONFLICT DO NOTHING;

-- 10. Payments Table (Manual verification initially: Binance, bKash, Nagad, Rocket, Upay)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_reference TEXT UNIQUE NOT NULL, -- e.g. "PAY-10291"
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  package_id UUID REFERENCES public.credit_packages(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  payment_method payment_method_type NOT NULL,
  sender_identifier TEXT NOT NULL, -- REQUIRED: Phone number or Wallet ID
  transaction_id TEXT, -- OPTIONAL: Txn hash or SMS TxnID
  screenshot_path TEXT, -- OPTIONAL: Supabase Storage path
  status payment_status_type DEFAULT 'pending' NOT NULL,
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  reviewed_at TIMESTAMPTZ,
  idempotency_key TEXT UNIQUE,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(payment_reference);

-- Constraint: At least one of transaction_id OR screenshot_path must be present
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS chk_txn_or_screenshot;
ALTER TABLE public.payments ADD CONSTRAINT chk_txn_or_screenshot 
  CHECK (transaction_id IS NOT NULL OR screenshot_path IS NOT NULL);

-- 11. Credit Transactions (Immutable Ledger)
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- positive for credits added, negative for usage
  balance_after INTEGER NOT NULL,
  transaction_type credit_transaction_type NOT NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_payment_id ON public.credit_transactions(payment_id);

-- 12. Admin Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- payment_approved, payment_rejected, credit_adjusted, user_suspended, etc.
  target_type TEXT NOT NULL, -- payment, user, package, setting
  target_id TEXT NOT NULL,
  ip_address TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON public.audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- 13. Service Compatibility Intelligence
CREATE TABLE IF NOT EXISTS public.compatibility_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_domain TEXT NOT NULL, -- e.g. "discord.com", "openai.com"
  email_domain TEXT NOT NULL, -- e.g. "mail.omnibey.com"
  provider TEXT DEFAULT 'OmniBey' NOT NULL,
  total_tests INTEGER DEFAULT 0 NOT NULL,
  successful_tests INTEGER DEFAULT 0 NOT NULL,
  failed_tests INTEGER DEFAULT 0 NOT NULL,
  success_rate NUMERIC(5, 2) DEFAULT 100.00 NOT NULL,
  average_delivery_time NUMERIC(6, 2) DEFAULT 1.5, -- in seconds
  confidence TEXT DEFAULT 'Medium' NOT NULL, -- Low, Medium, High
  last_tested TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(service_domain, email_domain, provider)
);

CREATE INDEX IF NOT EXISTS idx_compatibility_service ON public.compatibility_summary(service_domain);

-- 14. Future API Tables (Ready for Phase 4)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  hashed_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  rate_limit_per_minute INTEGER DEFAULT 60 NOT NULL,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  latency_ms INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_usage_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compatibility_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Email Addresses Policies
CREATE POLICY "Users can view own email addresses"
  ON public.email_addresses FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL OR public.is_admin());

CREATE POLICY "Users can create email addresses"
  ON public.email_addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Messages Policies
CREATE POLICY "Users can view messages for their mailboxes"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.email_addresses ea
      WHERE ea.id = messages.mailbox_id
      AND (ea.user_id = auth.uid() OR ea.user_id IS NULL OR public.is_admin())
    )
  );

-- Payments Policies
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can create payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can update payments"
  ON public.payments FOR UPDATE
  USING (public.is_admin());

-- Credit Transactions Policies
CREATE POLICY "Users can view own credit transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Credit Packages Policies (Publicly readable)
CREATE POLICY "Anyone can view active credit packages"
  ON public.credit_packages FOR SELECT
  USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Admins can manage packages"
  ON public.credit_packages FOR ALL
  USING (public.is_admin());

-- Audit Logs Policies (Admins only)
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

-- Compatibility Summary (Publicly readable)
CREATE POLICY "Anyone can view compatibility summary"
  ON public.compatibility_summary FOR SELECT
  USING (TRUE);

-- ==============================================================================
-- ATOMIC TRANSACTION FUNCTIONS
-- ==============================================================================

-- 15. Approve Payment Idempotently & Credit User
CREATE OR REPLACE FUNCTION public.approve_payment_transaction(
  p_payment_id UUID,
  p_admin_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_payment RECORD;
  v_package RECORD;
  v_credits_to_add INTEGER;
  v_new_balance INTEGER;
  v_already_approved BOOLEAN;
BEGIN
  -- 1. Check if admin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_admin_id AND role = 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Admin role required');
  END IF;

  -- 2. Lock the payment row for update (prevents race conditions)
  SELECT * INTO v_payment 
  FROM public.payments 
  WHERE id = p_payment_id 
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment record not found');
  END IF;

  -- 3. Strict Idempotency Check: If already approved, exit cleanly without adding credits again!
  IF v_payment.status = 'approved' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Payment already approved previously', 'already_approved', true);
  END IF;

  IF v_payment.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment is not in pending status');
  END IF;

  -- 4. Get package credits
  SELECT * INTO v_package 
  FROM public.credit_packages 
  WHERE id = v_payment.package_id;

  IF NOT FOUND THEN
    v_credits_to_add := FLOOR(v_payment.amount * 50); -- Fallback: 50 credits per dollar
  ELSE
    v_credits_to_add := v_package.credits + v_package.bonus_credits;
  END IF;

  -- 5. Atomically update user profile credits
  UPDATE public.profiles
  SET credits = credits + v_credits_to_add,
      updated_at = NOW()
  WHERE id = v_payment.user_id
  RETURNING credits INTO v_new_balance;

  -- 6. Insert immutable credit transaction
  INSERT INTO public.credit_transactions (
    user_id,
    amount,
    balance_after,
    transaction_type,
    payment_id,
    description,
    metadata
  ) VALUES (
    v_payment.user_id,
    v_credits_to_add,
    v_new_balance,
    'purchase',
    p_payment_id,
    COALESCE(v_package.name, 'Manual Payment') || ' (' || v_payment.payment_reference || ')',
    jsonb_build_object('amount', v_payment.amount, 'method', v_payment.payment_method)
  );

  -- 7. Update payment status to approved
  UPDATE public.payments
  SET status = 'approved',
      reviewed_by = p_admin_id,
      reviewed_at = NOW(),
      screenshot_path = NULL -- Trigger storage release indication
  WHERE id = p_payment_id;

  -- 8. Record in Admin Audit Log
  INSERT INTO public.audit_logs (
    admin_id,
    action,
    target_type,
    target_id,
    metadata
  ) VALUES (
    p_admin_id,
    'payment_approved',
    'payment',
    p_payment_id::text,
    jsonb_build_object(
      'credits_added', v_credits_to_add,
      'payment_reference', v_payment.payment_reference,
      'user_id', v_payment.user_id
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'credits_added', v_credits_to_add,
    'new_balance', v_new_balance,
    'payment_reference', v_payment.payment_reference
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Trigger to automatically create profile on auth.users sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, credits)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'user',
    50 -- Default welcome credits
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
