import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from "recharts";
import { ChartCard, ChartTooltip, Badge, C } from "./UI";

export default function Analytics({ stats, orders }) {
  const delayDist = [1,2,3,4,5,6,7,8].map((d) => ({
    days: `${d}d`,
    count: orders.filter((o) => o.shipping_delay === d).length,
  }));

  return (
    <div style={{ animation:"fadeUp 0.4s ease" }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:-1, marginBottom:4 }}>Deep Analytics</h1>
        <p style={{ color:C.muted, fontSize:13 }}>Detailed performance breakdown</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <ChartCard title="Warehouse: Avg vs Max Delay">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.warehouseStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d3d" />
              <XAxis dataKey="name" tick={{ fill:C.muted, fontSize:11 }} />
              <YAxis tick={{ fill:C.muted, fontSize:11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="avgDelay" name="Avg Delay"  fill={C.teal}   radius={[6,6,0,0]} />
              <Bar dataKey="maxDelay" name="Max Delay"  fill={C.red}    radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Shipping Delay Distribution">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={delayDist}>
              <defs>
                <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.violet} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={C.violet} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d3d" />
              <XAxis dataKey="days" tick={{ fill:C.muted, fontSize:11 }} />
              <YAxis tick={{ fill:C.muted, fontSize:11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="count" name="Orders"
                    stroke={C.violet} fill="url(#distGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Warehouse table */}
      <ChartCard title="Warehouse Performance Summary">
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr>
                {["Warehouse","Orders","Avg Delay","Max Delay","Status"].map((h) => (
                  <th key={h} style={{ textAlign:"left", padding:"10px 16px", color:C.muted, fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:1, borderBottom:"1px solid #1a2d3d" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.warehouseStats.map((w, i) => (
                <tr key={i} style={{ borderBottom:"1px solid #0d1a25", transition:"background 0.15s" }}>
                  <td style={{ padding:"12px 16px", color:"#e2eaf4", fontWeight:600 }}>{w.fullName}</td>
                  <td style={{ padding:"12px 16px", color:C.sub }}>{w.count}</td>
                  <td style={{ padding:"12px 16px", fontFamily:"monospace", fontWeight:700, color: w.avgDelay > 4 ? C.red : w.avgDelay > 2 ? C.yellow : C.green }}>{w.avgDelay}d</td>
                  <td style={{ padding:"12px 16px", color:C.sub, fontFamily:"monospace" }}>{w.maxDelay}d</td>
                  <td style={{ padding:"12px 16px" }}>
                    {w.avgDelay > 4
                      ? <Badge label="⚠ Critical" color={C.red} />
                      : w.avgDelay > 2
                      ? <Badge label="◆ Watch"    color={C.yellow} />
                      : <Badge label="✓ Good"     color={C.green} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
