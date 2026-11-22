/*
# Create cookie_accounts table for DOUNYA COOKIE MANAGER

1. Purpose
- Stores Facebook Messenger account cookies (appstate) for the bot's
  multi-account cookie manager panel.
- Each row = one account with a user-chosen name, encrypted cookies JSON,
  and a status (active / stopped / needs_update).
- Only one account should be active at a time; the bot loads that account's
  cookies on startup.

2. New Tables
- `cookie_accounts`
  - `id` (uuid, primary key)
  - `name` (text, not null) — user-chosen account label
  - `cookies_encrypted` (text, not null) — AES-256-GCM encrypted appstate JSON
  - `cookies_hash` (text) — sha256 of plaintext cookies, to detect stale cookies
  - `status` (text, not null, default 'stopped') — 'active' | 'stopped' | 'needs_update'
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

3. Security
- Enable RLS on `cookie_accounts`.
- This table is accessed ONLY server-side by the bot process using the
  service_role key (which bypasses RLS). The browser never touches this
  table directly — all CRUD goes through the bot's HTTP panel which uses
  the service role server-side.
- No grants to anon or authenticated: the table is invisible to the
  Data API / anon-key frontend by design.
- Grant ALL to service_role so the bot can manage rows.

4. Notes
- Cookies are encrypted before storage using AES-256-GCM with a key from
  the COOKIE_ENCRYPTION_KEY environment variable. Only encrypted ciphertext
  is stored in the database.
- A partial unique index ensures at most one active account at a time.
*/

CREATE TABLE IF NOT EXISTS cookie_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cookies_encrypted text NOT NULL,
  cookies_hash text,
  status text NOT NULL DEFAULT 'stopped',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cookie_accounts ENABLE ROW LEVEL SECURITY;

GRANT ALL ON cookie_accounts TO service_role;

-- At most one active account at a time
CREATE UNIQUE INDEX IF NOT EXISTS cookie_accounts_single_active
  ON cookie_accounts (status)
  WHERE status = 'active';
