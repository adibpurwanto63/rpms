"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const paymentStatusBadge: any = {
  PENDING: "badge-purple",
  PARTIAL: "badge-warning",
  PAID: "badge-success",
  OVERDUE: "badge-danger",
};

export default function FinancePage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "AP" | "AR">("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "ACCOUNTS_PAYABLE", supplierOrCustomer: "", amount: "", dueDate: "", description: "" });

  const load = () => {
    const params = tab !== "all" ? (tab === "AP" ? "?type=ACCOUNTS_PAYABLE" : "?type=ACCOUNTS_RECEIVABLE") : "";
    Promise.all([api.get("/finance/dashboard"), api.get(`/finance/invoices${params}`)])
      .then(([d, inv]) => { setDashboard(d.data); setInvoices(inv.data); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [tab]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/finance/invoices", { ...form, amount: parseFloat(form.amount) });
    setShowForm(false); load();
  };

  const fmtRp = (n: number) => `Rp ${(n / 1000000).toFixed(1)}M`;

  const kpis = dashboard ? [
    { label: "Revenue", value: fmtRp(dashboard.revenue), icon: "💹", variant: "dark", trend: "+12.5%", trendUp: true },
    { label: "Cash Position", value: fmtRp(dashboard.cashPosition), icon: "🏦", variant: "mint", trend: "+5.1%", trendUp: true },
    { label: "Piutang (AR)", value: fmtRp(dashboard.totalAR), icon: "📤", variant: "pink", trend: "+3.2%", trendUp: false },
    { label: "Hutang (AP)", value: fmtRp(dashboard.totalAP), icon: "📥", variant: "neutral", trend: "-1.1%", trendUp: false },
  ] : [];

  const variantBg: any = { dark: "var(--kpi-dark)", mint: "var(--kpi-mint-bg)", pink: "var(--kpi-pink-bg)", neutral: "var(--kpi-neutral-bg)" };
  const iconBgMap: any = { dark: "rgba(255,255,255,0.12)", mint: "rgba(78,205,196,0.15)", pink: "rgba(255,107,157,0.15)", neutral: "#EDE9FF" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Manajemen Keuangan</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Invoice, AR/AP, dan dashboard finansial</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Tutup" : "➕ Invoice Baru"}
        </button>
      </div>

      {/* Finance KPI Cards */}
      {dashboard && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {kpis.map((k, i) => (
            <div key={i} className="kpi-card" style={{ background: variantBg[k.variant], borderColor: k.variant === "dark" ? "transparent" : undefined }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: k.variant === "dark" ? "rgba(255,255,255,0.6)" : "var(--text-secondary)" }}>{k.label}</span>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: iconBgMap[k.variant], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{k.icon}</div>
              </div>
              <div style={{ fontSize: "1.65rem", fontWeight: 700, letterSpacing: "-0.03em", color: k.variant === "dark" ? "#fff" : "var(--text-primary)", lineHeight: 1.15 }}>{k.value}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: k.trendUp ? (k.variant === "dark" ? "#5FE09F" : "var(--color-green)") : "var(--color-red)" }}>
                  {k.trendUp ? "↑" : "↓"} {k.trend}
                </span>
                <span style={{ fontSize: 12, color: k.variant === "dark" ? "rgba(255,255,255,0.5)" : "var(--text-muted)" }}>vs bulan lalu</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Invoice Form */}
      {showForm && (
        <div className="erp-card animate-fade-in">
          <div className="erp-card-header">
            <h3 className="erp-card-title">Invoice Baru</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>✕</button>
          </div>
          <div className="erp-card-body">
            <form onSubmit={submit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tipe Invoice</label>
                  <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="ACCOUNTS_PAYABLE">Accounts Payable (Hutang)</option>
                    <option value="ACCOUNTS_RECEIVABLE">Accounts Receivable (Piutang)</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{form.type === "ACCOUNTS_PAYABLE" ? "Supplier" : "Customer"}</label>
                  <input className="form-input" value={form.supplierOrCustomer} onChange={e => setForm({ ...form, supplierOrCustomer: e.target.value })} placeholder="Nama perusahaan" required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Jumlah (Rp)</label>
                  <input className="form-input" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="50000000" required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Jatuh Tempo</label>
                  <input className="form-input" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0, gridColumn: "span 2" }}>
                  <label className="form-label">Deskripsi</label>
                  <input className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Pembelian OCC bulan Desember" />
                </div>
              </div>
              <div style={{ paddingTop: 16, borderTop: "1px solid var(--border-light)", display: "flex", gap: 8 }}>
                <button type="submit" className="btn btn-primary">💾 Simpan Invoice</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "#F3F4F6", borderRadius: 10, padding: 4, alignSelf: "flex-start" }}>
        {[{ key: "all", label: "Semua" }, { key: "AP", label: "Hutang (AP)" }, { key: "AR", label: "Piutang (AR)" }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            style={{
              padding: "6px 16px", borderRadius: 7, fontSize: 13, fontWeight: 600,
              border: "none", cursor: "pointer", transition: "all 0.2s ease",
              background: tab === t.key ? "#fff" : "transparent",
              color: tab === t.key ? "var(--color-purple)" : "var(--text-secondary)",
              boxShadow: tab === t.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Invoice Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #EDE9FF", borderTop: "3px solid #7C6FE0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : (
        <div className="erp-card">
          <div style={{ overflowX: "auto" }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>No. Invoice</th>
                  <th>Tipe</th>
                  <th>Pihak</th>
                  <th>Jumlah</th>
                  <th>Terbayar</th>
                  <th>Status</th>
                  <th>Jatuh Tempo</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Belum ada data invoice</td></tr>
                ) : invoices.map((inv: any) => (
                  <tr key={inv.id}>
                    <td style={{ fontFamily: "monospace", fontSize: 13, color: "var(--color-purple)", fontWeight: 600 }}>{inv.invoiceNumber}</td>
                    <td><span className={`badge ${inv.type === "ACCOUNTS_PAYABLE" ? "badge-danger" : "badge-success"}`}>{inv.type === "ACCOUNTS_PAYABLE" ? "AP" : "AR"}</span></td>
                    <td style={{ fontWeight: 500 }}>{inv.supplierOrCustomer}</td>
                    <td style={{ fontWeight: 600 }}>Rp {inv.amount?.toLocaleString("id-ID")}</td>
                    <td style={{ color: "var(--text-secondary)" }}>Rp {inv.paidAmount?.toLocaleString("id-ID")}</td>
                    <td><span className={`badge ${paymentStatusBadge[inv.paymentStatus] || "badge-neutral"}`}>{inv.paymentStatus}</span></td>
                    <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>{new Date(inv.dueDate).toLocaleDateString("id-ID")}</td>
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
