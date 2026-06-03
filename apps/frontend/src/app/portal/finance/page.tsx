"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const paymentStatusColor: any = { PENDING: "badge-info", PARTIAL: "badge-warning", PAID: "badge-success", OVERDUE: "badge-danger" };

export default function FinancePage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all"|"AP"|"AR">("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type:"ACCOUNTS_PAYABLE", supplierOrCustomer:"", amount:"", dueDate:"", description:"" });

  const load = () => {
    const params = tab !== "all" ? (tab === "AP" ? "?type=ACCOUNTS_PAYABLE" : "?type=ACCOUNTS_RECEIVABLE") : "";
    Promise.all([api.get("/finance/dashboard"), api.get(`/finance/invoices${params}`)])
      .then(([d, inv]) => { setDashboard(d.data); setInvoices(inv.data); }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [tab]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/finance/invoices", { ...form, amount: parseFloat(form.amount) });
    setShowForm(false); load();
  };

  const fmtRp = (n: number) => `Rp ${(n/1000000).toFixed(1)}M`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Manajemen Keuangan</h2>
          <p className="text-slate-400 text-sm">Invoice, AR/AP, dan dashboard finansial</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Tutup" : "➕ Invoice Baru"}
        </button>
      </div>

      {/* Finance KPIs */}
      {dashboard && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Revenue (AR)", value: fmtRp(dashboard.revenue), icon: "💹", color: "#10b981" },
            { label: "Cash Position", value: fmtRp(dashboard.cashPosition), icon: "💰", color: "#0ea5e9" },
            { label: "Piutang Outstanding", value: fmtRp(dashboard.totalAR), icon: "📤", color: "#f59e0b" },
            { label: "Hutang Outstanding", value: fmtRp(dashboard.totalAP), icon: "📥", color: "#ef4444" },
          ].map((k, i) => (
            <div key={i} className="stat-card glass-hover">
              <div className="flex items-center gap-2 mb-2"><span className="text-xl">{k.icon}</span><span className="text-xs text-slate-500">{k.label}</span></div>
              <div className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="glass rounded-2xl p-6 mb-6 animate-fade-in">
          <h3 className="font-bold mb-4">Invoice Baru</h3>
          <form onSubmit={submit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label>Tipe Invoice</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="ACCOUNTS_PAYABLE">Accounts Payable (Hutang)</option>
                  <option value="ACCOUNTS_RECEIVABLE">Accounts Receivable (Piutang)</option>
                </select>
              </div>
              <div className="form-group">
                <label>{form.type === "ACCOUNTS_PAYABLE" ? "Supplier" : "Customer"}</label>
                <input value={form.supplierOrCustomer} onChange={e => setForm({...form, supplierOrCustomer: e.target.value})} placeholder="Nama perusahaan" required />
              </div>
              <div className="form-group">
                <label>Jumlah (Rp)</label>
                <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="50000000" required />
              </div>
              <div className="form-group">
                <label>Jatuh Tempo</label>
                <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} required />
              </div>
              <div className="form-group md:col-span-2">
                <label>Deskripsi</label>
                <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Pembelian OCC bulan Desember" />
              </div>
            </div>
            <button type="submit" className="btn-primary">💾 Simpan Invoice</button>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[{key:"all",label:"Semua"},{key:"AP",label:"Hutang (AP)"},{key:"AR",label:"Piutang (AR)"}].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.key ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-white"}`}
            style={{ background: tab === t.key ? "#10b981" : "rgba(148,163,184,0.1)" }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table>
            <thead><tr><th>No. Invoice</th><th>Tipe</th><th>Pihak</th><th>Jumlah</th><th>Terbayar</th><th>Status</th><th>Jatuh Tempo</th></tr></thead>
            <tbody>
              {invoices.map((inv:any) => (
                <tr key={inv.id}>
                  <td className="font-mono text-xs text-cyan-400">{inv.invoiceNumber}</td>
                  <td><span className={`badge ${inv.type === "ACCOUNTS_PAYABLE" ? "badge-danger" : "badge-success"}`}>{inv.type === "ACCOUNTS_PAYABLE" ? "AP" : "AR"}</span></td>
                  <td className="text-sm">{inv.supplierOrCustomer}</td>
                  <td className="font-semibold">Rp {inv.amount?.toLocaleString("id-ID")}</td>
                  <td className="text-slate-400">Rp {inv.paidAmount?.toLocaleString("id-ID")}</td>
                  <td><span className={`badge ${paymentStatusColor[inv.paymentStatus]}`}>{inv.paymentStatus}</span></td>
                  <td className="text-xs text-slate-500">{new Date(inv.dueDate).toLocaleDateString("id-ID")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
