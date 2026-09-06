import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import AcceleratorApp from "../../components/AcceleratorApp";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sub } = await supabase.from("subscriptions").select("status, plan, current_period_end").eq("user_id", user.id).single();
  const active = sub && ["active", "trialing"].includes(sub.status);

  if (!active) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 text-center">
        <div className="max-w-sm flex flex-col gap-4">
          <h1 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            No active subscription
          </h1>
          <p className="text-sm" style={{ color: "#8791A0" }}>
            You're signed in as {user.email}, but your Conquer BPO Accelerator subscription isn't active yet.
          </p>
          <a href="/" className="px-4 py-2 rounded-md text-sm font-medium" style={{ background: "#E8A33D", color: "#171308" }}>
            View plans
          </a>
        </div>
      </main>
    );
  }

  return <AcceleratorApp userEmail={user.email} plan={sub.plan} />;
}
