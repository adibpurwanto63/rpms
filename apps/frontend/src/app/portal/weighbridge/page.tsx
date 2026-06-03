"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function WeighbridgePage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ supplierId:"", truckNumber:"", driverName:"", materialType:"OCC", grossWeight:"", tareWeight:"" });

  const load = () => {
    Promise.all([
      api.get("/weighbridge"),
      api.get("/weighbridge/stats/today"),
      api.get("/suppliers?status=ACTIVE"),
    ]).then(([t, s, sup]) => { setTickets(t.data); setStats(s.data); setSuppliers(sup.data); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/weighbridge", { ...form, grossWeight: parseFloat(form.grossWeight), tareWeight: parseFloat(form.tareWeight) });
    setShowForm(false);
    load();
  };

  const net = form.grossWeight && form.tareWeight ? parseFloat(form.grossWeight) - parseFloat(form.tareWeight) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Manajemen Timbangan</h2>
          <p className="text-slate-400 text-sm">Tiket timbang digital & histori transaksi</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Tutup" : "⚖️ Buat Tiket Baru"}
        </button>
      </div>

      {/* Today stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Tiket Hari Ini", value: stats._count || 0, icon: "🎫" },
            { label: "Total Netto (kg)", value: (stats._sum?.netWeight || 0).toLocaleString("id-ID"), icon: "⚖️" },
            { label: "Rata-rata Netto", value: stats._count ? ((stats._sum?.netWeight || 0) / stats._count).toFixed(0) + " kg" : "—", icon: "📊" },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-emerald-400">{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="glass rounded-2xl p-6 mb-6 animate-fade-in">
          <h3 className="font-bold mb-4">Tiket Timbangan Baru</h3>
          <form onSubmit={submit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="form-group">
                <label>Supplier</label>
                <select value={form.supplierId} onChange={e => setForm({...form, supplierId: e.target.value})} required>
                  <option value="">Pilih Supplier</option>
                  {suppliers.map((s:any) => <option key={s.id} value={s.id}>{s.companyName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>No. Polisi Truk</label>
                <input value={form.truckNumber} onChange={e => setForm({...form, truckNumber: e.target.value})} placeholder="B 1234 XYZ" required />
              </div>
              <div className="form-group">
                <label>Nama Pengemudi</label>
                <input value={form.driverName} onChange={e => setForm({...form, driverName: e.target.value})} placeholder="Nama supir" required />
              </div>
              <div className="form-group">
                <label>Jenis Material</label>
                <select value={form.materialType} onChange={e => setForm({...form, materialType: e.target.value})}>
                  {["OCC","ONP","Mixed Paper","White Ledger"].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Berat Bruto (kg)</label>
                <input type="number" value={form.grossWeight} onChange={e => setForm({...form, grossWeight: e.target.value})} placeholder="15000" required />
              </div>
              <div className="form-group">
                <label>Berat Tare (kg)</label>
                <input type="number" value={form.tareWeight} onChange={e => setForm({...form, tareWeight: e.target.value})} placeholder="4500" required />
              </div>
            </div>
            {net > 0 && (
              <div className="glass rounded-xl p-4 mb-4 flex items-center gap-4">
                <div className="text-2xl">⚖️</div>
                <div>
                  <div className="text-sm text-slate-400">Berat Netto Kalkulasi</div>
                  <div className="text-2xl font-bold text-emerald-400">{net.toLocaleString("id-ID")} kg</div>
                </div>
              </div>
            )}
            <button type="submit" className="btn-primary">🎫 Buat Tiket</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table>
            <thead><tr><th>No. Tiket</th><th>Supplier</th><th>Truk</th><th>Material</th><th>Bruto</th><th>Tare</th><th>Netto</th><th>Tanggal</th></tr></thead>
            <tbody>
              {tickets.map((t:any) => (
                <tr key={t.id}>
                  <td className="font-mono text-xs text-emerald-400">{t.ticketNumber}</td>
                  <td className="text-sm">{t.supplier?.companyName}</td>
                  <td className="text-slate-400 text-xs">{t.truckNumber}</td>
                  <td><span className="badge badge-info">{t.materialType}</span></td>
                  <td>{t.grossWeight?.toLocaleString("id-ID")}</td>
                  <td className="text-slate-500">{t.tareWeight?.toLocaleString("id-ID")}</td>
                  <td className="font-bold text-emerald-400">{t.netWeight?.toLocaleString("id-ID")}</td>
                  <td className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString("id-ID")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
