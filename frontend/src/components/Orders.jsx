import { Badge, C } from "./UI";

export default function Orders({ orders, stats }) {
  return (
    <div style={{ animation:"fadeUp 0.4s ease" }}>
      <div style={{ marginBottom:28, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:-1, marginBottom:4 }}>Order Records</h1>
          <p style={{ color:C.muted, fontSize:13 }}>{orders.length} orders · {stats.delayedCount} delayed</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <div style={{ background:"rgba(255,107,107,0.1)", border:"1px solid rgba(255,107,107,0.25)", borderRadius:10, padding:"8px 16px", fontSize:12, color:C.red, fontWeight:700 }}>
            🚨 {stats.delayedCount} Delayed
          </div>
          <div style={{ background:"rgba(6,214,160,0.1)", border:"1px solid rgba(6,214,160,0.25)", borderRadius:10, padding:"8px 16px", fontSize:12, color:C.green, fontWeight:700 }}>
            ✓ {stats.totalOrders - stats.delayedCount} On Time
          </div>
        </div>
      </div>

      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ background:"rgba(0,229,204,0.04)" }}>
                {["Order ID","Product","Warehouse","Order Date","Ship Date","Proc. Time","Priority","Status"].map((h) => (
                  <th key={h} style={{ textAlign:"left", padding:"12px 16px", color:C.muted, fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:1, borderBottom:"1px solid #1a2d3d", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={i} style={{ borderBottom:"1px solid #0d1a25" }}>
                  <td style={{ padding:"11px 16px", color:C.teal, fontFamily:"monospace", fontWeight:700, fontSize:11 }}>{o.Order_ID}</td>
                  <td style={{ padding:"11px 16px", color:"#e2eaf4", fontWeight:500 }}>{o.Product}</td>
                  <td style={{ padding:"11px 16px", color:C.sub }}>{o.Warehouse?.replace("Warehouse ","")}</td>
                  <td style={{ padding:"11px 16px", color:C.muted, fontFamily:"monospace", fontSize:11 }}>{o.Order_Date}</td>
                  <td style={{ padding:"11px 16px", color:C.muted, fontFamily:"monospace", fontSize:11 }}>{o.Ship_Date}</td>
                  <td style={{ padding:"11px 16px" }}>
                    <span style={{ color: o.shipping_delay > 3 ? C.red : C.green, fontFamily:"monospace", fontWeight:700 }}>{o.shipping_delay}d</span>
                  </td>
                  <td style={{ padding:"11px 16px" }}>
                    <Badge
                      label={o.Priority}
                      color={o.Priority === "High" ? C.red : o.Priority === "Medium" ? C.yellow : C.muted}
                    />
                  </td>
                  <td style={{ padding:"11px 16px" }}>
                    {o.is_delayed
                      ? <Badge label="⚠ Delayed"  color={C.red} />
                      : <Badge label="✓ On Time"  color={C.green} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
