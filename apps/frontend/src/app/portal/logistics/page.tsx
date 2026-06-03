"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const deliveryStatusColor: any = { SCHEDULED: "badge-info", LOADING: "badge-warning", IN_TRANSIT: "badge-warning", DELIVERED: "badge-success", CANCELLED: "badge-danger" };
const vehicleStatusColor: any = { AVAILABLE: "badge-success", ON_TRIP: "badge-warning", MAINTENANCE: "badge-danger" };
const vehicleStatusLabel: any = { AVAILABLE: "Tersedia", ON_TRIP: "Dalam Perjalanan", MAINTENANCE: "Maintenance" };

export default function LogisticsPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ vehicleId:"", destination:"", loadingWeight:"" });

  const load = () => {
    Promise.all([api.get("/logistics/vehicles"), api.get("/logistics/deliveries")])
      .then(([v, d]) => { setVehicles(v.data); setDeliveries(d.data); }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/logistics/deliveries", { ...form, loadingWeight: parseFloat(form.loadingWeight) });
    setShowForm(false); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Manajemen Logistik</h2>
          <p className="text-slate-400 text-sm">Armada kendaraan & delivery order</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Tutup" : "🚛 Buat DO Baru"}
        </button>
      </div>

      {/* Fleet status */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {vehicles.map((v:any) => (
          <div key={v.id} className="stat-card glass-hover">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">🚛</span>
              <span className={`badge ${vehicleStatusColor[v.status]}`}>{vehicleStatusLabel[v.status]}</span>
            </div>
            <div className="font-bold text-sm">{v.plate}</div>
            <div className="text-xs text-slate-500">{v.type} · {v.driverName}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-6 mb-6 animate-fade-in">
          <h3 className="font-bold mb-4">Delivery Order Baru</h3>
          <form onSubmit={submit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label>Kendaraan</label>
                <select value={form.vehicleId} onChange={e => setForm({...form, vehicleId: e.target.value})} required>
                  <option value="">Pilih Kendaraan</option>
                  {vehicles.filter(v => v.status === "AVAILABLE").map((v:any) => <option key={v.id} value={v.id}>{v.plate} - {v.driverName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Tujuan</label>
                <input value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} placeholder="PT Kertas Indonesia - Jakarta" required />
              </div>
              <div className="form-group">
                <label>Berat Muat (kg)</label>
                <input type="number" value={form.loadingWeight} onChange={e => setForm({...form, loadingWeight: e.target.value})} placeholder="10000" required />
              </div>
            </div>
            <button type="submit" className="btn-primary">📝 Buat Delivery Order</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table>
            <thead><tr><th>No. DO</th><th>Kendaraan</th><th>Tujuan</th><th>Berat (kg)</th><th>Status</th><th>Tanggal</th></tr></thead>
          <tbody>
            {deliveries.map((d:any) => (
              <tr key={d.id}>
                <td className="font-mono text-xs text-cyan-400">{d.orderNumber}</td>
                <td>
                  <div className="font-semibold text-sm">{d.vehicle?.plate}</div>
                  <div className="text-xs text-slate-500">{d.vehicle?.driverName}</div>
                </td>
                <td className="text-sm">{d.destination}</td>
                <td className="font-semibold">{d.loadingWeight?.toLocaleString("id-ID")}</td>
                <td><span className={`badge ${deliveryStatusColor[d.status]}`}>{d.status}</span></td>
                <td className="text-xs text-slate-500">{new Date(d.createdAt).toLocaleDateString("id-ID")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
