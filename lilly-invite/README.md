# 🛼 Lilly's Birthday Invite

A full interactive birthday party invite with real-time RSVP collection and a host dashboard.

---

## 🚀 Setup — takes about 10 minutes

### Step 1 — Create a Supabase project (free)

1. Go to [supabase.com](https://supabase.com) and sign up / log in
2. Click **New Project**, give it a name (e.g. `lilly-invite`), set a database password, choose a region (Australia if available)
3. Once created, go to **Settings → API**
4. Copy your **Project URL** and **anon public** key — you'll need these shortly

### Step 2 — Create the database tables

In your Supabase project, go to **SQL Editor** and run this:

```sql
-- RSVPs table
create table rsvps (
  id bigint generated always as identity primary key,
  name text not null,
  coming text not null check (coming in ('yes','no')),
  created_at timestamptz default now()
);

-- Party details table (single config row)
create table party_details (
  id int primary key default 1,
  party_name text,
  banner_datetime text,
  detail_when text,
  detail_where text,
  detail_contact text,
  detail_food text,
  detail_skates text,
  ticker text,
  updated_at timestamptz default now()
);

-- Allow public read/write (guests can submit RSVPs)
alter table rsvps enable row level security;
create policy "Anyone can insert rsvps" on rsvps for insert with check (true);
create policy "Anyone can read rsvps" on rsvps for select using (true);
create policy "Anyone can delete rsvps" on rsvps for delete using (true);

alter table party_details enable row level security;
create policy "Anyone can read details" on party_details for select using (true);
create policy "Anyone can upsert details" on party_details for insert with check (true);
create policy "Anyone can update details" on party_details for update using (true);
```

### Step 3 — Set up the project locally

```bash
# Clone or download this project folder, then:
cd lilly-invite
npm install

# Copy the env template and fill in your values
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_HOST_PASSWORD=your-chosen-password
```

Test it locally:
```bash
npm run dev
# Open http://localhost:3000
```

### Step 4 — Deploy to Vercel (free)

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Push this project to a GitHub repo (or use Vercel CLI)
3. In Vercel, click **Add New Project** and import your repo
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_HOST_PASSWORD`
5. Click **Deploy** — Vercel gives you a URL like `lilly-invite.vercel.app`

### Step 5 — Generate your QR code

1. Go to any free QR generator (e.g. [qr-code-generator.com](https://www.qr-code-generator.com))
2. Paste your Vercel URL
3. Download and print on the physical cards!

---

## 🎛️ Using the host dashboard

- Tap **Host access** on the intro screen (or **Host login** on the main screen)
- Enter your password
- See live RSVP count and guest list (from any device, anywhere)
- Edit any party details — changes go live instantly for all guests
- Clear RSVPs if needed

---

## 🔑 Changing the host password

Update `NEXT_PUBLIC_HOST_PASSWORD` in your Vercel environment variables and redeploy.
