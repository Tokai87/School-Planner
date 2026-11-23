# School Planner

*Your School Life, Organized.* — Phase 2: Authentication & Onboarding (Google Sign-In via Supabase).

See `docs/SETUP.md` for configuration and `docs/TEST_PLAN.md` for test status.

Stack: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide, React Router, React Hook Form + Zod, Supabase.

## Design status
All Phase 2 screens now follow the approved HTML mockup (v3):
- Welcome, Role selection, Profile setup (create + edit), Profile, success state.
- Three role dashboards (Primary playful, Secondary premium, Parent professional) with a floating bottom nav.
- Malay / English switch (EN | BM) on every screen. The choice is saved in `localStorage` (`sp.lang`). Strings are written inline as `L("English", "Bahasa Melayu")` via `useLang()`.

### Sample data
Dashboard content (timetable, counts, children, events, countdown) is **sample data** in the dashboard files. Real data arrives with the timetable / homework / exams / calendar and parent-child management phases. Bottom-nav tabs other than Home and Profile are placeholders (marked "Coming soon").

### Styling note
Screen styles live in `src/styles/screens.css` (ported from the mockup). They are un-layered CSS, so they win over Tailwind utilities on the same property; use inline `style` or edit the class when overriding.

## Not yet verified
`npm install`, `npm run build` and `npx tsc --noEmit` have **not** been run (the authoring environment had no network). Only a syntax-level check and a static unused-import / missing-module scan were done. Run them first and fix any type errors.
