import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function POST(request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: sub } = await supabase.from("subscriptions").select("status").eq("user_id", user.id).single();
  if (!sub || !["active", "trialing"].includes(sub.status)) {
    return NextResponse.json({ error: "Active subscription required" }, { status: 402 });
  }

  const { clientName, scope, deliverables, budget, tone } = await request.json();
  if (!clientName || !scope) return NextResponse.json({ error: "Missing clientName or scope" }, { status: 400 });

  const prompt = `Write a tailored business process outsourcing (BPO) services proposal for Conquer Group LLC, a firm operating across technology, agriculture, and construction services.

Client: ${clientName}
Project scope: ${scope}
Key deliverables: ${deliverables || "to be scoped jointly with the client"}
Budget context: ${budget ? "$" + budget : "not yet specified"}
Tone: ${tone || "confident and consultative"}

Structure the proposal with clear short sections: Executive Summary, Scope of Work, Deliverables, Timeline, Investment, Why Conquer Group. Keep it tight and persuasive — no filler. Return only the proposal text, with no preamble or markdown code fences.`;

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await resp.json();
  if (data.error) return NextResponse.json({ error: data.error.message }, { status: 502 });

  const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
  return NextResponse.json({ text });
}
