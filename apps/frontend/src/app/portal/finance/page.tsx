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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Manajemen Keuangan</h2>
          <p className="text-gray-500 text-sm">Invoice, AR/AP, dan dashboard finansial</p>
        </div>
        <button className="btn-primary shadow-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Tutup" : "➕ Invoice Baru"}
        </button>
      </div>

      {/* Finance KPIs */}
      {dashboard && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
          {[
            { label: "Revenue (AR)", value: fmtRp(dashboard.revenue), icon: "💹", color: "bg-success" },
            { label: "Cash Position", value: fmtRp(dashboard.cashPosition), icon: "💰", color: "bg-info" },
            { label: "Piutang Outstanding", value: fmtRp(dashboard.totalAR), icon: "📤", color: "bg-warning" },
            { label: "Hutang Outstanding", value: fmtRp(dashboard.totalAP), icon: "📥", color: "bg-danger" },
          ].map((k, i) => (
            <div key={i} className={`small-box ${k.color}`}>
              <div className="inner">
                <h3>{k.value}</h3>
                <p>{k.label}</p>
              </div>
              <div className="icon">{k.icon}</div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="admin-card primary mb-4 animate-fade-in">
          <div className="card-header">
            <h3 className="card-title">Invoice Baru</h3>
          </div>
          <div className="card-body">
            <form onSubmit={submit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group mb-0">
                  <label>Tipe Invoice</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="ACCOUNTS_PAYABLE">Accounts Payable (Hutang)</option>
                    <option value="ACCOUNTS_RECEIVABLE">Accounts Receivable (Piutang)</option>
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label>{form.type === "ACCOUNTS_PAYABLE" ? "Supplier" : "Customer"}</label>
                  <input value={form.supplierOrCustomer} onChange={e => setForm({...form, supplierOrCustomer: e.target.value})} placeholder="Nama perusahaan" required />
                </div>
                <div className="form-group mb-0">
                  <label>Jumlah (Rp)</label>
                  <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="50000000" required />
                </div>
                <div className="form-group mb-0">
                  <label>Jatuh Tempo</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} required />
                </div>
                <div className="form-group mb-0 md:col-span-2">
                  <label>Deskripsi</label>
                  <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Pembelian OCC bulan Desember" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200">
                <button type="submit" className="btn-primary">💾 Simpan Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[{key:"all",label:"Semua"},{key:"AP",label:"Hutang (AP)"},{key:"AR",label:"Piutang (AR)"}].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${tab === t.key ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="admin-card">
          <div className="card-body p-0 overflow-x-auto">
            <table className="m-0">
              <thead><tr><th>No. Invoice</th><th>Tipe</th><th>Pihak</th><th>Jumlah</th><th>Terbayar</th><th>Status</th><th>Jatuh Tempo</th></tr></thead>
              <tbody>
                {invoices.map((inv:any) => (
                  <tr key={inv.id}>
                    <td className="font-mono text-sm text-blue-600">{inv.invoiceNumber}</td>
                    <td><span className={`badge ${inv.type === "ACCOUNTS_PAYABLE" ? "badge-danger" : "badge-success"}`}>{inv.type === "ACCOUNTS_PAYABLE" ? "AP" : "AR"}</span></td>
                    <td className="text-sm text-gray-800">{inv.supplierOrCustomer}</td>
                    <td className="font-semibold text-gray-800">Rp {inv.amount?.toLocaleString("id-ID")}</td>
                    <td className="text-gray-500">Rp {inv.paidAmount?.toLocaleString("id-ID")}</td>
                    <td><span className={`badge ${paymentStatusColor[inv.paymentStatus]}`}>{inv.paymentStatus}</span></td>
                    <td className="text-sm text-gray-500">{new Date(inv.dueDate).toLocaleDateString("id-ID")}</td>
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
