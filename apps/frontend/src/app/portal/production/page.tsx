"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const machineStatusColor = { RUNNING: "badge-success", IDLE: "badge-gray", MAINTENANCE: "badge-warning", BREAKDOWN: "badge-danger" };
const machineStatusLabel = { RUNNING: "Berjalan", IDLE: "Standby", MAINTENANCE: "Maintenance", BREAKDOWN: "Rusak" };

export default function ProductionPage() {
  const [machines, setMachines] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ machineId:"", inputWeight:"", outputWeight:"", baleCount:"", runtimeMinutes:"", downtimeMinutes:"0" });

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

  const oeeGauge = (oee: number) => {
    const color = oee >= 85 ? "#10b981" : oee >= 70 ? "#f59e0b" : "#ef4444";
    return (
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${oee} ${100 - oee}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold" style={{ color }}>{oee?.toFixed(0)}%</span>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Monitoring Produksi</h2>
          <p className="text-slate-400 text-sm">Status mesin, OEE, dan catatan produksi</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Tutup" : "📝 Input Produksi"}
        </button>
      </div>

      {/* Machine status */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {machines.map((m:any) => (
          <div key={m.id} className="stat-card glass-hover">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl">🏭</span>
              <span className={`badge ${(machineStatusColor as any)[m.status]}`}>{(machineStatusLabel as any)[m.status]}</span>
            </div>
            <div className="font-semibold text-sm">{m.name}</div>
            <div className="text-xs text-slate-500 mt-1">{m.location}</div>
          </div>
        ))}
      </div>

      {/* Today stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Input", value: `${((stats._sum?.inputWeight || 0)/1000).toFixed(2)} Ton`, icon: "📥" },
            { label: "Output", value: `${((stats._sum?.outputWeight || 0)/1000).toFixed(2)} Ton`, icon: "📤" },
            { label: "Bale Hari Ini", value: stats._sum?.baleCount || 0, icon: "📦" },
            { label: "OEE Avg", value: `${(stats._avg?.oee || 0).toFixed(1)}%`, icon: "📊" },
          ].map((s,i) => (
            <div key={i} className="stat-card"><div className="text-xl mb-1">{s.icon}</div><div className="text-xl font-bold text-emerald-400">{s.value}</div><div className="text-xs text-slate-500">{s.label}</div></div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="glass rounded-2xl p-6 mb-6 animate-fade-in">
          <h3 className="font-bold mb-4">Input Catatan Produksi</h3>
          <form onSubmit={submit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="form-group">
                <label>Mesin</label>
                <select value={form.machineId} onChange={e => setForm({...form, machineId: e.target.value})} required>
                  <option value="">Pilih Mesin</option>
                  {machines.map((m:any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              {[
                { key:"inputWeight", label:"Input (kg)", placeholder:"5000" },
                { key:"outputWeight", label:"Output (kg)", placeholder:"4500" },
                { key:"baleCount", label:"Jumlah Bale", placeholder:"9" },
                { key:"runtimeMinutes", label:"Runtime (menit)", placeholder:"420" },
                { key:"downtimeMinutes", label:"Downtime (menit)", placeholder:"0" },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label>{f.label}</label>
                  <input type="number" value={(form as any)[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} placeholder={f.placeholder} required />
                </div>
              ))}
            </div>
            <button type="submit" className="btn-primary">💾 Simpan Produksi</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table>
            <thead><tr><th>Mesin</th><th>Input (kg)</th><th>Output (kg)</th><th>Bale</th><th>Runtime</th><th>Downtime</th><th>OEE</th><th>Tanggal</th></tr></thead>
            <tbody>
              {records.map((r:any) => (
                <tr key={r.id}>
                  <td className="text-sm">{r.machine?.name}</td>
                  <td>{r.inputWeight?.toLocaleString("id-ID")}</td>
                  <td className="font-semibold text-emerald-400">{r.outputWeight?.toLocaleString("id-ID")}</td>
                  <td className="font-bold">{r.baleCount}</td>
                  <td className="text-slate-400">{r.runtimeMinutes} min</td>
                  <td className={r.downtimeMinutes > 30 ? "text-red-400" : "text-slate-400"}>{r.downtimeMinutes} min</td>
                  <td>{oeeGauge(r.oee)}</td>
                  <td className="text-xs text-slate-500">{new Date(r.date).toLocaleDateString("id-ID")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
