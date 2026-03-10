// ─── CSV Parser ───────────────────────────────────────────────────────────────
export function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.trim());
    const obj = {};
    headers.forEach((h, i) => (obj[h] = vals[i] || ""));
    return obj;
  });
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────
export function daysBetween(a, b) {
  const d1 = new Date(a), d2 = new Date(b);
  if (isNaN(d1) || isNaN(d2)) return 0;
  return Math.round((d2 - d1) / 86400000);
}

// ─── Order Processor ─────────────────────────────────────────────────────────
export function processOrders(raw) {
  return raw.map((r) => ({
    ...r,
    processing_time: daysBetween(r.Order_Date, r.Ship_Date),
    shipping_delay:  daysBetween(r.Order_Date, r.Ship_Date),
    delivery_days:   daysBetween(r.Order_Date, r.Delivery_Date),
    is_delayed:      daysBetween(r.Order_Date, r.Ship_Date) > 3,
    Quantity:        parseInt(r.Quantity) || 0,
  }));
}

// ─── Analytics Builder ────────────────────────────────────────────────────────
export function buildStats(orders) {
  const warehouses = {};
  const products   = {};
  let totalDelay = 0, delayedCount = 0;

  orders.forEach((o) => {
    if (!warehouses[o.Warehouse])
      warehouses[o.Warehouse] = { name: o.Warehouse, delays: [], count: 0 };
    warehouses[o.Warehouse].delays.push(o.shipping_delay);
    warehouses[o.Warehouse].count++;

    if (!products[o.Product])
      products[o.Product] = { name: o.Product, times: [], count: 0 };
    products[o.Product].times.push(o.delivery_days);
    products[o.Product].count++;

    totalDelay += o.shipping_delay;
    if (o.is_delayed) delayedCount++;
  });

  const warehouseStats = Object.values(warehouses)
    .map((w) => ({
      name:     w.name.replace("Warehouse ", ""),
      fullName: w.name,
      avgDelay: +(w.delays.reduce((a, b) => a + b, 0) / w.delays.length).toFixed(2),
      count:    w.count,
      maxDelay: Math.max(...w.delays),
    }))
    .sort((a, b) => b.avgDelay - a.avgDelay);

  const productStats = Object.values(products)
    .map((p) => ({
      name:        p.name,
      avgDelivery: +(p.times.reduce((a, b) => a + b, 0) / p.times.length).toFixed(2),
      count:       p.count,
    }))
    .sort((a, b) => a.avgDelivery - b.avgDelivery);

  const delayedOrders = orders.filter((o) => o.shipping_delay > 3);

  return {
    warehouseStats,
    productStats,
    delayedOrders,
    totalOrders:     orders.length,
    avgDelay:        +(totalDelay / orders.length).toFixed(2),
    delayedCount,
    onTimeRate:      +((1 - delayedCount / orders.length) * 100).toFixed(1),
    fastestProduct:  productStats[0],
    worstWarehouse:  warehouseStats[0],
  };
}

// ─── Build AI Context from Stats ─────────────────────────────────────────────
export function buildSystemPrompt(stats) {
  const wh = stats.warehouseStats
    .map((w) => `${w.fullName}: avg delay ${w.avgDelay}d, ${w.count} orders, max ${w.maxDelay}d`)
    .join("; ");
  const pr = stats.productStats
    .map((p) => `${p.name}: avg ${p.avgDelivery}d delivery`)
    .join("; ");
  const delayed = stats.delayedOrders
    .map((o) => `${o.Order_ID}(${o.Product}, ${o.Warehouse}, ${o.shipping_delay}d)`)
    .join("; ");

  return `You are a Supply Chain AI Copilot embedded in an operations dashboard.
Respond with clear, concise analysis. Use **bold** for key numbers and bullet points for lists.

── DATASET (${stats.totalOrders} orders) ──────────────────────────────────────
Overall avg delay : ${stats.avgDelay} days
On-time rate      : ${stats.onTimeRate}%
Delayed (>3 days) : ${stats.delayedCount} orders
Fastest product   : ${stats.fastestProduct?.name} (${stats.fastestProduct?.avgDelivery}d avg)
Worst warehouse   : ${stats.worstWarehouse?.fullName} (${stats.worstWarehouse?.avgDelay}d avg)

── WAREHOUSE BREAKDOWN ────────────────────────────────────────────────────────
${wh}

── PRODUCT BREAKDOWN ──────────────────────────────────────────────────────────
${pr}

── DELAYED ORDERS ─────────────────────────────────────────────────────────────
${delayed}

Answer only from this data. Be direct and actionable. End with a 1-sentence recommendation when relevant.`;
}

// ─── Sample Dataset ───────────────────────────────────────────────────────────
export const SAMPLE_CSV = `Order_ID,Product,Warehouse,Order_Date,Ship_Date,Delivery_Date,Category,Quantity,Priority
ORD-001,Widget A,Warehouse NYC,2024-01-02,2024-01-05,2024-01-09,Electronics,50,High
ORD-002,Gadget B,Warehouse LA,2024-01-03,2024-01-04,2024-01-07,Electronics,30,Medium
ORD-003,Component C,Warehouse Chicago,2024-01-04,2024-01-09,2024-01-13,Hardware,120,Low
ORD-004,Widget A,Warehouse NYC,2024-01-05,2024-01-06,2024-01-10,Electronics,75,High
ORD-005,Gadget D,Warehouse LA,2024-01-06,2024-01-08,2024-01-11,Electronics,45,Medium
ORD-006,Component E,Warehouse Chicago,2024-01-07,2024-01-14,2024-01-18,Hardware,200,Low
ORD-007,Widget F,Warehouse NYC,2024-01-08,2024-01-10,2024-01-14,Electronics,60,High
ORD-008,Gadget B,Warehouse Dallas,2024-01-09,2024-01-10,2024-01-13,Electronics,90,Medium
ORD-009,Component C,Warehouse Dallas,2024-01-10,2024-01-11,2024-01-14,Hardware,150,Low
ORD-010,Widget A,Warehouse Chicago,2024-01-11,2024-01-16,2024-01-20,Electronics,40,High
ORD-011,Gadget G,Warehouse NYC,2024-01-12,2024-01-13,2024-01-16,Logistics,85,Medium
ORD-012,Component H,Warehouse LA,2024-01-13,2024-01-15,2024-01-18,Hardware,300,Low
ORD-013,Widget A,Warehouse Dallas,2024-01-14,2024-01-15,2024-01-18,Electronics,55,High
ORD-014,Gadget B,Warehouse Chicago,2024-01-15,2024-01-20,2024-01-24,Electronics,70,Medium
ORD-015,Component I,Warehouse NYC,2024-01-16,2024-01-17,2024-01-20,Hardware,180,Low
ORD-016,Widget J,Warehouse LA,2024-01-17,2024-01-19,2024-01-22,Electronics,95,High
ORD-017,Gadget D,Warehouse Dallas,2024-01-18,2024-01-19,2024-01-22,Electronics,65,Medium
ORD-018,Component C,Warehouse NYC,2024-01-19,2024-01-25,2024-01-29,Hardware,220,Low
ORD-019,Widget A,Warehouse LA,2024-01-20,2024-01-21,2024-01-24,Electronics,80,High
ORD-020,Gadget K,Warehouse Chicago,2024-01-21,2024-01-22,2024-01-25,Logistics,110,Medium
ORD-021,Component L,Warehouse Dallas,2024-01-22,2024-01-28,2024-02-01,Hardware,160,Low
ORD-022,Widget F,Warehouse NYC,2024-01-23,2024-01-24,2024-01-27,Electronics,70,High
ORD-023,Gadget B,Warehouse LA,2024-01-24,2024-01-26,2024-01-29,Electronics,35,Medium
ORD-024,Component M,Warehouse Chicago,2024-01-25,2024-01-30,2024-02-03,Hardware,250,Low
ORD-025,Widget A,Warehouse Dallas,2024-01-26,2024-01-27,2024-01-30,Electronics,90,High`;
