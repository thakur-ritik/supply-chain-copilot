import { Tooltip, ResponsiveContainer } from "recharts";

// ─── Theme ────────────────────────────────────────────────────────────────────
export const C = {
  teal:   "#00E5CC",
  red:    "#FF6B6B",
  yellow: "#FFD166",
  violet: "#A78BFA",
  green:  "#06D6A0",
  bg:     "#070e17",
  card:   "#0f1923",
  border: "rgba(0,229,204,0.12)",
  muted:  "#4a6070",
  sub:    "#7a8fa6",
};

export const CHART_COLORS = [C.teal, C.red, C.yellow, C.violet, C.green, "#EF476F"];

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ icon, label, value, sub, color = C.teal, delay = 0 }) {
  const rgb = color === C.teal ? "0,229,204"
            : color === C.red  ? "255,107,107"
            : color === C.yellow ? "255,209,102"
            : color === C.green  ? "6,214,160"
            : "167,139,250";

  return (
    <div style={{
      background: "linear-gradient(135deg,#0f1923 0%,#111d2b 100%)",
      border: `1px solid rgba(${rgb},0.22)`,
      borderRadius: 16, padding: "22px 24px",
      display: "flex", flexDirection: "column", gap: 8,
      boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
      animation: `fadeUp 0.5s ease ${delay}s both`,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position:"absolute",top:0,right:0,width:72,height:72,borderRadius:"0 16px 0 72px",background:`rgba(${rgb},0.07)` }} />
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color, fontFamily:"'Space Mono',monospace", letterSpacing: -1 }}>{value}</div>
      <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, textTransform:"uppercase", letterSpacing: 1 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color:"#3a5060" }}>{sub}</div>}
    </div>
  );
}

// ─── ChartCard ───────────────────────────────────────────────────────────────
export function ChartCard({ title, children, span = 1, style = {} }) {
  return (
    <div style={{
      background: "linear-gradient(135deg,#0f1923 0%,#111d2b 100%)",
      border: `1px solid ${C.border}`,
      borderRadius: 16, padding: 24,
      gridColumn: `span ${span}`,
      boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
      ...style,
    }}>
      <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:1.5, marginBottom:20 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

// ─── Custom Recharts Tooltip ──────────────────────────────────────────────────
export function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#0a1520", border:"1px solid #00E5CC33", borderRadius:10, padding:"10px 14px", fontSize:12 }}>
      <div style={{ color:C.sub, marginBottom:4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color:p.color, fontWeight:700 }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
export function Badge({ label, color = C.teal }) {
  const rgb = color === C.red ? "255,107,107" : color === C.yellow ? "255,209,102" : color === C.green ? "6,214,160" : color === C.violet ? "167,139,250" : "0,229,204";
  return (
    <span style={{
      background: `rgba(${rgb},0.12)`, color,
      padding:"3px 10px", borderRadius:6, fontSize:10, fontWeight:700,
    }}>{label}</span>
  );
}
