"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PricingButtons({ plan, loggedIn }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const subscribe = async () => {
    if (!loggedIn) {
      router.push(`/login?next=subscribe&plan=${plan}`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Something went wrong — no checkout link was returned.");
        setLoading(false);
      }
    } catch (e) {
      setError("Couldn't reach the server: " + e.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={subscribe}
        disabled={loading}
        className="mt-2 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
        style={{ background: "#E8A33D", color: "#171308" }}
      >
        {loading ? "Redirecting…" : `Subscribe ${plan === "monthly" ? "monthly" : "yearly"}`}
      </button>
      {error && <p className="text-xs" style={{ color: "#DD6B55" }}>{error}</p>}
    </div>
  );
}
