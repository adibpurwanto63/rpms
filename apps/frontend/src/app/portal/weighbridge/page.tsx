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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Manajemen Timbangan</h2>
          <p className="text-gray-500 text-sm">Tiket timbang digital & histori transaksi</p>
        </div>
        <button className="btn-primary shadow-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Tutup" : "⚖️ Buat Tiket Baru"}
        </button>
      </div>

      {/* Today stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {[
            { label: "Tiket Hari Ini", value: stats._count || 0, icon: "🎫", color: "bg-info" },
            { label: "Total Netto (kg)", value: (stats._sum?.netWeight || 0).toLocaleString("id-ID"), icon: "⚖️", color: "bg-success" },
            { label: "Rata-rata Netto", value: stats._count ? ((stats._sum?.netWeight || 0) / stats._count).toFixed(0) + " kg" : "—", icon: "📊", color: "bg-warning" },
          ].map((s, i) => (
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
        <div className="admin-card primary mb-4 animate-fade-in">
          <div className="card-header">
            <h3 className="card-title">Tiket Timbangan Baru</h3>
          </div>
          <div className="card-body">
            <form onSubmit={submit}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="form-group mb-0">
                  <label>Supplier</label>
                  <select value={form.supplierId} onChange={e => setForm({...form, supplierId: e.target.value})} required>
                    <option value="">Pilih Supplier</option>
                    {suppliers.map((s:any) => <option key={s.id} value={s.id}>{s.companyName}</option>)}
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label>No. Polisi Truk</label>
                  <input value={form.truckNumber} onChange={e => setForm({...form, truckNumber: e.target.value})} placeholder="B 1234 XYZ" required />
                </div>
                <div className="form-group mb-0">
                  <label>Nama Pengemudi</label>
                  <input value={form.driverName} onChange={e => setForm({...form, driverName: e.target.value})} placeholder="Nama supir" required />
                </div>
                <div className="form-group mb-0">
                  <label>Jenis Material</label>
                  <select value={form.materialType} onChange={e => setForm({...form, materialType: e.target.value})}>
                    {["OCC","ONP","Mixed Paper","White Ledger"].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label>Berat Bruto (kg)</label>
                  <input type="number" value={form.grossWeight} onChange={e => setForm({...form, grossWeight: e.target.value})} placeholder="15000" required />
                </div>
                <div className="form-group mb-0">
                  <label>Berat Tare (kg)</label>
                  <input type="number" value={form.tareWeight} onChange={e => setForm({...form, tareWeight: e.target.value})} placeholder="4500" required />
                </div>
              </div>
              {net > 0 && (
                <div className="bg-gray-100 rounded p-4 my-4 flex items-center gap-4 border border-gray-200">
                  <div className="text-2xl">⚖️</div>
                  <div>
                    <div className="text-sm text-gray-500">Berat Netto Kalkulasi</div>
                    <div className="text-2xl font-bold text-success">{net.toLocaleString("id-ID")} kg</div>
                  </div>
                </div>
              )}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <button type="submit" className="btn-primary">🎫 Buat Tiket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="admin-card">
          <div className="card-body p-0 overflow-x-auto">
            <table className="m-0">
              <thead><tr><th>No. Tiket</th><th>Supplier</th><th>Truk</th><th>Material</th><th>Bruto</th><th>Tare</th><th>Netto</th><th>Tanggal</th></tr></thead>
              <tbody>
                {tickets.map((t:any) => (
                  <tr key={t.id}>
                    <td className="font-mono text-sm text-blue-600">{t.ticketNumber}</td>
                    <td className="text-sm">{t.supplier?.companyName}</td>
                    <td className="text-gray-500 text-sm">{t.truckNumber}</td>
                    <td><span className="badge badge-info">{t.materialType}</span></td>
                    <td className="text-gray-700">{t.grossWeight?.toLocaleString("id-ID")}</td>
                    <td className="text-gray-500">{t.tareWeight?.toLocaleString("id-ID")}</td>
                    <td className="font-bold text-success">{t.netWeight?.toLocaleString("id-ID")}</td>
                    <td className="text-sm text-gray-500">{new Date(t.date).toLocaleDateString("id-ID")}</td>
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
