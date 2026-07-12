-- --------------------------------------------------------------------------- --
-- SportsTech Sweden — one-time database setup for the website.
--
-- Run this ONCE in the Supabase dashboard:
--   SQL Editor → New query → paste this → Run.
--
-- It adds a moderation column so startup submissions stay hidden until you
-- approve them. Existing imported companies are marked 'approved' so they
-- show immediately; new submissions default to 'pending'.
-- --------------------------------------------------------------------------- --

-- 1. Add the column (no default yet, so we can backfill existing rows first).
alter table companies
  add column if not exists moderation_status text;

-- 2. Mark all existing rows as approved.
update companies
  set moderation_status = 'approved'
  where moderation_status is null;

-- 3. New rows default to 'pending' (must be approved before showing).
alter table companies
  alter column moderation_status set default 'pending';

-- Optional: quick check
-- select moderation_status, count(*) from companies group by moderation_status;
