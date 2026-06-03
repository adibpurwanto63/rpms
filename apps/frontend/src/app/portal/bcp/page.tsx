"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const sevBadge: any = { LOW: "badge-info", MEDIUM: "badge-warning", HIGH: "badge-danger", CRITICAL: "badge-danger" };
const statusBadge: any = { OPEN: "badge-danger", IN_PROGRESS: "badge-warning", RESOLVED: "badge-success", CLOSED: "badge-neutral" };
const statusLabel: any = { OPEN: "Terbuka", IN_PROGRESS: "Proses", RESOLVED: "Selesai", CLOSED: "Ditutup" };
const alertIcons: any = { FIRE: "🔥", DOWNTIME: "⚙️", POWER_FAILURE: "⚡", INTERNET_FAILURE: "🌐", CASH_CRISIS: "💸", QUOTA_CLOSURE: "🚫", OTHER: "⚠️" };
const typeLabel: any = { FIRE: "Kebakaran", DOWNTIME: "Downtime", POWER_FAILURE: "Pemadaman Listrik", INTERNET_FAILURE: "Gangguan Internet", CASH_CRISIS: "Krisis Kas", QUOTA_CLOSURE: "Penutupan Kuota", OTHER: "Lainnya" };

export default function BcpPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [risks, setRisks] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ type: "DOWNTIME", severity: "MEDIUM", title: "", description: "" });

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/bcp/incidents"), api.get("/bcp/risks"), api.get("/bcp/alerts")])
      .then(([i, r, a]) => { setIncidents(i.data); setRisks(r.data); setAlerts(a.data); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/bcp/incidents", form);
      setShowForm(false);
      setForm({ type: "DOWNTIME", severity: "MEDIUM", title: "", description: "" });
      load();
    } finally { setSubmitting(false); }
  };

  const resolve = async (id: string) => {
    await api.put(`/bcp/incidents/${id}/resolve`);
    load();
  };

  const riskScore = (likelihood: number, impact: number) => {
    const score = likelihood * impact;
    if (score >= 15) return { label: "Tinggi", badge: "badge-danger" };
    if (score >= 8) return { label: "Sedang", badge: "badge-warning" };
    return { label: "Rendah", badge: "badge-success" };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Business Continuity Center</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Incident management, risk register, & alert system</p>
        </div>
        <button className="btn btn-primary" style={{ background: "var(--color-red)", borderColor: "var(--color-red)" }} onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Tutup" : "⚠️ Laporkan Insiden"}
        </button>
      </div>

      {/* Alert Summary KPIs */}
      {alerts && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {[
            { label: "Insiden Terbuka", value: alerts.openIncidents, bg: "#FFF5F5", border: "1px solid #FEE2E2", color: "var(--color-red)", icon: "🚨" },
            { label: "Insiden Kritis", value: alerts.criticalIncidents, bg: "#FFF5F5", border: "1px solid #FECACA", color: "#BE123C", icon: "🔴" },
            { label: "Risiko Tinggi", value: alerts.highRiskItems, bg: "#FFFBEB", border: "1px solid #FDE68A", color: "#B45309", icon: "⚠️" },
          ].map((a, i) => (
            <div key={i} style={{ borderRadius: 16, padding: "1.5rem", background: a.bg, border: a.border, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: a.color, opacity: 0.8 }}>{a.label}</span>
                <span style={{ fontSize: 24 }}>{a.icon}</span>
              </div>
              <div style={{ fontSize: "2.5rem", fontWeight: 800, color: a.color, letterSpacing: "-0.04em", lineHeight: 1 }}>{a.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Report Form */}
      {showForm && (
        <div className="erp-card animate-fade-in" style={{ borderLeft: "4px solid var(--color-red)" }}>
          <div className="erp-card-header">
            <h3 className="erp-card-title">🚨 Laporan Insiden Baru</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>✕</button>
          </div>
          <div className="erp-card-body">
            <form onSubmit={submit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="form-label">Tipe Insiden</label>
                  <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    {Object.entries(typeLabel).map(([k, v]) => <option key={k} value={k}>{alertIcons[k]} {v as string}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Tingkat Keparahan</label>
                  <select className="form-select" value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
                    <option value="LOW">🟢 Rendah</option>
                    <option value="MEDIUM">🟡 Sedang</option>
                    <option value="HIGH">🔴 Tinggi</option>
                    <option value="CRITICAL">🆘 Kritis</option>
                  </select>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Judul Insiden</label>
                  <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ringkasan singkat insiden" required />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Deskripsi Detail</label>
                  <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Jelaskan detail insiden yang terjadi..." required style={{ resize: "vertical" }} />
                </div>
              </div>
              <div style={{ paddingTop: 16, borderTop: "1px solid var(--border-light)", display: "flex", gap: 8 }}>
                <button type="submit" className="btn" style={{ background: "var(--color-red)", color: "#fff", border: "none" }} disabled={submitting}>
                  {submitting ? "⏳ Mengirim..." : "🚨 Kirim Laporan"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Incidents + Risk Side-by-side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Incidents List */}
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Daftar Insiden</span>
            <span className="badge badge-danger">{incidents.filter(i => i.status === "OPEN").length} terbuka</span>
          </div>
          <div style={{ padding: "12px" }}>
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
                <div style={{ width: 32, height: 32, border: "3px solid #EDE9FF", borderTop: "3px solid #7C6FE0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              </div>
            ) : incidents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Tidak ada insiden aktif</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {incidents.map((inc: any) => (
                  <div key={inc.id} style={{
                    background: "#FAFAFA",
                    border: "1px solid var(--border-light)",
                    borderLeft: `3px solid ${inc.severity === "CRITICAL" ? "var(--color-red)" : inc.severity === "HIGH" ? "#F97316" : inc.severity === "MEDIUM" ? "var(--color-amber)" : "var(--color-purple)"}`,
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{alertIcons[inc.type]}</span>
                        <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{inc.title}</span>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <span className={`badge ${sevBadge[inc.severity]}`}>{inc.severity}</span>
                        <span className={`badge ${statusBadge[inc.status]}`}>{statusLabel[inc.status]}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8, lineHeight: 1.5 }}>{inc.description}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(inc.createdAt).toLocaleDateString("id-ID")}</span>
                      {inc.status === "OPEN" && (
                        <button
                          onClick={() => resolve(inc.id)}
                          className="btn btn-sm"
                          style={{ background: "var(--color-green-light)", color: "var(--color-green)", border: "none", fontSize: 12, padding: "4px 10px" }}
                        >
                          ✓ Tandai Selesai
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                  <th>Risiko</th><th>Like.</th><th>Impact</th><th>Level</th>
                </tr>
              </thead>
              <tbody>
                {risks.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Tidak ada risiko terdaftar</td></tr>
                ) : risks.map((r: any) => {
                  const { label, badge } = riskScore(r.likelihood, r.impact);
                  return (
                    <tr key={r.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{r.description}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{r.category} · {r.owner}</div>
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 700 }}>{r.likelihood}/5</td>
                      <td style={{ textAlign: "center", fontWeight: 700 }}>{r.impact}/5</td>
                      <td><span className={`badge ${badge}`}>{label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
