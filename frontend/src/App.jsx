import { useState, useRef, useCallback } from "react";
import { parseCSV, processOrders, buildStats, SAMPLE_CSV } from "./utils/data";
import { C } from "./components/UI";
import Dashboard from "./components/Dashboard";
import Analytics from "./components/Analytics";
import Orders    from "./components/Orders";
import Copilot   from "./components/Copilot";

const TABS = [
  { id:"dashboard", label:"Dashboard", icon:"◈" },
  { id:"analytics", label:"Analytics", icon:"◉" },
  { id:"orders",    label:"Orders",    icon:"≡"  },
  { id:"copilot",   label:"AI Copilot",icon:"✦", badge:"AI" },
];

const initOrders = processOrders(parseCSV(SAMPLE_CSV));
const initStats  = buildStats(initOrders);

export default function App() {
  const [orders,      setOrders]      = useState(initOrders);
  const [stats,       setStats]       = useState(initStats);
  const [activeTab,   setActiveTab]   = useState("dashboard");
  const [apiKey,      setApiKey]      = useState(() => localStorage.getItem("groq_key") || "");
  const [showSettings,setShowSettings]= useState(false);
  const [uploadMsg,   setUploadMsg]   = useState("");
  const fileRef = useRef(null);

  const handleUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed    = parseCSV(ev.target.result);
        const processed = processOrders(parsed);
        const newStats  = buildStats(processed);
        setOrders(processed);
        setStats(newStats);
        setUploadMsg(`✅ Loaded ${processed.length} orders from "${file.name}"`);
        setTimeout(() => setUploadMsg(""), 4000);
      } catch {
        setUploadMsg("❌ Could not parse CSV — check column headers.");
        setTimeout(() => setUploadMsg(""), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, []);

  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem("groq_key", key);
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column" }}>

      {/* ── Header ── */}
      <header style={{
        background:"linear-gradient(90deg,#080f18,#0d1e2e 50%,#080f18)",
        borderBottom:"1px solid rgba(0,229,204,0.13)",
        padding:"0 28px", display:"flex", alignItems:"center",
        justifyContent:"space-between", height:64,
        position:"sticky", top:0, zIndex:100,
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36,height:36,background:"linear-gradient(135deg,#00E5CC,#006B80)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>⚡</div>
          <div>
            <div style={{ fontWeight:800, fontSize:16, letterSpacing:-0.5 }}>
              SupplyChain<span style={{ color:C.teal }}>AI</span>
            </div>
            <div style={{ fontSize:10, color:C.muted, letterSpacing:1, textTransform:"uppercase" }}>Operations Copilot</div>
          </div>
        </div>

        {/* Tabs */}
        <nav style={{ display:"flex", gap:4 }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                background:    activeTab === t.id ? "rgba(0,229,204,0.1)"  : "transparent",
                border:        activeTab === t.id ? "1px solid rgba(0,229,204,0.28)" : "1px solid transparent",
                color:         activeTab === t.id ? C.teal : C.sub,
                borderRadius:10, padding:"7px 16px", cursor:"pointer",
                fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:6,
                transition:"all 0.18s",
              }}
            >
              <span style={{ fontSize:14 }}>{t.icon}</span>
              {t.label}
              {t.badge && (
                <span style={{ background:C.teal, color:"#000", fontSize:9, padding:"1px 5px", borderRadius:4, fontWeight:800, letterSpacing:0.5 }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button
            onClick={() => fileRef.current?.click()}
            style={{ background:"transparent", border:"1px solid rgba(0,229,204,0.18)", color:C.sub, borderRadius:10, padding:"7px 14px", cursor:"pointer", fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:6, transition:"all 0.18s" }}
          >📤 Upload CSV</button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{ background: showSettings ? "rgba(167,139,250,0.15)" : "transparent", border:"1px solid rgba(167,139,250,0.25)", color:C.violet, borderRadius:10, padding:"7px 14px", cursor:"pointer", fontSize:12, fontWeight:600, transition:"all 0.18s" }}
          >⚙ Settings</button>

          <input ref={fileRef} type="file" accept=".csv" style={{ display:"none" }} onChange={handleUpload} />
        </div>
      </header>

      {/* ── Settings bar ── */}
      {showSettings && (
        <div style={{ background:"rgba(167,139,250,0.06)", borderBottom:"1px solid rgba(167,139,250,0.18)", padding:"12px 28px", display:"flex", alignItems:"center", gap:14, animation:"fadeUp 0.3s ease" }}>
          <span style={{ fontSize:12, color:C.violet, fontWeight:700, whiteSpace:"nowrap" }}>Groq API Key</span>
          <input
            defaultValue={apiKey}
            onBlur={(e) => saveApiKey(e.target.value)}
            placeholder="gsk_... — get yours free at console.groq.com"
            type="password"
            style={{ background:"#0a1520", border:"1px solid rgba(167,139,250,0.28)", color:"#e2eaf4", borderRadius:8, padding:"7px 14px", fontSize:12, flex:1, outline:"none" }}
          />
          <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer"
             style={{ color:C.violet, fontSize:12, textDecoration:"none", whiteSpace:"nowrap" }}>
            Get free key →
          </a>
          <button
            onClick={() => setShowSettings(false)}
            style={{ background:"rgba(167,139,250,0.18)", border:"none", color:C.violet, borderRadius:8, padding:"7px 14px", cursor:"pointer", fontSize:12, fontWeight:700 }}
          >Save ✓</button>
        </div>
      )}

      {/* ── Upload toast ── */}
      {uploadMsg && (
        <div style={{ background:"rgba(0,229,204,0.08)", borderBottom:"1px solid rgba(0,229,204,0.2)", padding:"10px 28px", fontSize:13, color:C.teal, animation:"fadeUp 0.3s ease" }}>
          {uploadMsg}
        </div>
      )}

      {/* ── Main content ── */}
      <main style={{ flex:1, padding:28, overflow:"auto" }}>
        {activeTab === "dashboard" && <Dashboard stats={stats} orders={orders} />}
        {activeTab === "analytics" && <Analytics stats={stats} orders={orders} />}
        {activeTab === "orders"    && <Orders    stats={stats} orders={orders} />}
        {activeTab === "copilot"   && <Copilot   stats={stats} apiKey={apiKey} />}
      </main>
    </div>
  );
}
