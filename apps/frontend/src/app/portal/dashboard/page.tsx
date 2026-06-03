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
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return <div className="text-gray-500">Gagal memuat data</div>;

  const kpis = [
    { icon: "⚖️", label: "Pembelian", value: fmt(data.todayPurchase.weight), sub: `${data.todayPurchase.count} tiket`, color: "bg-success" },
    { icon: "🏭", label: "Produksi", value: fmt(data.todayProduction.weight), sub: `${data.todayProduction.baleCount} bale`, color: "bg-info" },
    { icon: "🚛", label: "Pengiriman", value: fmt(data.todayShipment.weight), sub: `${data.todayShipment.count} DO`, color: "bg-warning" },
    { icon: "📦", label: "Stok Gudang", value: fmt(data.inventory.weight), sub: `${data.inventory.count} bale`, color: "bg-danger" },
  ];
  
  const financeKpis = [
    { label: "Revenue", value: fmtRp(data.finance.revenue), color: "success" },
    { label: "Cash Position", value: fmtRp(data.finance.cashPosition), color: "info" },
    { label: "Piutang (AR)", value: fmtRp(data.finance.totalAR), color: "warning" },
    { label: "Hutang (AP)", value: fmtRp(data.finance.totalAP), color: "danger" },
  ];

  const oeeColor = data.todayProduction.avgOee >= 85 ? "bg-success" : data.todayProduction.avgOee >= 70 ? "bg-warning" : "bg-danger";

  return (
    <div>
      {/* Risk Alert */}
      {data.riskStatus.openIncidents > 0 && (
        <div className="bg-danger p-3 rounded mb-4 shadow-sm text-sm font-semibold">
          🚨 {data.riskStatus.openIncidents} insiden terbuka — Cek BCP Center
        </div>
      )}

      {/* KPI Grid - Small Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {kpis.map((k, i) => (
          <div key={i} className={`small-box ${k.color}`}>
            <div className="inner">
              <h3>{k.value}</h3>
              <p>{k.label}</p>
            </div>
            <div className="icon">{k.icon}</div>
            <div className="small-box-footer text-sm opacity-80">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Trend chart */}
        <div className="lg:col-span-2 admin-card info">
          <div className="card-header">
            <h3 className="card-title">Tren 7 Hari — Pembelian & Produksi</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="gPurchase" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#28a745" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#28a745" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#17a2b8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#17a2b8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis dataKey="date" tick={{ fill: "#6c757d", fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fill: "#6c757d", fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}T`} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #dee2e6", borderRadius: 4, fontSize: 12 }}
                  formatter={(v: any) => [`${(v/1000).toFixed(2)} Ton`]} />
                <Area type="monotone" dataKey="purchase" name="Pembelian" stroke="#28a745" fill="url(#gPurchase)" strokeWidth={2} />
                <Area type="monotone" dataKey="production" name="Produksi" stroke="#17a2b8" fill="url(#gProd)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Operasional */}
        <div className="admin-card primary">
          <div className="card-header">
            <h3 className="card-title">Status Operasional</h3>
          </div>
          <div className="card-body flex flex-col gap-4">
            <div>
              <div className="flex justify-between text-sm mb-1 font-semibold">
                <span>OEE Rata-rata</span>
                <span>{fmtPct(data.todayProduction.avgOee)}</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-2 ${oeeColor}`} style={{ width: `${Math.min(100, data.todayProduction.avgOee)}%` }} />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3 mt-2">
              <p className="font-semibold text-sm mb-3">Finance Overview</p>
              {financeKpis.map((f, i) => (
                <div key={i} className="flex justify-between text-sm mb-2 pb-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-600">{f.label}</span>
                  <span className={`badge badge-${f.color}`}>{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="admin-card success">
          <div className="card-header">
            <h3 className="card-title">Tiket Timbangan Terbaru</h3>
          </div>
          <div className="card-body p-0 overflow-x-auto">
            <table className="m-0">
              <thead><tr>
                <th>Tiket</th><th>Supplier</th><th>Netto (kg)</th>
              </tr></thead>
              <tbody>
                {data.recentTickets.map((t: any) => (
                  <tr key={t.id}>
                    <td className="font-mono text-sm text-blue-600">{t.ticketNumber}</td>
                    <td className="text-sm">{t.supplier?.companyName}</td>
                    <td className="font-semibold text-sm">{t.netWeight?.toLocaleString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-card warning">
          <div className="card-header">
            <h3 className="card-title">Catatan Produksi Terbaru</h3>
          </div>
          <div className="card-body p-0 overflow-x-auto">
            <table className="m-0">
              <thead><tr>
                <th>Mesin</th><th>Output (kg)</th><th>OEE</th>
              </tr></thead>
              <tbody>
                {data.recentProduction.map((p: any) => (
                  <tr key={p.id}>
                    <td className="text-sm">{p.machine?.name}</td>
                    <td className="font-semibold text-sm">{p.outputWeight?.toLocaleString("id-ID")}</td>
                    <td><span className={`badge badge-${p.oee >= 85 ? 'success' : 'warning'}`}>{p.oee?.toFixed(1)}%</span></td>
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
