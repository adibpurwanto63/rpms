"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const deliveryStatusBadge: any = {
  SCHEDULED: "badge-info", LOADING: "badge-warning", IN_TRANSIT: "badge-purple",
  DELIVERED: "badge-success", CANCELLED: "badge-danger"
};
const deliveryStatusLabel: any = {
  SCHEDULED: "Terjadwal", LOADING: "Muat", IN_TRANSIT: "Dalam Perjalanan",
  DELIVERED: "Terkirim", CANCELLED: "Dibatalkan"
};
const vehicleStatusBadge: any = { AVAILABLE: "badge-success", ON_TRIP: "badge-warning", MAINTENANCE: "badge-danger" };
const vehicleStatusLabel: any = { AVAILABLE: "Tersedia", ON_TRIP: "Dalam Perjalanan", MAINTENANCE: "Maintenance" };
const vehicleStatusIcon: any = { AVAILABLE: "🟢", ON_TRIP: "🚛", MAINTENANCE: "🔧" };

export default function LogisticsPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ vehicleId: "", destination: "", loadingWeight: "" });

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/logistics/vehicles"), api.get("/logistics/deliveries")])
      .then(([v, d]) => { setVehicles(v.data); setDeliveries(d.data); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/logistics/deliveries", { ...form, loadingWeight: parseFloat(form.loadingWeight) });
      setShowForm(false);
      setForm({ vehicleId: "", destination: "", loadingWeight: "" });
      load();
    } finally { setSubmitting(false); }
  };

  const updateDeliveryStatus = async (id: string, status: string) => {
    await api.put(`/logistics/deliveries/${id}/status`, { status });
    load();
  };

  const availableVehicles = vehicles.filter(v => v.status === "AVAILABLE");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Manajemen Logistik</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Armada kendaraan & delivery order</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Tutup" : "🚛 Buat DO Baru"}
        </button>
      </div>

      {/* Fleet Status */}
      {vehicles.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Status Armada</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {vehicles.map((v: any) => (
              <div key={v.id} className="erp-card" style={{ padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 18 }}>{vehicleStatusIcon[v.status]}</span>
                  <span className={`badge ${vehicleStatusBadge[v.status]}`}>{vehicleStatusLabel[v.status]}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", fontFamily: "monospace", marginBottom: 4 }}>{v.plate}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{v.type}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>👤 {v.driverName}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create DO Form */}
      {showForm && (
        <div className="erp-card animate-fade-in">
          <div className="erp-card-header">
            <h3 className="erp-card-title">Delivery Order Baru</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>✕</button>
          </div>
          <div className="erp-card-body">
            <form onSubmit={submit}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="form-label">Kendaraan</label>
                  <select className="form-select" value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })} required>
                    <option value="">Pilih Kendaraan</option>
                    {availableVehicles.length === 0
                      ? <option disabled>Tidak ada kendaraan tersedia</option>
                      : availableVehicles.map((v: any) => <option key={v.id} value={v.id}>{v.plate} — {v.driverName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Tujuan</label>
                  <input className="form-input" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} placeholder="PT Kertas Indonesia - Jakarta" required />
                </div>
                <div>
                  <label className="form-label">Berat Muat (kg)</label>
                  <input className="form-input" type="number" value={form.loadingWeight} onChange={e => setForm({ ...form, loadingWeight: e.target.value })} placeholder="10000" required />
                </div>
              </div>
              <div style={{ paddingTop: 16, borderTop: "1px solid var(--border-light)", display: "flex", gap: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={submitting || availableVehicles.length === 0}>
                  {submitting ? "⏳ Membuat..." : "📝 Buat Delivery Order"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deliveries Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #EDE9FF", borderTop: "3px solid #7C6FE0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : (
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Delivery Orders</span>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{deliveries.length} DO</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>No. DO</th><th>Kendaraan</th><th>Pengemudi</th>
                  <th>Tujuan</th><th>Berat (kg)</th><th>Status</th><th>Update Status</th><th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Belum ada delivery order</td></tr>
                ) : deliveries.map((d: any) => (
                  <tr key={d.id}>
                    <td style={{ fontFamily: "monospace", fontSize: 13, color: "var(--color-purple)", fontWeight: 600 }}>{d.orderNumber}</td>
                    <td style={{ fontWeight: 700, fontFamily: "monospace" }}>{d.vehicle?.plate}</td>
                    <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>{d.vehicle?.driverName}</td>
                    <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.destination}</td>
                    <td style={{ fontWeight: 600 }}>{d.loadingWeight?.toLocaleString("id-ID")}</td>
                    <td><span className={`badge ${deliveryStatusBadge[d.status]}`}>{deliveryStatusLabel[d.status] || d.status}</span></td>
                    <td>
                      {d.status !== "DELIVERED" && d.status !== "CANCELLED" && (
                        <select
                          className="form-select"
                          value={d.status}
                          onChange={e => updateDeliveryStatus(d.id, e.target.value)}
                          style={{ fontSize: 12, padding: "4px 24px 4px 8px", minWidth: 120 }}
                        >
                          {["SCHEDULED", "LOADING", "IN_TRANSIT", "DELIVERED", "CANCELLED"].map(s => (
                            <option key={s} value={s}>{deliveryStatusLabel[s]}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>{new Date(d.createdAt).toLocaleDateString("id-ID")}</td>
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
