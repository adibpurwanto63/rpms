"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRefresh } from "@/lib/refresh-context";
import { CheckCircle2, AlertTriangle, Ban } from "lucide-react";

const gradeColor: any = { A: "badge-success", B: "badge-warning", REJECT: "badge-danger" };
const gradeLabel: any = { A: "Grade A", B: "Grade B", REJECT: "Reject" };

export default function QcPage() {
  const [inspections, setInspections] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ticketId: "", grade: "A", moisturePct: 0, plasticPct: 0, metalPct: 0, contaminationPct: 0, notes: "" });
  const { triggerRefresh } = useRefresh();

  const load = () => {
    Promise.all([api.get("/qc"), api.get("/qc/stats"), api.get("/weighbridge")]).then(([q, s, t]) => {
      setInspections(q.data); setStats(s.data); setTickets(t.data.filter((t: any) => !t.qcInspection));
    }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/qc", form);
    setShowForm(false);
    load();
    triggerRefresh();
  };

  const getStat = (grade: string) => stats.find(s => s.grade === grade)?._count || 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Quality Control</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Inspeksi material & grading kualitas OCC</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Tutup" : "+ Input Inspeksi QC"}
        </button>
      </div>

      {/* Stats summary row */}
      {!loading && stats.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { label: "Grade A (Diterima)", value: getStat("A"), Icon: CheckCircle2, variant: "mint" },
            { label: "Grade B (Sortir)", value: getStat("B"), Icon: AlertTriangle, variant: "dark" },
            { label: "Ditolak (Reject)", value: getStat("REJECT"), Icon: Ban, variant: "pink" },
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

      {/* Form Modal */}
      {showForm && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(4px)"
        }}>
          <div className="erp-card animate-fade-in" style={{ width: "100%", maxWidth: 700, margin: 20, maxHeight: "90vh", overflowY: "auto", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div className="erp-card-header" style={{ position: "sticky", top: 0, background: "#fff", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="erp-card-title" style={{ fontSize: 20 }}>Form Inspeksi Baru</h3>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
            </div>
            <div className="erp-card-body" style={{ padding: 24 }}>
              <form onSubmit={submit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label className="form-label">Tiket Timbangan</label>
                    <select className="form-input" value={form.ticketId} onChange={e => setForm({ ...form, ticketId: e.target.value })} required>
                      <option value="">Pilih Tiket yang Belum Diinspeksi</option>
                      {tickets.map((t: any) => <option key={t.id} value={t.id}>{t.ticketNumber} — {t.supplier?.companyName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Keputusan Grade</label>
                    <select className="form-input" value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })}>
                      <option value="A">Grade A (Sesuai Standar)</option>
                      <option value="B">Grade B (Di Bawah Standar)</option>
                      <option value="REJECT">Reject (Ditolak)</option>
                    </select>
                  </div>
                  
                  {[{ label: "Kadar Air (Moisture) %", field: "moisturePct" },
                    { label: "Kontaminasi Plastik %", field: "plasticPct" },
                    { label: "Kontaminasi Metal %", field: "metalPct" },
                    { label: "Kontaminasi Total %", field: "contaminationPct" }
                  ].map((s: any) => (
                    <div key={s.field}>
                      <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>{s.label}</span>
                        <span style={{ fontWeight: 700, color: "var(--brand-purple)" }}>{(form as any)[s.field]}%</span>
                      </label>
                      <input type="range" min={0} max={50} step={0.5} value={(form as any)[s.field]}
                        onChange={e => setForm({ ...form, [s.field]: parseFloat(e.target.value) })}
                        style={{ width: "100%", accentColor: "var(--brand-purple)" }} />
                    </div>
                  ))}
                  
                  <div style={{ gridColumn: "span 2" }}>
                    <label className="form-label">Catatan QC</label>
                    <textarea className="form-input" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Masukkan catatan tambahan bila perlu..." style={{ height: "auto" }} />
                  </div>
                </div>
                <div style={{ paddingTop: 20, borderTop: "1px solid var(--border-light)", display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: "0 24px" }}>💾 Simpan Inspeksi</button>
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
            <span className="erp-card-title">Riwayat Inspeksi QC</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>No Tiket</th>
                  <th>Supplier</th>
                  <th>Grade</th>
                  <th>Moisture</th>
                  <th>Plastik</th>
                  <th>Metal</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {inspections.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Belum ada data QC</td></tr>
                ) : inspections.map((q: any) => (
                  <tr key={q.id}>
                    <td style={{ fontWeight: 600, color: "var(--brand-purple)" }}>{q.ticket?.ticketNumber}</td>
                    <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>{q.ticket?.supplier?.companyName}</td>
                    <td><span className={`badge ${gradeColor[q.grade]}`}>{gradeLabel[q.grade]}</span></td>
                    <td style={{ color: "var(--text-secondary)" }}>{q.moisturePct?.toFixed(1)}%</td>
                    <td style={{ color: "var(--text-secondary)" }}>{q.plasticPct?.toFixed(1)}%</td>
                    <td style={{ color: "var(--text-secondary)" }}>{q.metalPct?.toFixed(1)}%</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{new Date(q.inspectedAt).toLocaleDateString("id-ID")}</td>
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
