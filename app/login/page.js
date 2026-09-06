"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signin"); // signin | signup
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const afterAuth = async () => {
    if (params.get("next") === "subscribe") {
      const plan = params.get("plan") || "monthly";
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
    }
    router.push("/dashboard");
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    const fn = mode === "signin" ? supabase.auth.signInWithPassword : supabase.auth.signUp;
    const { error } = await fn.call(supabase.auth, { email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    if (mode === "signup") {
      setError("Check your email to confirm your account, then log in.");
      setMode("signin");
      return;
    }
    afterAuth();
  };

  const inputStyle = { background: "#1F2530", border: "1px solid #262C36", color: "#ECEEF2" };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl p-6 flex flex-col gap-4" style={{ background: "#1A1F27", border: "1px solid #262C36" }}>
        <h1 className="text-lg font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {mode === "signin" ? "Log in to" : "Create your"} Conquer BPO Accelerator account
        </h1>
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="px-3 py-2 rounded-md text-sm outline-none" style={inputStyle} />
        <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
          className="px-3 py-2 rounded-md text-sm outline-none" style={inputStyle} minLength={6} />
        {error && <p className="text-xs" style={{ color: "#DD6B55" }}>{error}</p>}
        <button type="submit" disabled={loading} className="px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50" style={{ background: "#E8A33D", color: "#171308" }}>
          {loading ? "Please wait…" : mode === "signin" ? "Log in" : "Sign up"}
        </button>
        <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-xs underline" style={{ color: "#8791A0" }}>
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Log in"}
        </button>
      </form>
    </main>
  );
}
