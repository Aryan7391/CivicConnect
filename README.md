# CivicConnect

A full-stack Progressive Web App (PWA) for civic engagement — where citizens, volunteers, institutions, and government authorities collaborate to report and resolve community issues.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript |
| Styling | Tailwind CSS + custom global styles |
| Backend | Supabase (Auth, PostgreSQL, Storage) |
| Fonts | Playfair Display + DM Sans (Google Fonts) |
| PWA | Service worker, installable |

---

## Features

### Authentication
- Email + password signup and login
- 3-step signup flow (credentials → role selection → location)
- 4 user roles: **Citizen**, **Volunteer**, **Institution**, **Government**
- Government and Institution accounts require **manual admin approval** before first login
- Session persistence via localStorage
- Forgot password flow via Supabase email reset

### Pages
- **Landing Page** — Hero section, stats, call to action
- **Community Feed** — Browse all reported issues with status filters
- **Report Issue** — Form with drag & drop image upload to Supabase Storage
- **Activities** — Join or organize community volunteer events
- **Ideas** — Propose and support community improvement ideas
- **Profile** — Edit profile, switch roles, view stats
- **Government Dashboard** — Manage issues, verify reports, publish announcements (government role only)

### UI/UX
- Responsive sidebar navigation (fixed on desktop, overlay on mobile)
- Hamburger toggle — sidebar never closes on page navigation, only on toggle click
- Role-based navigation (Government Dashboard only visible to government users)
- Status badges, verified badges, category icons on issue cards
- Real image display from Supabase Storage

---

## Project Structure

```
/
├── app/
│   └── page.tsx              # Entry point — renders CivicConnect
├── components/
│   └── CivicConnect.jsx      # Entire app in a single file
├── public/
│   └── manifest.json         # PWA manifest
├── .env.local                # Environment variables (never commit this)
└── README.md
```

---

## Database Schema

### `profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid | References auth.users |
| name | text | |
| email | text | |
| role | text | citizen / volunteer / institution / government |
| location | text | |
| avatar_url | text | |
| approved | boolean | false for govt/institution until admin approves |
| created_at | timestamp | |

### `issues`
| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| title | text | |
| description | text | |
| image_url | text | Public URL from Supabase Storage |
| location | text | |
| status | text | Reported / Under Review / Verified / In Progress / Resolved |
| category | text | Garbage / Road Damage / Streetlight / Water Leakage / Sanitation / Others |
| verified | boolean | Set by government users |
| created_by | uuid | References profiles |
| created_at | timestamp | |

### `ideas`
| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| title | text | |
| description | text | |
| support_count | integer | |
| created_by | uuid | References profiles |
| created_at | timestamp | |

### `activities`
| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| title | text | |
| description | text | |
| location | text | |
| date | timestamp | |
| organizer | uuid | References profiles |
| required_volunteers | integer | |
| current_volunteers | integer | |
| created_at | timestamp | |

---

## Supabase Setup

### 1. Create project
Go to [supabase.com](https://supabase.com) → New project → choose region closest to your users.

### 2. Run SQL
Open **SQL Editor → New Query** and run:

```sql
-- Profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text, email text, role text default 'citizen',
  location text, avatar_url text, approved boolean default true,
  created_at timestamp default now()
);

-- Issues
create table if not exists issues (
  id uuid primary key default gen_random_uuid(),
  title text, description text, image_url text, location text,
  status text default 'Reported', category text, verified boolean default false,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamp default now()
);

-- Ideas
create table if not exists ideas (
  id uuid primary key default gen_random_uuid(),
  title text, description text, support_count integer default 0,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamp default now()
);

-- Activities
create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  title text, description text, location text, date timestamp,
  organizer uuid references profiles(id) on delete set null,
  required_volunteers integer default 10, current_volunteers integer default 0,
  created_at timestamp default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role, approved)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'citizen'),
    case when new.raw_user_meta_data->>'role' in ('government','institution') then false else true end
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Disable RLS for development
alter table profiles   disable row level security;
alter table issues     disable row level security;
alter table ideas      disable row level security;
alter table activities disable row level security;
```

### 3. Storage bucket
- Go to **Storage → New bucket**
- Name: `issue-images`
- Toggle **Public bucket** → ON
- Save

Then add storage policies via **Storage → issue-images → Policies**:
- **SELECT** policy: target = public, using = `true`
- **INSERT** policy: target = authenticated, with check = `true`

### 4. Auth settings
- **Authentication → Providers → Email** → turn off **Confirm email** (for development)
- **Authentication → URL Configuration** → set Site URL to `http://localhost:3000`

### 5. Get your keys
**Settings → Data API** → copy:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `publishable` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Environment Variables

Create a `.env.local` file in the root of your project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key-here
```

> ⚠️ Never commit `.env.local` to version control. Add it to `.gitignore`.

---

## Getting Started

```bash
# Install dependencies
npm install

# Install Supabase client
npm install @supabase/supabase-js

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Role Access Guide

| Feature | Citizen | Volunteer | Institution | Government |
|---|---|---|---|---|
| View feed | ✅ | ✅ | ✅ | ✅ |
| Report issue | ✅ | ✅ | ✅ | ✅ |
| Join activities | ✅ | ✅ | ✅ | ✅ |
| Organize activities | ✅ | ✅ | ✅ | ✅ |
| Support ideas | ✅ | ✅ | ✅ | ✅ |
| Verify issues | ❌ | ❌ | ❌ | ✅ |
| Update issue status | ❌ | ❌ | ❌ | ✅ |
| Government Dashboard | ❌ | ❌ | ❌ | ✅ |
| Requires approval | ❌ | ❌ | ✅ | ✅ |

---

## Approving Government / Institution Accounts

When a government or institution user signs up, their `approved` field is set to `false`. To approve:

1. Go to **Supabase → Table Editor → profiles**
2. Find the user's row by email
3. Set `approved` = `true`
4. Save

The user can now log in normally.

---

## Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard under **Project → Settings → Environment Variables**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

After deploying, update Supabase:
- **Authentication → URL Configuration** → update Site URL to your Vercel URL
- Add your Vercel URL to Redirect URLs

---

## Development Notes

- RLS is disabled on all tables for development. Re-enable with proper policies before production.
- The entire frontend lives in a single file `CivicConnect.jsx` with `'use client'` at the top.
- All CSS is written as a `globalStyles` string injected via a `<style>` tag — no Tailwind classes in JSX.
- Image uploads go to Supabase Storage under `{user_id}/{timestamp}.{ext}`.

---

## License

MIT
