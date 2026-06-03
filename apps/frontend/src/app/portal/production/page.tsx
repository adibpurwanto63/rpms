"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const machineStatusColor = { RUNNING: "bg-success", IDLE: "bg-secondary", MAINTENANCE: "bg-warning", BREAKDOWN: "bg-danger" };
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
    const color = oee >= 85 ? "#28a745" : oee >= 70 ? "#ffc107" : "#dc3545";
    return (
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e9ecef" strokeWidth="3" />
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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Monitoring Produksi</h2>
          <p className="text-gray-500 text-sm">Status mesin, OEE, dan catatan produksi</p>
        </div>
        <button className="btn-primary shadow-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Tutup" : "📝 Input Produksi"}
        </button>
      </div>

      {/* Machine status */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        {machines.map((m:any) => (
          <div key={m.id} className="paper-card px-4 py-3 border-t-0 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">🏭</span>
              <span className={`badge ${(machineStatusColor as any)[m.status]}`}>{(machineStatusLabel as any)[m.status]}</span>
            </div>
            <div className="font-semibold text-sm text-gray-800">{m.name}</div>
            <div className="text-xs text-gray-500 mt-1">{m.location}</div>
          </div>
        ))}
      </div>

      {/* Today stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[
            { label: "Input", value: `${((stats._sum?.inputWeight || 0)/1000).toFixed(2)} Ton`, icon: "📥", color: "bg-info" },
            { label: "Output", value: `${((stats._sum?.outputWeight || 0)/1000).toFixed(2)} Ton`, icon: "📤", color: "bg-success" },
            { label: "Bale Hari Ini", value: stats._sum?.baleCount || 0, icon: "📦", color: "bg-primary" },
            { label: "OEE Avg", value: `${(stats._avg?.oee || 0).toFixed(1)}%`, icon: "📊", color: "bg-warning" },
          ].map((s,i) => (
            <div key={i} className={`small-box ${s.color}`}>
              <div className="inner">
                <h3>{s.value}</h3>
                <p>{s.label}</p>
              </div>
              <div className="icon">{s.icon}</div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="paper-card mb-4 animate-fade-in">
          <div className="card-header">
            <h3 className="card-title">Input Catatan Produksi</h3>
          </div>
          <div className="card-body">
            <form onSubmit={submit}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="form-group mb-0">
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
                  <div key={f.key} className="form-group mb-0">
                    <label>{f.label}</label>
                    <input type="number" value={(form as any)[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} placeholder={f.placeholder} required />
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200">
                <button type="submit" className="btn-primary">💾 Simpan Produksi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="paper-card ">
          <div className="card-body p-0 overflow-x-auto">
            <table className="m-0">
              <thead><tr><th>Mesin</th><th>Input (kg)</th><th>Output (kg)</th><th>Bale</th><th>Runtime</th><th>Downtime</th><th>OEE</th><th>Tanggal</th></tr></thead>
              <tbody>
                {records.map((r:any) => (
                  <tr key={r.id}>
                    <td className="text-sm font-semibold">{r.machine?.name}</td>
                    <td className="text-gray-700">{r.inputWeight?.toLocaleString("id-ID")}</td>
                    <td className="font-semibold text-success">{r.outputWeight?.toLocaleString("id-ID")}</td>
                    <td className="font-bold text-gray-800">{r.baleCount}</td>
                    <td className="text-gray-500">{r.runtimeMinutes} min</td>
                    <td className={r.downtimeMinutes > 30 ? "text-danger font-semibold" : "text-gray-500"}>{r.downtimeMinutes} min</td>
                    <td>{oeeGauge(r.oee)}</td>
                    <td className="text-xs text-gray-500">{new Date(r.date).toLocaleDateString("id-ID")}</td>
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
