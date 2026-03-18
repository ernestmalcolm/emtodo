## EM To Do – Eisenhower Matrix To Do

EM To Do is a minimal, calm productivity app built around the Eisenhower Matrix. Instead of just collecting tasks, it helps you decide which tasks truly deserve your attention.

### Tech stack

- **Next.js (App Router)** – core framework
- **Supabase** – authentication and database
- **Mantine UI** – inputs, buttons, modals
- **TailwindCSS** – layout and custom theming
- **dnd-kit** – drag-and-drop between quadrants

### Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a `.env.local` file**

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. **Create the `tasks` table in Supabase**

   Run this SQL inside the Supabase SQL editor:

   ```sql
   create table if not exists public.tasks (
     id uuid primary key default gen_random_uuid(),
     title text not null,
     description text,
     importance boolean not null default true,
     urgency boolean not null default true,
     quadrant text not null check (quadrant in ('do_now', 'schedule', 'delegate', 'eliminate')),
     completed boolean not null default false,
  due_date date,
  review_at timestamp with time zone,
  completed_at timestamp with time zone,
     created_at timestamp with time zone not null default now(),
     user_id uuid not null references auth.users(id) on delete cascade
   );

   create index if not exists tasks_user_id_created_at_idx
     on public.tasks (user_id, created_at desc);
   ```

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000` to see the landing page.

### Pages

- **`/`** – Landing page introducing the philosophy of EM To Do.
- **`/login`** – Email/password login via Supabase Auth.
- **`/register`** – Registration with name, email, and password.
- **`/dashboard`** – Authenticated Eisenhower Matrix with four quadrants:
  - DO NOW
  - SCHEDULE
  - DELEGATE
  - ELIMINATE

### Matrix behaviour

- Each quadrant has:
  - A title, short description, and empty-state text.
  - Task cards with title, optional description, and a completion checkbox.
  - A **+ Add task** button that opens a Mantine modal.
- The **Add Task** modal:
  - Prefills importance/urgency from the quadrant you clicked.
  - Shows a live message like “This task will appear in: DO NOW”.
  - Inserts the new task into Supabase and updates the UI.
- You can **drag tasks between quadrants**:
  - Drag-and-drop is powered by `dnd-kit`.
  - Dropping into another quadrant updates:
    - `quadrant`
    - `importance`
    - `urgency`
  - Changes are persisted in Supabase.

### Design system

- **Background:** `#0B132B`
- **Panels:** `#1F2A44`
- **Hover surfaces:** `#253155`
- **Primary text:** `#EAEFF7`
- **Secondary text:** `#AAB6CF`
- **Quadrant accents:**
  - **Do Now:** `#FF6B6B`
  - **Schedule:** `#5BC0BE`
  - **Delegate:** `#F2C94C`
  - **Eliminate:** `#6C7A89`

The overall feel is deliberately calm, intimate, and reflective. The interface is meant to feel like a quiet workspace for thinking about your tasks, not just managing lists.

