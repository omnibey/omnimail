-- ==============================================================================
-- OmniBey / OmniMail - PostgreSQL Supabase Database Schema
-- Production Schema with Row Level Security (RLS), Indexes, and Auto-Cleanup
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DOMAINS TABLE
-- Stores valid receiving domains managed under Cloudflare & OmniBey
CREATE TABLE IF NOT EXISTS public.domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default domains
INSERT INTO public.domains (domain_name, is_active, is_premium)
VALUES 
    ('omnibey.com', TRUE, FALSE),
    ('mail.omnibey.com', TRUE, FALSE),
    ('omnimail.app', TRUE, TRUE)
ON CONFLICT (domain_name) DO NOTHING;

-- 2. MAILBOXES TABLE
-- Supports both Anonymous (session_token) and Registered Users (user_id)
CREATE TABLE IF NOT EXISTS public.mailboxes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address TEXT NOT NULL UNIQUE,
    local_part TEXT NOT NULL,
    domain TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_custom BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_mailboxes_address ON public.mailboxes (LOWER(address));
CREATE INDEX IF NOT EXISTS idx_mailboxes_session_token ON public.mailboxes (session_token);
CREATE INDEX IF NOT EXISTS idx_mailboxes_user_id ON public.mailboxes (user_id);
CREATE INDEX IF NOT EXISTS idx_mailboxes_expires_at ON public.mailboxes (expires_at);

-- 3. MESSAGES TABLE
-- Inbound emails parsed and stored securely
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mailbox_id UUID NOT NULL REFERENCES public.mailboxes(id) ON DELETE CASCADE,
    recipient TEXT NOT NULL,
    sender TEXT NOT NULL,
    sender_name TEXT,
    subject TEXT NOT NULL DEFAULT '(No Subject)',
    snippet TEXT,
    body_html TEXT,
    body_text TEXT,
    raw_eml_path TEXT,
    spf_status TEXT DEFAULT 'neutral',
    dkim_status TEXT DEFAULT 'neutral',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    is_starred BOOLEAN NOT NULL DEFAULT FALSE,
    size_bytes INTEGER DEFAULT 0,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Indexes for mailbox message retrieval
CREATE INDEX IF NOT EXISTS idx_messages_mailbox_id ON public.messages (mailbox_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages (LOWER(recipient));
CREATE INDEX IF NOT EXISTS idx_messages_received_at ON public.messages (received_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_expires_at ON public.messages (expires_at);

-- 4. ATTACHMENTS TABLE
-- References files stored in Supabase Storage bucket
CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'application/octet-stream',
    size_bytes INTEGER NOT NULL DEFAULT 0,
    storage_path TEXT NOT NULL,
    content_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attachments_message_id ON public.attachments (message_id);

-- 5. API KEYS TABLE (For future developer integrations)
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    prefix TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys (user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys (key_hash);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mailboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- DOMAINS: Anyone can view active domains to generate mailboxes
CREATE POLICY "Public read active domains"
    ON public.domains FOR SELECT
    USING (is_active = TRUE);

-- MAILBOXES POLICIES:
-- 1. Anonymous users can select their mailboxes matching session_token
CREATE POLICY "Anonymous access mailbox by session_token"
    ON public.mailboxes FOR SELECT
    USING (session_token IS NOT NULL AND session_token = current_setting('request.headers', true)::json->>'x-session-token');

-- 2. Authenticated users can view and manage their own mailboxes
CREATE POLICY "Users can manage own mailboxes"
    ON public.mailboxes FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. Anonymous users can create mailboxes with session_token
CREATE POLICY "Anonymous can create mailbox"
    ON public.mailboxes FOR INSERT
    WITH CHECK (session_token IS NOT NULL OR auth.uid() IS NOT NULL);

-- MESSAGES POLICIES:
-- 1. Read messages if user owns the mailbox or matches session token
CREATE POLICY "Access messages via mailbox ownership or session"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.mailboxes m
            WHERE m.id = messages.mailbox_id
            AND (
                (m.user_id IS NOT NULL AND m.user_id = auth.uid())
                OR
                (m.session_token IS NOT NULL AND m.session_token = current_setting('request.headers', true)::json->>'x-session-token')
            )
        )
    );

-- 2. Update message (mark as read / starred)
CREATE POLICY "Update own message"
    ON public.messages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.mailboxes m
            WHERE m.id = messages.mailbox_id
            AND (
                (m.user_id IS NOT NULL AND m.user_id = auth.uid())
                OR
                (m.session_token IS NOT NULL AND m.session_token = current_setting('request.headers', true)::json->>'x-session-token')
            )
        )
    );

-- 3. Delete message
CREATE POLICY "Delete own message"
    ON public.messages FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.mailboxes m
            WHERE m.id = messages.mailbox_id
            AND (
                (m.user_id IS NOT NULL AND m.user_id = auth.uid())
                OR
                (m.session_token IS NOT NULL AND m.session_token = current_setting('request.headers', true)::json->>'x-session-token')
            )
        )
    );

-- ATTACHMENTS POLICIES:
CREATE POLICY "Access attachments via message ownership"
    ON public.attachments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.messages msg
            JOIN public.mailboxes m ON m.id = msg.mailbox_id
            WHERE msg.id = attachments.message_id
            AND (
                (m.user_id IS NOT NULL AND m.user_id = auth.uid())
                OR
                (m.session_token IS NOT NULL AND m.session_token = current_setting('request.headers', true)::json->>'x-session-token')
            )
        )
    );

-- API KEYS POLICIES:
CREATE POLICY "Users can manage own api keys"
    ON public.api_keys FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC CLEANUP FUNCTION
-- Purges expired mailboxes, messages, and associated attachments
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.purge_expired_records()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_messages_count INT;
    deleted_mailboxes_count INT;
BEGIN
    -- Delete messages expired
    DELETE FROM public.messages
    WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_messages_count = ROW_COUNT;

    -- Delete mailboxes expired
    DELETE FROM public.mailboxes
    WHERE expires_at < NOW() AND is_active = TRUE;
    GET DIAGNOSTICS deleted_mailboxes_count = ROW_COUNT;

    RETURN jsonb_build_object(
        'deleted_messages', deleted_messages_count,
        'deleted_mailboxes', deleted_mailboxes_count,
        'cleaned_at', NOW()
    );
END;
$$;
