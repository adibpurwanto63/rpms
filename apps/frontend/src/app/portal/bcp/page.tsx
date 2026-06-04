"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRefresh } from "@/lib/refresh-context";
import { AlertTriangle, Siren, TrendingUp } from "lucide-react";

const sevColor: any = { LOW: "badge-info", MEDIUM: "badge-warning", HIGH: "badge-pink", CRITICAL: "badge-danger" };
const statusColor: any = { OPEN: "badge-danger", IN_PROGRESS: "badge-warning", RESOLVED: "badge-success", CLOSED: "badge-neutral" };
const alertIcons: any = { FIRE: "🔥", DOWNTIME: "⚙️", POWER_FAILURE: "⚡", INTERNET_FAILURE: "🌐", CASH_CRISIS: "💸", QUOTA_CLOSURE: "🚫", OTHER: "⚠️" };

export default function BcpPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [risks, setRisks] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "DOWNTIME", severity: "MEDIUM", title: "", description: "" });
  const { triggerRefresh } = useRefresh();

  const load = () => {
    Promise.all([api.get("/bcp/incidents"), api.get("/bcp/risks"), api.get("/bcp/alerts")])
      .then(([i, r, a]) => { setIncidents(i.data); setRisks(r.data); setAlerts(a.data); }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/bcp/incidents", form);
    setShowForm(false);
    load();
    triggerRefresh();
  };

  const resolve = async (id: string) => {
    await api.put(`/bcp/incidents/${id}/resolve`);
    load();
    triggerRefresh();
  };

  const riskScore = (likelihood: number, impact: number) => {
    const score = likelihood * impact;
    if (score >= 15) return { label: "Tinggi", color: "#FF6B9D" }; // pink
    if (score >= 8) return { label: "Sedang", color: "#FBBF24" };  // warning
    return { label: "Rendah", color: "var(--brand-teal)" };       // teal
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Business Continuity Center</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Manajemen Insiden, Mitigasi Risiko, & Sistem Notifikasi BCP</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ background: "var(--brand-pink)", borderColor: "transparent" }}>
          {showForm ? "✕ Tutup" : "🚨 Laporkan Insiden"}
        </button>
      </div>

      {/* Alert Summary */}
      {!loading && alerts && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { label: "Insiden Terbuka", value: alerts.openIncidents, Icon: AlertTriangle, variant: "dark" },
            { label: "Insiden Kritis", value: alerts.criticalIncidents, Icon: Siren, variant: "pink" },
            { label: "Risiko Tinggi", value: alerts.highRiskItems, Icon: TrendingUp, variant: "mint" },
          ].map((k, i) => (
            <div key={i} className="kpi-card" style={{ background: ({ dark: "var(--kpi-dark)", mint: "var(--kpi-mint-bg)", pink: "var(--kpi-pink-bg)" } as any)[k.variant], borderColor: k.variant === "dark" ? "transparent" : undefined }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: k.variant === "dark" ? "rgba(255,255,255,0.6)" : "var(--text-secondary)" }}>{k.label}</span>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: k.variant === "dark" ? "rgba(255,255,255,0.12)" : k.variant === "mint" ? "rgba(78,205,196,0.15)" : "rgba(255,107,157,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: k.variant === "dark" ? "#fff" : "var(--color-primary)" }}>{k.Icon && <k.Icon size={18} strokeWidth={2} />}</div>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.03em", color: k.variant === "dark" ? "#fff" : "var(--text-primary)", lineHeight: 1.2 }}>{k.value}</div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(4px)"
        }}>
          <div className="erp-card animate-fade-in" style={{ width: "100%", maxWidth: 700, margin: 20, maxHeight: "90vh", overflowY: "auto", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", borderLeft: "4px solid var(--brand-pink)" }}>
            <div className="erp-card-header" style={{ position: "sticky", top: 0, background: "#fff", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="erp-card-title" style={{ fontSize: 20 }}>Form Laporan Insiden</h3>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
            </div>
            <div className="erp-card-body" style={{ padding: 24 }}>
              <form onSubmit={submit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label className="form-label">Tipe Insiden</label>
                    <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                      {["FIRE", "DOWNTIME", "POWER_FAILURE", "INTERNET_FAILURE", "CASH_CRISIS", "QUOTA_CLOSURE", "OTHER"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Tingkat Keparahan</label>
                    <select className="form-input" value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
                      {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label className="form-label">Judul Insiden</label>
                    <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Cth: Kebakaran di Gudang A" required />
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label className="form-label">Deskripsi & Dampak</label>
                    <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Jelaskan detail insiden yang terjadi..." style={{ height: "auto" }} required />
                  </div>
                </div>
                <div style={{ paddingTop: 20, borderTop: "1px solid var(--border-light)", display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: "0 24px", background: "var(--brand-pink)", borderColor: "transparent" }}>🚨 Kirim Laporan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #EDE9FF", borderTop: "3px solid #7C6FE0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Incidents */}
          <div className="erp-card">
            <div className="erp-card-header">
              <span className="erp-card-title">Daftar Insiden Aktif</span>
            </div>
            <div className="erp-card-body" style={{ padding: 16, background: "var(--bg-light)", display: "flex", flexDirection: "column", gap: 12 }}>
              {incidents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Tidak ada insiden tercatat</div>
              ) : incidents.map((inc: any) => (
                <div key={inc.id} style={{ background: "#fff", borderRadius: 8, padding: 16, border: "1px solid var(--border-light)", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "1.25rem" }}>{alertIcons[inc.type]}</span>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{inc.title}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span className={`badge ${sevColor[inc.severity]}`}>{inc.severity}</span>
                      <span className={`badge ${statusColor[inc.status]}`}>{inc.status}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>{inc.description}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid var(--border-light)" }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Dilaporkan: {new Date(inc.createdAt).toLocaleDateString("id-ID")}</span>
                    {inc.status === "OPEN" && (
                      <button onClick={() => resolve(inc.id)} style={{ background: "transparent", border: "none", color: "var(--brand-teal)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>✓ Tandai Selesai</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Register */}
          <div className="erp-card">
            <div className="erp-card-header">
              <span className="erp-card-title">Risk Register</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Risiko & Owner</th>
                    <th>Kemungkinan</th>
                    <th>Dampak</th>
                    <th>Level</th>
                  </tr>
                </thead>
                <tbody>
                  {risks.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Tidak ada data risiko</td></tr>
                  ) : risks.map((r: any) => {
                    const { label, color } = riskScore(r.likelihood, r.impact);
                    return (
                      <tr key={r.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{r.description}</div>
                          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{r.category} · PIC: <span style={{ fontWeight: 500 }}>{r.owner}</span></div>
                        </td>
                        <td style={{ fontWeight: 700, color: "var(--text-primary)", textAlign: "center" }}>{r.likelihood}/5</td>
                        <td style={{ fontWeight: 700, color: "var(--text-primary)", textAlign: "center" }}>{r.impact}/5</td>
                        <td>
                          <span style={{ padding: "4px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, background: `${color}15`, color: color, border: `1px solid ${color}40`, textTransform: "uppercase" }}>
                            {label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
