"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const sevColor: any = { LOW: "badge-info", MEDIUM: "badge-warning", HIGH: "badge-danger", CRITICAL: "badge-danger" };
const statusColor: any = { OPEN: "badge-danger", IN_PROGRESS: "badge-warning", RESOLVED: "badge-success", CLOSED: "badge-secondary" };
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
    if (score >= 15) return { label: "Tinggi", color: "#dc3545" };
    if (score >= 8) return { label: "Sedang", color: "#ffc107" };
    return { label: "Rendah", color: "#28a745" };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Business Continuity Center</h2>
          <p className="text-gray-500 text-sm">Incident management, risk register, & alert system</p>
        </div>
        <button className="btn-primary shadow-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Tutup" : "⚠️ Laporkan Insiden"}
        </button>
      </div>

      {/* Alert Summary */}
      {alerts && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="admin-card px-4 py-4 text-center border-t-4 border-t-danger">
            <div className="text-3xl font-bold text-danger">{alerts.openIncidents}</div>
            <div className="text-xs text-gray-500 mt-1 font-semibold uppercase">Insiden Terbuka</div>
          </div>
          <div className="admin-card px-4 py-4 text-center border-t-4 border-t-danger bg-red-50">
            <div className="text-3xl font-bold text-danger">{alerts.criticalIncidents}</div>
            <div className="text-xs text-gray-500 mt-1 font-semibold uppercase">Insiden Kritis</div>
          </div>
          <div className="admin-card px-4 py-4 text-center border-t-4 border-t-warning">
            <div className="text-3xl font-bold text-warning">{alerts.highRiskItems}</div>
            <div className="text-xs text-gray-500 mt-1 font-semibold uppercase">Risiko Tinggi</div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="admin-card primary mb-4 animate-fade-in">
          <div className="card-header">
            <h3 className="card-title">Laporan Insiden Baru</h3>
          </div>
          <div className="card-body">
            <form onSubmit={submit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group mb-0">
                  <label>Tipe Insiden</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    {["FIRE","DOWNTIME","POWER_FAILURE","INTERNET_FAILURE","CASH_CRISIS","QUOTA_CLOSURE","OTHER"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label>Tingkat Keparahan</label>
                  <select value={form.severity} onChange={e => setForm({...form, severity: e.target.value})}>
                    {["LOW","MEDIUM","HIGH","CRITICAL"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group mb-0 md:col-span-2">
                  <label>Judul</label>
                  <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Ringkasan singkat insiden" required />
                </div>
                <div className="form-group mb-0 md:col-span-2">
                  <label>Deskripsi</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Jelaskan detail insiden yang terjadi..." required />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200">
                <button type="submit" className="btn-primary">🚨 Kirim Laporan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Incidents */}
        <div className="admin-card">
          <div className="card-header border-b border-gray-200">
            <h3 className="card-title font-semibold text-gray-800">Daftar Insiden</h3>
          </div>
          <div className="card-body p-4 bg-gray-50">
            {loading ? <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div> : (
              <div className="space-y-3">
                {incidents.map((inc:any) => (
                  <div key={inc.id} className="bg-white rounded border border-gray-200 p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{alertIcons[inc.type]}</span>
                        <span className="font-semibold text-sm text-gray-800">{inc.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${sevColor[inc.severity]}`}>{inc.severity}</span>
                        <span className={`badge ${statusColor[inc.status]}`}>{inc.status}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{inc.description}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">{new Date(inc.createdAt).toLocaleDateString("id-ID")}</span>
                      {inc.status === "OPEN" && (
                        <button onClick={() => resolve(inc.id)} className="text-xs text-success hover:text-green-700 font-semibold">✓ Tandai Selesai</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Risk Register */}
        <div className="admin-card">
          <div className="card-header border-b border-gray-200">
            <h3 className="card-title font-semibold text-gray-800">Risk Register</h3>
          </div>
          <div className="card-body p-0 overflow-x-auto">
            <table className="m-0">
              <thead><tr><th>Risiko</th><th>Likelihood</th><th>Impact</th><th>Level</th></tr></thead>
              <tbody>
                {risks.map((r:any) => {
                  const { label, color } = riskScore(r.likelihood, r.impact);
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="font-semibold text-sm text-gray-800">{r.description}</div>
                        <div className="text-xs text-gray-500">{r.category} · Owner: {r.owner}</div>
                      </td>
                      <td className="text-center font-bold text-gray-700">{r.likelihood}/5</td>
                      <td className="text-center font-bold text-gray-700">{r.impact}/5</td>
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
