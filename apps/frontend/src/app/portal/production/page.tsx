"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const machineStatusBadge: any = {
  RUNNING: "badge-success", IDLE: "badge-neutral", MAINTENANCE: "badge-warning", BREAKDOWN: "badge-danger"
};
const machineStatusLabel: any = {
  RUNNING: "Berjalan", IDLE: "Standby", MAINTENANCE: "Maintenance", BREAKDOWN: "Rusak"
};
const machineStatusIcon: any = {
  RUNNING: "🟢", IDLE: "🟡", MAINTENANCE: "🔧", BREAKDOWN: "🔴"
};

export default function ProductionPage() {
  const [machines, setMachines] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ machineId: "", inputWeight: "", outputWeight: "", baleCount: "", runtimeMinutes: "", downtimeMinutes: "0" });

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/production/machines"), api.get("/production"), api.get("/production/stats/today")])
      .then(([m, r, s]) => { setMachines(m.data); setRecords(r.data); setStats(s.data); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/production", {
        machineId: form.machineId,
        inputWeight: parseFloat(form.inputWeight),
        outputWeight: parseFloat(form.outputWeight),
        baleCount: parseInt(form.baleCount),
        runtimeMinutes: parseInt(form.runtimeMinutes),
        downtimeMinutes: parseInt(form.downtimeMinutes),
      });
      setShowForm(false);
      setForm({ machineId: "", inputWeight: "", outputWeight: "", baleCount: "", runtimeMinutes: "", downtimeMinutes: "0" });
      load();
    } finally { setSubmitting(false); }
  };

  const updateMachineStatus = async (id: string, status: string) => {
    await api.put(`/production/machines/${id}/status`, { status });
    load();
  };

  const oeeColor = (oee: number) => oee >= 85 ? "var(--color-green)" : oee >= 70 ? "var(--color-amber)" : "var(--color-red)";

  const statKpis = stats ? [
    { label: "Input Hari Ini", value: `${((stats._sum?.inputWeight || 0) / 1000).toFixed(2)} Ton`, icon: "📥", variant: "dark" },
    { label: "Output Hari Ini", value: `${((stats._sum?.outputWeight || 0) / 1000).toFixed(2)} Ton`, icon: "📤", variant: "mint" },
    { label: "Total Bale", value: stats._sum?.baleCount || 0, icon: "📦", variant: "pink" },
    { label: "OEE Rata-rata", value: `${(stats._avg?.oee || 0).toFixed(1)}%`, icon: "📊", variant: "neutral" },
  ] : [];

  const variantBg: any = { dark: "var(--kpi-dark)", mint: "var(--kpi-mint-bg)", pink: "var(--kpi-pink-bg)", neutral: "var(--kpi-neutral-bg)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Monitoring Produksi</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Status mesin, OEE, dan catatan produksi</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Tutup" : "📝 Input Produksi"}
        </button>
      </div>

      {/* Machine Status Grid */}
      {machines.length > 0 && (
        <div>
          <div style={{ fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 12 }}>Status Mesin</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {machines.map((m: any) => (
              <div key={m.id} className="erp-card" style={{ padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 20 }}>{machineStatusIcon[m.status] || "⚙️"}</span>
                  <span className={`badge ${machineStatusBadge[m.status]}`}>{machineStatusLabel[m.status]}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 4 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>{m.location}</div>
                <select
                  className="form-select"
                  value={m.status}
                  onChange={e => updateMachineStatus(m.id, e.target.value)}
                  style={{ fontSize: 12, padding: "5px 28px 5px 8px" }}
                >
                  {["RUNNING", "IDLE", "MAINTENANCE", "BREAKDOWN"].map(s => (
                    <option key={s} value={s}>{machineStatusLabel[s]}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today Stats */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {statKpis.map((k, i) => (
            <div key={i} className="kpi-card" style={{ background: variantBg[k.variant], borderColor: k.variant === "dark" ? "transparent" : undefined }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: k.variant === "dark" ? "rgba(255,255,255,0.6)" : "var(--text-secondary)" }}>{k.label}</span>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: k.variant === "dark" ? "rgba(255,255,255,0.12)" : "rgba(78,205,196,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{k.icon}</div>
              </div>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-0.03em", color: k.variant === "dark" ? "#fff" : "var(--text-primary)", lineHeight: 1.2 }}>{k.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Production Form */}
      {showForm && (
        <div className="erp-card animate-fade-in">
          <div className="erp-card-header">
            <h3 className="erp-card-title">Input Catatan Produksi</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>✕</button>
          </div>
          <div className="erp-card-body">
            <form onSubmit={submit}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
                <div style={{ gridColumn: "span 3" }}>
                  <label className="form-label">Mesin</label>
                  <select className="form-select" value={form.machineId} onChange={e => setForm({ ...form, machineId: e.target.value })} required>
                    <option value="">Pilih Mesin</option>
                    {machines.map((m: any) => <option key={m.id} value={m.id}>{m.name} — {m.location}</option>)}
                  </select>
                </div>
                {[
                  { key: "inputWeight", label: "Input (kg)", placeholder: "5000" },
                  { key: "outputWeight", label: "Output (kg)", placeholder: "4500" },
                  { key: "baleCount", label: "Jumlah Bale", placeholder: "9" },
                  { key: "runtimeMinutes", label: "Runtime (menit)", placeholder: "420" },
                  { key: "downtimeMinutes", label: "Downtime (menit)", placeholder: "0" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="form-label">{f.label}</label>
                    <input className="form-input" type="number" value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} required />
                  </div>
                ))}
              </div>
              <div style={{ paddingTop: 16, borderTop: "1px solid var(--border-light)", display: "flex", gap: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "⏳ Menyimpan..." : "💾 Simpan Produksi"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Records Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #EDE9FF", borderTop: "3px solid #7C6FE0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : (
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Catatan Produksi</span>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{records.length} catatan</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Mesin</th><th>Input (kg)</th><th>Output (kg)</th>
                  <th>Bale</th><th>Runtime</th><th>Downtime</th><th>OEE</th><th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Belum ada catatan produksi</td></tr>
                ) : records.map((r: any) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.machine?.name}</td>
                    <td>{r.inputWeight?.toLocaleString("id-ID")}</td>
                    <td style={{ fontWeight: 600, color: "var(--color-teal)" }}>{r.outputWeight?.toLocaleString("id-ID")}</td>
                    <td style={{ fontWeight: 700 }}>{r.baleCount}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{r.runtimeMinutes} min</td>
                    <td style={{ color: r.downtimeMinutes > 30 ? "var(--color-red)" : "var(--text-secondary)", fontWeight: r.downtimeMinutes > 30 ? 600 : 400 }}>
                      {r.downtimeMinutes} min
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: "#F0F2F7", borderRadius: 99, minWidth: 50 }}>
                          <div style={{ height: 6, borderRadius: 99, width: `${Math.min(100, r.oee || 0)}%`, background: oeeColor(r.oee || 0) }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: oeeColor(r.oee || 0), minWidth: 42 }}>{r.oee?.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>{new Date(r.date).toLocaleDateString("id-ID")}</td>
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
