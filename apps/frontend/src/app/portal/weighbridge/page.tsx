"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function WeighbridgePage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ supplierId: "", truckNumber: "", driverName: "", materialType: "OCC", grossWeight: "", tareWeight: "" });

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get("/weighbridge"),
      api.get("/weighbridge/stats/today"),
      api.get("/suppliers?status=ACTIVE"),
    ]).then(([t, s, sup]) => {
      setTickets(t.data); setStats(s.data); setSuppliers(sup.data);
    }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/weighbridge", {
        ...form,
        grossWeight: parseFloat(form.grossWeight),
        tareWeight: parseFloat(form.tareWeight),
      });
      setShowForm(false);
      setForm({ supplierId: "", truckNumber: "", driverName: "", materialType: "OCC", grossWeight: "", tareWeight: "" });
      load();
    } finally { setSubmitting(false); }
  };

  const net = form.grossWeight && form.tareWeight ? parseFloat(form.grossWeight) - parseFloat(form.tareWeight) : 0;

  const kpis = stats ? [
    { label: "Tiket Hari Ini", value: stats._count || 0, icon: "🎫", variant: "dark" },
    { label: "Total Netto", value: `${((stats._sum?.netWeight || 0) / 1000).toFixed(2)} Ton`, icon: "⚖️", variant: "mint" },
    { label: "Rata-rata Netto", value: stats._count ? `${((stats._sum?.netWeight || 0) / stats._count / 1000).toFixed(2)} Ton` : "—", icon: "📊", variant: "pink" },
  ] : [];

  const variantBg: any = { dark: "var(--kpi-dark)", mint: "var(--kpi-mint-bg)", pink: "var(--kpi-pink-bg)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Manajemen Timbangan</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Tiket timbang digital & histori transaksi</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Tutup" : "⚖️ Buat Tiket Baru"}
        </button>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {kpis.map((k, i) => (
            <div key={i} className="kpi-card" style={{ background: variantBg[k.variant], borderColor: k.variant === "dark" ? "transparent" : undefined }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: k.variant === "dark" ? "rgba(255,255,255,0.6)" : "var(--text-secondary)" }}>{k.label}</span>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: k.variant === "dark" ? "rgba(255,255,255,0.12)" : "rgba(78,205,196,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{k.icon}</div>
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.03em", color: k.variant === "dark" ? "#fff" : "var(--text-primary)", lineHeight: 1.2 }}>{k.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* New Ticket Form */}
      {showForm && (
        <div className="erp-card animate-fade-in">
          <div className="erp-card-header">
            <h3 className="erp-card-title">Tiket Timbangan Baru</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>✕</button>
          </div>
          <div className="erp-card-body">
            <form onSubmit={submit}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="form-label">Supplier</label>
                  <select className="form-select" value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })} required>
                    <option value="">Pilih Supplier</option>
                    {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.companyName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">No. Polisi Truk</label>
                  <input className="form-input" value={form.truckNumber} onChange={e => setForm({ ...form, truckNumber: e.target.value })} placeholder="B 1234 XYZ" required />
                </div>
                <div>
                  <label className="form-label">Nama Pengemudi</label>
                  <input className="form-input" value={form.driverName} onChange={e => setForm({ ...form, driverName: e.target.value })} placeholder="Nama supir" required />
                </div>
                <div>
                  <label className="form-label">Jenis Material</label>
                  <select className="form-select" value={form.materialType} onChange={e => setForm({ ...form, materialType: e.target.value })}>
                    {["OCC", "ONP", "Mixed Paper", "White Ledger"].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Berat Bruto (kg)</label>
                  <input className="form-input" type="number" value={form.grossWeight} onChange={e => setForm({ ...form, grossWeight: e.target.value })} placeholder="15000" required />
                </div>
                <div>
                  <label className="form-label">Berat Tare (kg)</label>
                  <input className="form-input" type="number" value={form.tareWeight} onChange={e => setForm({ ...form, tareWeight: e.target.value })} placeholder="4500" required />
                </div>
              </div>

              {net > 0 && (
                <div style={{ background: "var(--kpi-mint-bg)", borderRadius: 10, padding: "14px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12, border: "1px solid rgba(78,205,196,0.3)" }}>
                  <span style={{ fontSize: 24 }}>⚖️</span>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Berat Netto Kalkulasi</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-teal)", letterSpacing: "-0.02em" }}>{net.toLocaleString("id-ID")} kg</div>
                  </div>
                </div>
              )}

              <div style={{ paddingTop: 16, borderTop: "1px solid var(--border-light)", display: "flex", gap: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "⏳ Menyimpan..." : "🎫 Buat Tiket"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tickets Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #EDE9FF", borderTop: "3px solid #7C6FE0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : (
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Riwayat Tiket Timbangan</span>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{tickets.length} tiket</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>No. Tiket</th><th>Supplier</th><th>Truk</th><th>Material</th>
                  <th>Bruto (kg)</th><th>Tare (kg)</th><th>Netto (kg)</th><th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Belum ada tiket timbangan</td></tr>
                ) : tickets.map((t: any) => (
                  <tr key={t.id}>
                    <td style={{ fontFamily: "monospace", fontSize: 13, color: "var(--color-purple)", fontWeight: 600 }}>{t.ticketNumber}</td>
                    <td style={{ fontWeight: 500 }}>{t.supplier?.companyName}</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{t.truckNumber}</td>
                    <td><span className="badge badge-info">{t.materialType}</span></td>
                    <td>{t.grossWeight?.toLocaleString("id-ID")}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{t.tareWeight?.toLocaleString("id-ID")}</td>
                    <td style={{ fontWeight: 700, color: "var(--color-teal)" }}>{t.netWeight?.toLocaleString("id-ID")}</td>
                    <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>{new Date(t.date).toLocaleDateString("id-ID")}</td>
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
