"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRefresh } from "@/lib/refresh-context";
import {
  Truck, Save, Package, X, CheckSquare, Square, Trash2,
  CheckCircle, PackageCheck, Clock, FileText, User
} from "lucide-react";

const statusColor: any = {
  SCHEDULED: "badge-warning",
  LOADING: "badge-info",
  IN_TRANSIT: "badge-purple",
  DELIVERED: "badge-success",
  CANCELLED: "badge-danger",
};
const statusLabel: any = {
  SCHEDULED: "Terjadwal",
  LOADING: "Loading",
  IN_TRANSIT: "Dalam Perjalanan",
  DELIVERED: "Selesai",
  CANCELLED: "Dibatalkan",
};
const statusNext: any = {
  SCHEDULED: "LOADING",
  LOADING: "IN_TRANSIT",
  IN_TRANSIT: "DELIVERED",
};
const statusNextLabel: any = {
  SCHEDULED: "Mulai Loading",
  LOADING: "Berangkat",
  IN_TRANSIT: "Selesai",
};
const statusIcon: any = {
  SCHEDULED: Clock,
  LOADING: Package,
  IN_TRANSIT: Truck,
  DELIVERED: CheckCircle,
};

const gradeColor: any = { A: "badge-success", B: "badge-warning", REJECT: "badge-danger" };

export default function LogisticsPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availableBales, setAvailableBales] = useState<any[]>([]);
  const [selectedBaleIds, setSelectedBaleIds] = useState<string[]>([]);

  const [form, setForm] = useState({ vehicleId: "", customerId: "", destination: "", loadingWeight: "" });
  const [vehicleForm, setVehicleForm] = useState({ plate: "", driverName: "", type: "TRONTON", status: "AVAILABLE" });
  const [dashboard, setDashboard] = useState<any>(null);

  const { triggerRefresh } = useRefresh();

  const load = async () => {
    setLoading(true);
    const [d, v, c, bales, stats] = await Promise.allSettled([
      api.get("/logistics/deliveries"),
      api.get("/logistics/vehicles"),
      api.get("/customers"),
      api.get("/warehouse/fifo?grade=A"),
      api.get("/logistics/stats"),
    ]);
    
    if (d.status === "fulfilled") setDeliveries(d.value.data);
    if (v.status === "fulfilled") setVehicles(v.value.data);
    if (c.status === "fulfilled") setCustomers(c.value.data);
    if (bales.status === "fulfilled") setAvailableBales(bales.value.data);
    if (stats.status === "fulfilled") setDashboard(stats.value.data);
    
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readyPickupBales === 0) return alert("Gudang belum memiliki stok ready pickup.");
    if (selectedBaleIds.length === 0) return alert("Pilih minimal 1 bale dari Gudang.");
    if (!form.vehicleId) return alert("Pilih kendaraan tersedia terlebih dahulu.");
    const customer = customers.find(c => c.id === form.customerId);
    const destination = customer ? `${customer.companyName} - ${customer.address}` : form.destination;
    try {
      const res = await api.post("/logistics/deliveries", { ...form, destination, loadingWeight: parseFloat(form.loadingWeight) || 0 });
      await api.post("/warehouse/load-do", { deliveryOrderId: res.data.id, ids: selectedBaleIds });
      setShowForm(false);
      setForm({ vehicleId: "", customerId: "", destination: "", loadingWeight: "" });
      setSelectedBaleIds([]);
      load();
      triggerRefresh();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Gagal membuat surat jalan.");
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/logistics/deliveries/${id}/status`, { status: newStatus });
      load();
      triggerRefresh();
    } catch (e) { console.error(e); }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Batalkan / hapus surat jalan ini?")) return;
    try {
      await api.put(`/logistics/deliveries/${id}/status`, { status: "CANCELLED" });
      load();
    } catch (e) { console.error(e); }
  };

  const saveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/logistics/vehicles", vehicleForm);
      setVehicleForm({ plate: "", driverName: "", type: "TRONTON", status: "AVAILABLE" });
      setShowVehicleForm(false);
      load();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Gagal menyimpan kendaraan.");
    }
  };

  const updateVehicleStatus = async (vehicle: any, status: string) => {
    if (vehicle.deliveries?.length > 0) return alert("Kendaraan masih aktif di Surat Jalan dan status tidak bisa diubah.");
    try {
      await api.put(`/logistics/vehicles/${vehicle.id}`, { status });
      load();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Gagal mengubah status kendaraan.");
    }
  };

  const toggleBale = (id: string) => {
    setSelectedBaleIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAllBales = () => {
    if (selectedBaleIds.length === availableBales.length) setSelectedBaleIds([]);
    else setSelectedBaleIds(availableBales.map((b: any) => b.id));
  };

  const readyPickupBales = availableBales.length;
  const readyPickupWeight = availableBales.reduce((a: number, b: any) => a + (b.weight || 0), 0);
  const availableVehicles = vehicles.filter((v: any) => v.status === "AVAILABLE" && (!v.deliveries || v.deliveries.length === 0));
  const totalSelectedWeight = availableBales.filter((b: any) => selectedBaleIds.includes(b.id)).reduce((a: number, b: any) => a + b.weight, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div className="page-header-responsive" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Manajemen Pengiriman</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Surat Jalan — Terintegrasi dengan Produksi & Gudang</p>
        </div>
        <div className="page-header-actions" style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setShowVehicleForm(true)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Truck size={16} /> Tambah Kendaraan
          </button>
          <button
            className="btn btn-primary"
            disabled={readyPickupBales === 0}
            title={readyPickupBales === 0 ? "Gudang belum memiliki stok ready pickup" : undefined}
            onClick={() => { setSelectedBaleIds([]); setForm({ vehicleId: "", customerId: "", destination: "", loadingWeight: "" }); setShowForm(true); }}
          >
            + Buat Surat Jalan Baru
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      {dashboard && (
        <div className="rg-auto">
          {[
            { label: "Total DO", value: dashboard._count || 0, sub: "surat jalan", color: "var(--kpi-dark)", dark: true },
            { label: "Ready Pickup", value: readyPickupBales, sub: `${(readyPickupWeight / 1000).toFixed(1)} Ton dari Gudang`, color: "#EDE9FF", dark: false },
            { label: "Kendaraan Tersedia", value: availableVehicles.length, sub: `${vehicles.length} total kendaraan`, color: "var(--kpi-mint-bg)", dark: false },
          ].map((kpi, i) => (
            <div key={i} className="kpi-card" style={{ background: kpi.color, borderColor: undefined }}>
              <div style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: 8 }}>{kpi.label}</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)", lineHeight: 1.1 }}>{kpi.value}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 4 }}>{kpi.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Main Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #EDE9FF", borderTop: "3px solid #7C6FE0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : (
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Riwayat Surat Jalan</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
              <FileText size={14} />
              {deliveries.length} surat jalan
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>No. SJ</th>
                  <th>Pelanggan</th>
                  <th>Kendaraan</th>
                  <th>Muatan (Bale)</th>
                  <th>Berat Dimuat</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Belum ada surat jalan</td></tr>
                ) : deliveries.map((d: any) => {
                  const next = statusNext[d.status];
                  const NextIcon = statusIcon[next] || CheckCircle;
                  return (
                    <tr key={d.id}>
                      <td style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--brand-purple)", fontSize: 13 }}>{d.orderNumber}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <User size={14} color="var(--text-muted)" />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{d.customer?.companyName || "Non-Pelanggan"}</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.destination || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{d.vehicle?.plate || "—"}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.vehicle?.driverName || ""}</div>
                      </td>
                      <td><span className="badge badge-info" style={{ fontWeight: 700 }}>{d.items?.length || 0} Bale</span></td>
                      <td style={{ fontWeight: 700, color: "var(--brand-teal)" }}>{d.loadingWeight?.toLocaleString("id-ID")} kg</td>
                      <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>{new Date(d.createdAt).toLocaleDateString("id-ID")}</td>
                      <td><span className={`badge ${statusColor[d.status] || "badge-neutral"}`}>{statusLabel[d.status] || d.status}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          {next && (
                            <button
                              onClick={() => updateStatus(d.id, next)}
                              title={statusNextLabel[next] || next}
                              style={{
                                display: "flex", alignItems: "center", gap: 4,
                                fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 6,
                                border: "1px solid var(--color-primary)", color: "var(--color-primary)",
                                background: "transparent", cursor: "pointer", transition: "background 0.15s",
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = "rgba(124,111,224,0.08)")}
                              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            >
                              <NextIcon size={13} />
                              {statusNextLabel[next] || next}
                            </button>
                          )}
                          {(d.status === "SCHEDULED" || d.status === "LOADING") && (
                            <button
                              onClick={() => deleteOrder(d.id)}
                              title="Batalkan"
                              style={{
                                display: "flex", alignItems: "center", gap: 4,
                                fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 6,
                                border: "1px solid #FF6B6B", color: "#FF6B6B",
                                background: "transparent", cursor: "pointer", transition: "background 0.15s",
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,107,107,0.08)")}
                              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            >
                              <Trash2 size={13} />
                              Batal
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vehicle Management */}
      <div className="erp-card">
        <div className="erp-card-header page-header-responsive">
          <div>
            <span className="erp-card-title">Daftar Kendaraan</span>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
              Kendaraan tersedia di sini akan muncul di dropdown Surat Jalan jika Gudang punya stok ready pickup.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-muted)" }}>
            <Truck size={14} /> {availableVehicles.length} tersedia / {vehicles.length} total
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="erp-table">
            <thead>
              <tr>
                <th>No. Polisi</th>
                <th>Supir</th>
                <th>Tipe</th>
                <th>Status</th>
                <th>Surat Jalan Aktif</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Belum ada kendaraan. Tambahkan kendaraan dulu sebelum membuat Surat Jalan.</td></tr>
              ) : vehicles.map((v: any) => {
                const activeDelivery = v.deliveries?.[0];
                const isSelectable = v.status === "AVAILABLE" && !activeDelivery;
                return (
                  <tr key={v.id}>
                    <td style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--brand-purple)", fontSize: 13 }}>{v.plate}</td>
                    <td style={{ fontWeight: 600 }}>{v.driverName}</td>
                    <td><span className="badge badge-neutral">{v.type}</span></td>
                    <td>
                      <span className={`badge ${isSelectable ? "badge-success" : activeDelivery ? "badge-warning" : "badge-neutral"}`}>
                        {isSelectable ? "Tersedia" : activeDelivery ? "Aktif SJ" : v.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: activeDelivery ? "var(--text-primary)" : "var(--text-muted)", fontWeight: activeDelivery ? 600 : 400 }}>
                      {activeDelivery ? `${activeDelivery.orderNumber || "DO aktif"} (${statusLabel[activeDelivery.status] || activeDelivery.status})` : "-"}
                    </td>
                    <td>
                      <select
                        className="form-input"
                        value={v.status}
                        disabled={!!activeDelivery}
                        onChange={e => updateVehicleStatus(v, e.target.value)}
                        style={{ minWidth: 140, fontSize: 12, padding: "4px 8px" }}
                        title={activeDelivery ? "Kendaraan aktif di Surat Jalan tidak bisa diubah" : undefined}
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vehicle Form Modal */}
      {showVehicleForm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div className="erp-card animate-fade-in" style={{ width: "100%", maxWidth: 520, margin: 20, border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div className="erp-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Truck size={20} color="var(--color-primary)" />
                <h3 className="erp-card-title" style={{ fontSize: 20, margin: 0 }}>Tambah Kendaraan</h3>
              </div>
              <button type="button" onClick={() => setShowVehicleForm(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={20} /></button>
            </div>
            <div className="erp-card-body" style={{ padding: 24 }}>
              <form onSubmit={saveVehicle} style={{ display: "grid", gap: 16 }}>
                <div>
                  <label className="form-label">No. Polisi</label>
                  <input className="form-input" value={vehicleForm.plate} onChange={e => setVehicleForm({ ...vehicleForm, plate: e.target.value.toUpperCase() })} placeholder="B 1234 ABC" required />
                </div>
                <div>
                  <label className="form-label">Nama Supir</label>
                  <input className="form-input" value={vehicleForm.driverName} onChange={e => setVehicleForm({ ...vehicleForm, driverName: e.target.value })} placeholder="Nama supir" required />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="form-label">Tipe Kendaraan</label>
                    <select className="form-input" value={vehicleForm.type} onChange={e => setVehicleForm({ ...vehicleForm, type: e.target.value })} required>
                      <option value="TRONTON">TRONTON</option>
                      <option value="ENGKEL">ENGKEL</option>
                      <option value="VENDOR">VENDOR</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Status</label>
                    <select className="form-input" value={vehicleForm.status} onChange={e => setVehicleForm({ ...vehicleForm, status: e.target.value })} required>
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                    </select>
                  </div>
                </div>
                <div style={{ padding: "12px 14px", background: "var(--bg-secondary)", borderRadius: 10, fontSize: 13, color: "var(--text-secondary)" }}>
                  Kendaraan dengan status AVAILABLE akan muncul di dropdown Surat Jalan hanya jika tidak sedang aktif di Surat Jalan lain.
                </div>
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowVehicleForm(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }}><Save size={16} /> Simpan Kendaraan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div className="erp-card animate-fade-in" style={{ width: "100%", maxWidth: 900, margin: 20, maxHeight: "90vh", overflowY: "auto", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div className="erp-card-header" style={{ position: "sticky", top: 0, background: "#fff", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <FileText size={20} color="var(--color-primary)" />
                <h3 className="erp-card-title" style={{ fontSize: 20, margin: 0 }}>Surat Jalan Baru</h3>
              </div>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={20} /></button>
            </div>
            <div className="erp-card-body" style={{ padding: 24 }}>
              <form onSubmit={submit}>
                {/* Order Info */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Informasi Surat Jalan</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                    <div>
                      <label className="form-label">Kendaraan</label>
                      <select className="form-input" value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })} required>
                        <option value="">-- Pilih Kendaraan --</option>
                        {availableVehicles.map((v: any) => (
                          <option key={v.id} value={v.id}>{v.plate} — {v.driverName}</option>
                        ))}
                      </select>
                      {availableVehicles.length === 0 && (
                        <div style={{ fontSize: 12, color: "var(--color-red)", marginTop: 6 }}>
                          Tidak ada kendaraan tersedia. Kendaraan aktif di Surat Jalan tidak bisa dipilih.
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="form-label">Pelanggan</label>
                      <select className="form-input" value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })}>
                        <option value="">-- Non-Pelanggan --</option>
                        {customers.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.companyName}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Berat Target (kg)</label>
                      <input className="form-input" type="number" value={form.loadingWeight} onChange={e => setForm({ ...form, loadingWeight: e.target.value })} placeholder="10000" />
                    </div>
                  </div>
                </div>

                {/* Bale Selection from Gudang */}
                <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pilih Bale dari Gudang (Barang Jadi)</div>
                    <button type="button" onClick={toggleAllBales} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border-light)", background: "var(--bg-secondary)", color: "var(--text-secondary)", cursor: "pointer" }}>
                      {selectedBaleIds.length === availableBales.length && availableBales.length > 0 ? <CheckSquare size={14} /> : <Square size={14} />}
                      {selectedBaleIds.length === availableBales.length ? "Batal Pilih" : "Pilih Semua"}
                    </button>
                  </div>

                  {availableBales.length === 0 ? (
                    <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", background: "var(--bg-secondary)", borderRadius: 10 }}>
                      <Package size={32} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
                      <div style={{ fontWeight: 600 }}>Tidak ada bale di Gudang</div>
                      <div style={{ fontSize: 13, marginTop: 4 }}>Pastikan Produksi sudah menghasilkan bale dan Gudang sudah menerima barang jadi.</div>
                    </div>
                  ) : (
                    <div style={{ maxHeight: 260, overflowY: "auto", border: "1px solid var(--border-light)", borderRadius: 10 }}>
                      <table className="erp-table" style={{ margin: 0 }}>
                        <thead style={{ position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
                          <tr>
                            <th style={{ width: 40 }}></th>
                            <th>Bale ID</th>
                            <th>Tgl Produksi</th>
                            <th>Grade</th>
                            <th>Berat</th>
                            <th>Lokasi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {availableBales.map((b: any) => (
                            <tr key={b.id} onClick={() => toggleBale(b.id)} style={{ cursor: "pointer", background: selectedBaleIds.includes(b.id) ? "rgba(124,111,224,0.06)" : "" }}>
                              <td style={{ textAlign: "center" }} onClick={e => e.stopPropagation()}>
                                {selectedBaleIds.includes(b.id) ? <CheckSquare size={16} color="var(--color-primary)" /> : <Square size={16} color="var(--text-muted)" />}
                              </td>
                              <td style={{ fontFamily: "monospace", fontWeight: 600, color: "var(--brand-purple)", fontSize: 13 }}>{b.baleId}</td>
                              <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>{b.productionDate ? new Date(b.productionDate).toLocaleDateString("id-ID") : "—"}</td>
                              <td><span className={`badge ${gradeColor[b.grade] || "badge-neutral"}`}>{b.grade}</span></td>
                              <td style={{ fontWeight: 600, color: "var(--brand-teal)" }}>{b.weight?.toLocaleString("id-ID")} kg</td>
                              <td style={{ fontSize: 13, color: "var(--text-muted)" }}>{b.location || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {selectedBaleIds.length > 0 && (
                    <div style={{ marginTop: 12, padding: "12px 16px", background: "var(--kpi-mint-bg)", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{selectedBaleIds.length} bale</span> dipilih dari Gudang
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-teal)" }}>{totalSelectedWeight.toLocaleString("id-ID")} kg</div>
                    </div>
                  )}
                </div>

                <div style={{ paddingTop: 20, borderTop: "1px solid var(--border-light)", display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }} disabled={selectedBaleIds.length === 0}>
                    <Save size={16} /> Simpan Surat Jalan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
