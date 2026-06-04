"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRefresh } from "@/lib/refresh-context";
import { ClipboardList, Hourglass, CheckCircle2, Banknote } from "lucide-react";

const statusColor: any = {
  PENDING: "badge-warning",
  APPROVED: "badge-info",
  ORDERED: "badge-purple",
  RECEIVED: "badge-success",
  CANCELLED: "badge-danger",
};
const statusLabel: any = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  ORDERED: "Dipesan",
  RECEIVED: "Diterima",
  CANCELLED: "Dibatalkan",
};
const statusNext: any = {
  PENDING: "APPROVED",
  APPROVED: "ORDERED",
  ORDERED: "RECEIVED",
};

const fmtRp = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

export default function PembelianPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [form, setForm] = useState({
    supplierId: "",
    itemName: "Kardus (OCC)",
    quantity: "",
    unit: "kg",
    unitPrice: "",
    notes: "",
    deliveryDate: "",
  });
  const { triggerRefresh } = useRefresh();

  const load = () => {
    const params = filterStatus !== "all" ? `?status=${filterStatus}` : "";
    Promise.all([
      api.get(`/pembelian${params}`),
      api.get("/pembelian/dashboard"),
      api.get("/suppliers?status=ACTIVE"),
    ])
      .then(([o, d, s]) => {
        setOrders(o.data);
        setDashboard(d.data);
        setSuppliers(s.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStatus]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/pembelian", {
      ...form,
      quantity: parseFloat(form.quantity),
      unitPrice: parseFloat(form.unitPrice),
    });
    setShowForm(false);
    setForm({ supplierId: "", itemName: "Kardus (OCC)", quantity: "", unit: "kg", unitPrice: "", notes: "", deliveryDate: "" });
    load();
    triggerRefresh();
  };

  const updateStatus = async (id: string, status: string) => {
    await api.put(`/pembelian/${id}/status`, { status });
    load();
    triggerRefresh();
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Hapus purchase order ini?")) return;
    await api.delete(`/pembelian/${id}`);
    load();
    triggerRefresh();
  };

  const totalAmount = form.quantity && form.unitPrice
    ? parseFloat(form.quantity) * parseFloat(form.unitPrice)
    : 0;

  const kpis = dashboard
    ? [
        { label: "Total PO", value: dashboard.totalOrders, Icon: ClipboardList, variant: "dark" },
        { label: "PO Aktif", value: dashboard.pendingOrders, Icon: Hourglass, variant: "pink" },
        { label: "Diterima Hari Ini", value: dashboard.receivedToday, Icon: CheckCircle2, variant: "mint" },
        { label: "Total Pengeluaran", value: fmtRp(dashboard.totalSpend), Icon: Banknote, variant: "neutral" },
      ]
    : [];

  const variantBg: any = {
    dark: "var(--kpi-dark)",
    mint: "var(--kpi-mint-bg)",
    pink: "var(--kpi-pink-bg)",
    neutral: "var(--kpi-neutral-bg)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Pembelian Kardus
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>
            Purchase Order pembelian kardus (OCC) dari supplier
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          ➕ Buat PO Baru
        </button>
      </div>

      {/* KPI Cards */}
      {dashboard && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {kpis.map((k, i) => (
            <div
              key={i}
              className="kpi-card"
              style={{
                background: variantBg[k.variant],
                borderColor: undefined,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>
                  {k.label}
                </span>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(124,111,224,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>
                  {k.Icon && <k.Icon size={18} strokeWidth={2} />}
                </div>
              </div>
              <div style={{ fontSize: "1.65rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)", lineHeight: 1.15 }}>
                {k.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 4, background: "#F3F4F6", borderRadius: 10, padding: 4, alignSelf: "flex-start" }}>
        {[
          { key: "all", label: "Semua" },
          { key: "PENDING", label: "Menunggu" },
          { key: "APPROVED", label: "Disetujui" },
          { key: "ORDERED", label: "Dipesan" },
          { key: "RECEIVED", label: "Diterima" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilterStatus(t.key)}
            style={{
              padding: "6px 14px", borderRadius: 7, fontSize: 13, fontWeight: 600,
              border: "none", cursor: "pointer", transition: "all 0.2s ease",
              background: filterStatus === t.key ? "#fff" : "transparent",
              color: filterStatus === t.key ? "var(--color-purple)" : "var(--text-secondary)",
              boxShadow: filterStatus === t.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(4px)",
        }}>
          <div className="erp-card animate-fade-in" style={{ width: "100%", maxWidth: 680, margin: 20, maxHeight: "90vh", overflowY: "auto", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div className="erp-card-header" style={{ position: "sticky", top: 0, background: "#fff", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="erp-card-title" style={{ fontSize: 20 }}>Buat Purchase Order Baru</h3>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
            </div>
            <div className="erp-card-body" style={{ padding: 24 }}>
              <form onSubmit={submit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div className="form-group" style={{ gridColumn: "span 2", marginBottom: 0 }}>
                    <label className="form-label">Supplier</label>
                    <select className="form-input" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} required>
                      <option value="">-- Pilih Supplier --</option>
                      {suppliers.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.companyName} — {s.picName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: "span 2", marginBottom: 0 }}>
                    <label className="form-label">Nama Barang</label>
                    <select className="form-input" value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })}>
                      <option value="Kardus (OCC)">Kardus (OCC)</option>
                      <option value="Kardus (DLK)">Kardus (DLK)</option>
                      <option value="Kardus (ONP)">Kardus (ONP)</option>
                      <option value="Kardus Campuran">Kardus Campuran</option>
                      <option value="Kertas HVS Bekas">Kertas HVS Bekas</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Jumlah</label>
                    <input className="form-input" type="number" step="0.01" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="1000" required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Satuan</label>
                    <select className="form-input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                      <option value="kg">kg</option>
                      <option value="ton">ton</option>
                      <option value="pcs">pcs</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Harga Satuan (Rp)</label>
                    <input className="form-input" type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} placeholder="2500" required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Tanggal Pengiriman</label>
                    <input className="form-input" type="date" value={form.deliveryDate} onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })} />
                  </div>

                  <div className="form-group" style={{ gridColumn: "span 2", marginBottom: 0 }}>
                    <label className="form-label">Catatan</label>
                    <input className="form-input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Catatan tambahan..." />
                  </div>
                </div>

                {/* Total Preview */}
                {totalAmount > 0 && (
                  <div style={{ background: "var(--kpi-mint-bg)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>Total Nilai PO</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "var(--color-teal)" }}>{fmtRp(totalAmount)}</span>
                  </div>
                )}

                <div style={{ paddingTop: 20, borderTop: "1px solid var(--border-light)", display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: "0 24px" }}>💾 Buat Purchase Order</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #EDE9FF", borderTop: "3px solid #7C6FE0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : (
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Daftar Purchase Order</span>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{orders.length} PO ditemukan</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>No. PO</th>
                  <th>Supplier</th>
                  <th>Barang</th>
                  <th>Qty</th>
                  <th>Harga Satuan</th>
                  <th>Total</th>
                  <th>Tgl Kirim</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                      Belum ada purchase order
                    </td>
                  </tr>
                ) : (
                  orders.map((o: any) => (
                    <tr key={o.id}>
                      <td style={{ fontFamily: "monospace", fontSize: 13, color: "var(--color-purple)", fontWeight: 600 }}>
                        {o.orderNumber}
                      </td>
                      <td style={{ fontWeight: 500 }}>{o.supplier?.companyName}</td>
                      <td>{o.itemName}</td>
                      <td style={{ color: "var(--text-secondary)" }}>
                        {o.quantity?.toLocaleString("id-ID")} {o.unit}
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>
                        {fmtRp(o.unitPrice)}/{o.unit}
                      </td>
                      <td style={{ fontWeight: 700, color: "var(--color-teal)" }}>
                        {fmtRp(o.totalAmount)}
                      </td>
                      <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                        {o.deliveryDate ? new Date(o.deliveryDate).toLocaleDateString("id-ID") : "—"}
                      </td>
                      <td>
                        <span className={`badge ${statusColor[o.status]}`}>{statusLabel[o.status]}</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          {statusNext[o.status] && (
                            <button
                              onClick={() => updateStatus(o.id, statusNext[o.status])}
                              style={{
                                fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 6,
                                border: "1px solid var(--color-purple)", color: "var(--color-purple)",
                                background: "transparent", cursor: "pointer",
                              }}
                            >
                              {statusNext[o.status] === "APPROVED" && "✅ Setujui"}
                              {statusNext[o.status] === "ORDERED" && "📦 Pesan"}
                              {statusNext[o.status] === "RECEIVED" && "✔ Terima"}
                            </button>
                          )}
                          {(o.status === "PENDING" || o.status === "CANCELLED") && (
                            <button
                              onClick={() => deleteOrder(o.id)}
                              style={{
                                fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 6,
                                border: "1px solid #FF6B6B", color: "#FF6B6B",
                                background: "transparent", cursor: "pointer",
                              }}
                            >
                              🗑 Hapus
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent PO from Dashboard */}
      {dashboard?.recentOrders?.length > 0 && (
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">PO Terbaru</span>
          </div>
          <div style={{ padding: "0 1rem 1rem" }}>
            {dashboard.recentOrders.map((o: any) => (
              <div
                key={o.id}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 0", borderBottom: "1px solid var(--border-light)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{o.itemName}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{o.supplier?.companyName} — {o.quantity?.toLocaleString("id-ID")} {o.unit}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, color: "var(--color-teal)" }}>{fmtRp(o.totalAmount)}</div>
                  <span className={`badge ${statusColor[o.status]}`} style={{ fontSize: 11 }}>{statusLabel[o.status]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
