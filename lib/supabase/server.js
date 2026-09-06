import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Use inside Server Components / Route Handlers. Reads the user's session from cookies.
export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try { cookieStore.set({ name, value, ...options }); } catch (e) {}
        },
        remove(name, options) {
          try { cookieStore.set({ name, value: "", ...options }); } catch (e) {}
        },
      },
    }
  );
}

// Service-role client: bypasses RLS. ONLY use in trusted server code (the Stripe webhook).
// Never import this into anything reachable from the browser.
export function createServiceClient() {
  const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
