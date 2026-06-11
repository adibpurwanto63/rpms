"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRefresh } from "@/lib/refresh-context";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import { ShoppingBag, TrendingUp, Factory, Truck, Package, AlertTriangle, Calendar, ChevronDown, ArrowUp, ArrowDown, DollarSign, Landmark, TrendingDown } from "lucide-react";

interface DashData {
  todayPurchase: { count: number; weight: number };
  todayProduction: { weight: number; baleCount: number; avgOee: number };
  todayShipment: { count: number; weight: number };
  inventory: { count: number; weight: number };
  finance: { revenue: number; totalAR: number; totalAP: number; cashPosition: number };
  riskStatus: { openIncidents: number };
  recentTickets: any[];
  recentProduction: any[];
  pembelian: { pendingPO: number; recentPO: any[]; totalPO: number; totalSpend: number };
  penjualan: { pendingSO: number; recentSO: any[]; totalSO: number; totalRevenue: number };
  salesAnalytics: { name: string; value: number }[];
}

const fmt = (n: number) => `${(n / 1000).toFixed(2)} Ton`;
const fmtRp = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
const fmtPct = (n: number) => `${(n || 0).toFixed(1)}%`;

const DONUT_COLORS = ["#7C6FE0", "#4ECDC4", "#FF6B9D"];

export default function DashboardPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [chartFilter, setChartFilter] = useState("Semua");
  const { refreshKey } = useRefresh();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const d = await api.get(`/dashboard/executive?date=${selectedDate}`);
        setData(d.data);
      } catch (e) { console.error("Error loading dashboard data", e); }
      
      try {
        const t = await api.get("/dashboard/kpi-trend?days=7");
        setTrend(t.data);
      } catch (e) { console.error("Error loading trend data", e); }
      
      setLoading(false);
    };
    load();
  }, [selectedDate, refreshKey]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div style={{ width: 40, height: 40, border: "3px solid var(--color-primary-light)", borderTop: "3px solid var(--color-primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  if (!data) return <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "3rem" }}>Gagal memuat data dashboard</div>;

  const fmtRpShort = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

  const kpis = [
    {
      label: "Total Pembelian",
      value: fmtRpShort(data.pembelian?.totalSpend || 0),
      sub: `${data.pembelian?.totalPO || 0} PO · ${data.pembelian?.pendingPO || 0} aktif`,
      trend: "+10.5%",
      trendUp: true,
      variant: "dark",
      Icon: ShoppingBag,
      iconBg: "rgba(255,255,255,0.15)",
    },
    {
      label: "Total Penjualan",
      value: fmtRpShort(data.penjualan?.totalRevenue || 0),
      sub: `${data.penjualan?.totalSO || 0} SO · ${data.penjualan?.pendingSO || 0} tertunda`,
      trend: "+8.4%",
      trendUp: true,
      variant: "pink",
      Icon: TrendingUp,
      iconBg: "rgba(255,107,157,0.2)",
    },
    {
      label: "Total Produksi",
      value: fmt(data.todayProduction.weight),
      sub: `${data.todayProduction.baleCount} bale`,
      trend: "+10.9%",
      trendUp: true,
      variant: "mint",
      Icon: Factory,
      iconBg: "rgba(78,205,196,0.2)",
    },
    {
      label: "Total Pengiriman",
      value: `${data.todayShipment.count} DO`,
      sub: fmt(data.todayShipment.weight),
      trend: "+12.5%",
      trendUp: true,
      variant: "pink",
      Icon: Truck,
      iconBg: "rgba(255,107,157,0.2)",
    },
    {
      label: "Stok Gudang",
      value: `${data.inventory.count}`,
      sub: `${fmt(data.inventory.weight)} bale`,
      trend: "-0.5%",
      trendUp: false,
      variant: "neutral",
      Icon: Package,
      iconBg: "#EDE9FF",
    },
  ];

  const variantStyles: Record<string, React.CSSProperties> = {
    dark: { background: "var(--kpi-dark)", borderColor: "transparent" },
    mint: { background: "var(--kpi-mint-bg)" },
    pink: { background: "var(--kpi-pink-bg)" },
    neutral: { background: "var(--kpi-neutral-bg)" },
  };

  const donutData = data.salesAnalytics || [
    { name: "Selesai", value: 1 },
    { name: "Distribusi", value: 0 },
    { name: "Dikembalikan", value: 0 },
  ];
  
  const totalSales = donutData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="db-gap" style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Risk Alert */}
      {data.riskStatus.openIncidents > 0 && (
        <div className="db-risk-alert" style={{
          background: "var(--color-red-light)",
          border: "1px solid var(--color-red)",
          borderRadius: 12,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "var(--color-red)",
          fontWeight: 600,
          fontSize: 14,
        }}>
          <AlertTriangle size={18} strokeWidth={2.5} />
          <span>{data.riskStatus.openIncidents} insiden terbuka — Segera cek BCP Center</span>
        </div>
      )}

      {/* Overview header row */}
      <div className="page-header-responsive" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 className="db-overview-title" style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Overview</h2>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 14px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          borderRadius: 8,
          fontSize: 13,
          color: "var(--text-secondary)",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}>
          <Calendar size={14} />
          <span style={{ minWidth: 85, fontSize: 12 }}>{new Date(selectedDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</span>
          <ChevronDown size={14} />
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
          />
        </div>
      </div>

      {/* KPI Grid */}
      <div className="rg-4">
        {kpis.map((k, i) => (
          <div key={i} className="kpi-card db-kpi-card" style={variantStyles[k.variant]}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div className="db-kpi-sub" style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>
                {k.label}
              </div>
              <div className="db-kpi-icon" style={{ width: 36, height: 36, borderRadius: 8, background: k.iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>
                {k.Icon && <k.Icon size={18} strokeWidth={2} />}
              </div>
            </div>
            <div className="db-kpi-value" style={{ fontSize: "1.65rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)", lineHeight: 1.15 }}>
              {k.value}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 600, color: k.trendUp ? "var(--color-green)" : "var(--color-red)" }}>
                {k.trendUp ? <ArrowUp size={12} strokeWidth={3} /> : <ArrowDown size={12} strokeWidth={3} />} {k.trend}
              </span>
              <span className="db-kpi-sub" style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {k.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="rg-chart-2-1">

        {/* Orders Overview Area Chart */}
        <div className="erp-card">
          <div className="erp-card-header db-chart-header">
            <span className="erp-card-title">Tren Pembelian & Penjualan</span>
            <div className="db-trend-controls" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {(chartFilter === "Semua" || chartFilter === "Pembelian") && (
                <div className="db-trend-legend" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-purple)" }} />
                  Pembelian
                </div>
              )}
              {(chartFilter === "Semua" || chartFilter === "Penjualan") && (
                <div className="db-trend-legend" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-teal)" }} />
                  Penjualan
                </div>
              )}
              <select 
                className="db-trend-select"
                value={chartFilter}
                onChange={(e) => setChartFilter(e.target.value)}
                style={{
                  padding: "6px 12px", borderRadius: 6, outline: "none",
                  border: "1px solid var(--border-light)", fontSize: 13,
                  color: "var(--text-secondary)", cursor: "pointer",
                  background: "var(--bg-card)",
                  WebkitAppearance: "menulist",
                  minHeight: 32,
                }}
              >
                <option value="Semua">Semua</option>
                <option value="Pembelian">Pembelian Saja</option>
                <option value="Penjualan">Penjualan Saja</option>
              </select>
            </div>
          </div>
          <div className="db-chart-area" style={{ padding: "1.25rem 0.5rem 0.5rem", width: "100%", boxSizing: "border-box" }}>
            <div style={{ width: "100%", height: 220, position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 10 }} tickFormatter={d => d.slice(5)} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}T`} axisLine={false} tickLine={false} width={35} />
                  <Tooltip
                    contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 8, fontSize: 12, color: "var(--text-primary)", boxShadow: "var(--shadow-dropdown)" }}
                    labelStyle={{ color: "var(--text-secondary)", marginBottom: 4 }}
                    formatter={(v: any) => [`${(v / 1000).toFixed(2)} Ton`]}
                  />
                  {(chartFilter === "Semua" || chartFilter === "Pembelian") && (
                    <Area type="monotone" dataKey="purchase" name="Pembelian" stroke="#7C6FE0" fill="url(#gPurchase)" strokeWidth={2.5} dot={false} />
                  )}
                  {(chartFilter === "Semua" || chartFilter === "Penjualan") && (
                    <Area type="monotone" dataKey="sales" name="Penjualan" stroke="#4ECDC4" fill="url(#gProd)" strokeWidth={2.5} dot={false} />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sale Analytics Donut */}
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Sale Analytics</span>
          </div>
          <div className="erp-card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <div className="db-donut-wrap" style={{ position: "relative", width: 180, height: 180 }}>
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
                <div className="db-donut-label" style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
                  {fmtPct(data.todayProduction.avgOee)}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>OEE Hari ini</div>
              </div>
            </div>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
              {donutData.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: DONUT_COLORS[i % DONUT_COLORS.length], flexShrink: 0 }} />
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{item.name}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: DONUT_COLORS[i % DONUT_COLORS.length] }}>
                    {totalSales > 0 ? ((item.value / totalSales) * 100).toFixed(0) + "%" : "0%"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="rg-chart-1-2">
        {/* Finance KPIs */}
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Finance Overview</span>
          </div>
          <div className="erp-card-body" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { label: "Revenue", value: fmtRp(data.finance.revenue), color: "var(--color-purple)", Icon: DollarSign },
              { label: "Cash Position", value: fmtRp(data.finance.cashPosition), color: "var(--color-teal)", Icon: Landmark },
              { label: "Piutang (AR)", value: fmtRp(data.finance.totalAR), color: "var(--color-amber)", Icon: TrendingUp },
              { label: "Hutang (AP)", value: fmtRp(data.finance.totalAP), color: "var(--color-red)", Icon: TrendingDown },
            ].map((item, i) => (
              <div key={i} className="db-finance-item" style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 0",
                borderBottom: i < 3 ? "1px solid var(--border-light)" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="db-finance-icon" style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: `${item.color}15`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: item.color,
                  }}>
                    <item.Icon size={18} strokeWidth={2} />
                  </div>
                  <span className="db-finance-label" style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>{item.label}</span>
                </div>
                <span className="db-finance-value" style={{ fontSize: 15, fontWeight: 700, color: item.color }}>{item.value}</span>
              </div>
            ))}

            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>OEE Rata-rata</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{fmtPct(data.todayProduction.avgOee)}</span>
              </div>
                  <div style={{ height: 8, background: "var(--bg-secondary)", borderRadius: 99 }}>
                    <div style={{
                      height: 8, borderRadius: 99,
                      width: `${Math.min(100, data.todayProduction.avgOee)}%`,
                      background: "linear-gradient(90deg, var(--color-primary), var(--color-teal))",
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
                      <div style={{ flex: 1, height: 6, background: "var(--bg-secondary)", borderRadius: 99, minWidth: 60 }}>
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
      {/* Pembelian PO Widget */}
      {data.pembelian && (
        <div className="erp-card">
          <div className="erp-card-header db-po-header">
            <span className="erp-card-title">Purchase Order Terbaru</span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {data.pembelian.pendingPO > 0 && (
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-amber)", background: "var(--color-amber-light)", padding: "4px 10px", borderRadius: 6 }}>
                  {data.pembelian.pendingPO} PO aktif
                </span>
              )}
              <a href="/portal/pembelian" style={{ fontSize: 13, color: "var(--color-purple)", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>Lihat Semua →</a>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>No. PO</th>
                  <th>Supplier</th>
                  <th>Barang</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.pembelian.recentPO.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>Belum ada PO</td></tr>
                ) : data.pembelian.recentPO.map((po: any) => (
                  <tr key={po.id}>
                    <td style={{ fontFamily: "monospace", fontSize: 13, color: "var(--color-purple)", fontWeight: 600 }}>{po.orderNumber}</td>
                    <td style={{ fontWeight: 500 }}>{po.supplier?.companyName}</td>
                    <td>{po.itemName}</td>
                    <td style={{ fontWeight: 700 }}>{fmtRp(po.totalAmount)}</td>
                    <td>
                      <span className={`badge ${{ PENDING: "badge-warning", APPROVED: "badge-info", ORDERED: "badge-purple", RECEIVED: "badge-success", CANCELLED: "badge-danger" }[po.status as string] || "badge-neutral"}`}>
                        {{ PENDING: "Menunggu", APPROVED: "Disetujui", ORDERED: "Dipesan", RECEIVED: "Diterima", CANCELLED: "Dibatalkan" }[po.status as string]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
