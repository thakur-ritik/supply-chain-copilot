import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";
import { StatCard, ChartCard, ChartTooltip, C, CHART_COLORS } from "./UI";

export default function Dashboard({ stats, orders }) {
  const delayTrend = orders.slice(0, 20).map((o, i) => ({
    name: `#${i + 1}`,
    delay: o.shipping_delay,
  }));

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -1, marginBottom: 4 }}>
          Operations Dashboard
        </h1>
        <p style={{ color: C.muted, fontSize: 13 }}>
          {stats.totalOrders} orders loaded · real-time analysis
        </p>
      </div>

      {/* KPI Row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        <StatCard icon="📦" label="Total Orders"       value={stats.totalOrders}        sub="In current dataset"             color={C.teal}   delay={0}    />
        <StatCard icon="⏱"  label="Avg Shipping Delay" value={`${stats.avgDelay}d`}     sub="Days from order to ship"        color={C.yellow} delay={0.06} />
        <StatCard icon="✅" label="On-Time Rate"        value={`${stats.onTimeRate}%`}   sub={`${stats.totalOrders - stats.delayedCount} orders on time`} color={C.green}  delay={0.12} />
        <StatCard icon="🚨" label="Delayed Orders"      value={stats.delayedCount}       sub="Shipping delay > 3 days"        color={C.red}    delay={0.18} />
      </div>

      {/* Row 1 */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <ChartCard title="Avg Delay by Warehouse (days)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.warehouseStats} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d3d" />
              <XAxis dataKey="name" tick={{ fill:C.muted, fontSize:11 }} />
              <YAxis tick={{ fill:C.muted, fontSize:11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="avgDelay" name="Avg Delay (days)" radius={[6,6,0,0]}>
                {stats.warehouseStats.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Product Delivery Speed (days avg)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.productStats.slice(0, 8)} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d3d" horizontal={false} />
              <XAxis type="number" tick={{ fill:C.muted, fontSize:11 }} />
              <YAxis dataKey="name" type="category" tick={{ fill:C.sub, fontSize:10 }} width={80} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="avgDelivery" name="Avg Delivery (days)" radius={[0,6,6,0]}>
                {stats.productStats.slice(0,8).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2 */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
        <ChartCard title="Orders by Warehouse">
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={stats.warehouseStats} dataKey="count" nameKey="name"
                   cx="50%" cy="50%" innerRadius={48} outerRadius={75} paddingAngle={3}>
                {stats.warehouseStats.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center" }}>
            {stats.warehouseStats.map((w, i) => (
              <span key={i} style={{ display:"flex", alignItems:"center", gap:4, fontSize:10, color:C.sub }}>
                <span style={{ width:7,height:7,borderRadius:2,background:CHART_COLORS[i % CHART_COLORS.length],display:"inline-block" }} />
                {w.name}
              </span>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Max Delay Radar">
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={stats.warehouseStats}>
              <PolarGrid stroke="#1a2d3d" />
              <PolarAngleAxis dataKey="name" tick={{ fill:C.muted, fontSize:9 }} />
              <Radar name="Max Delay" dataKey="maxDelay" stroke={C.teal} fill={C.teal} fillOpacity={0.15} />
              <Tooltip content={<ChartTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Delay Trend (first 20 orders)">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={delayTrend}>
              <defs>
                <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.teal} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.teal} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d3d" />
              <XAxis dataKey="name" tick={{ fill:C.muted, fontSize:10 }} />
              <YAxis tick={{ fill:C.muted, fontSize:10 }} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="delay" name="Delay (days)"
                    stroke={C.teal} fill="url(#dg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
