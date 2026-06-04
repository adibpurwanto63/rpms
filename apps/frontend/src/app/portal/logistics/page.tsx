"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRefresh } from "@/lib/refresh-context";

const deliveryStatusColor: any = { SCHEDULED: "badge-neutral", LOADING: "badge-warning", IN_TRANSIT: "badge-warning", DELIVERED: "badge-success", CANCELLED: "badge-danger" };
const vehicleStatusColor: any = { AVAILABLE: "badge-success", ON_TRIP: "badge-warning", MAINTENANCE: "badge-danger" };
const vehicleStatusLabel: any = { AVAILABLE: "Tersedia", ON_TRIP: "Dalam Perjalanan", MAINTENANCE: "Maintenance" };
const vehicleTypeLabel: any = { TRONTON: "Tronton", ENGKEL: "Engkel", VENDOR: "Vendor Eksternal" };

export default function LogisticsPage() {
  const [activeTab, setActiveTab] = useState<"DO" | "ARMADA">("DO");
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showDoForm, setShowDoForm] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [doForm, setDoForm] = useState({ vehicleId: "", destination: "", loadingWeight: "" });
  const [vehicleForm, setVehicleForm] = useState({ id: "", plate: "", type: "ENGKEL", driverName: "", status: "AVAILABLE" });
  
  const { triggerRefresh } = useRefresh();

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/logistics/vehicles"), api.get("/logistics/deliveries"), api.get("/customers")])
      .then(([v, d, c]) => { setVehicles(v.data); setDeliveries(d.data); setCustomers(c.data); }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const submitDo = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/logistics/deliveries", { ...doForm, loadingWeight: parseFloat(doForm.loadingWeight) });
    setShowDoForm(false);
    setDoForm({ vehicleId: "", destination: "", loadingWeight: "" });
    load();
    triggerRefresh();
  };

  const submitVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (vehicleForm.id) {
      await api.put(`/logistics/vehicles/${vehicleForm.id}`, {
        plate: vehicleForm.plate, type: vehicleForm.type, driverName: vehicleForm.driverName, status: vehicleForm.status
      });
    } else {
      await api.post("/logistics/vehicles", {
        plate: vehicleForm.plate, type: vehicleForm.type, driverName: vehicleForm.driverName, status: vehicleForm.status
      });
    }
    setShowVehicleForm(false);
    setVehicleForm({ id: "", plate: "", type: "ENGKEL", driverName: "", status: "AVAILABLE" });
    load();
  };

  const updateDoStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/logistics/deliveries/${id}/status`, { status: newStatus });
      load();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Manajemen Logistik</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Monitoring armada kendaraan dan Delivery Order (DO)</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {activeTab === "DO" ? (
            <button className="btn btn-primary" onClick={() => setShowDoForm(true)}>+ Buat DO Baru</button>
          ) : (
            <button className="btn btn-primary" onClick={() => { setVehicleForm({ id: "", plate: "", type: "ENGKEL", driverName: "", status: "AVAILABLE" }); setShowVehicleForm(true); }}>+ Tambah Armada</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 32, borderBottom: "1px solid var(--border-light)" }}>
        <div onClick={() => setActiveTab("DO")} style={{ paddingBottom: 12, cursor: "pointer", fontWeight: 600, color: activeTab === "DO" ? "var(--brand-purple)" : "var(--text-secondary)", borderBottom: activeTab === "DO" ? "2px solid var(--brand-purple)" : "2px solid transparent", transition: "all 0.2s" }}>
          Delivery Orders
        </div>
        <div onClick={() => setActiveTab("ARMADA")} style={{ paddingBottom: 12, cursor: "pointer", fontWeight: 600, color: activeTab === "ARMADA" ? "var(--brand-purple)" : "var(--text-secondary)", borderBottom: activeTab === "ARMADA" ? "2px solid var(--brand-purple)" : "2px solid transparent", transition: "all 0.2s" }}>
          Armada Kendaraan
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #EDE9FF", borderTop: "3px solid #7C6FE0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : activeTab === "DO" ? (
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
                  <th>Tanggal</th>
                  <th>Status / Aksi</th>
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
                    <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{new Date(d.createdAt).toLocaleDateString("id-ID")}</td>
                    <td>
                      <select 
                        value={d.status} 
                        onChange={(e) => updateDoStatus(d.id, e.target.value)}
                        style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border-light)", fontSize: 13, fontWeight: 600, color: "var(--text-primary)", background: "var(--bg-secondary)", cursor: "pointer", outline: "none" }}
                      >
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="LOADING">Loading</option>
                        <option value="IN_TRANSIT">In Transit</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Daftar Armada Kendaraan</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Plat Nomor</th>
                  <th>Tipe</th>
                  <th>Nama Supir</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Belum ada armada terdaftar</td></tr>
                ) : vehicles.map((v: any) => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 15, letterSpacing: "1px" }}>{v.plate}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{vehicleTypeLabel[v.type] || v.type}</td>
                    <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>{v.driverName}</td>
                    <td><span className={`badge ${vehicleStatusColor[v.status]}`}>{vehicleStatusLabel[v.status]}</span></td>
                    <td>
                      <button onClick={() => { setVehicleForm(v); setShowVehicleForm(true); }} style={{ padding: "6px 12px", borderRadius: 6, background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border-light)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        Edit ✎
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal DO */}
      {showDoForm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div className="erp-card animate-fade-in" style={{ width: "100%", maxWidth: 700, margin: 20, maxHeight: "90vh", overflowY: "auto", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div className="erp-card-header" style={{ position: "sticky", top: 0, background: "#fff", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="erp-card-title" style={{ fontSize: 20 }}>Delivery Order Baru</h3>
              <button type="button" onClick={() => setShowDoForm(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
            </div>
            <div className="erp-card-body" style={{ padding: 24 }}>
              <form onSubmit={submitDo}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label className="form-label">Kendaraan</label>
                    <select className="form-input" value={doForm.vehicleId} onChange={e => setDoForm({ ...doForm, vehicleId: e.target.value })} required>
                      <option value="">-- Pilih Kendaraan Tersedia --</option>
                      {vehicles.filter(v => v.status === "AVAILABLE").map((v: any) => <option key={v.id} value={v.id}>{v.plate} - {v.driverName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Tujuan (Customer)</label>
                    <select className="form-input" value={doForm.destination} onChange={e => setDoForm({ ...doForm, destination: e.target.value })} required>
                      <option value="">-- Pilih Customer --</option>
                      {customers.map((c: any) => (
                        <option key={c.id} value={`${c.companyName} - ${c.address}`}>{c.companyName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Berat Muat (kg)</label>
                    <input className="form-input" type="number" value={doForm.loadingWeight} onChange={e => setDoForm({ ...doForm, loadingWeight: e.target.value })} placeholder="10000" required />
                  </div>
                </div>
                <div style={{ paddingTop: 20, borderTop: "1px solid var(--border-light)", display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowDoForm(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: "0 24px" }}>📝 Simpan Delivery Order</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal Vehicle */}
      {showVehicleForm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div className="erp-card animate-fade-in" style={{ width: "100%", maxWidth: 500, margin: 20, maxHeight: "90vh", overflowY: "auto", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div className="erp-card-header" style={{ position: "sticky", top: 0, background: "#fff", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="erp-card-title" style={{ fontSize: 20 }}>{vehicleForm.id ? "Edit Armada" : "Tambah Armada Baru"}</h3>
              <button type="button" onClick={() => setShowVehicleForm(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
            </div>
            <div className="erp-card-body" style={{ padding: 24 }}>
              <form onSubmit={submitVehicle}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                  <div>
                    <label className="form-label">Plat Nomor</label>
                    <input className="form-input" value={vehicleForm.plate} onChange={e => setVehicleForm({ ...vehicleForm, plate: e.target.value })} placeholder="B 1234 CD" required />
                  </div>
                  <div>
                    <label className="form-label">Tipe Kendaraan</label>
                    <select className="form-input" value={vehicleForm.type} onChange={e => setVehicleForm({ ...vehicleForm, type: e.target.value })} required>
                      <option value="ENGKEL">Engkel</option>
                      <option value="TRONTON">Tronton</option>
                      <option value="VENDOR">Vendor Eksternal</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Nama Supir</label>
                    <input className="form-input" value={vehicleForm.driverName} onChange={e => setVehicleForm({ ...vehicleForm, driverName: e.target.value })} placeholder="Nama Supir" required />
                  </div>
                  {vehicleForm.id && (
                    <div>
                      <label className="form-label">Status</label>
                      <select className="form-input" value={vehicleForm.status} onChange={e => setVehicleForm({ ...vehicleForm, status: e.target.value })} required>
                        <option value="AVAILABLE">Tersedia</option>
                        <option value="ON_TRIP">Dalam Perjalanan (Jangan diubah manual jika sedang DO)</option>
                        <option value="MAINTENANCE">Maintenance</option>
                      </select>
                    </div>
                  )}
                </div>
                <div style={{ paddingTop: 20, borderTop: "1px solid var(--border-light)", display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowVehicleForm(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: "0 24px" }}>💾 Simpan Armada</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
