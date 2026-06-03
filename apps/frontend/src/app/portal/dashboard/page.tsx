"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";

interface DashData {
  todayPurchase: { count: number; weight: number };
  todayProduction: { weight: number; baleCount: number; avgOee: number };
  todayShipment: { count: number; weight: number };
  inventory: { count: number; weight: number };
  finance: { revenue: number; totalAR: number; totalAP: number; cashPosition: number };
  riskStatus: { openIncidents: number };
  recentTickets: any[];
  recentProduction: any[];
}

const fmt = (n: number) => `${(n / 1000).toFixed(2)} Ton`;
const fmtRp = (n: number) => `Rp ${(n / 1000000).toFixed(1)}M`;
const fmtPct = (n: number) => `${(n || 0).toFixed(1)}%`;

const DONUT_COLORS = ["#7C6FE0", "#4ECDC4", "#FF6B9D"];

export default function DashboardPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/dashboard/executive?date=${selectedDate}`),
      api.get("/dashboard/kpi-trend?days=7"),
    ]).then(([d, t]) => { setData(d.data); setTrend(t.data); })
      .finally(() => setLoading(false));
  }, [selectedDate]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div style={{ width: 40, height: 40, border: "3px solid #EDE9FF", borderTop: "3px solid #7C6FE0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  if (!data) return <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "3rem" }}>Gagal memuat data dashboard</div>;

  const kpis = [
    {
      label: "Total Pembelian",
      value: fmt(data.todayPurchase.weight),
      sub: `${data.todayPurchase.count} tiket`,
      trend: "+10.5%",
      trendUp: true,
      variant: "dark",
      icon: "💰",
      iconBg: "rgba(255,255,255,0.15)",
    },
    {
      label: "Total Produksi",
      value: fmt(data.todayProduction.weight),
      sub: `${data.todayProduction.baleCount} bale`,
      trend: "+10.9%",
      trendUp: true,
      variant: "mint",
      icon: "🏭",
      iconBg: "rgba(78,205,196,0.2)",
    },
    {
      label: "Total Pengiriman",
      value: `${data.todayShipment.count} DO`,
      sub: fmt(data.todayShipment.weight),
      trend: "+12.5%",
      trendUp: true,
      variant: "pink",
      icon: "🚛",
      iconBg: "rgba(255,107,157,0.2)",
    },
    {
      label: "Stok Gudang",
      value: `${data.inventory.count}`,
      sub: `${fmt(data.inventory.weight)} bale`,
      trend: "-0.5%",
      trendUp: false,
      variant: "neutral",
      icon: "📦",
      iconBg: "#EDE9FF",
    },
  ];

  const variantStyles: Record<string, React.CSSProperties> = {
    dark: { background: "var(--kpi-dark)", borderColor: "transparent" },
    mint: { background: "var(--kpi-mint-bg)" },
    pink: { background: "var(--kpi-pink-bg)" },
    neutral: { background: "var(--kpi-neutral-bg)" },
  };

  const donutData = [
    { name: "Selesai", value: 70 },
    { name: "Distribusi", value: 15 },
    { name: "Dikembalikan", value: 15 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Risk Alert */}
      {data.riskStatus.openIncidents > 0 && (
        <div style={{
          background: "#FFF5F5",
          border: "1px solid #FEE2E2",
          borderRadius: 12,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "var(--color-red)",
          fontWeight: 600,
          fontSize: 14,
        }}>
          <span>🚨</span>
          <span>{data.riskStatus.openIncidents} insiden terbuka — Segera cek BCP Center</span>
        </div>
      )}

      {/* Overview header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Overview</h2>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 14px",
          background: "#fff",
          border: "1px solid var(--border-light)",
          borderRadius: 8,
          fontSize: 13,
          color: "var(--text-secondary)",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden"
        }}>
          <span>📅</span>
          <span style={{ minWidth: 85 }}>{new Date(selectedDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</span>
          <span style={{ fontSize: 10 }}>▼</span>
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
          />
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
        {kpis.map((k, i) => (
          <div key={i} className="kpi-card" style={variantStyles[k.variant]}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: k.variant === "dark" ? "rgba(255,255,255,0.6)" : "var(--text-secondary)" }}>
                {k.label}
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: k.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                {k.icon}
              </div>
            </div>
            <div style={{ fontSize: "1.65rem", fontWeight: 700, letterSpacing: "-0.03em", color: k.variant === "dark" ? "#fff" : "var(--text-primary)", lineHeight: 1.15 }}>
              {k.value}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: k.trendUp ? (k.variant === "dark" ? "#5FE09F" : "var(--color-green)") : "var(--color-red)" }}>
                {k.trendUp ? "↑" : "↓"} {k.trend}
              </span>
              <span style={{ fontSize: 12, color: k.variant === "dark" ? "rgba(255,255,255,0.5)" : "var(--text-muted)" }}>
                {k.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>

        {/* Orders Overview Area Chart */}
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Tren Pembelian & Produksi</span>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-purple)" }} />
                Pembelian
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-teal)" }} />
                Produksi
              </div>
              <div style={{
                padding: "4px 10px", borderRadius: 6,
                border: "1px solid var(--border-light)", fontSize: 12,
                color: "var(--text-secondary)", cursor: "pointer",
              }}>
                2024 ▾
              </div>
            </div>
          </div>
          <div style={{ padding: "1.25rem 1rem 0.5rem" }}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trend} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="gPurchase" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C6FE0" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#7C6FE0" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F7" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 11 }} tickFormatter={d => d.slice(5)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}T`} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1A1C2B", border: "none", borderRadius: 8, fontSize: 12, color: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}
                  labelStyle={{ color: "rgba(255,255,255,0.7)", marginBottom: 4 }}
                  formatter={(v: any) => [`${(v / 1000).toFixed(2)} Ton`]}
                />
                <Area type="monotone" dataKey="purchase" name="Pembelian" stroke="#7C6FE0" fill="url(#gPurchase)" strokeWidth={2.5} dot={false} />
                <Area type="monotone" dataKey="production" name="Produksi" stroke="#4ECDC4" fill="url(#gProd)" strokeWidth={2.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sale Analytics Donut */}
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Sale Analytics</span>
          </div>
          <div className="erp-card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <div style={{ position: "relative", width: 180, height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%" cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {donutData.map((_, i) => (
                      <Cell key={i} fill={DONUT_COLORS[i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
              }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
                  {fmtPct(data.todayProduction.avgOee)}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>OEE Hari ini</div>
              </div>
            </div>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Selesai", pct: "70%", color: DONUT_COLORS[0] },
                { label: "Distribusi", pct: "15%", color: DONUT_COLORS[1] },
                { label: "Dikembalikan", pct: "15%", color: DONUT_COLORS[2] },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
        {/* Finance KPIs */}
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Finance Overview</span>
          </div>
          <div className="erp-card-body" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { label: "Revenue", value: fmtRp(data.finance.revenue), color: "var(--color-purple)", icon: "💰" },
              { label: "Cash Position", value: fmtRp(data.finance.cashPosition), color: "var(--color-teal)", icon: "🏦" },
              { label: "Piutang (AR)", value: fmtRp(data.finance.totalAR), color: "var(--color-amber)", icon: "📈" },
              { label: "Hutang (AP)", value: fmtRp(data.finance.totalAP), color: "var(--color-red)", icon: "📉" },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 0",
                borderBottom: i < 3 ? "1px solid var(--border-light)" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: `${item.color}15`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16,
                  }}>{item.icon}</div>
                  <span style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>{item.label}</span>
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: item.color }}>{item.value}</span>
              </div>
            ))}

            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>OEE Rata-rata</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{fmtPct(data.todayProduction.avgOee)}</span>
              </div>
              <div style={{ height: 8, background: "#F0F2F7", borderRadius: 99 }}>
                <div style={{
                  height: 8, borderRadius: 99,
                  width: `${Math.min(100, data.todayProduction.avgOee)}%`,
                  background: "linear-gradient(90deg, #7C6FE0, #4ECDC4)",
                  transition: "width 1s ease",
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Bar Chart - Recent Tickets */}
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Tiket Timbangan Terbaru</span>
          </div>
          <div className="erp-card-body" style={{ padding: 0, overflowX: "auto" }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>No. Tiket</th>
                  <th>Supplier</th>
                  <th>Netto (kg)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTickets.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>Belum ada data</td></tr>
                ) : data.recentTickets.map((t: any) => (
                  <tr key={t.id}>
                    <td style={{ fontFamily: "monospace", fontSize: 13, color: "var(--color-purple)", fontWeight: 600 }}>{t.ticketNumber}</td>
                    <td style={{ fontWeight: 500 }}>{t.supplier?.companyName || "—"}</td>
                    <td style={{ fontWeight: 600 }}>{t.netWeight?.toLocaleString("id-ID") || "—"}</td>
                    <td><span className="badge badge-success">Selesai</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Production */}
      <div className="erp-card">
        <div className="erp-card-header">
          <span className="erp-card-title">Catatan Produksi Terbaru</span>
          <span style={{ fontSize: 13, color: "var(--color-purple)", fontWeight: 600, cursor: "pointer" }}>Lihat Semua →</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="erp-table">
            <thead>
              <tr>
                <th>Mesin</th>
                <th>Output (kg)</th>
                <th>OEE</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentProduction.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>Belum ada data</td></tr>
              ) : data.recentProduction.map((p: any) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.machine?.name || "—"}</td>
                  <td style={{ fontWeight: 600 }}>{p.outputWeight?.toLocaleString("id-ID") || "—"}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: "#F0F2F7", borderRadius: 99, minWidth: 60 }}>
                        <div style={{
                          height: 6, borderRadius: 99,
                          width: `${Math.min(100, p.oee || 0)}%`,
                          background: (p.oee || 0) >= 85 ? "var(--color-green)" : (p.oee || 0) >= 70 ? "var(--color-amber)" : "var(--color-red)",
                        }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, minWidth: 40, textAlign: "right" }}>{p.oee?.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${(p.oee || 0) >= 85 ? "badge-success" : "badge-warning"}`}>
                      {(p.oee || 0) >= 85 ? "Baik" : "Perhatian"}
                    </span>
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
