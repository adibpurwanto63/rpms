"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const gradeColor: any = { A: "badge-success", B: "badge-warning", REJECT: "badge-danger" };
const gradeLabel: any = { A: "Grade A", B: "Grade B", REJECT: "Reject" };
const gradeTextColor: any = { A: "var(--color-green)", B: "#B45309", REJECT: "var(--color-red)" };

export default function QcPage() {
  const [inspections, setInspections] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ ticketId: "", grade: "A", moisturePct: 0, plasticPct: 0, metalPct: 0, contaminationPct: 0, notes: "" });

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/qc"), api.get("/qc/stats"), api.get("/weighbridge")])
      .then(([q, s, t]) => {
        setInspections(q.data);
        setStats(s.data);
        setTickets(t.data.filter((t: any) => !t.qcInspection));
      }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/qc", form);
      setShowForm(false);
      setForm({ ticketId: "", grade: "A", moisturePct: 0, plasticPct: 0, metalPct: 0, contaminationPct: 0, notes: "" });
      load();
    } finally { setSubmitting(false); }
  };

  const Slider = ({ label, field }: { label: string; field: string }) => (
    <div>
      <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
        <span>{label}</span>
        <span style={{ color: "var(--color-purple)", fontWeight: 700 }}>{(form as any)[field]}%</span>
      </label>
      <input
        type="range" min={0} max={50} step={0.5}
        value={(form as any)[field]}
        onChange={e => setForm({ ...form, [field]: parseFloat(e.target.value) })}
        style={{ width: "100%", accentColor: "var(--color-purple)", height: 4, cursor: "pointer" }}
      />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Quality Control</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Inspeksi material & grading OCC</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Tutup" : "🔬 Input Inspeksi"}
        </button>
      </div>

      {/* Grade Stats */}
      {stats.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {stats.map((s: any) => (
            <div key={s.grade} className="kpi-card" style={{
              background: s.grade === "A" ? "var(--kpi-mint-bg)" : s.grade === "B" ? "var(--kpi-pink-bg)" : "#FFF5F5",
              textAlign: "center",
            }}>
              <span className={`badge ${gradeColor[s.grade]}`} style={{ alignSelf: "flex-start" }}>{gradeLabel[s.grade]}</span>
              <div style={{ fontSize: "2.5rem", fontWeight: 800, color: gradeTextColor[s.grade], letterSpacing: "-0.04em" }}>{s._count}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>inspeksi</div>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="erp-card animate-fade-in">
          <div className="erp-card-header">
            <h3 className="erp-card-title">Form Inspeksi QC</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>✕</button>
          </div>
          <div className="erp-card-body">
            <form onSubmit={submit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="form-label">Tiket Timbangan</label>
                  <select className="form-select" value={form.ticketId} onChange={e => setForm({ ...form, ticketId: e.target.value })} required>
                    <option value="">Pilih Tiket</option>
                    {tickets.map((t: any) => <option key={t.id} value={t.id}>{t.ticketNumber} — {t.supplier?.companyName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Grade</label>
                  <select className="form-select" value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })}>
                    <option value="A">Grade A — Premium</option>
                    <option value="B">Grade B — Standard</option>
                    <option value="REJECT">Reject — Ditolak</option>
                  </select>
                </div>
              </div>

              <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "16px 20px", marginBottom: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <Slider label="Kadar Air (Moisture)" field="moisturePct" />
                <Slider label="Kontaminasi Plastik" field="plasticPct" />
                <Slider label="Kontaminasi Metal" field="metalPct" />
                <Slider label="Kontaminasi Total" field="contaminationPct" />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Catatan QC</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Catatan tambahan pemeriksaan..."
                  style={{ resize: "vertical" }}
                />
              </div>

              <div style={{ paddingTop: 16, borderTop: "1px solid var(--border-light)", display: "flex", gap: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "⏳ Menyimpan..." : "💾 Simpan Inspeksi"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
              </div>
            </form>
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
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{inspections.length} inspeksi</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Tiket</th><th>Supplier</th><th>Grade</th>
                  <th>Moisture</th><th>Plastik</th><th>Metal</th><th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {inspections.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Belum ada data inspeksi</td></tr>
                ) : inspections.map((q: any) => (
                  <tr key={q.id}>
                    <td style={{ fontFamily: "monospace", fontSize: 13, color: "var(--color-purple)", fontWeight: 600 }}>{q.ticket?.ticketNumber}</td>
                    <td style={{ fontWeight: 500 }}>{q.ticket?.supplier?.companyName}</td>
                    <td><span className={`badge ${gradeColor[q.grade]}`}>{q.grade}</span></td>
                    <td>{q.moisturePct?.toFixed(1)}%</td>
                    <td>{q.plasticPct?.toFixed(1)}%</td>
                    <td>{q.metalPct?.toFixed(1)}%</td>
                    <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>{new Date(q.inspectedAt).toLocaleDateString("id-ID")}</td>
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
