-- EdTech CRM & Inquiry System: database schema (Supabase / PostgreSQL)
-- Safe to run more than once. Run it in the Supabase SQL editor, or with: cd backend && npm run db:setup

CREATE TABLE IF NOT EXISTS admins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,                    -- bcrypt hash, never the plain password
  name          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inquiries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type  TEXT NOT NULL CHECK (user_type IN ('parent', 'student', 'school')),
  category   TEXT NOT NULL CHECK (category IN ('scholarship', 'concert', 'admission', 'general_query')),
  name       TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  email      TEXT NOT NULL CHECK (char_length(email) <= 254),
  phone      TEXT NOT NULL CHECK (phone ~ '^\+?[0-9]{10,15}$'),
  message    TEXT NOT NULL CHECK (char_length(message) BETWEEN 10 AND 2000),
  status     TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for the dashboard filters and default sort
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_category   ON inquiries (category);
CREATE INDEX IF NOT EXISTS idx_inquiries_user_type  ON inquiries (user_type);
CREATE INDEX IF NOT EXISTS idx_inquiries_status     ON inquiries (status);

-- Keep updated_at fresh on every change
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_inquiries_updated_at ON inquiries;
CREATE TRIGGER trg_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Supabase exposes the public schema through its auto-generated REST API.
-- Only our own backend should touch these tables, so turn on Row Level Security with no policies.
-- That blocks the public anon key completely. The backend connects with the database role from
-- DATABASE_URL, which bypasses RLS, so it keeps working.
ALTER TABLE admins    ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
