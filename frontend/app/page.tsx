"use client";

import { useState, useEffect, useRef } from "react";
import {
  Loader2, Zap, ChevronDown, ChevronRight, AlertTriangle, CheckCircle2,
  Clock, RefreshCw, Database, Cpu, Layers, Code, Copy, Check, Lock,
  Unlock, Layout, List, Terminal, ArrowRight, Play, Eye, FileJson, Info
} from "lucide-react";
import InteractiveBackground from "./components/InteractiveBackground";

const EXAMPLE_PROMPTS = [
  "Build a CRM with login, contacts, dashboard, role-based access, and premium plan with payments. Admins can see analytics.",
  "Create an e-commerce platform with product listings, shopping cart, Stripe checkout, and order tracking.",
  "Build a project management tool like Trello with boards, cards, team members, and deadlines.",
  "Create a hospital management system with patient records, doctor schedules, billing, and pharmacy.",
];

type TabType = "intent" | "db" | "api" | "ui" | "json";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"fast" | "deep">("fast");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("intent");

  // Terminal logs state
  const [logs, setLogs] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const logTimeouts = useRef<NodeJS.Timeout[]>([]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${time}] ${message}`]);
  };

  const clearLogTimeouts = () => {
    logTimeouts.current.forEach((t) => clearTimeout(t));
    logTimeouts.current = [];
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setOutput(null);
    setError(null);
    setLogs([]);
    clearLogTimeouts();

    addLog("⚙️ Initializing Compiler Engine...");
    addLog(`🔧 Optimization Mode selected: ${mode.toUpperCase()} compiler`);
    addLog("🌐 Handshaking with backend API endpoint /generate...");

    // Set up step-by-step simulated logging
    const steps = mode === "fast" ? [
      { delay: 800, msg: "🤖 Handshake complete. Spawning LLM compilation process..." },
      { delay: 1800, msg: "🧠 Analyzing prompt requirements, extracting intents & roles..." },
      { delay: 3500, msg: "🧱 Architecting system design structure & foreign keys..." },
      { delay: 5500, msg: "📝 Formatting Page components & RESTful API endpoints..." },
      { delay: 7200, msg: "🛡️ Running cross-layer static validation checks..." },
    ] : [
      { delay: 800, msg: "🤖 Handshake complete. Spawning multi-stage pipeline agents..." },
      { delay: 2000, msg: "🔍 [Stage 1/4] Intent Extractor active: Meticulously parsing core requirements..." },
      { delay: 6000, msg: "🔍 [Stage 1/4] Core features and user roles successfully identified." },
      { delay: 8000, msg: "📐 [Stage 2/4] System Designer active: Formulating entities and flow steps..." },
      { delay: 15000, msg: "📐 [Stage 2/4] Database relational constraints mapped." },
      { delay: 17000, msg: "📋 [Stage 3/4] Schema Generator active: Constructing UI layouts, APIs, and DB columns..." },
      { delay: 28000, msg: "📋 [Stage 3/4] Schemas built. Matching primary keys and routes..." },
      { delay: 31000, msg: "⚡ [Stage 4/4] Refinement & Self-Repair Agent active: Performing LLM-based audit..." },
      { delay: 45000, msg: "⚡ [Stage 4/4] Aligning UI fields with database table parameters..." },
      { delay: 52000, msg: "🛡️ Running static schema integrity check..." },
    ];

    steps.forEach((step) => {
      const timeout = setTimeout(() => {
        addLog(step.msg);
      }, step.delay);
      logTimeouts.current.push(timeout);
    });

    try {
      const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");
      const startMs = Date.now();

      const res = await fetch(`${API}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, mode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Generation failed");

      clearLogTimeouts();

      // Print completed steps if API was fast
      addLog("✅ Generation output received from API.");
      addLog("🛡️ Running static validation checks...");

      const staticIssues = data.output?.generation_metadata?.static_issues_found ?? 0;
      const llmIssues = data.output?.generation_metadata?.llm_issues_found ?? 0;

      if (staticIssues === 0 && llmIssues === 0) {
        addLog("🎉 Success! Zero cross-layer integrity issues detected.");
      } else {
        addLog(`⚠️ Validation warning: Resolved ${llmIssues} LLM issues, found ${staticIssues} static issues.`);
      }

      addLog(`🚀 Compilation successfully completed in ${data.latency_ms}ms.`);

      setOutput(data.output);
      setLatency(data.latency_ms);
      setActiveTab("intent");
    } catch (e: any) {
      clearLogTimeouts();
      addLog(`❌ ERROR: Compiler failed. Reason: ${e.message}`);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(JSON.stringify(output, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main 
      className="min-h-screen bg-[#08080c] bg-grid-pattern text-gray-200 relative pb-20 overflow-x-hidden selection:bg-violet-500/30"
    >
      {/* Canvas-based interactive particle background */}
      <InteractiveBackground />

      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-black/30 sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Cpu size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wider text-white uppercase flex items-center gap-2">
              App Compiler
            </h1>
            <p className="text-[10px] text-gray-400 font-mono">Natural Language Prompt ➜ Fully Mapped App Config</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 hidden sm:inline">Choose Compilation Mode:</span>
          <div className="bg-black/50 border border-white/10 p-0.5 rounded-lg flex items-center">
            <button
              onClick={() => setMode("fast")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${mode === "fast"
                  ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md shadow-violet-500/10"
                  : "text-gray-400 hover:text-white"
                }`}
            >
              <Zap size={12} /> Fast Mode (~30s)
            </button>
            <button
              onClick={() => setMode("deep")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${mode === "deep"
                  ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md shadow-violet-500/10"
                  : "text-gray-400 hover:text-white"
                }`}
            >
              <Layers size={12} /> Deep Mode (~60s)
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10 space-y-8 animate-slide-up">

        {/* Prompt Input Container */}
        <section className="bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-2xl p-6 space-y-6 glow-border">
          <div className="flex justify-between items-center">
            <label className="text-xs text-violet-400 uppercase tracking-widest font-bold flex items-center gap-2">
              <Info size={14} /> Describe Your Web Application Requirements
            </label>
            <span className="text-xs text-gray-500 font-mono">Accepts full-length user stories</span>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe features, pages, database tables, user access roles, or integrations..."
            className="w-full h-36 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all font-mono shadow-inner"
          />

          {/* Prompt Suggestions */}
          <div className="space-y-2">
            <span className="text-xs text-gray-500 font-mono block">Preset Templates:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EXAMPLE_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(p)}
                  className="text-left text-xs px-4 py-3 rounded-lg border border-white/5 bg-white/[0.01] text-gray-400 hover:text-white hover:border-violet-500/30 hover:bg-violet-500/[0.03] transition-all font-mono truncate"
                >
                  📄 {p}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className={`w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold tracking-wider text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none ${loading ? "glow-btn-active" : ""}`}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                COMPILING SCHEMAS...
              </>
            ) : (
              <>
                <Play size={15} /> COMPILE WEB APPLICATION
              </>
            )}
          </button>
        </section>

        {/* Live Compiler Console */}
        {(loading || logs.length > 0) && (
          <section className="bg-black/85 border border-white/10 rounded-2xl overflow-hidden font-mono shadow-2xl">
            <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-white/10">
              <span className="text-xs text-gray-400 flex items-center gap-2">
                <Terminal size={14} className="text-violet-400" /> Compiler Log Terminal
              </span>
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/30" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/30" />
                <span className="w-3 h-3 rounded-full bg-green-500/30" />
              </div>
            </div>
            <div className="p-4 h-48 overflow-y-auto text-xs space-y-1.5 leading-relaxed selection:bg-emerald-500/20">
              {logs.map((log, idx) => (
                <div key={idx} className={`flex items-start gap-2 ${log.includes("❌") ? "text-red-400" :
                    log.includes("✅") || log.includes("🎉") ? "text-emerald-400" :
                      log.includes("⚠️") ? "text-amber-400" : "text-gray-300"
                  }`}>
                  <span className="text-violet-400/50 shrink-0 select-none">➜</span>
                  <span>{log}</span>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-violet-400/80 animate-pulse">
                  <span className="text-violet-400/50">➜</span>
                  <span>Executing LLM agent nodes...</span>
                  <span className="inline-block w-1.5 h-3 bg-violet-400 animate-pulse">_</span>
                </div>
              )}
              <div ref={terminalEndRef} />
            </div>
          </section>
        )}

        {/* Error panel */}
        {error && (
          <section className="border border-red-500/20 bg-red-500/[0.03] rounded-xl p-4 flex gap-3 items-start animate-slide-up">
            <AlertTriangle size={18} className="text-red-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-red-300">Compilation Pipeline Halted</h4>
              <p className="text-xs text-red-400/80 font-mono mt-1">{error}</p>
            </div>
          </section>
        )}

        {/* Generated Output Showcase */}
        {output && (
          <section className="space-y-6 animate-slide-up">
            {/* Meta Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-400">
                <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/5 border border-emerald-400/10 px-2.5 py-1 rounded-full">
                  <CheckCircle2 size={13} /> Output Ready
                </span>
                <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                  <Clock size={13} /> {latency ?? 0}ms Latency
                </span>
                <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                  <RefreshCw size={13} /> {output.generation_metadata?.compiler_mode === "fast" ? "Fast Mode" : "Deep Mode"}
                </span>
                <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-violet-400">
                  🔧 Resolved Issues: {output.generation_metadata?.llm_issues_found ?? 0}
                </span>
              </div>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-xs hover:bg-white/5 transition-all text-gray-300 hover:text-white font-mono active:scale-95"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-emerald-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={13} /> Copy Full JSON
                  </>
                )}
              </button>
            </div>

            {/* Showcase Visualizer Tabs */}
            <div className="flex overflow-x-auto border-b border-white/10 pb-0.5 gap-1 select-none">
              {(
                [
                  { id: "intent", label: "🧩 App Overview", icon: Eye },
                  { id: "db", label: "💾 DB Schema", icon: Database },
                  { id: "api", label: "🔌 API Specs", icon: Code },
                  { id: "ui", label: "🖥️ UI Mockup", icon: Layout },
                  { id: "json", label: "📄 Raw JSON", icon: FileJson },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold font-mono transition-all uppercase whitespace-nowrap ${activeTab === tab.id
                        ? "border-violet-500 text-white bg-violet-500/[0.03]"
                        : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/[0.01]"
                      }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 min-h-[400px]">

              {/* 🧩 Tab 1: App Overview / Intent */}
              {activeTab === "intent" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/30 border border-white/5 p-5 rounded-xl space-y-2">
                      <span className="text-[10px] text-violet-400 font-bold uppercase tracking-widest">Application Name</span>
                      <h3 className="text-lg font-bold text-white">{output.intent.app_name}</h3>
                    </div>
                    <div className="bg-black/30 border border-white/5 p-5 rounded-xl space-y-2">
                      <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Application Type</span>
                      <h3 className="text-lg font-bold text-white">{output.intent.app_type}</h3>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">Key Features Mapped:</h4>
                    <div className="flex flex-wrap gap-2">
                      {output.intent.core_features.map((feat: string, i: number) => (
                        <span key={i} className="text-xs px-3 py-1.5 rounded-lg border border-violet-500/10 bg-violet-500/[0.03] text-violet-300 font-mono">
                          ⚡ {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">User Access Roles:</h4>
                    <div className="flex flex-wrap gap-2">
                      {output.intent.user_roles.map((role: string, i: number) => (
                        <span key={i} className="text-xs px-3 py-1.5 rounded-lg border border-blue-500/10 bg-blue-500/[0.03] text-blue-300 font-mono uppercase">
                          👤 {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  {output.intent.assumptions?.length > 0 && (
                    <div className="border border-amber-500/10 bg-amber-500/[0.01] rounded-xl p-4 space-y-2">
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block font-mono">Compiler Assumptions (Vague requirements resolved):</span>
                      <ul className="text-xs text-gray-400 list-disc pl-4 space-y-1">
                        {output.intent.assumptions.map((ass: string, i: number) => (
                          <li key={i}>{ass}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* System Design Flow Journeys */}
                  {output.system_design?.flows?.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">User Journey Flow Diagrams:</h4>
                      <div className="grid grid-cols-1 gap-4">
                        {output.system_design.flows.map((flow: any, i: number) => (
                          <div key={i} className="bg-black/20 border border-white/5 p-5 rounded-xl space-y-3">
                            <span className="text-xs font-bold text-white flex items-center gap-2">
                              🔄 Flow {i + 1}: {flow.name}
                            </span>
                            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                              {flow.steps.map((step: string, sIdx: number) => (
                                <div key={sIdx} className="flex items-center gap-2">
                                  <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-300">
                                    {sIdx + 1}. {step}
                                  </span>
                                  {sIdx < flow.steps.length - 1 && <ArrowRight size={12} className="text-gray-600" />}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 💾 Tab 2: Database Schema */}
              {activeTab === "db" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold font-mono text-gray-300 uppercase tracking-wider">Relational Database Schemas</h3>
                    <span className="text-xs text-gray-500 font-mono">SQLite / Postgres compatible</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {output.schema.database.map((table: any, idx: number) => (
                      <div key={idx} className="bg-black/30 border border-white/5 rounded-xl overflow-hidden flex flex-col">
                        <div className="bg-white/5 px-4 py-3 flex items-center justify-between border-b border-white/5">
                          <span className="text-xs font-bold text-white font-mono flex items-center gap-2">
                            📋 {table.table_name}
                          </span>
                          <span className="text-[10px] text-violet-400 font-mono">PK: {table.primary_key}</span>
                        </div>
                        <div className="p-4 flex-1 space-y-2.5">
                          <div className="space-y-1">
                            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Columns</span>
                            <div className="space-y-1 font-mono">
                              {Object.entries(table.columns).map(([colName, colType]: any) => (
                                <div key={colName} className="flex items-center justify-between text-xs py-1 border-b border-white/[0.02]">
                                  <span className={colName === table.primary_key ? "text-violet-400 font-bold" : "text-gray-300"}>
                                    {colName}
                                  </span>
                                  <span className="text-gray-500 text-[11px]">{colType}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {table.foreign_keys?.length > 0 && (
                            <div className="pt-2 border-t border-white/5 space-y-1">
                              <span className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Foreign Keys / Relations</span>
                              <div className="space-y-1">
                                {table.foreign_keys.map((fk: string, fIdx: number) => (
                                  <span key={fIdx} className="inline-block text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded font-mono">
                                    🔗 {fk}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 🔌 Tab 3: API Specification */}
              {activeTab === "api" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold font-mono text-gray-300 uppercase tracking-wider">Backend API Endpoint Specifications</h3>
                    <span className="text-xs text-gray-500 font-mono">RESTful Endpoints</span>
                  </div>

                  <div className="space-y-4">
                    {output.schema.api.map((endpoint: any, idx: number) => {
                      const methodColors = {
                        GET: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                        POST: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                        PUT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                        DELETE: "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }[endpoint.method as string] || "bg-white/10 text-white";

                      return (
                        <div key={idx} className="bg-black/20 border border-white/5 rounded-xl p-4 space-y-4 font-mono">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 border rounded ${methodColors}`}>
                                {endpoint.method}
                              </span>
                              <span className="text-xs font-bold text-white">{endpoint.path}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              {endpoint.auth_required ? (
                                <span className="flex items-center gap-1 text-[10px] bg-red-500/10 text-red-300 border border-red-500/20 px-2 py-0.5 rounded">
                                  <Lock size={9} /> Protected
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded">
                                  <Unlock size={9} /> Public
                                </span>
                              )}
                              {endpoint.roles_allowed?.length > 0 && (
                                <span className="text-[10px] text-gray-500">
                                  Access: [{endpoint.roles_allowed.join(", ")}]
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-gray-400 font-sans">{endpoint.description}</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-white/5">
                            {endpoint.request_body && Object.keys(endpoint.request_body).length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[10px] text-gray-500">Request Body Schema</span>
                                <pre className="bg-black/40 border border-white/5 p-2 rounded text-gray-300 overflow-auto">
                                  {JSON.stringify(endpoint.request_body, null, 2)}
                                </pre>
                              </div>
                            )}
                            {endpoint.response && (
                              <div className="space-y-1">
                                <span className="text-[10px] text-gray-500">Success Response Schema (200 OK)</span>
                                <pre className="bg-black/40 border border-white/5 p-2 rounded text-gray-300 overflow-auto">
                                  {JSON.stringify(endpoint.response, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 🖥️ Tab 4: UI Page Mockup layout */}
              {activeTab === "ui" && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold font-mono text-gray-300 uppercase tracking-wider">Frontend Interface Wireframe Mockups</h3>
                    <span className="text-xs text-gray-500 font-mono">React / Tailwind components</span>
                  </div>

                  <div className="space-y-6">
                    {output.schema.ui.map((page: any, idx: number) => (
                      <div key={idx} className="border border-white/10 rounded-xl overflow-hidden bg-black/40 shadow-xl">
                        {/* Browser Window Bar */}
                        <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                            <span className="ml-3 font-mono text-gray-400 bg-black/40 border border-white/5 px-2 py-0.5 rounded text-[10px]">
                              {page.route}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-white">{page.page_name}</span>
                          <span className="text-[9px] text-gray-500">Access: {page.accessible_by.join(", ")}</span>
                        </div>

                        {/* Page Visual Canvas */}
                        <div className="p-6 bg-[#0c0c14] space-y-6">
                          {page.components.map((comp: any, cIdx: number) => (
                            <div key={cIdx} className="bg-white/[0.02] border border-white/5 p-4 rounded-lg space-y-3">
                              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider font-mono">
                                  🧩 Component: {comp.component_type}
                                </span>
                                <span className="text-[9px] text-gray-500 font-mono">interactive wireframe</span>
                              </div>

                              {/* Form Mockup */}
                              {comp.component_type === "form" && (
                                <div className="space-y-3 max-w-md">
                                  {comp.fields.map((f: string) => (
                                    <div key={f} className="space-y-1">
                                      <label className="text-[10px] text-gray-400 font-mono capitalize">{f.replace("_", " ")}</label>
                                      <input
                                        type="text"
                                        disabled
                                        placeholder={`Enter ${f.replace("_", " ")}...`}
                                        className="w-full bg-black/30 border border-white/5 rounded-md px-3 py-1.5 text-xs text-gray-400 select-none font-mono"
                                      />
                                    </div>
                                  ))}
                                  <div className="flex gap-2 pt-2">
                                    {(comp.actions || ["Submit"]).map((act: string) => (
                                      <button
                                        key={act}
                                        disabled
                                        className="px-3 py-1.5 text-xs rounded bg-violet-600/90 text-white font-bold font-mono capitalize"
                                      >
                                        {act}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Table Mockup */}
                              {comp.component_type === "table" && (
                                <div className="border border-white/5 rounded overflow-x-auto">
                                  <table className="w-full text-[11px] font-mono text-left">
                                    <thead className="bg-white/5 text-gray-400">
                                      <tr>
                                        {comp.fields.map((f: string) => (
                                          <th key={f} className="px-3 py-2 border-b border-white/5 capitalize">{f.replace("_", " ")}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.02] text-gray-400">
                                      <tr>
                                        {comp.fields.map((f: string) => (
                                          <td key={f} className="px-3 py-2.5">
                                            {f === "id" ? "uuid-128a..." : `[mock_${f}]`}
                                          </td>
                                        ))}
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              )}

                              {/* Chart Mockup */}
                              {comp.component_type === "chart" && (
                                <div className="space-y-3 font-mono">
                                  <div className="text-[10px] text-gray-500">Visualization Metrics: [{comp.fields.join(", ")}]</div>
                                  <div className="h-28 bg-black/40 border border-white/5 rounded-lg flex items-end justify-around p-3">
                                    <div className="w-10 bg-violet-500/80 rounded-t h-[60%] flex items-center justify-center text-[8px] text-white">60%</div>
                                    <div className="w-10 bg-blue-500/80 rounded-t h-[80%] flex items-center justify-center text-[8px] text-white">80%</div>
                                    <div className="w-10 bg-emerald-500/80 rounded-t h-[40%] flex items-center justify-center text-[8px] text-white">40%</div>
                                    <div className="w-10 bg-amber-500/80 rounded-t h-[95%] flex items-center justify-center text-[8px] text-white">95%</div>
                                  </div>
                                </div>
                              )}

                              {/* Card / Stats Mockup */}
                              {comp.component_type === "card" && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono">
                                  {comp.fields.map((f: string, fIdx: number) => (
                                    <div key={fIdx} className="bg-black/30 border border-white/5 rounded-lg p-3 space-y-1">
                                      <span className="text-[9px] text-gray-500 uppercase tracking-widest">{f}</span>
                                      <div className="text-sm font-bold text-white">1,248</div>
                                      <span className="text-[9px] text-emerald-400">▲ +12% this week</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Generic Content list */}
                              {!["form", "table", "chart", "card"].includes(comp.component_type) && (
                                <div className="text-xs text-gray-400 font-mono space-y-1.5">
                                  <div>Structure element containing fields:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {comp.fields.map((f: string) => (
                                      <span key={f} className="bg-white/5 px-2 py-0.5 rounded border border-white/10 text-gray-300">
                                        {f}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 📄 Tab 5: Raw JSON */}
              {activeTab === "json" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-mono">Raw Generated JSON Configuration</span>
                    <button
                      onClick={copyToClipboard}
                      className="text-xs px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white font-mono"
                    >
                      {copied ? "Copied" : "Copy Code"}
                    </button>
                  </div>
                  <div className="bg-black/60 border border-white/10 rounded-xl overflow-x-auto max-h-[600px] shadow-inner">
                    <pre className="text-xs text-emerald-400/80 p-4 leading-relaxed font-mono">
                      {JSON.stringify(output, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Full Config download */}
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(output, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${output.intent.app_name.toLowerCase().replace(/\s+/g, "-")}-config.json`;
                a.click();
              }}
              className="w-full py-3.5 rounded-xl border border-white/10 bg-white/[0.01] hover:bg-white/[0.04] text-xs text-gray-400 hover:text-white hover:border-white/30 transition-all font-mono tracking-wider uppercase flex items-center justify-center gap-1.5"
            >
              ↓ Download Complete compiled JSON Specification
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
