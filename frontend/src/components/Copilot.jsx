import { useState, useRef, useEffect } from "react";
import { C } from "./UI";
import { askGroq } from "../utils/api";
import { buildSystemPrompt } from "../utils/data";

const SUGGESTIONS = [
  "Which warehouse has the highest delay?",
  "Which product ships the fastest?",
  "Show all orders delayed more than 3 days",
  "What is the average delay per warehouse?",
  "Which priority orders have the most delays?",
  "Give me a summary of overall supply chain health",
];

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, `<strong style="color:${C.teal}">$1</strong>`)
    .replace(/\*(.*?)\*/g,     `<em style="color:${C.yellow}">$1</em>`)
    .replace(/•/g,             `<span style="color:${C.teal}">•</span>`)
    .replace(/\n/g,            "<br/>");
}

export default function Copilot({ stats, apiKey }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "👋 Hello! I'm your **Supply Chain AI Copilot** powered by Groq + Llama 3.\n\nI've analyzed your shipment data and I'm ready to answer questions.\n\nTry asking:\n• *Which warehouse has the highest delay?*\n• *Which orders were delayed more than 3 days?*\n• *What is the average delay per warehouse?*",
    },
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);  // raw {role,content} for context
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((m) => [...m, { role:"user", text:msg }]);
    setLoading(true);

    try {
      const systemPrompt = buildSystemPrompt(stats);
      const reply = await askGroq(msg, systemPrompt, apiKey, history);
      setHistory((h) => [...h, { role:"user", content:msg }, { role:"assistant", content:reply }]);
      setMessages((m) => [...m, { role:"assistant", text:reply }]);
    } catch (err) {
      setMessages((m) => [...m, {
        role: "assistant",
        text: `⚠️ **Error:** ${err.message}\n\nMake sure your backend is running and the Groq API key is set in \`backend/.env\`.`,
      }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display:"flex", gap:22, height:"calc(100vh - 160px)", animation:"fadeUp 0.4s ease" }}>

      {/* ── Left panel ── */}
      <div style={{ width:256, flexShrink:0, display:"flex", flexDirection:"column", gap:14 }}>
        {/* Quick stats */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:18 }}>
          <div style={{ fontSize:10, color:C.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:1.2, marginBottom:14 }}>Quick Insights</div>
          {[
            { label:"Worst Warehouse",  val:stats.worstWarehouse?.name,              sub:`${stats.worstWarehouse?.avgDelay}d avg delay`,  color:C.red    },
            { label:"Fastest Product",  val:stats.fastestProduct?.name,              sub:`${stats.fastestProduct?.avgDelivery}d avg`,      color:C.green  },
            { label:"Delayed Orders",   val:stats.delayedCount,                      sub:`of ${stats.totalOrders} total`,                 color:C.yellow },
            { label:"On-Time Rate",     val:`${stats.onTimeRate}%`,                  sub:"Overall performance",                           color:C.teal   },
          ].map((item, i, arr) => (
            <div key={i} style={{ marginBottom:i < arr.length-1 ? 14 : 0, paddingBottom:i < arr.length-1 ? 14 : 0, borderBottom:i < arr.length-1 ? "1px solid #0d1a25" : "none" }}>
              <div style={{ fontSize:10, color:C.muted, marginBottom:3 }}>{item.label}</div>
              <div style={{ fontSize:16, fontWeight:800, color:item.color, fontFamily:"monospace" }}>{item.val}</div>
              <div style={{ fontSize:10, color:"#3a5060" }}>{item.sub}</div>
            </div>
          ))}
        </div>

        {/* Suggestions */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:18, flex:1, overflowY:"auto" }}>
          <div style={{ fontSize:10, color:C.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:1.2, marginBottom:14 }}>Suggested Questions</div>
          {SUGGESTIONS.map((q, i) => (
            <button key={i} onClick={() => send(q)} style={{
              display:"block", width:"100%", textAlign:"left",
              background:"rgba(0,229,204,0.04)", border:"1px solid rgba(0,229,204,0.1)",
              color:C.sub, borderRadius:8, padding:"9px 12px", cursor:"pointer",
              fontSize:11, marginBottom:8, lineHeight:1.5, transition:"all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,229,204,0.1)"; e.currentTarget.style.borderColor = "rgba(0,229,204,0.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,229,204,0.04)"; e.currentTarget.style.borderColor = "rgba(0,229,204,0.1)"; }}
            >
              <span style={{ color:C.teal, marginRight:6 }}>→</span>{q}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chat panel ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", background:C.card, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden" }}>
        {/* Header */}
        <div style={{ padding:"15px 22px", borderBottom:"1px solid #0d1a25", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36,height:36,background:"linear-gradient(135deg,#00E5CC20,#00E5CC40)",border:"1px solid #00E5CC40",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>✦</div>
          <div>
            <div style={{ fontWeight:700, fontSize:14 }}>Supply Chain Copilot</div>
            <div style={{ fontSize:11, color:C.muted, display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ width:6,height:6,borderRadius:"50%",background:C.green,display:"inline-block" }} />
              Groq · Llama 3 70B · {stats.totalOrders} orders indexed
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={chatRef} style={{ flex:1, overflowY:"auto", padding:"20px 22px", display:"flex", flexDirection:"column", gap:14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", gap:10 }}>
              {m.role === "assistant" && (
                <div style={{ width:28,height:28,background:"linear-gradient(135deg,#00E5CC25,#00E5CC45)",border:"1px solid #00E5CC40",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0,marginTop:2 }}>✦</div>
              )}
              <div
                style={{
                  maxWidth:"76%", padding:"13px 16px",
                  borderRadius: m.role==="user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                  background:   m.role==="user" ? "rgba(0,229,204,0.1)"  : "rgba(255,255,255,0.04)",
                  border:       m.role==="user" ? "1px solid rgba(0,229,204,0.28)" : "1px solid rgba(255,255,255,0.06)",
                  fontSize:13, lineHeight:1.75, color:"#cddae8",
                }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(m.text) }}
              />
              {m.role === "user" && (
                <div style={{ width:28,height:28,background:"linear-gradient(135deg,#A78BFA25,#A78BFA45)",border:"1px solid #A78BFA40",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0,marginTop:2 }}>◎</div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <div style={{ width:28,height:28,background:"linear-gradient(135deg,#00E5CC25,#00E5CC45)",border:"1px solid #00E5CC40",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13 }}>✦</div>
              <div style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"4px 16px 16px 16px",padding:"13px 18px",display:"flex",gap:5,alignItems:"center" }}>
                {[0,1,2].map((i) => (
                  <span key={i} style={{ width:6,height:6,borderRadius:"50%",background:C.teal,display:"inline-block",animation:`pulse 1.2s ease ${i*0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ padding:"14px 20px", borderTop:"1px solid #0d1a25" }}>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask about your supply chain data..."
              style={{ flex:1, background:"#070e17", border:"1px solid rgba(0,229,204,0.2)", color:"#e2eaf4", borderRadius:12, padding:"13px 18px", fontSize:13, outline:"none", transition:"border-color 0.2s" }}
              onFocus={(e) => e.target.style.borderColor = "rgba(0,229,204,0.5)"}
              onBlur={(e)  => e.target.style.borderColor = "rgba(0,229,204,0.2)"}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              style={{
                background: loading || !input.trim() ? "#0f1923" : C.teal,
                border:"none", color: loading || !input.trim() ? C.muted : "#000",
                borderRadius:12, width:46, height:46,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:20, fontWeight:800, transition:"all 0.2s", flexShrink:0,
              }}
            >
              {loading
                ? <span style={{ animation:"spin 1s linear infinite", display:"inline-block" }}>↻</span>
                : "↑"}
            </button>
          </div>
          <div style={{ fontSize:10, color:"#243545", marginTop:8, textAlign:"center" }}>
            Powered by Groq + Llama 3 · Press Enter to send
          </div>
        </div>
      </div>
    </div>
  );
}
