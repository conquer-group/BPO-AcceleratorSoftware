"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from "recharts";
import { createClient } from "../lib/supabase/client";

/* ---------- icon set (no external icon package needed) ---------- */
function Icon({ name, size = 16, style, className, fill = "none" }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill, stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", style, className };
  switch (name) {
    case "grid": return <svg {...common}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
    case "users": return <svg {...common}><circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c0-3.3 2.9-5.6 6.5-5.6s6.5 2.3 6.5 5.6"/><circle cx="17" cy="8.3" r="2.4"/><path d="M15.5 14.6c2.8.4 5 2.3 5 5.4"/></svg>;
    case "file": return <svg {...common}><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v5h5"/></svg>;
    case "radar": return <svg {...common}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/><line x1="12" y1="12" x2="19" y2="7"/></svg>;
    case "store": return <svg {...common}><path d="M3 9l1.5-6h15L21 9"/><rect x="3" y="9" width="18" height="11"/><line x1="9" y1="20" x2="9" y2="13"/></svg>;
    case "chart": return <svg {...common}><path d="M3 3v18h18"/><polyline points="3,15 9,9 13,13 21,5"/></svg>;
    case "plus": return <svg {...common}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case "loader": return <svg {...common}><circle cx="12" cy="12" r="9" strokeOpacity="0.25"/><path d="M21 12a9 9 0 0 0-9-9"/></svg>;
    case "sparkles": return <svg {...common} fill="currentColor" stroke="none"><path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8z"/><circle cx="19" cy="5" r="1"/><circle cx="5" cy="19" r="1"/></svg>;
    case "x": return <svg {...common}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case "search": return <svg {...common}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
    case "trending-up": return <svg {...common}><polyline points="3 17 9 11 13 15 21 7"/><polyline points="14 7 21 7 21 14"/></svg>;
    case "trending-down": return <svg {...common}><polyline points="3 7 9 13 13 9 21 17"/><polyline points="14 17 21 17 21 10"/></svg>;
    case "flame": return <svg {...common}><path d="M12 2c-1 4-6 5.5-6 10.5A6 6 0 0 0 18 12.5c0-3-2-4-2-6 0 2-1.2 3-2.2 3C13.8 6.5 12 4.5 12 2z"/></svg>;
    case "snow": return <svg {...common}><line x1="12" y1="2" x2="12" y2="22"/><line x1="4.9" y1="4.9" x2="19.1" y2="19.1"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="4.9" y1="19.1" x2="19.1" y2="4.9"/></svg>;
    case "wind": return <svg {...common}><path d="M2 9h13a2.5 2.5 0 1 0-2-4"/><path d="M2 15h16a2.5 2.5 0 1 1-2 4"/><path d="M2 12h10"/></svg>;
    case "pin": return <svg {...common}><path d="M12 21s-7-7.5-7-12a7 7 0 0 1 14 0c0 4.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>;
    case "star": return <svg {...common} fill="currentColor" stroke="none"><polygon points="12,2 15,9 22,9 16.5,13.5 18.5,21 12,17 5.5,21 7.5,13.5 2,9 9,9"/></svg>;
    case "trash": return <svg {...common}><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;
    default: return null;
  }
}

const C = {
  bg: "#12151B", panel: "#1A1F27", panel2: "#1F2530", border: "#262C36",
  text: "#ECEEF2", muted: "#8791A0", amber: "#E8A33D", teal: "#4FB8A8", coral: "#DD6B55",
};
const uid = () => Math.random().toString(36).slice(2, 10);
const money = (n) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");

const SEED_LEADS = [
  { id: uid(), name: "Marta Solis", company: "Harvestline Foods", sector: "agriculture", budget: 42000, urgency: "immediate", engaged: true, stage: "Proposal", source: "Referral", note: "Needs seasonal harvest logistics support." },
  { id: uid(), name: "Priya Nandan", company: "Vector Cloud Labs", sector: "tech", budget: 65000, urgency: "immediate", engaged: true, stage: "Negotiation", source: "Inbound web", note: "Wants dedicated QA + support pod." },
];
const SEED_VENDORS = [
  { id: uid(), name: "Ironclad Fabrication", category: "construction", rate: "$65/hr", rating: 4.8, location: "Austin, TX", tags: ["welding", "structural"], vetted: true },
  { id: uid(), name: "Northstack Devs", category: "tech", rate: "$55/hr", rating: 4.9, location: "Remote", tags: ["full-stack", "QA"], vetted: true },
];
const SEED_PROJECTS = [
  { id: uid(), client: "Vector Cloud Labs", month: "Mar", revenue: 42000, vendorCost: 18000, opsCost: 6000 },
];
const JOB_FEED = [
  { id: uid(), platform: "Upwork", title: "Ongoing bookkeeping & AP/AR for agri exporter", category: "agriculture", budget: 3200, postedAgo: "2h ago", tags: ["bookkeeping", "monthly retainer"] },
  { id: uid(), platform: "LinkedIn", title: "Construction PM support, 3 active job sites", category: "construction", budget: 12000, postedAgo: "5h ago", tags: ["project management", "on-site"] },
  { id: uid(), platform: "Upwork", title: "QA + customer support pod for SaaS launch", category: "tech", budget: 18500, postedAgo: "1h ago", tags: ["QA", "support", "SaaS"] },
  { id: uid(), platform: "Fiverr Pro", title: "Seasonal harvest labor coordination", category: "agriculture", budget: 9000, postedAgo: "1d ago", tags: ["labor coordination"] },
  { id: uid(), platform: "Freelancer", title: "Estimating & takeoff services, commercial builds", category: "construction", budget: 6400, postedAgo: "3h ago", tags: ["estimating", "takeoff"] },
];
const TABS = [
  { id: "overview", label: "Overview", icon: "grid" },
  { id: "leads", label: "Leads", icon: "users" },
  { id: "proposals", label: "Proposals", icon: "file" },
  { id: "jobs", label: "Job Hunter", icon: "radar" },
  { id: "vendors", label: "Vendors", icon: "store" },
  { id: "profit", label: "Profit", icon: "chart" },
];

function scoreLead(l) {
  let s = 0;
  if (l.budget >= 50000) s += 35; else if (l.budget >= 20000) s += 25; else if (l.budget >= 5000) s += 15; else s += 5;
  if (l.urgency === "immediate") s += 25; else if (l.urgency === "this_month") s += 15; else s += 5;
  if (["tech", "agriculture", "construction"].includes(l.sector)) s += 25; else s += 10;
  if (l.engaged) s += 15;
  return Math.min(100, s);
}
function tierOf(score) {
  if (score >= 75) return { label: "Hot", color: C.coral, icon: "flame" };
  if (score >= 50) return { label: "Warm", color: C.amber, icon: "wind" };
  return { label: "Cold", color: C.teal, icon: "snow" };
}

function Field({ label, children }) {
  return <label className="flex flex-col gap-1 text-sm"><span style={{ color: C.muted }}>{label}</span>{children}</label>;
}
const inputCls = "px-3 py-2 rounded-md text-sm outline-none focus:ring-2 transition";
function inputStyle() { return { background: C.panel2, border: `1px solid ${C.border}`, color: C.text }; }
function Btn({ children, onClick, variant = "solid", disabled, type = "button" }) {
  const base = "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition disabled:opacity-50";
  const styles = variant === "solid" ? { background: C.amber, color: "#171308" }
    : variant === "ghost" ? { background: "transparent", color: C.text, border: `1px solid ${C.border}` }
    : { background: C.coral, color: "#1b0b06" };
  return <button type={type} disabled={disabled} onClick={onClick} className={base} style={styles}>{children}</button>;
}
function KpiCard({ label, value, sub, accent }) {
  return (
    <div className="rounded-lg p-4 flex flex-col gap-1" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
      <span className="text-xs uppercase tracking-wider" style={{ color: C.muted }}>{label}</span>
      <span className="text-2xl font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: accent || C.text }}>{value}</span>
      {sub && <span className="text-xs" style={{ color: C.muted }}>{sub}</span>}
    </div>
  );
}

/* ---------- main app ---------- */
export default function AcceleratorApp({ userEmail, plan }) {
  const supabase = useMemo(() => createClient(), []);
  const [ready, setReady] = useState(false);
  const [leads, setLeads] = useState(SEED_LEADS);
  const [vendors, setVendors] = useState(SEED_VENDORS);
  const [projects, setProjects] = useState(SEED_PROJECTS);
  const [proposals, setProposals] = useState([]);
  const [ticker, setTicker] = useState(["System online — Conquer BPO Accelerator initialized"]);
  const [tab, setTab] = useState("overview");
  const [saveErr, setSaveErr] = useState(false);
  const [userId, setUserId] = useState(null);

  const pushTicker = useCallback((msg) => setTicker((t) => [msg, ...t].slice(0, 24)), []);

  // Load this user's shared workspace row from Supabase (works from any device/browser they log in on)
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data, error } = await supabase.from("workspaces").select("data").eq("user_id", user.id).single();
      if (!error && data?.data && Object.keys(data.data).length) {
        const d = data.data;
        if (d.leads) setLeads(d.leads);
        if (d.vendors) setVendors(d.vendors);
        if (d.projects) setProjects(d.projects);
        if (d.proposals) setProposals(d.proposals);
        if (d.ticker) setTicker(d.ticker);
      }
      setReady(true);
    })();
  }, [supabase]);

  // Persist to the shared workspace row on any change
  useEffect(() => {
    if (!ready || !userId) return;
    (async () => {
      const { error } = await supabase.from("workspaces").upsert({
        user_id: userId,
        data: { leads, vendors, projects, proposals, ticker },
        updated_at: new Date().toISOString(),
      });
      setSaveErr(!!error);
    })();
  }, [leads, vendors, projects, proposals, ticker, ready, userId, supabase]);

  const kpis = useMemo(() => {
    const activeLeads = leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").length;
    const won = leads.filter((l) => l.stage === "Won").length;
    const closedTotal = leads.filter((l) => l.stage === "Won" || l.stage === "Lost").length;
    const winRate = closedTotal ? Math.round((won / closedTotal) * 100) : 0;
    const netMargin = projects.reduce((a, p) => a + (p.revenue - p.vendorCost - p.opsCost), 0);
    return { activeLeads, proposalsSent: proposals.length, winRate, netMargin, vendorCount: vendors.length };
  }, [leads, proposals, projects, vendors]);

  const signOut = async () => { await supabase.auth.signOut(); window.location.href = "/"; };
  const manageBilling = async () => {
    const res = await fetch("/api/create-portal-session", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <div className="w-full min-h-screen flex" style={{ background: C.bg, color: C.text, fontFamily: "'Inter', sans-serif" }}>
      <nav className="hidden sm:flex flex-col w-56 shrink-0 p-4 gap-1" style={{ borderRight: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2 px-2 pb-6">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: C.amber }} />
          <span className="font-semibold tracking-tight text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>CONQUER BPO<br/>ACCELERATOR</span>
        </div>
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition"
              style={{ background: active ? C.panel2 : "transparent", color: active ? C.amber : C.muted }}>
              <Icon name={t.icon} size={16} /> {t.label}
            </button>
          );
        })}
        <div className="mt-auto px-2 pt-6 flex flex-col gap-2">
          <span className="text-xs truncate" style={{ color: C.muted }}>{userEmail}</span>
          <span className="text-xs capitalize" style={{ color: C.teal }}>{plan} plan</span>
          <button onClick={manageBilling} className="text-xs text-left underline" style={{ color: C.muted }}>Manage billing</button>
          <button onClick={signOut} className="text-xs text-left underline" style={{ color: C.muted }}>Sign out</button>
          <span className="text-xs" style={{ color: C.muted }}>{saveErr ? "Sync issue — retrying…" : "Synced to your account"}</span>
        </div>
      </nav>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="w-full overflow-hidden py-2 px-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${C.border}`, background: C.panel }}>
          <span className="text-xs shrink-0 px-2 py-0.5 rounded font-medium" style={{ background: C.amber, color: "#171308" }}>LIVE</span>
          <div className="overflow-hidden flex-1">
            <div className="flex whitespace-nowrap ticker-track" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px", color: C.muted }}>
              {[...ticker, ...ticker].map((msg, i) => <span key={i} className="mr-10">• {msg}</span>)}
            </div>
          </div>
        </div>

        <div className="sm:hidden flex gap-1 p-2 overflow-x-auto" style={{ borderBottom: `1px solid ${C.border}` }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className="text-xs px-3 py-1.5 rounded-full shrink-0"
              style={{ background: tab === t.id ? C.amber : C.panel2, color: tab === t.id ? "#171308" : C.muted }}>{t.label}</button>
          ))}
        </div>

        <main className="flex-1 p-5 sm:p-7 overflow-y-auto">
          {tab === "overview" && <Overview kpis={kpis} leads={leads} projects={projects} />}
          {tab === "leads" && <Leads leads={leads} setLeads={setLeads} pushTicker={pushTicker} setTab={setTab} />}
          {tab === "proposals" && <Proposals proposals={proposals} setProposals={setProposals} pushTicker={pushTicker} />}
          {tab === "jobs" && <JobHunter pushTicker={pushTicker} setLeads={setLeads} />}
          {tab === "vendors" && <Vendors vendors={vendors} setVendors={setVendors} pushTicker={pushTicker} />}
          {tab === "profit" && <Profit projects={projects} setProjects={setProjects} pushTicker={pushTicker} />}
        </main>
      </div>
    </div>
  );
}

function Overview({ kpis, leads, projects }) {
  const marginPositive = kpis.netMargin >= 0;
  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Operation Overview</h1>
        <p className="text-sm mt-1" style={{ color: C.muted }}>Everything running through your BPO desk right now.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard label="Active Leads" value={kpis.activeLeads} />
        <KpiCard label="Proposals Sent" value={kpis.proposalsSent} />
        <KpiCard label="Win Rate" value={`${kpis.winRate}%`} accent={C.teal} />
        <KpiCard label="Net Margin (tracked)" value={money(kpis.netMargin)} accent={marginPositive ? C.teal : C.coral} />
        <KpiCard label="Vetted Vendors" value={kpis.vendorCount} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg p-4" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
          <h2 className="text-sm font-medium mb-3" style={{ color: C.muted }}>Pipeline by stage</h2>
          <div className="flex flex-col gap-2">
            {["New", "Contacted", "Proposal", "Negotiation", "Won", "Lost"].map((stage) => {
              const count = leads.filter((l) => l.stage === stage).length;
              return (
                <div key={stage} className="flex items-center gap-3 text-sm">
                  <span className="w-24 shrink-0" style={{ color: C.muted }}>{stage}</span>
                  <div className="flex-1 h-2 rounded-full" style={{ background: C.panel2 }}>
                    <div className="h-2 rounded-full" style={{ width: `${Math.min(100, count * 20)}%`, background: C.amber }} />
                  </div>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-lg p-4" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
          <h2 className="text-sm font-medium mb-3" style={{ color: C.muted }}>Recent projects</h2>
          <div className="flex flex-col divide-y" style={{ borderColor: C.border }}>
            {projects.slice(-5).reverse().map((p) => {
              const margin = p.revenue - p.vendorCost - p.opsCost;
              return (
                <div key={p.id} className="flex items-center justify-between py-2 text-sm">
                  <span>{p.client}</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: margin >= 0 ? C.teal : C.coral }}>{money(margin)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Leads({ leads, setLeads, pushTicker, setTab }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", sector: "tech", budget: "", urgency: "this_month", engaged: false, source: "Inbound web", note: "" });
  const [selected, setSelected] = useState(null);

  const addLead = () => {
    if (!form.name || !form.company) return;
    const lead = { id: uid(), stage: "New", ...form, budget: Number(form.budget) || 0 };
    setLeads((l) => [lead, ...l]);
    pushTicker(`New lead captured — ${form.company} (${tierOf(scoreLead(lead)).label})`);
    setForm({ name: "", company: "", sector: "tech", budget: "", urgency: "this_month", engaged: false, source: "Inbound web", note: "" });
    setShowForm(false);
  };
  const setStage = (id, stage) => { setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, stage } : l))); pushTicker(`Lead stage updated → ${stage}`); };
  const removeLead = (id) => setLeads((ls) => ls.filter((l) => l.id !== id));

  return (
    <div className="flex flex-col gap-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Leads &amp; CRM</h1>
          <p className="text-sm mt-1" style={{ color: C.muted }}>Every prospect, scored the moment they land.</p>
        </div>
        <Btn onClick={() => setShowForm((s) => !s)}><Icon name="plus" size={16} /> Add lead</Btn>
      </div>

      {showForm && (
        <div className="grid sm:grid-cols-3 gap-3 rounded-lg p-4" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
          <Field label="Contact name"><input className={inputCls} style={inputStyle()} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Company"><input className={inputCls} style={inputStyle()} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></Field>
          <Field label="Sector">
            <select className={inputCls} style={inputStyle()} value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })}>
              <option value="tech">Tech</option><option value="agriculture">Agriculture</option><option value="construction">Construction</option><option value="other">Other</option>
            </select>
          </Field>
          <Field label="Budget (USD)"><input type="number" className={inputCls} style={inputStyle()} value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></Field>
          <Field label="Urgency">
            <select className={inputCls} style={inputStyle()} value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
              <option value="immediate">Immediate</option><option value="this_month">This month</option><option value="later">Later</option>
            </select>
          </Field>
          <Field label="Source"><input className={inputCls} style={inputStyle()} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm sm:col-span-3" style={{ color: C.muted }}>
            <input type="checkbox" checked={form.engaged} onChange={(e) => setForm({ ...form, engaged: e.target.checked })} /> Has already replied / engaged with outreach
          </label>
          <div className="sm:col-span-3 flex gap-2">
            <Btn onClick={addLead}>Save lead</Btn>
            <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancel</Btn>
          </div>
        </div>
      )}

      <div className="rounded-lg overflow-x-auto" style={{ border: `1px solid ${C.border}` }}>
        <table className="w-full text-sm">
          <thead><tr style={{ background: C.panel2, color: C.muted }}>{["Lead", "Sector", "Budget", "Score", "Stage", ""].map((h) => <th key={h} className="text-left px-4 py-2 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {leads.map((l) => {
              const score = scoreLead(l);
              const tier = tierOf(score);
              return (
                <tr key={l.id} style={{ borderTop: `1px solid ${C.border}`, background: C.panel }} className="hover:brightness-110 cursor-pointer" onClick={() => setSelected(l)}>
                  <td className="px-4 py-3"><div className="font-medium">{l.company}</div><div style={{ color: C.muted }} className="text-xs">{l.name}</div></td>
                  <td className="px-4 py-3 capitalize" style={{ color: C.muted }}>{l.sector}</td>
                  <td className="px-4 py-3" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{money(l.budget)}</td>
                  <td className="px-4 py-3"><span className="flex items-center gap-1.5" style={{ color: tier.color }}><Icon name={tier.icon} size={14} /> {score} · {tier.label}</span></td>
                  <td className="px-4 py-3">
                    <select onClick={(e) => e.stopPropagation()} className="text-xs rounded px-2 py-1" style={inputStyle()} value={l.stage} onChange={(e) => setStage(l.id, e.target.value)}>
                      {["New", "Contacted", "Proposal", "Negotiation", "Won", "Lost"].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right"><button onClick={(e) => { e.stopPropagation(); removeLead(l.id); }} style={{ color: C.muted }}><Icon name="trash" size={14} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-10" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setSelected(null)}>
          <div className="rounded-lg p-5 max-w-md w-full" style={{ background: C.panel, border: `1px solid ${C.border}` }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div><h3 className="font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{selected.company}</h3><p className="text-sm" style={{ color: C.muted }}>{selected.name} · {selected.source}</p></div>
              <button onClick={() => setSelected(null)}><Icon name="x" size={18} style={{ color: C.muted }} /></button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><span style={{ color: C.muted }}>Budget</span><div style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{money(selected.budget)}</div></div>
              <div><span style={{ color: C.muted }}>Score</span><div>{scoreLead(selected)} / 100</div></div>
              <div><span style={{ color: C.muted }}>Urgency</span><div className="capitalize">{selected.urgency.replace("_", " ")}</div></div>
              <div><span style={{ color: C.muted }}>Sector</span><div className="capitalize">{selected.sector}</div></div>
            </div>
            {selected.note && <p className="mt-3 text-sm" style={{ color: C.muted }}>{selected.note}</p>}
            <div className="mt-4"><Btn onClick={() => { setTab("proposals"); setSelected(null); }}><Icon name="sparkles" size={16} /> Draft proposal for this lead</Btn></div>
          </div>
        </div>
      )}
    </div>
  );
}

function Proposals({ proposals, setProposals, pushTicker }) {
  const [clientName, setClientName] = useState("");
  const [scope, setScope] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [budget, setBudget] = useState("");
  const [tone, setTone] = useState("confident and consultative");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const generate = async () => {
    if (!clientName || !scope) return;
    setLoading(true); setError(""); setOutput("");
    try {
      const res = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName, scope, deliverables, budget, tone }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setOutput(data.text);
      const record = { id: uid(), clientName, scope, budget, createdAt: new Date().toISOString(), text: data.text };
      setProposals((p) => [record, ...p]);
      pushTicker(`Proposal drafted for ${clientName}`);
    } catch (e) {
      setError("Couldn't generate a proposal: " + e.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-5 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>AI Proposal Writer</h1>
        <p className="text-sm mt-1" style={{ color: C.muted }}>Fill in the brief, get a client-ready draft in seconds.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-3 rounded-lg p-4" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
        <Field label="Client / company name"><input className={inputCls} style={inputStyle()} value={clientName} onChange={(e) => setClientName(e.target.value)} /></Field>
        <Field label="Budget context (optional, USD)"><input className={inputCls} style={inputStyle()} value={budget} onChange={(e) => setBudget(e.target.value)} /></Field>
        <div className="md:col-span-2"><Field label="Project scope"><textarea rows={3} className={inputCls} style={inputStyle()} value={scope} onChange={(e) => setScope(e.target.value)} /></Field></div>
        <div className="md:col-span-2"><Field label="Key deliverables (optional)"><textarea rows={2} className={inputCls} style={inputStyle()} value={deliverables} onChange={(e) => setDeliverables(e.target.value)} /></Field></div>
        <Field label="Tone">
          <select className={inputCls} style={inputStyle()} value={tone} onChange={(e) => setTone(e.target.value)}>
            <option value="confident and consultative">Confident &amp; consultative</option>
            <option value="warm and relationship-first">Warm &amp; relationship-first</option>
            <option value="direct and results-driven">Direct &amp; results-driven</option>
          </select>
        </Field>
        <div className="flex items-end">
          <Btn onClick={generate} disabled={loading || !clientName || !scope}>
            {loading ? <Icon name="loader" size={16} className="animate-spin" /> : <Icon name="sparkles" size={16} />} {loading ? "Drafting…" : "Generate proposal"}
          </Btn>
        </div>
      </div>
      {error && <p className="text-sm" style={{ color: C.coral }}>{error}</p>}
      {output && <div className="rounded-lg p-5 whitespace-pre-wrap text-sm leading-relaxed" style={{ background: C.panel, border: `1px solid ${C.border}` }}>{output}</div>}
      {proposals.length > 0 && (
        <div>
          <h2 className="text-sm font-medium mb-2" style={{ color: C.muted }}>Past proposals</h2>
          <div className="flex flex-col gap-2">
            {proposals.map((p) => (
              <div key={p.id} className="rounded-md px-4 py-2 text-sm flex items-center justify-between" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
                <span>{p.clientName}</span><span style={{ color: C.muted }} className="text-xs">{new Date(p.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function JobHunter({ pushTicker, setLeads }) {
  const [category, setCategory] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [minBudget, setMinBudget] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);

  const runHunt = () => {
    setScanning(true); setResults(null);
    setTimeout(() => {
      const matches = JOB_FEED
        .filter((j) => category === "all" || j.category === category)
        .filter((j) => j.budget >= Number(minBudget || 0))
        .filter((j) => !keyword || (j.title + j.tags.join(" ")).toLowerCase().includes(keyword.toLowerCase()))
        .map((j) => ({ ...j, matchScore: Math.min(99, 60 + Math.round(j.budget / 500)) }))
        .sort((a, b) => b.matchScore - a.matchScore);
      setResults(matches); setScanning(false);
      pushTicker(`Job hunt complete — ${matches.length} matches found`);
    }, 1100);
  };
  const convertToLead = (job) => {
    const lead = { id: uid(), name: "Platform contact", company: job.title.slice(0, 40), sector: job.category, budget: job.budget, urgency: "this_month", engaged: false, stage: "New", source: job.platform, note: `Sourced via ${job.platform}: ${job.title}` };
    setLeads((ls) => [lead, ...ls]);
    pushTicker(`${job.platform} match converted to lead`);
  };

  return (
    <div className="flex flex-col gap-5 max-w-6xl">
      <div>
        <h1 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Automated Job Hunter</h1>
        <p className="text-sm mt-1" style={{ color: C.muted }}>Scans your target platforms for matching work and scores each one.</p>
      </div>
      <div className="rounded-lg p-4 grid sm:grid-cols-4 gap-3 items-end" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
        <Field label="Category">
          <select className={inputCls} style={inputStyle()} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All sectors</option><option value="tech">Tech</option><option value="agriculture">Agriculture</option><option value="construction">Construction</option>
          </select>
        </Field>
        <Field label="Keyword"><input className={inputCls} style={inputStyle()} value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g. QA, bookkeeping" /></Field>
        <Field label="Min. budget (USD)"><input type="number" className={inputCls} style={inputStyle()} value={minBudget} onChange={(e) => setMinBudget(e.target.value)} /></Field>
        <Btn onClick={runHunt} disabled={scanning}>{scanning ? <Icon name="loader" size={16} className="animate-spin" /> : <Icon name="radar" size={16} />} {scanning ? "Scanning…" : "Run job hunt"}</Btn>
      </div>
      <p className="text-xs" style={{ color: C.muted }}>Running on a seeded demo feed. Live scanning of Upwork, LinkedIn, Fiverr, etc. requires connecting each platform's API with your own credentials.</p>
      {results && (
        <div className="flex flex-col gap-2">
          {results.length === 0 && <p className="text-sm" style={{ color: C.muted }}>No matches for these filters — widen your search.</p>}
          {results.map((j) => (
            <div key={j.id} className="rounded-lg p-4 flex items-center justify-between gap-4" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs mb-1" style={{ color: C.muted }}><span className="px-2 py-0.5 rounded" style={{ background: C.panel2 }}>{j.platform}</span><span>{j.postedAgo}</span></div>
                <div className="font-medium truncate">{j.title}</div>
                <div className="text-xs mt-1" style={{ color: C.muted }}>{j.tags.join(" · ")}</div>
              </div>
              <div className="text-right shrink-0">
                <div style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{money(j.budget)}</div>
                <div className="text-xs mb-2" style={{ color: C.teal }}>{j.matchScore}% match</div>
                <Btn variant="ghost" onClick={() => convertToLead(j)}><Icon name="plus" size={14} /> To CRM</Btn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Vendors({ vendors, setVendors, pushTicker }) {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: "tech", rate: "", rating: 4.5, location: "", tags: "" });
  const filtered = vendors.filter((v) => (category === "all" || v.category === category) && v.name.toLowerCase().includes(search.toLowerCase()));
  const addVendor = () => {
    if (!form.name) return;
    const vendor = { id: uid(), ...form, rating: Number(form.rating), tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean), vetted: false };
    setVendors((v) => [vendor, ...v]);
    pushTicker(`New vendor added to marketplace — ${form.name}`);
    setForm({ name: "", category: "tech", rate: "", rating: 4.5, location: "", tags: "" });
    setShowForm(false);
  };
  return (
    <div className="flex flex-col gap-5 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Vendor Marketplace</h1><p className="text-sm mt-1" style={{ color: C.muted }}>Vetted capacity across every sector you operate in.</p></div>
        <Btn onClick={() => setShowForm((s) => !s)}><Icon name="plus" size={16} /> Add vendor</Btn>
      </div>
      <div className="flex flex-wrap gap-3">
        <select className={inputCls} style={inputStyle()} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option><option value="tech">Tech</option><option value="agriculture">Agriculture</option><option value="construction">Construction</option>
        </select>
        <div className="flex items-center gap-2 px-3 py-2 rounded-md flex-1 min-w-[180px]" style={inputStyle()}>
          <Icon name="search" size={14} style={{ color: C.muted }} />
          <input className="bg-transparent outline-none text-sm flex-1" placeholder="Search vendors" value={search} onChange={(e) => setSearch(e.target.value)} style={{ color: C.text }} />
        </div>
      </div>
      {showForm && (
        <div className="grid sm:grid-cols-3 gap-3 rounded-lg p-4" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
          <Field label="Vendor name"><input className={inputCls} style={inputStyle()} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Category">
            <select className={inputCls} style={inputStyle()} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="tech">Tech</option><option value="agriculture">Agriculture</option><option value="construction">Construction</option>
            </select>
          </Field>
          <Field label="Rate"><input className={inputCls} style={inputStyle()} value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} placeholder="$/hr" /></Field>
          <Field label="Location"><input className={inputCls} style={inputStyle()} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
          <Field label="Rating (1-5)"><input type="number" step="0.1" min="1" max="5" className={inputCls} style={inputStyle()} value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} /></Field>
          <Field label="Tags (comma separated)"><input className={inputCls} style={inputStyle()} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></Field>
          <div className="sm:col-span-3 flex gap-2"><Btn onClick={addVendor}>Save vendor</Btn><Btn variant="ghost" onClick={() => setShowForm(false)}>Cancel</Btn></div>
        </div>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((v) => (
          <div key={v.id} className="rounded-lg p-4 flex flex-col gap-2" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
            <div className="flex items-start justify-between"><span className="font-medium">{v.name}</span>{v.vetted && <span className="text-xs px-2 py-0.5 rounded" style={{ background: C.panel2, color: C.teal }}>Vetted</span>}</div>
            <div className="flex items-center gap-1 text-xs" style={{ color: C.muted }}><Icon name="pin" size={12} /> {v.location}</div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{v.rate}</span>
              <span className="flex items-center gap-1" style={{ color: C.amber }}><Icon name="star" size={13} fill={C.amber} /> {v.rating}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">{v.tags.map((t) => <span key={t} className="text-xs px-2 py-0.5 rounded" style={{ background: C.panel2, color: C.muted }}>{t}</span>)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Profit({ projects, setProjects, pushTicker }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ client: "", month: "", revenue: "", vendorCost: "", opsCost: "" });
  const addProject = () => {
    if (!form.client || !form.month) return;
    const p = { id: uid(), client: form.client, month: form.month, revenue: Number(form.revenue) || 0, vendorCost: Number(form.vendorCost) || 0, opsCost: Number(form.opsCost) || 0 };
    setProjects((ps) => [...ps, p]);
    pushTicker(`Profit entry logged — ${form.client}`);
    setForm({ client: "", month: "", revenue: "", vendorCost: "", opsCost: "" });
    setShowForm(false);
  };
  const chartData = projects.map((p) => ({ name: p.month, Revenue: p.revenue, Cost: p.vendorCost + p.opsCost, Margin: p.revenue - p.vendorCost - p.opsCost }));
  const totals = projects.reduce((a, p) => ({ revenue: a.revenue + p.revenue, cost: a.cost + p.vendorCost + p.opsCost }), { revenue: 0, cost: 0 });
  const margin = totals.revenue - totals.cost;
  return (
    <div className="flex flex-col gap-5 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Real-Time Profit Tracker</h1><p className="text-sm mt-1" style={{ color: C.muted }}>Revenue, vendor cost, and margin per engagement.</p></div>
        <Btn onClick={() => setShowForm((s) => !s)}><Icon name="plus" size={16} /> Log entry</Btn>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Total revenue" value={money(totals.revenue)} />
        <KpiCard label="Total cost" value={money(totals.cost)} accent={C.coral} />
        <KpiCard label="Net margin" value={money(margin)} accent={margin >= 0 ? C.teal : C.coral} sub={margin >= 0 ? <span className="flex items-center gap-1"><Icon name="trending-up" size={12} /> healthy</span> : <span className="flex items-center gap-1"><Icon name="trending-down" size={12} /> under pressure</span>} />
      </div>
      {showForm && (
        <div className="grid sm:grid-cols-5 gap-3 rounded-lg p-4" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
          <Field label="Client"><input className={inputCls} style={inputStyle()} value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} /></Field>
          <Field label="Month"><input className={inputCls} style={inputStyle()} placeholder="e.g. Aug" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} /></Field>
          <Field label="Revenue"><input type="number" className={inputCls} style={inputStyle()} value={form.revenue} onChange={(e) => setForm({ ...form, revenue: e.target.value })} /></Field>
          <Field label="Vendor cost"><input type="number" className={inputCls} style={inputStyle()} value={form.vendorCost} onChange={(e) => setForm({ ...form, vendorCost: e.target.value })} /></Field>
          <Field label="Ops cost"><input type="number" className={inputCls} style={inputStyle()} value={form.opsCost} onChange={(e) => setForm({ ...form, opsCost: e.target.value })} /></Field>
          <div className="sm:col-span-5 flex gap-2"><Btn onClick={addProject}>Save entry</Btn><Btn variant="ghost" onClick={() => setShowForm(false)}>Cancel</Btn></div>
        </div>
      )}
      <div className="rounded-lg p-4" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartData}>
            <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke={C.muted} fontSize={12} />
            <YAxis stroke={C.muted} fontSize={12} />
            <Tooltip contentStyle={{ background: C.panel2, border: `1px solid ${C.border}`, color: C.text }} />
            <Legend wrapperStyle={{ fontSize: 12, color: C.muted }} />
            <Bar dataKey="Revenue" fill={C.teal} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Cost" fill={C.coral} radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="Margin" stroke={C.amber} strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-lg overflow-x-auto" style={{ border: `1px solid ${C.border}` }}>
        <table className="w-full text-sm">
          <thead><tr style={{ background: C.panel2, color: C.muted }}>{["Client", "Month", "Revenue", "Vendor cost", "Ops cost", "Margin"].map((h) => <th key={h} className="text-left px-4 py-2 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {projects.map((p) => {
              const m = p.revenue - p.vendorCost - p.opsCost;
              return (
                <tr key={p.id} style={{ borderTop: `1px solid ${C.border}`, background: C.panel }}>
                  <td className="px-4 py-2">{p.client}</td>
                  <td className="px-4 py-2" style={{ color: C.muted }}>{p.month}</td>
                  <td className="px-4 py-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{money(p.revenue)}</td>
                  <td className="px-4 py-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{money(p.vendorCost)}</td>
                  <td className="px-4 py-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{money(p.opsCost)}</td>
                  <td className="px-4 py-2" style={{ fontFamily: "'IBM Plex Mono', monospace", color: m >= 0 ? C.teal : C.coral }}>{money(m)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
