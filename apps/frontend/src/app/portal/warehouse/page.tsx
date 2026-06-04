"use client";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { LayoutDashboard, Download, Package, Truck, ArrowRightLeft, AlertTriangle, Pin, ClipboardList, CheckCircle2 } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const gradeColor: any = { A: "badge-success", B: "badge-warning", REJECT: "badge-danger" };
const statusColor: any = { IN_STOCK: "badge-success", RESERVED: "badge-info", SHIPPED: "badge-neutral", DAMAGED: "badge-danger" };
const areaLabel: any = { RAW_MATERIAL: "Bahan Baku", FINISHED_GOODS: "Barang Jadi", REJECTED: "Reject" };
const mvtLabel: any = {
  INBOUND_PENDING: "Penerimaan (Pending)", INBOUND_APPROVED: "Penerimaan Disetujui",
  INBOUND_REJECTED: "Penerimaan Ditolak", MOVE: "Pemindahan", RESERVE: "Reservasi",
  OUTBOUND: "Pengiriman (Outbound)",
};

type Tab = "DASHBOARD" | "INBOUND" | "STOCK" | "OUTBOUND" | "MOVEMENTS";

export default function WarehousePage() {
  const [activeTab, setActiveTab] = useState<Tab>("DASHBOARD");
  const [inventory, setInventory] = useState<any[]>([]);
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [fifo, setFifo] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [todayStats, setTodayStats] = useState<any>({ inbound: 0, outbound: 0, pending: 0 });
  const [scheduledDOs, setScheduledDOs] = useState<any[]>([]);
  const [selectedDO, setSelectedDO] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // ─── Filter states ───────────────────────────────────────────────────────────
  const [stockFilter, setStockFilter] = useState({ area: "", status: "", grade: "" });

  // ─── Selection for batch ops ─────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ─── Form states ─────────────────────────────────────────────────────────────
  const [inboundForm, setInboundForm] = useState({ baleId: "", weight: "", grade: "A", location: "", notes: "", submittedBy: "" });
  const [moveForm, setMoveForm] = useState({ id: "", toArea: "FINISHED_GOODS", toLocation: "" });
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showInboundForm, setShowInboundForm] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (stockFilter.area) params.set("area", stockFilter.area);
    if (stockFilter.status) params.set("status", stockFilter.status);
    if (stockFilter.grade) params.set("grade", stockFilter.grade);

    Promise.all([
      api.get(`/warehouse?${params}&pendingApproval=false`),
      api.get("/warehouse?pendingApproval=true"),
      api.get("/warehouse/summary"),
      api.get("/warehouse/stats/today"),
      api.get("/warehouse/fifo"),
      api.get("/warehouse/movements"),
      api.get("/logistics/deliveries?status=SCHEDULED"),
    ]).then(([inv, pend, sum, stats, fi, mvt, dos]) => {
      setInventory(inv.data);
      setPendingItems(pend.data);
      setSummary(sum.data);
      setTodayStats(stats.data);
      setFifo(fi.data);
      setMovements(mvt.data);
      setScheduledDOs(dos.data);
    }).finally(() => setLoading(false));
  }, [stockFilter]);

  useEffect(() => { load(); }, [load]);

  // ─── Actions ─────────────────────────────────────────────────────────────────
  const submitInbound = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/warehouse/inbound", { ...inboundForm, weight: parseFloat(inboundForm.weight) });
    setInboundForm({ baleId: "", weight: "", grade: "A", location: "", notes: "", submittedBy: "" });
    setShowInboundForm(false);
    load();
  };

  const approve = async (id: string) => {
    await api.put(`/warehouse/inbound/${id}/approve`, { approvedBy: "Supervisor" });
    load();
  };

  const reject = async (id: string) => {
    if (!confirm("Yakin menolak penerimaan bale ini? Data akan dihapus.")) return;
    await api.put(`/warehouse/inbound/${id}/reject`, { rejectedBy: "Supervisor" });
    load();
  };

  const submitMove = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.put(`/warehouse/${moveForm.id}/move`, { toArea: moveForm.toArea, toLocation: moveForm.toLocation });
    setShowMoveModal(false);
    setSelectedIds([]);
    load();
  };

  const reserveSelected = async () => {
    if (selectedIds.length === 0) return alert("Pilih bale terlebih dahulu.");
    await api.post("/warehouse/reserve", { ids: selectedIds });
    setSelectedIds([]);
    load();
  };

  const dispatchSelected = async () => {
    if (!selectedDO) return alert("Pilih Delivery Order (DO) tujuan terlebih dahulu.");
    if (selectedIds.length === 0) return alert("Pilih bale untuk dimuat.");
    if (!confirm(`Muat ${selectedIds.length} bale ke DO ini?`)) return;
    await api.post("/warehouse/load-do", { deliveryOrderId: selectedDO, ids: selectedIds });
    setSelectedIds([]);
    setSelectedDO("");
    load();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const totalStock = inventory.reduce((a, i) => a + (i.weight || 0), 0);
  const reservedCount = inventory.filter(i => i.status === "RESERVED").length;

  // ─── Tab Definitions ─────────────────────────────────────────────────────────
  const tabs: { id: Tab; label: string; Icon: any; badge?: number }[] = [
    { id: "DASHBOARD", label: "Dashboard", Icon: LayoutDashboard },
    { id: "INBOUND", label: "Penerimaan", Icon: Download, badge: pendingItems.length },
    { id: "STOCK", label: "Stok Bale", Icon: Package },
    { id: "OUTBOUND", label: "Pemuatan DO (Loading)", Icon: Truck },
    { id: "MOVEMENTS", label: "Mutasi Stok", Icon: ArrowRightLeft },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Manajemen Gudang (WMS)</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Sistem manajemen gudang terintegrasi — Penerimaan, Stok, dan Pengiriman</p>
        </div>
        {activeTab === "INBOUND" && (
          <button className="btn btn-primary" onClick={() => setShowInboundForm(!showInboundForm)}>
            {showInboundForm ? "✕ Tutup" : "+ Catat Penerimaan"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border-light)", flexWrap: "wrap" }}>
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              paddingBottom: 12, paddingLeft: 4, paddingRight: 16, cursor: "pointer", fontWeight: 600, fontSize: 14,
              color: activeTab === tab.id ? "var(--brand-purple)" : "var(--text-secondary)",
              borderBottom: activeTab === tab.id ? "2px solid var(--brand-purple)" : "2px solid transparent",
              transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <tab.Icon size={16} /> {tab.label}
            {tab.badge ? (
              <span style={{ background: "#ef4444", color: "#fff", borderRadius: 999, fontSize: 11, fontWeight: 700, padding: "1px 6px" }}>
                {tab.badge}
              </span>
            ) : null}
          </div>
        ))}
      </div>

      {/* ── TAB: DASHBOARD ────────────────────────────────────────────────────── */}
      {activeTab === "DASHBOARD" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* KPI Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {[
              { label: "Total Stok Aktif", value: `${(totalStock / 1000).toFixed(2)} Ton`, sub: `${inventory.length} bale`, color: "var(--kpi-dark)", dark: true },
              { label: "Masuk Hari Ini", value: todayStats.inbound, sub: "bale diterima", color: "var(--kpi-mint-bg)", dark: false },
              { label: "Keluar Hari Ini", value: todayStats.outbound, sub: "bale dikirim", color: "var(--kpi-pink-bg)", dark: false },
              { label: "Menunggu Approval", value: todayStats.pending, sub: "pending Supervisor", color: "#FFF7ED", dark: false },
              { label: "Stok Terreservasi", value: reservedCount, sub: "bale", color: "#EDE9FF", dark: false },
            ].map((kpi, i) => (
              <div key={i} className="kpi-card" style={{ background: kpi.color, borderColor: undefined }}>
                <div style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: 8 }}>{kpi.label}</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)", lineHeight: 1.1 }}>{kpi.value}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 4 }}>{kpi.sub}</div>
              </div>
            ))}
          </div>

          {/* Area Summary */}
          <div className="erp-card">
            <div className="erp-card-header"><span className="erp-card-title">Ringkasan Per Area</span></div>
            <div style={{ overflowX: "auto" }}>
              <table className="erp-table">
                <thead>
                  <tr><th>Area</th><th>Status</th><th>Jumlah Bale</th><th>Total Berat</th></tr>
                </thead>
                <tbody>
                  {summary.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Belum ada data</td></tr>
                  ) : summary.map((s: any, i: number) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{areaLabel[s.area] || s.area}</td>
                      <td><span className={`badge ${statusColor[s.status]}`}>{s.status}</span></td>
                      <td>{s._count} bale</td>
                      <td style={{ fontWeight: 600, color: "var(--brand-teal)" }}>{((s._sum?.weight || 0) / 1000).toFixed(2)} Ton</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: INBOUND ──────────────────────────────────────────────────────── */}
      {activeTab === "INBOUND" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {showInboundForm && (
            <div className="erp-card animate-fade-in">
              <div className="erp-card-header">
                <span className="erp-card-title">Form Penerimaan Bale Baru</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-secondary)", marginLeft: 12 }}>
                  <AlertTriangle size={14} /> Memerlukan persetujuan Supervisor
                </span>
              </div>
              <div className="erp-card-body" style={{ padding: 24 }}>
                <form onSubmit={submitInbound}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>
                      <label className="form-label">Bale ID</label>
                      <input className="form-input" value={inboundForm.baleId} onChange={e => setInboundForm({ ...inboundForm, baleId: e.target.value })} placeholder="BALE-2024-001" required />
                    </div>
                    <div>
                      <label className="form-label">Berat (kg)</label>
                      <input className="form-input" type="number" value={inboundForm.weight} onChange={e => setInboundForm({ ...inboundForm, weight: e.target.value })} placeholder="250" required />
                    </div>
                    <div>
                      <label className="form-label">Grade</label>
                      <select className="form-input" value={inboundForm.grade} onChange={e => setInboundForm({ ...inboundForm, grade: e.target.value })}>
                        <option value="A">Grade A</option>
                        <option value="B">Grade B</option>
                        <option value="REJECT">Reject</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Lokasi Rak</label>
                      <input className="form-input" value={inboundForm.location} onChange={e => setInboundForm({ ...inboundForm, location: e.target.value })} placeholder="R-A-03" />
                    </div>
                    <div>
                      <label className="form-label">Dicatat Oleh</label>
                      <input className="form-input" value={inboundForm.submittedBy} onChange={e => setInboundForm({ ...inboundForm, submittedBy: e.target.value })} placeholder="Nama Operator" />
                    </div>
                    <div>
                      <label className="form-label">Catatan</label>
                      <input className="form-input" value={inboundForm.notes} onChange={e => setInboundForm({ ...inboundForm, notes: e.target.value })} placeholder="Opsional" />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", borderTop: "1px solid var(--border-light)", paddingTop: 16 }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowInboundForm(false)}>Batal</button>
                    <button type="submit" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }}><Download size={16} /> Kirim untuk Approval</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Pending Approval Table */}
          <div className="erp-card">
            <div className="erp-card-header">
              <span className="erp-card-title">Menunggu Persetujuan Supervisor</span>
              <span style={{ marginLeft: 12, background: "#FEF3C7", color: "#92400E", borderRadius: 6, fontSize: 12, fontWeight: 600, padding: "3px 10px" }}>{pendingItems.length} item</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="erp-table">
                <thead>
                  <tr><th>Bale ID</th><th>Berat</th><th>Grade</th><th>Lokasi</th><th>Waktu Input</th><th>Aksi Supervisor</th></tr>
                </thead>
                <tbody>
                  {pendingItems.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Tidak ada penerimaan yang menunggu persetujuan</td></tr>
                  ) : pendingItems.map((item: any) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600, color: "var(--brand-purple)" }}>{item.baleId}</td>
                      <td style={{ fontWeight: 600 }}>{item.weight?.toLocaleString("id-ID")} kg</td>
                      <td><span className={`badge ${gradeColor[item.grade]}`}>{item.grade}</span></td>
                      <td style={{ color: "var(--text-muted)", fontFamily: "monospace" }}>{item.location || "—"}</td>
                      <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{new Date(item.createdAt).toLocaleString("id-ID")}</td>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => approve(item.id)} style={{ padding: "5px 12px", borderRadius: 6, background: "#10b981", color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                            ✓ Approve
                          </button>
                          <button onClick={() => reject(item.id)} style={{ padding: "5px 12px", borderRadius: 6, background: "#ef4444", color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                            ✕ Tolak
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: STOCK ────────────────────────────────────────────────────────── */}
      {activeTab === "STOCK" && (
        <div className="erp-card">
          <div className="erp-card-header" style={{ borderBottom: "none", paddingBottom: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <span className="erp-card-title">Daftar Stok Bale</span>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                  {inventory.length} item — {(totalStock / 1000).toFixed(2)} Ton
                  {selectedIds.length > 0 && <span style={{ color: "var(--brand-purple)", fontWeight: 600, marginLeft: 12 }}>{selectedIds.length} terpilih</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <select className="form-input" style={{ width: 150 }} value={stockFilter.area} onChange={e => setStockFilter({ ...stockFilter, area: e.target.value })}>
                  <option value="">Semua Area</option>
                  <option value="RAW_MATERIAL">Bahan Baku</option>
                  <option value="FINISHED_GOODS">Barang Jadi</option>
                  <option value="REJECTED">Reject</option>
                </select>
                <select className="form-input" style={{ width: 130 }} value={stockFilter.grade} onChange={e => setStockFilter({ ...stockFilter, grade: e.target.value })}>
                  <option value="">Semua Grade</option>
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="REJECT">Reject</option>
                </select>
                <select className="form-input" style={{ width: 130 }} value={stockFilter.status} onChange={e => setStockFilter({ ...stockFilter, status: e.target.value })}>
                  <option value="">Semua Status</option>
                  <option value="IN_STOCK">In Stock</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="SHIPPED">Shipped</option>
                </select>
                {selectedIds.length > 0 && (
                  <>
                    <button onClick={reserveSelected} className="btn btn-secondary" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13 }}>
                      <Pin size={14} /> Reservasi ({selectedIds.length})
                    </button>
                    <button onClick={() => { setMoveForm({ ...moveForm, id: selectedIds[0] }); setShowMoveModal(true); }} className="btn btn-secondary" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13 }}>
                      <ArrowRightLeft size={14} /> Pindah
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          <div style={{ overflowX: "auto", marginTop: 16 }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th><input type="checkbox" onChange={e => setSelectedIds(e.target.checked ? inventory.map(i => i.id) : [])} /></th>
                  <th>Bale ID</th><th>Berat</th><th>Grade</th><th>Area</th><th>Lokasi</th><th>Status</th><th>Tgl Produksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: "3rem" }}>Memuat...</td></tr>
                ) : inventory.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Tidak ada data stok</td></tr>
                ) : inventory.map((item: any) => (
                  <tr key={item.id} style={{ background: selectedIds.includes(item.id) ? "#F5F3FF" : undefined }}>
                    <td><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} /></td>
                    <td style={{ fontWeight: 600, color: "var(--brand-purple)" }}>{item.baleId}</td>
                    <td style={{ fontWeight: 600 }}>{item.weight?.toLocaleString("id-ID")} kg</td>
                    <td><span className={`badge ${gradeColor[item.grade]}`}>{item.grade}</span></td>
                    <td style={{ color: "var(--text-secondary)" }}>{areaLabel[item.area] || item.area}</td>
                    <td style={{ color: "var(--text-muted)", fontFamily: "monospace" }}>{item.location || "—"}</td>
                    <td><span className={`badge ${statusColor[item.status]}`}>{item.status}</span></td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{item.productionDate ? new Date(item.productionDate).toLocaleDateString("id-ID") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: OUTBOUND FIFO ────────────────────────────────────────────────── */}
      {activeTab === "OUTBOUND" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="erp-card-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, background: "#EDE9FF", borderRadius: 10, padding: "12px 16px", fontSize: 14, color: "var(--brand-purple)", fontWeight: 500 }}>
              <ClipboardList size={18} /> <strong>Metode FIFO:</strong> Bale ditampilkan dari yang paling lama diproduksi. Pilih bale yang akan dikirim, lalu klik "Proses Pengiriman".
            </span>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <select className="form-input" style={{ width: 300, background: "#fff" }} value={selectedDO} onChange={(e) => setSelectedDO(e.target.value)}>
                <option value="">-- Pilih Delivery Order (DO) --</option>
                {scheduledDOs.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.orderNumber} - {d.customer?.companyName || d.destination}</option>
                ))}
              </select>
              {selectedIds.length > 0 && selectedDO && (
                <button onClick={dispatchSelected} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px" }}>
                  <Truck size={16} /> Masukkan ke Truk ({selectedIds.length} bale)
                </button>
              )}
            </div>
          </div>
          <div className="erp-card">
            <div className="erp-card-header">
              <span className="erp-card-title">Antrian FIFO — Siap Kirim</span>
              <span style={{ marginLeft: 12, fontSize: 13, color: "var(--text-secondary)" }}>{fifo.length} bale tersedia</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="erp-table">
                <thead>
                  <tr>
                    <th><input type="checkbox" onChange={e => setSelectedIds(e.target.checked ? fifo.map(i => i.id) : [])} /></th>
                    <th>Urutan FIFO</th><th>Bale ID</th><th>Berat</th><th>Grade</th><th>Area</th><th>Tgl Produksi</th>
                  </tr>
                </thead>
                <tbody>
                  {fifo.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Tidak ada bale yang siap kirim</td></tr>
                  ) : fifo.map((item: any, index: number) => (
                    <tr key={item.id} style={{ background: selectedIds.includes(item.id) ? "#F5F3FF" : undefined }}>
                      <td><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} /></td>
                      <td>
                        <span style={{ background: index < 3 ? "#10b981" : "var(--bg-secondary)", color: index < 3 ? "#fff" : "var(--text-secondary)", borderRadius: 999, width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                          {index + 1}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: "var(--brand-purple)" }}>{item.baleId}</td>
                      <td style={{ fontWeight: 600 }}>{item.weight?.toLocaleString("id-ID")} kg</td>
                      <td><span className={`badge ${gradeColor[item.grade]}`}>{item.grade}</span></td>
                      <td style={{ color: "var(--text-secondary)" }}>{areaLabel[item.area] || item.area}</td>
                      <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                        {item.productionDate ? new Date(item.productionDate).toLocaleDateString("id-ID") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: MOVEMENTS ────────────────────────────────────────────────────── */}
      {activeTab === "MOVEMENTS" && (
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Log Mutasi Stok</span>
            <span style={{ marginLeft: 12, fontSize: 13, color: "var(--text-secondary)" }}>200 entri terakhir</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="erp-table">
              <thead>
                <tr><th>Waktu</th><th>Tipe</th><th>Bale ID</th><th>Dari</th><th>Ke</th><th>Berat</th><th>Catatan</th><th>Oleh</th></tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Belum ada riwayat mutasi</td></tr>
                ) : movements.map((m: any) => (
                  <tr key={m.id}>
                    <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>{new Date(m.createdAt).toLocaleString("id-ID")}</td>
                    <td style={{ fontSize: 13 }}>{mvtLabel[m.movementType] || m.movementType}</td>
                    <td style={{ fontWeight: 600, color: "var(--brand-purple)", fontSize: 13 }}>{m.baleId}</td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{m.fromArea || "—"} {m.fromStatus ? `/ ${m.fromStatus}` : ""}</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>{m.toArea || "—"} {m.toStatus ? `/ ${m.toStatus}` : ""}</td>
                    <td style={{ fontWeight: 600, color: "var(--brand-teal)", fontSize: 13 }}>{m.weight?.toLocaleString("id-ID")} kg</td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{m.notes || "—"}</td>
                    <td style={{ fontSize: 12 }}>{m.performedBy || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MOVE MODAL ───────────────────────────────────────────────────────── */}
      {showMoveModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div className="erp-card animate-fade-in" style={{ width: "100%", maxWidth: 480, margin: 20, border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div className="erp-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="erp-card-title">Pindahkan Bale</h3>
              <button onClick={() => setShowMoveModal(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            <div className="erp-card-body" style={{ padding: 24 }}>
              <form onSubmit={submitMove}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label className="form-label">Pindah ke Area</label>
                    <select className="form-input" value={moveForm.toArea} onChange={e => setMoveForm({ ...moveForm, toArea: e.target.value })}>
                      <option value="RAW_MATERIAL">Bahan Baku</option>
                      <option value="FINISHED_GOODS">Barang Jadi</option>
                      <option value="REJECTED">Reject</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Lokasi Rak Tujuan</label>
                    <input className="form-input" value={moveForm.toLocation} onChange={e => setMoveForm({ ...moveForm, toLocation: e.target.value })} placeholder="R-B-05" required />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24, borderTop: "1px solid var(--border-light)", paddingTop: 16 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowMoveModal(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }}><ArrowRightLeft size={16} /> Proses Pemindahan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
