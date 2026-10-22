# Supabase local setup

This project includes a local Supabase migration and fictional doctor seed data. It does not link to or deploy to a hosted project.

1. Start Docker Desktop.
2. From the project root, run `supabase start`.
3. Run `supabase db reset` to apply the migration and seed the local database.
4. Copy the local API URL and publishable key from the CLI output into `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local-publishable-key>
   ```

5. Run `pnpm dev` and create a test account at `/login`. Local email confirmation is disabled; hosted projects may require confirmation.

6. Run `pnpm test:db` to execute the pgTAP integration checks against the local database. Run `pnpm test` for the Vitest unit tests. Both test suites use fictitious data only.
7. In one terminal, keep `pnpm dev` running. In another, run `pnpm test:integration` to exercise Auth, the appointment API, private PDF upload/download, owner isolation, and a live Realtime notification. This test creates and removes temporary users and records in the local stack; it refuses non-local Supabase URLs.

The migration enables row-level security for patient-owned profiles, appointments, exams, notifications, and private PDF reports. It makes doctor directory data readable without login. The included directory seed is fictional. Do not add real patient or medical data to this prototype. The SQL tests verify profile creation, patient data isolation, appointment writes, private bucket configuration, and Realtime publication membership. The local integration script uses the service-role key returned by the local Supabase CLI only in memory to remove temporary Auth users; SQL fixtures are executed through the local CLI. The key is never written to an environment file.

To stop the local services, run `supabase stop`. `supabase db reset` resets only the local database and reloads the migration and seed. Do not use `supabase db push` against a hosted project as part of this local setup.
