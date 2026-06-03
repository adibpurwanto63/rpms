"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRefresh } from "@/lib/refresh-context";

const deliveryStatusColor: any = { SCHEDULED: "badge-neutral", LOADING: "badge-warning", IN_TRANSIT: "badge-warning", DELIVERED: "badge-success", CANCELLED: "badge-danger" };
const vehicleStatusColor: any = { AVAILABLE: "badge-success", ON_TRIP: "badge-warning", MAINTENANCE: "badge-danger" };
const vehicleStatusLabel: any = { AVAILABLE: "Tersedia", ON_TRIP: "Dalam Perjalanan", MAINTENANCE: "Maintenance" };

export default function LogisticsPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ vehicleId: "", destination: "", loadingWeight: "" });
  const { triggerRefresh } = useRefresh();

  const load = () => {
    Promise.all([api.get("/logistics/vehicles"), api.get("/logistics/deliveries")])
      .then(([v, d]) => { setVehicles(v.data); setDeliveries(d.data); }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/logistics/deliveries", { ...form, loadingWeight: parseFloat(form.loadingWeight) });
    setShowForm(false);
    load();
    triggerRefresh();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Manajemen Logistik</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Monitoring armada kendaraan dan Delivery Order (DO)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Tutup" : "+ Buat DO Baru"}
        </button>
      </div>

      {/* Fleet status */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {vehicles.map((v: any) => (
          <div key={v.id} className="erp-card" style={{ padding: "16px", background: "var(--bg-card)", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "1.5rem" }}>🚛</span>
              <span className={`badge ${vehicleStatusColor[v.status]}`}>{vehicleStatusLabel[v.status]}</span>
            </div>
            <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "1.1rem", marginTop: 4 }}>{v.plate}</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{v.type} • {v.driverName}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(4px)"
        }}>
          <div className="erp-card animate-fade-in" style={{ width: "100%", maxWidth: 700, margin: 20, maxHeight: "90vh", overflowY: "auto", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div className="erp-card-header" style={{ position: "sticky", top: 0, background: "#fff", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="erp-card-title" style={{ fontSize: 20 }}>Delivery Order Baru</h3>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
            </div>
            <div className="erp-card-body" style={{ padding: 24 }}>
              <form onSubmit={submit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label className="form-label">Kendaraan</label>
                    <select className="form-input" value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })} required>
                      <option value="">-- Pilih Kendaraan Tersedia --</option>
                      {vehicles.filter(v => v.status === "AVAILABLE").map((v: any) => <option key={v.id} value={v.id}>{v.plate} - {v.driverName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Tujuan</label>
                    <input className="form-input" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} placeholder="Cth: PT Kertas Nusantara - Jakarta" required />
                  </div>
                  <div>
                    <label className="form-label">Berat Muat (kg)</label>
                    <input className="form-input" type="number" value={form.loadingWeight} onChange={e => setForm({ ...form, loadingWeight: e.target.value })} placeholder="10000" required />
                  </div>
                </div>
                <div style={{ paddingTop: 20, borderTop: "1px solid var(--border-light)", display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: "0 24px" }}>📝 Simpan Delivery Order</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #EDE9FF", borderTop: "3px solid #7C6FE0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : (
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Riwayat Delivery Order</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>No. DO</th>
                  <th>Kendaraan & Supir</th>
                  <th>Tujuan</th>
                  <th>Berat Muat</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Belum ada DO terdaftar</td></tr>
                ) : deliveries.map((d: any) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600, color: "var(--brand-purple)" }}>{d.orderNumber}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{d.vehicle?.plate}</div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{d.vehicle?.driverName}</div>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>{d.destination}</td>
                    <td style={{ fontWeight: 600, color: "var(--brand-teal)" }}>{d.loadingWeight?.toLocaleString("id-ID")} kg</td>
                    <td><span className={`badge ${deliveryStatusColor[d.status]}`}>{d.status}</span></td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{new Date(d.createdAt).toLocaleDateString("id-ID")}</td>
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
