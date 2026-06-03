"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const sevColor: any = { LOW: "badge-info", MEDIUM: "badge-warning", HIGH: "badge-danger", CRITICAL: "badge-danger" };
const statusColor: any = { OPEN: "badge-danger", IN_PROGRESS: "badge-warning", RESOLVED: "badge-success", CLOSED: "badge-gray" };
const alertIcons: any = { FIRE: "🔥", DOWNTIME: "⚙️", POWER_FAILURE: "⚡", INTERNET_FAILURE: "🌐", CASH_CRISIS: "💸", QUOTA_CLOSURE: "🚫", OTHER: "⚠️" };

export default function BcpPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [risks, setRisks] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type:"DOWNTIME", severity:"MEDIUM", title:"", description:"" });

  const load = () => {
    Promise.all([api.get("/bcp/incidents"), api.get("/bcp/risks"), api.get("/bcp/alerts")])
      .then(([i, r, a]) => { setIncidents(i.data); setRisks(r.data); setAlerts(a.data); }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/bcp/incidents", form);
    setShowForm(false); load();
  };

  const resolve = async (id: string) => {
    await api.put(`/bcp/incidents/${id}/resolve`);
    load();
  };

  const riskScore = (likelihood: number, impact: number) => {
    const score = likelihood * impact;
    if (score >= 15) return { label: "Tinggi", color: "#ef4444" };
    if (score >= 8) return { label: "Sedang", color: "#f59e0b" };
    return { label: "Rendah", color: "#10b981" };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Business Continuity Center</h2>
          <p className="text-slate-400 text-sm">Incident management, risk register, & alert system</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Tutup" : "⚠️ Laporkan Insiden"}
        </button>
      </div>

      {/* Alert Summary */}
      {alerts && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="stat-card" style={{ borderColor: alerts.openIncidents > 0 ? "rgba(239,68,68,0.3)" : undefined }}>
            <div className="text-3xl font-bold text-red-400">{alerts.openIncidents}</div>
            <div className="text-xs text-slate-500 mt-1">Insiden Terbuka</div>
          </div>
          <div className="stat-card" style={{ borderColor: alerts.criticalIncidents > 0 ? "rgba(239,68,68,0.5)" : undefined }}>
            <div className="text-3xl font-bold text-red-500">{alerts.criticalIncidents}</div>
            <div className="text-xs text-slate-500 mt-1">Insiden Kritis</div>
          </div>
          <div className="stat-card">
            <div className="text-3xl font-bold text-yellow-400">{alerts.highRiskItems}</div>
            <div className="text-xs text-slate-500 mt-1">Risiko Tinggi</div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="glass rounded-2xl p-6 mb-6 animate-fade-in">
          <h3 className="font-bold mb-4">Laporan Insiden Baru</h3>
          <form onSubmit={submit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label>Tipe Insiden</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  {["FIRE","DOWNTIME","POWER_FAILURE","INTERNET_FAILURE","CASH_CRISIS","QUOTA_CLOSURE","OTHER"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Tingkat Keparahan</label>
                <select value={form.severity} onChange={e => setForm({...form, severity: e.target.value})}>
                  {["LOW","MEDIUM","HIGH","CRITICAL"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group md:col-span-2">
                <label>Judul</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Ringkasan singkat insiden" required />
              </div>
              <div className="form-group md:col-span-2">
                <label>Deskripsi</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Jelaskan detail insiden yang terjadi..." required />
              </div>
            </div>
            <button type="submit" className="btn-primary">🚨 Kirim Laporan</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Incidents */}
        <div>
          <h3 className="font-bold mb-4">Daftar Insiden</h3>
          {loading ? <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div> : (
            <div className="space-y-3">
              {incidents.map((inc:any) => (
                <div key={inc.id} className="glass rounded-xl p-4 glass-hover">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{alertIcons[inc.type]}</span>
                      <span className="font-semibold text-sm">{inc.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${sevColor[inc.severity]}`}>{inc.severity}</span>
                      <span className={`badge ${statusColor[inc.status]}`}>{inc.status}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{inc.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{new Date(inc.createdAt).toLocaleDateString("id-ID")}</span>
                    {inc.status === "OPEN" && (
                      <button onClick={() => resolve(inc.id)} className="text-xs text-emerald-400 hover:text-emerald-300">✓ Tandai Selesai</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Risk Register */}
        <div>
          <h3 className="font-bold mb-4">Risk Register</h3>
          <div className="glass rounded-2xl overflow-hidden">
            <table>
              <thead><tr><th>Risiko</th><th>Likelihood</th><th>Impact</th><th>Level</th></tr></thead>
              <tbody>
                {risks.map((r:any) => {
                  const { label, color } = riskScore(r.likelihood, r.impact);
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="font-semibold text-sm">{r.description}</div>
                        <div className="text-xs text-slate-500">{r.category} · Owner: {r.owner}</div>
                      </td>
                      <td className="text-center font-bold">{r.likelihood}/5</td>
                      <td className="text-center font-bold">{r.impact}/5</td>
                      <td><span className="badge font-bold" style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}>{label}</span></td>
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
