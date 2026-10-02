# OmniBey — OmniMail Platform

> **Main Domain:** [omnibey.com](https://omnibey.com)  
> **Product:** OmniMail — Temporary Email by OmniBey  
> **Status:** Production-Ready MVP &bull; Low-Cost &bull; Scalable &bull; Modular  

---

## 1. Executive Summary & Architecture Overview

**OmniBey** is a modular SaaS platform hosting **OmniMail**, an ultra-fast, zero-retention temporary disposable email service.

The architecture is specifically engineered to be:
- **Low-Cost:** Ingestion runs at the edge using Cloudflare Email Workers (no expensive SMTP servers or long-running daemon pools).
- **High-Performance:** Sub-100ms edge routing, server-rendered Next.js App Router, and lightweight JSON payloads.
- **Enterprise-Grade Security:** Strict HTML sandboxing, URI neutralization, script stripping, and PostgreSQL Row Level Security (RLS).
- **Zero-Retention Guarantee:** Automated database functions purge expired mailboxes, messages, and attachments on schedule.
- **Modular Multi-Provider Design:** Clean provider interface (`MailProvider`) ready to connect **Gmail API**, **Microsoft Outlook / Graph API**, and **AI Summarization** without altering core user tables or ingestion endpoints.

```
+-----------------------------------------------------------------------------------+
|                                  INBOUND EMAIL                                    |
|                      Sender sends to: user@omnibey.com                            |
+----------------------------------------+------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                            CLOUDFLARE EMAIL EDGE                                  |
|   1. Catches *@omnibey.com                                                        |
|   2. Validates SPF & DKIM signatures                                              |
|   3. Executes cloudflare/worker.js                                                |
|   4. Dispatches authenticated POST payload to OmniBey Webhook                     |
+----------------------------------------+------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                        NEXT.JS INGESTION ROUTE                                    |
|   1. Route: /api/email/ingest                                                     |
|   2. Verifies INGESTION_WEBHOOK_SECRET                                            |
|   3. Normalizes payload via CloudflareEmailProvider (MailProvider interface)      |
|   4. Checks recipient mailbox status & expiry                                     |
|   5. Sanitizes HTML (strips malicious scripts & tracker beacons)                  |
+----------------------------------------+------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                     SUPABASE (POSTGRESQL + STORAGE + RLS)                         |
|   1. Stores message record in 'messages' table                                    |
|   2. Uploads attachments to 'omnimail-attachments' bucket                         |
|   3. Row Level Security verifies user_id or session_token                         |
|   4. Auto-Purge stored procedure cleans expired mailboxes & records               |
+----------------------------------------+------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                            CLIENT INTERFACE                                       |
|   1. Instant Anonymous Session (no login required)                                |
|   2. Auto-sync inbox countdown timer & pleasant chime notification                |
|   3. Mobile QR code sync, domain switcher, +60m timer extend                     |
|   4. Multi-mailbox manager & developer REST API integration                       |
+-----------------------------------------------------------------------------------+
```

---

## 2. Core Technology Stack

- **Framework:** Next.js (App Router, Server Actions, Dynamic API Routes)
- **Frontend:** React, TypeScript, Tailwind CSS v4, Lucide Icons
- **Database & Auth:** Supabase PostgreSQL, Supabase Auth (OAuth + Magic Links), Supabase Storage
- **Security:** PostgreSQL Row Level Security (RLS), HTML Sanitization
- **Edge Routing:** Cloudflare Email Workers (`cloudflare/worker.js`)
- **Email Processing:** `mailparser` for MIME/EML, customizable sanitizers

---

## 3. Directory Structure

```
├── cloudflare/
│   └── worker.js                     # Production Cloudflare Email Routing worker
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── domains/              # Available receiving domains (@omnibey.com, etc.)
│   │   │   ├── email/
│   │   │   │   ├── ingest/           # Secure Cloudflare webhook ingestion endpoint
│   │   │   │   └── send-test/        # Realistic email simulation (2FA OTP, GitHub, Stripe)
│   │   │   ├── health/               # System health & diagnostics probe
│   │   │   ├── mailboxes/            # Mailbox generation & retrieval
│   │   │   │   └── [id]/             # Get, extend (+60m), delete mailbox
│   │   │   │       └── messages/     # List emails for mailbox
│   │   │   └── messages/[id]/        # Get email, mark as read, delete
│   │   ├── auth/
│   │   │   ├── callback/             # Supabase Auth OAuth/Magic Link handler
│   │   │   ├── login/                # Sign In page
│   │   │   └── register/             # Registration with plan selection
│   │   ├── dashboard/                # User console, API keys, multi-mailbox manager
│   │   ├── docs/                     # Developer REST API & code examples (Node/Python)
│   │   ├── pricing/                  # Transparent SaaS subscription tiers
│   │   ├── privacy/                  # Zero-retention privacy policy
│   │   ├── terms/                    # Terms of service
│   │   ├── globals.css               # Styling, dark mode tokens, email sandbox
│   │   ├── layout.tsx                # Master layout with Navbar & Footer
│   │   └── page.tsx                  # Home page with live interactive temporary inbox
│   ├── components/
│   │   ├── layout/                   # Navbar, Footer
│   │   ├── marketing/                # HeroSection, FeaturesGrid, ArchitectureShowcase, PricingTable
│   │   ├── omnimail/                 # MailboxBar, MessageList, MessageDetail, QrCodeModal, MultiMailboxDrawer, SendTestEmailModal
│   │   └── ui/                       # Button, Badge, Modal, Toast
│   ├── lib/
│   │   ├── email/                    # Inbound MIME parser, address generator, HTML sanitizer
│   │   ├── providers/                # MailProvider interface, Cloudflare, Gmail, Outlook, Mock
│   │   ├── session/                  # Anonymous session token & multi-mailbox local storage
│   │   ├── supabase/                 # client.ts, server.ts, admin.ts, schema.sql
│   │   └── utils.ts                  # Class merger, date and byte formatters
│   └── types/                        # Core TypeScript interfaces (email.ts, saas.ts)
├── .env.example                      # Documented environment variables template
└── .env.local                        # Local development environment configuration
```

---

## 4. Setup & Deployment Guide

### Step 1: Clone & Install Dependencies

```bash
npm install
```

### Step 2: Environment Variables

Copy `.env.example` to `.env.local` and configure your credentials:

```bash
NEXT_PUBLIC_APP_URL=https://omnibey.com
NEXT_PUBLIC_APP_NAME=OmniBey
NEXT_PUBLIC_PRODUCT_NAME="OmniMail — Temporary Email by OmniBey"

# Temporary Email Domains
NEXT_PUBLIC_DEFAULT_MAIL_DOMAIN=omnibey.com
NEXT_PUBLIC_AVAILABLE_DOMAINS=omnibey.com,mail.omnibey.com,omnimail.app

# Supabase (PostgreSQL & Storage)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_STORAGE_BUCKET=omnimail-attachments

# Ingestion Webhook Security Secret
INGESTION_WEBHOOK_SECRET=your_strong_random_secret_here
```

### Step 3: Run Database Schema in Supabase

1. Open your **Supabase Dashboard** -> **SQL Editor**.
2. Run the script located in `src/lib/supabase/schema.sql`.
3. This creates:
   - `domains`: Active and premium domains
   - `mailboxes`: Temporary mailboxes with expiry index
   - `messages`: Received emails, sender, subject, SPF/DKIM flags
   - `attachments`: File metadata linked to Supabase Storage
   - `api_keys`: Developer tokens for testing automation
   - **Row Level Security (RLS)** policies for anonymous and authenticated access
   - `purge_expired_records()`: Stored procedure for automated cleanup

4. In **Storage**, create a bucket named `omnimail-attachments` (with public read disabled or restricted by RLS).

### Step 4: Configure Cloudflare Email Routing

1. In the **Cloudflare Dashboard**, select your domain `omnibey.com`.
2. Go to **Email Routing** -> **Email Workers**.
3. Create a Worker and paste the code from `cloudflare/worker.js`.
4. Under **Worker Settings** -> **Variables**, add:
   - `OMNIMAIL_INGEST_URL`: `https://omnibey.com/api/email/ingest`
   - `INGESTION_SECRET`: Value matching `INGESTION_WEBHOOK_SECRET` in `.env.local`
5. Go to **Email Routing** -> **Routing Rules** and add:
   - Catch-all rule: `*@omnibey.com` &rarr; Send to Worker: `omnimail-worker`.

---

## 5. Extensibility: Adding Future Providers

To add Gmail, Outlook, or AI features:
1. Implement the `MailProvider` interface in `src/lib/providers/mail-provider.interface.ts`.
2. Register the provider in `src/lib/providers/registry.ts`.
3. Set feature toggles in `.env.local`:
   - `ENABLE_GMAIL_INTEGRATION=true`
   - `ENABLE_OUTLOOK_INTEGRATION=true`
   - `ENABLE_AI_SUMMARY=true`
No database schema changes or client rewriting are required.

---

## 6. Developer REST API

### Create Temporary Mailbox
```bash
curl -X POST https://omnibey.com/api/mailboxes \
  -H "Content-Type: application/json" \
  -d '{"domain": "omnibey.com"}'
```

### Query Messages & OTPs
```bash
curl -X GET https://omnibey.com/api/mailboxes/{mailboxId}/messages
```

### Simulate Test Email
```bash
curl -X POST https://omnibey.com/api/email/send-test \
  -H "Content-Type: application/json" \
  -d '{"to": "your-address@omnibey.com", "template": "verification"}'
```

---

## 7. Build & Production Run

```bash
# Build production bundle
npm run build

# Start production server
npm start
```
