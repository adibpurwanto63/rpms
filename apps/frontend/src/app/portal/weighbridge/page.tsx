"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRefresh } from "@/lib/refresh-context";
import { Ticket, Scale, BarChart2 } from "lucide-react";

export default function WeighbridgePage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ supplierId: "", truckNumber: "", driverName: "", materialType: "OCC", grossWeight: "", tareWeight: "" });
  const { triggerRefresh } = useRefresh();

  const load = () => {
    Promise.all([
      api.get("/weighbridge"),
      api.get("/weighbridge/stats/today"),
      api.get("/suppliers?status=ACTIVE"),
    ]).then(([t, s, sup]) => { setTickets(t.data); setStats(s.data); setSuppliers(sup.data); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/weighbridge", { ...form, grossWeight: parseFloat(form.grossWeight), tareWeight: parseFloat(form.tareWeight) });
    setShowForm(false);
    setForm({ supplierId: "", truckNumber: "", driverName: "", materialType: "OCC", grossWeight: "", tareWeight: "" });
    load();
    triggerRefresh();
  };

  const net = form.grossWeight && form.tareWeight ? parseFloat(form.grossWeight) - parseFloat(form.tareWeight) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Manajemen Timbangan</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Tiket timbang digital, tracking armada, & histori transaksi</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Buat Tiket Baru
        </button>
      </div>

      {/* Today stats summary row */}
      {!loading && stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { label: "Tiket Hari Ini", value: stats._count || 0, Icon: Ticket, variant: "dark" },
            { label: "Total Netto", value: `${((stats._sum?.netWeight || 0) / 1000).toFixed(2)} Ton`, Icon: Scale, variant: "mint" },
            { label: "Rata-Rata Netto", value: stats._count ? `${(((stats._sum?.netWeight || 0) / stats._count) / 1000).toFixed(2)} Ton` : "0 Ton", Icon: BarChart2, variant: "pink" },
          ].map((k, i) => (
            <div key={i} className="kpi-card" style={{ background: ({ dark: "var(--kpi-dark)", mint: "var(--kpi-mint-bg)", pink: "var(--kpi-pink-bg)" } as any)[k.variant], borderColor: undefined }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>{k.label}</span>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: k.variant === "mint" ? "rgba(78,205,196,0.15)" : "rgba(255,107,157,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>{k.Icon && <k.Icon size={18} strokeWidth={2} />}</div>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)", lineHeight: 1.2 }}>{k.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Pop-up Modal Form */}
      {showForm && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(4px)"
        }}>
          <div className="erp-card animate-fade-in" style={{ width: "100%", maxWidth: 700, margin: 20, maxHeight: "90vh", overflowY: "auto", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div className="erp-card-header" style={{ position: "sticky", top: 0, background: "#fff", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="erp-card-title" style={{ fontSize: 20 }}>Buat Tiket Timbangan Baru</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
            </div>
            <div className="erp-card-body" style={{ padding: 24 }}>
              <form onSubmit={submit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                  <div style={{ gridColumn: "span 2" }}>
                    <label className="form-label">Supplier Pengirim</label>
                    <select className="form-input" value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })} required>
                      <option value="">-- Pilih Supplier --</option>
                      {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.companyName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Nomor Polisi Kendaraan</label>
                    <input className="form-input" value={form.truckNumber} onChange={e => setForm({ ...form, truckNumber: e.target.value })} placeholder="Cth: B 1234 XYZ" required />
                  </div>
                  <div>
                    <label className="form-label">Nama Pengemudi</label>
                    <input className="form-input" value={form.driverName} onChange={e => setForm({ ...form, driverName: e.target.value })} placeholder="Cth: Budi Santoso" required />
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label className="form-label">Jenis Material</label>
                    <select className="form-input" value={form.materialType} onChange={e => setForm({ ...form, materialType: e.target.value })}>
                      {["OCC", "ONP", "Mixed Paper", "White Ledger"].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Berat Bruto (kg)</label>
                    <input className="form-input" type="number" value={form.grossWeight} onChange={e => setForm({ ...form, grossWeight: e.target.value })} placeholder="Cth: 15000" required />
                  </div>
                  <div>
                    <label className="form-label">Berat Tare (kg)</label>
                    <input className="form-input" type="number" value={form.tareWeight} onChange={e => setForm({ ...form, tareWeight: e.target.value })} placeholder="Cth: 4500" required />
                  </div>
                </div>

                {net > 0 && (
                  <div style={{ background: "var(--bg-light)", padding: "16px 20px", borderRadius: 8, display: "flex", alignItems: "center", gap: 16, marginBottom: 24, border: "1px solid var(--border-light)" }}>
                    <div style={{ fontSize: "2rem" }}>⚖️</div>
                    <div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>Perkiraan Berat Netto</div>
                      <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--brand-teal)" }}>{net.toLocaleString("id-ID")} kg</div>
                    </div>
                  </div>
                )}

                <div style={{ paddingTop: 20, borderTop: "1px solid var(--border-light)", display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: "0 24px" }}>💾 Simpan Tiket</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #EDE9FF", borderTop: "3px solid #7C6FE0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : (
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Riwayat Tiket Timbangan</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>No. Tiket</th>
                  <th>Supplier</th>
                  <th>Kendaraan</th>
                  <th>Material</th>
                  <th>Bruto</th>
                  <th>Tare</th>
                  <th>Netto</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Belum ada tiket timbangan</td></tr>
                ) : tickets.map((t: any) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600, color: "var(--brand-purple)" }}>{t.ticketNumber}</td>
                    <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>{t.supplier?.companyName}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{t.truckNumber}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{t.driverName}</div>
                    </td>
                    <td><span className="badge badge-neutral" style={{ background: "#EDE9FF", color: "var(--brand-purple)", border: "none" }}>{t.materialType}</span></td>
                    <td style={{ color: "var(--text-secondary)" }}>{t.grossWeight?.toLocaleString("id-ID")} kg</td>
                    <td style={{ color: "var(--text-secondary)" }}>{t.tareWeight?.toLocaleString("id-ID")} kg</td>
                    <td style={{ fontWeight: 700, color: "var(--brand-teal)" }}>{t.netWeight?.toLocaleString("id-ID")} kg</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{new Date(t.date).toLocaleDateString("id-ID")}</td>
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
