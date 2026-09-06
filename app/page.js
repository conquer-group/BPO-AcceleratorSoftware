import Link from "next/link";
import { createClient } from "../lib/supabase/server";
import PricingButtons from "../components/PricingButtons";

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 sm:px-10 py-5" style={{ borderBottom: "1px solid #262C36" }}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#E8A33D" }} />
          <span className="font-semibold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            CONQUER BPO ACCELERATOR
          </span>
        </div>
        {user ? (
          <Link href="/dashboard" className="text-sm px-4 py-2 rounded-md" style={{ background: "#E8A33D", color: "#171308" }}>
            Go to dashboard
          </Link>
        ) : (
          <Link href="/login" className="text-sm px-4 py-2 rounded-md" style={{ border: "1px solid #262C36" }}>
            Log in
          </Link>
        )}
      </header>

      <section className="flex-1 flex flex-col items-center text-center px-6 py-20 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-semibold leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Run your entire BPO operation from one dashboard.
        </h1>
        <p className="mt-5 text-base sm:text-lg" style={{ color: "#8791A0" }}>
          AI proposal writing, automated job hunting, lead scoring, a built-in CRM,
          a vetted vendor marketplace, and real-time profit tracking — everything bolted together, nothing bolted on.
        </p>

        <div className="mt-12 grid sm:grid-cols-2 gap-5 w-full">
          <PricingCard
            title="Monthly"
            price="$149"
            period="/month"
            note="Cancel anytime"
            plan="monthly"
            loggedIn={!!user}
          />
          <PricingCard
            title="Yearly"
            price="$1,490"
            period="/year"
            note="2 months free vs. monthly"
            plan="yearly"
            highlighted
            loggedIn={!!user}
          />
        </div>
      </section>

      <footer className="text-center text-xs pb-8" style={{ color: "#8791A0" }}>
        Conquer BPO Accelerator — a Conquer Group LLC product
      </footer>
    </main>
  );
}

function PricingCard({ title, price, period, note, plan, highlighted, loggedIn }) {
  return (
    <div
      className="rounded-xl p-6 flex flex-col gap-3 text-left"
      style={{
        background: "#1A1F27",
        border: highlighted ? "1px solid #E8A33D" : "1px solid #262C36",
      }}
    >
      <span className="text-sm" style={{ color: "#8791A0" }}>{title}</span>
      <div className="flex items-end gap-1">
        <span className="text-3xl font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{price}</span>
        <span className="text-sm mb-1" style={{ color: "#8791A0" }}>{period}</span>
      </div>
      <span className="text-xs" style={{ color: "#4FB8A8" }}>{note}</span>
      <PricingButtons plan={plan} loggedIn={loggedIn} />
    </div>
  );
}
