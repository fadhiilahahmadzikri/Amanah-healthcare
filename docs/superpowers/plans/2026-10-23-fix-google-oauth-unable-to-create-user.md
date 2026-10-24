# Fix Google OAuth `unable_to_create_user` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve the Better Auth `unable_to_create_user` error during Google OAuth signup by correcting the database trigger function column mismatch (`image_url` -> `avatar_url`) and synchronizing migration artifacts.

**Architecture:** Better Auth operates with PostgreSQL table `"user"`. A PostgreSQL trigger `trg_sync_better_auth_user` automatically synchronizes new users into the core `users` and `user_roles` tables. The trigger function `fn_sync_better_auth_user_to_core_users()` incorrectly referenced `image_url` instead of `avatar_url` on relation `users`, causing PostgreSQL to abort the transaction with `column "image_url" of relation "users" does not exist`.

**Tech Stack:** NestJS, Better Auth v1.7.5, PostgreSQL 17 (Docker `backend-postgres-1`), Drizzle ORM.

**Spec:** User reported Better Auth error `unable_to_create_user` when authenticating via Google OAuth with a new unregistered Google account.

## Global Constraints

- **Single Source of Truth (SSOT):** Canonical user profile table is `users` with column `avatar_url` (as defined in `Amanah-backend/src/database/schema/amanah.schema.ts:279`).
- **Zero Defensive Overengineering:** Fix the root cause directly at the database trigger layer; do not patch with dummy data or fallback hacks.
- **Full File Reading Discipline:** Any file modified must be read 100% from line 1 to EOF.
- **Docker Efficiency:** Do not recreate or rebuild database volumes; apply DDL migration cleanly to the running `backend-postgres-1` container.

---

### Task 1: Update Migration Files `0005_sync_oauth_avatar.sql` and `0006_backfill_staff_avatar_url.sql`

**Files:**
- Modify: `Amanah-backend/src/database/migrations/0005_sync_oauth_avatar.sql:1-91`
- Modify: `Amanah-backend/src/database/migrations/0006_backfill_staff_avatar_url.sql:1-14`

**Interfaces:**
- Consumes: PostgreSQL schema for `public.users` (`avatar_url text`)
- Produces: Corrected SQL migration scripts referencing canonical `avatar_url`

- [ ] **Step 1: Update `Amanah-backend/src/database/migrations/0005_sync_oauth_avatar.sql`**

Replace `image_url` with `avatar_url` on all references to table `users`:
```sql
-- Migration: 0005_sync_oauth_avatar.sql
-- Description: Propagates OAuth profile image from Better Auth "user" to canonical "users"."avatar_url",
-- and keeps "staff_profiles"."avatar_url" synchronized with "users"."avatar_url".

-- 1. Update fn_sync_better_auth_user_to_core_users to synchronize image -> avatar_url
CREATE OR REPLACE FUNCTION fn_sync_better_auth_user_to_core_users()
RETURNS TRIGGER AS $$
DECLARE
  v_role_id uuid;
  v_role_code text;
BEGIN
  v_role_code := CASE
    WHEN NEW.role = 'admin' THEN 'admin'
    WHEN NEW.role = 'staffDoctor' THEN 'staff_doctor'
    WHEN NEW.role = 'staffMidwife' THEN 'staff_midwife'
    WHEN NEW.role = 'staffWorker' THEN 'staff_worker'
    ELSE 'patient'
  END;

  SELECT id INTO v_role_id FROM roles WHERE code = v_role_code LIMIT 1;
  IF v_role_id IS NULL THEN
    SELECT id INTO v_role_id FROM roles WHERE code = 'patient' LIMIT 1;
  END IF;

  INSERT INTO users (
    id,
    name,
    email,
    email_verified,
    avatar_url,
    status,
    preferred_locale,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.name,
    NEW.email,
    NEW."emailVerified",
    NEW.image,
    CASE 
      WHEN NEW.banned THEN 'inactive'::user_status 
      WHEN NEW."emailVerified" THEN 'active'::user_status
      ELSE 'pending_verification'::user_status 
    END,
    'id-ID',
    NEW."createdAt",
    NEW."updatedAt"
  )
  ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      email = EXCLUDED.email,
      email_verified = EXCLUDED.email_verified,
      avatar_url = COALESCE(users.avatar_url, EXCLUDED.avatar_url),
      status = CASE 
        WHEN NEW.banned THEN 'inactive'::user_status 
        WHEN NEW."emailVerified" THEN 'active'::user_status
        ELSE 'pending_verification'::user_status 
      END,
      updated_at = EXCLUDED.updated_at;

  IF v_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id)
    VALUES (NEW.id, v_role_id)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger function to automatically keep staff_profiles.avatar_url in sync with users.avatar_url
CREATE OR REPLACE FUNCTION fn_sync_users_image_to_staff_profiles()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.avatar_url IS DISTINCT FROM OLD.avatar_url THEN
    UPDATE staff_profiles
    SET avatar_url = NEW.avatar_url,
        updated_at = now()
    WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_users_image_to_staff_profiles ON users;
CREATE TRIGGER trg_sync_users_image_to_staff_profiles
AFTER UPDATE OF avatar_url ON users
FOR EACH ROW
EXECUTE FUNCTION fn_sync_users_image_to_staff_profiles();
```

- [ ] **Step 2: Update `Amanah-backend/src/database/migrations/0006_backfill_staff_avatar_url.sql`**

Replace `u.image_url` with `u.avatar_url`:
```sql
-- Migration: 0006_backfill_staff_avatar_url.sql
-- Description: One-time backfill of staff_profiles.avatar_url from users.avatar_url
-- for rows where staff_profiles.avatar_url is NULL but users.avatar_url is set.

UPDATE staff_profiles sp
SET avatar_url = u.avatar_url,
    updated_at = now()
FROM users u
WHERE sp.user_id = u.id
  AND sp.avatar_url IS NULL
  AND u.avatar_url IS NOT NULL
  AND u.avatar_url <> '';
```

- [ ] **Step 3: Commit migration file fixes**

```bash
git add Amanah-backend/src/database/migrations/0005_sync_oauth_avatar.sql Amanah-backend/src/database/migrations/0006_backfill_staff_avatar_url.sql
git commit -m "fix(db): correct users.avatar_url column in OAuth sync trigger and backfill migrations"
```

---

### Task 2: Apply the Corrected Trigger Function to `backend-postgres-1`

**Files:**
- Live Database: PostgreSQL 17 container `backend-postgres-1`

**Interfaces:**
- Consumes: Corrected `fn_sync_better_auth_user_to_core_users()` PL/pgSQL definition
- Produces: Live updated trigger function in PostgreSQL `public` schema

- [ ] **Step 1: Execute `CREATE OR REPLACE FUNCTION` in PostgreSQL**

Run PowerShell command:
```powershell
$sql = @'
CREATE OR REPLACE FUNCTION fn_sync_better_auth_user_to_core_users()
RETURNS TRIGGER AS $$
DECLARE
  v_role_id uuid;
  v_role_code text;
BEGIN
  v_role_code := CASE
    WHEN NEW.role = 'admin' THEN 'admin'
    WHEN NEW.role = 'staffDoctor' THEN 'staff_doctor'
    WHEN NEW.role = 'staffMidwife' THEN 'staff_midwife'
    WHEN NEW.role = 'staffWorker' THEN 'staff_worker'
    ELSE 'patient'
  END;

  SELECT id INTO v_role_id FROM roles WHERE code = v_role_code LIMIT 1;
  IF v_role_id IS NULL THEN
    SELECT id INTO v_role_id FROM roles WHERE code = 'patient' LIMIT 1;
  END IF;

  INSERT INTO users (
    id,
    name,
    email,
    email_verified,
    avatar_url,
    status,
    preferred_locale,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.name,
    NEW.email,
    NEW."emailVerified",
    NEW.image,
    CASE 
      WHEN NEW.banned THEN 'inactive'::user_status 
      WHEN NEW."emailVerified" THEN 'active'::user_status
      ELSE 'pending_verification'::user_status 
    END,
    'id-ID',
    NEW."createdAt",
    NEW."updatedAt"
  )
  ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      email = EXCLUDED.email,
      email_verified = EXCLUDED.email_verified,
      avatar_url = COALESCE(users.avatar_url, EXCLUDED.avatar_url),
      status = CASE 
        WHEN NEW.banned THEN 'inactive'::user_status 
        WHEN NEW."emailVerified" THEN 'active'::user_status
        ELSE 'pending_verification'::user_status 
      END,
      updated_at = EXCLUDED.updated_at;

  IF v_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id)
    VALUES (NEW.id, v_role_id)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
'@
$sql | docker exec -i backend-postgres-1 psql -U amanah -d amanah_healthcare
```

- [ ] **Step 2: Verify trigger function definition in `pg_proc`**

Run:
```powershell
docker exec -i backend-postgres-1 psql -U amanah -d amanah_healthcare -c "SELECT prosrc FROM pg_proc WHERE proname = 'fn_sync_better_auth_user_to_core_users';"
```
Expected output: Contains `avatar_url`, 0 occurrences of `image_url`.

---

### Task 3: Align Environment Variables (`BETTER_AUTH_SECRET`)

**Files:**
- Modify: `kolaborasihealthcare/.env.local:4`

**Interfaces:**
- Consumes: `BETTER_AUTH_SECRET` from `Amanah-backend/.env`
- Produces: Consistent secret key across frontend and backend

- [ ] **Step 1: Check and align `BETTER_AUTH_SECRET` in `kolaborasihealthcare/.env.local`**

Ensure `kolaborasihealthcare/.env.local` contains:
```bash
BETTER_AUTH_SECRET=63d7c01d452ba6c99d5bcea1dccb2d4a6a8632d837b1cf38f513ab40ed89643b
```
Matching `Amanah-backend/.env` line 10 and line 59 (`AUTH_JWT_SECRET`).

---

### Task 4: End-to-End Simulation & Verification

**Files:**
- Test target: Live database and OAuth signup pipeline

**Interfaces:**
- Consumes: Test user with Google picture URL
- Produces: Verified creation in `"user"`, `users`, `user_roles`, and `account`

- [ ] **Step 1: Run comprehensive OAuth simulation script in PostgreSQL**

Run:
```powershell
$sql = @'
BEGIN;
-- 1. Insert test user mimicking Google OAuth first-time signup
INSERT INTO public."user" (id, name, email, "emailVerified", image)
VALUES ('e1111111-2222-3333-4444-555555555555', 'Verifikasi Google OAuth', 'verif.oauth@example.com', true, 'https://lh3.googleusercontent.com/a/test-avatar');

-- 2. Insert account record mimicking Google OAuth tokens
INSERT INTO public.account (id, "accountId", "providerId", "userId", "accessToken", "refreshToken", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'google-sub-999999999',
  'google',
  'e1111111-2222-3333-4444-555555555555',
  'mock-google-token',
  'mock-google-refresh',
  now(),
  now()
);

-- 3. Assertions
SELECT id, name, email, email_verified, avatar_url, status FROM public.users WHERE id = 'e1111111-2222-3333-4444-555555555555';
SELECT u.email, r.code AS role_code FROM public.users u JOIN public.user_roles ur ON u.id = ur.user_id JOIN public.roles r ON ur.role_id = r.id WHERE u.id = 'e1111111-2222-3333-4444-555555555555';
SELECT "accountId", "providerId" FROM public.account WHERE "userId" = 'e1111111-2222-3333-4444-555555555555';

ROLLBACK;
'@
$sql | docker exec -i backend-postgres-1 psql -U amanah -d amanah_healthcare
```
Expected output:
- `public.users` row exists with `avatar_url = 'https://lh3.googleusercontent.com/a/test-avatar'` and `status = 'active'`.
- `public.user_roles` has role `patient`.
- `public.account` has provider `google`.
- Zero errors thrown.

- [ ] **Step 2: Verify Backend API Health and Routes**

Run:
```powershell
curl.exe -s http://127.0.0.1:3001/health/ready
```
Expected output: `{"status":"ok"}` or 200 OK response.
