"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

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

const fmt = (n: number, unit = "kg") => `${(n / 1000).toFixed(2)} Ton`;
const fmtRp = (n: number) => `Rp ${(n / 1000000).toFixed(1)}M`;
const fmtPct = (n: number) => `${(n || 0).toFixed(1)}%`;

export default function DashboardPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/dashboard/executive"),
      api.get("/dashboard/kpi-trend?days=7"),
    ]).then(([d, t]) => { setData(d.data); setTrend(t.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return <div className="text-slate-400">Gagal memuat data</div>;

  const kpis = [
    { icon: "⚖️", label: "Pembelian Hari Ini", value: fmt(data.todayPurchase.weight), sub: `${data.todayPurchase.count} tiket`, color: "#10b981" },
    { icon: "🏭", label: "Produksi Hari Ini", value: fmt(data.todayProduction.weight), sub: `${data.todayProduction.baleCount} bale`, color: "#0ea5e9" },
    { icon: "🚛", label: "Pengiriman Hari Ini", value: fmt(data.todayShipment.weight), sub: `${data.todayShipment.count} DO`, color: "#f59e0b" },
    { icon: "📦", label: "Stok Gudang", value: fmt(data.inventory.weight), sub: `${data.inventory.count} bale`, color: "#a855f7" },
    { icon: "💹", label: "Revenue", value: fmtRp(data.finance.revenue), sub: "Total AR", color: "#10b981" },
    { icon: "💰", label: "Cash Position", value: fmtRp(data.finance.cashPosition), sub: "Estimasi kas", color: "#0ea5e9" },
    { icon: "📤", label: "Piutang (AR)", value: fmtRp(data.finance.totalAR), sub: "Outstanding", color: "#f59e0b" },
    { icon: "📥", label: "Hutang (AP)", value: fmtRp(data.finance.totalAP), sub: "Outstanding", color: "#ef4444" },
  ];

  const oeeColor = data.todayProduction.avgOee >= 85 ? "#10b981" : data.todayProduction.avgOee >= 70 ? "#f59e0b" : "#ef4444";

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">Executive Dashboard</h2>
        <p className="text-slate-400 text-sm">Ringkasan operasional real-time RPMS Bogor</p>
      </div>

      {/* Risk Alert */}
      {data.riskStatus.openIncidents > 0 && (
        <div className="badge badge-danger mb-6 w-full justify-center py-3 rounded-xl text-sm gap-2">
          🚨 {data.riskStatus.openIncidents} insiden terbuka — Cek BCP Center
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {kpis.map((k, i) => (
          <div key={i} className="stat-card glass-hover">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{k.icon}</span>
              <span className="text-xs text-slate-500 font-medium">{k.label}</span>
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: k.color }}>{k.value}</div>
            <div className="text-xs text-slate-500">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Trend chart */}
        <div className="xl:col-span-2 glass rounded-2xl p-6">
          <h3 className="font-bold mb-4">Tren 7 Hari — Pembelian & Produksi</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="gPurchase" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gProd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}T`} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 8, fontSize: 12 }}
                formatter={(v: any) => [`${(v/1000).toFixed(2)} Ton`]} />
              <Area type="monotone" dataKey="purchase" name="Pembelian" stroke="#10b981" fill="url(#gPurchase)" strokeWidth={2} />
              <Area type="monotone" dataKey="production" name="Produksi" stroke="#0ea5e9" fill="url(#gProd)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* OEE + Status */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-bold mb-4">Status Operasional</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">OEE Rata-rata</span>
                <span className="font-bold" style={{ color: oeeColor }}>{fmtPct(data.todayProduction.avgOee)}</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: "rgba(148,163,184,0.15)" }}>
                <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min(100, data.todayProduction.avgOee)}%`, background: `linear-gradient(90deg, ${oeeColor}, ${oeeColor}cc)` }} />
              </div>
            </div>

            {[
              { label: "Supplier Aktif", value: "5", status: "badge-success" },
              { label: "Open Incidents", value: String(data.riskStatus.openIncidents), status: data.riskStatus.openIncidents > 0 ? "badge-danger" : "badge-success" },
              { label: "Pengiriman Aktif", value: String(data.todayShipment.count), status: "badge-info" },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-slate-400">{s.label}</span>
                <span className={`badge ${s.status}`}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-bold mb-4">Tiket Timbangan Terbaru</h3>
          <div className="overflow-x-auto">
            <table>
              <thead><tr>
                <th>Tiket</th><th>Supplier</th><th>Netto (kg)</th>
              </tr></thead>
              <tbody>
                {data.recentTickets.map((t: any) => (
                  <tr key={t.id}>
                    <td className="font-mono text-xs text-emerald-400">{t.ticketNumber}</td>
                    <td className="text-sm">{t.supplier?.companyName}</td>
                    <td className="font-semibold">{t.netWeight?.toLocaleString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-bold mb-4">Catatan Produksi Terbaru</h3>
          <div className="overflow-x-auto">
            <table>
              <thead><tr>
                <th>Mesin</th><th>Output (kg)</th><th>OEE</th>
              </tr></thead>
              <tbody>
                {data.recentProduction.map((p: any) => (
                  <tr key={p.id}>
                    <td className="text-sm">{p.machine?.name}</td>
                    <td className="font-semibold">{p.outputWeight?.toLocaleString("id-ID")}</td>
                    <td><span className="badge" style={{ background: p.oee >= 85 ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", color: p.oee >= 85 ? "#10b981" : "#f59e0b", border: `1px solid ${p.oee >= 85 ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}` }}>{p.oee?.toFixed(1)}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
