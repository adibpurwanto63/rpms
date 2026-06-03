"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const machineStatusColor: any = { RUNNING: "badge-success", IDLE: "badge-neutral", MAINTENANCE: "badge-warning", BREAKDOWN: "badge-danger" };
const machineStatusLabel: any = { RUNNING: "Berjalan", IDLE: "Standby", MAINTENANCE: "Maintenance", BREAKDOWN: "Rusak" };

export default function ProductionPage() {
  const [machines, setMachines] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ machineId: "", inputWeight: "", outputWeight: "", baleCount: "", runtimeMinutes: "", downtimeMinutes: "0" });

  const load = () => {
    Promise.all([api.get("/production/machines"), api.get("/production"), api.get("/production/stats/today")])
      .then(([m, r, s]) => { setMachines(m.data); setRecords(r.data); setStats(s.data); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/production", { machineId: form.machineId, inputWeight: parseFloat(form.inputWeight), outputWeight: parseFloat(form.outputWeight), baleCount: parseInt(form.baleCount), runtimeMinutes: parseInt(form.runtimeMinutes), downtimeMinutes: parseInt(form.downtimeMinutes) });
    setShowForm(false); load();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Monitoring Produksi</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Status mesin, performa OEE, dan catatan produksi baling</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Tutup" : "+ Input Produksi"}
        </button>
      </div>

      {/* Machine status */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {machines.map((m: any) => (
          <div key={m.id} className="erp-card" style={{ padding: "16px", background: "var(--bg-card)", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "1.5rem" }}>🏭</span>
              <span className={`badge ${machineStatusColor[m.status]}`}>{machineStatusLabel[m.status]}</span>
            </div>
            <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "1.1rem", marginTop: 4 }}>{m.name}</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{m.location}</div>
          </div>
        ))}
      </div>

      {/* Today stats summary row */}
      {!loading && stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { label: "Input Material", value: `${((stats._sum?.inputWeight || 0) / 1000).toFixed(2)} Ton`, icon: "📥", variant: "neutral" },
            { label: "Output Produksi", value: `${((stats._sum?.outputWeight || 0) / 1000).toFixed(2)} Ton`, icon: "📤", variant: "mint" },
            { label: "Bale Selesai", value: stats._sum?.baleCount || 0, icon: "📦", variant: "dark" },
            { label: "Rata-Rata OEE", value: `${(stats._avg?.oee || 0).toFixed(1)}%`, icon: "📊", variant: "pink" },
          ].map((k, i) => (
            <div key={i} className="kpi-card" style={{ background: ({ dark: "var(--kpi-dark)", mint: "var(--kpi-mint-bg)", pink: "var(--kpi-pink-bg)", neutral: "var(--kpi-neutral-bg)" } as any)[k.variant], borderColor: k.variant === "dark" ? "transparent" : undefined }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: k.variant === "dark" ? "rgba(255,255,255,0.6)" : "var(--text-secondary)" }}>{k.label}</span>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: k.variant === "dark" ? "rgba(255,255,255,0.12)" : k.variant === "mint" ? "rgba(78,205,196,0.15)" : k.variant === "neutral" ? "#EDE9FF" : "rgba(255,107,157,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{k.icon}</div>
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.03em", color: k.variant === "dark" ? "#fff" : "var(--text-primary)", lineHeight: 1.2 }}>{k.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add Record Form */}
      {showForm && (
        <div className="erp-card animate-fade-in">
          <div className="erp-card-header">
            <h3 className="erp-card-title">Catat Hasil Produksi</h3>
          </div>
          <div className="erp-card-body">
            <form onSubmit={submit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div style={{ gridColumn: "span 3" }}>
                  <label className="form-label">Pilih Mesin</label>
                  <select className="form-input" value={form.machineId} onChange={e => setForm({ ...form, machineId: e.target.value })} required>
                    <option value="">-- Pilih Mesin --</option>
                    {machines.map((m: any) => <option key={m.id} value={m.id}>{m.name} ({machineStatusLabel[m.status]})</option>)}
                  </select>
                </div>
                {[
                  { key: "inputWeight", label: "Input Material (kg)", placeholder: "5000" },
                  { key: "outputWeight", label: "Output Produksi (kg)", placeholder: "4500" },
                  { key: "baleCount", label: "Jumlah Bale", placeholder: "9" },
                  { key: "runtimeMinutes", label: "Waktu Jalan (Menit)", placeholder: "420" },
                  { key: "downtimeMinutes", label: "Waktu Henti (Menit)", placeholder: "0" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="form-label">{f.label}</label>
                    <input className="form-input" type="number" value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} required />
                  </div>
                ))}
              </div>
              <div style={{ paddingTop: 16, borderTop: "1px solid var(--border-light)", display: "flex", gap: 8 }}>
                <button type="submit" className="btn btn-primary">💾 Simpan Catatan</button>
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
            <span className="erp-card-title">Riwayat Produksi</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Mesin</th>
                  <th>Input</th>
                  <th>Output</th>
                  <th>Bale</th>
                  <th>Runtime</th>
                  <th>Downtime</th>
                  <th>OEE</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Belum ada catatan produksi</td></tr>
                ) : records.map((r: any) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600, color: "var(--brand-purple)" }}>{r.machine?.name}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{r.inputWeight?.toLocaleString("id-ID")} kg</td>
                    <td style={{ fontWeight: 600, color: "var(--brand-teal)" }}>{r.outputWeight?.toLocaleString("id-ID")} kg</td>
                    <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>{r.baleCount}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{r.runtimeMinutes} min</td>
                    <td style={{ color: r.downtimeMinutes > 30 ? "#FF6B9D" : "var(--text-secondary)", fontWeight: r.downtimeMinutes > 30 ? 600 : 400 }}>{r.downtimeMinutes} min</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 60, height: 8, background: "var(--border-light)", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ height: "100%", background: r.oee >= 85 ? "var(--brand-teal)" : r.oee >= 70 ? "#FBBF24" : "#FF6B9D", width: `${Math.min(100, Math.max(0, r.oee))}%` }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{r.oee?.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{new Date(r.date).toLocaleDateString("id-ID")}</td>
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
