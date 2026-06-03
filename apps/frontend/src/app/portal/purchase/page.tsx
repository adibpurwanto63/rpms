"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRefresh } from "@/lib/refresh-context";

const fmtRp = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function PurchasePage() {
  const [activeTab, setActiveTab] = useState("supplier"); // 'supplier' | 'penjualan'
  
  // Supplier State
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ companyName: "", picName: "", phone: "", email: "", address: "", taxNumber: "" });

  // Penjualan State
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [showSalesForm, setShowSalesForm] = useState(false);
  const [salesForm, setSalesForm] = useState({ customerName: "", itemName: "Kardus Bekas (OCC)", quantity: "", unit: "ton", unitPrice: "", notes: "" });

  const { triggerRefresh } = useRefresh();

  // Load Data
  const loadSuppliers = () => {
    api.get("/suppliers").then(r => setSuppliers(r.data)).finally(() => setLoadingSuppliers(false));
  };
  const loadSales = () => {
    api.get("/penjualan").then(r => setSalesOrders(r.data)).finally(() => setLoadingSales(false));
  };

  useEffect(() => {
    if (activeTab === "supplier") loadSuppliers();
    else loadSales();
  }, [activeTab]);

  // Actions Supplier
  const submitSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/suppliers", supplierForm);
    setShowSupplierForm(false);
    setSupplierForm({ companyName: "", picName: "", phone: "", email: "", address: "", taxNumber: "" });
    loadSuppliers();
    triggerRefresh();
  };

  // Actions Penjualan
  const submitSales = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/penjualan", {
      ...salesForm,
      quantity: parseFloat(salesForm.quantity),
      unitPrice: parseFloat(salesForm.unitPrice),
    });
    setShowSalesForm(false);
    setSalesForm({ customerName: "", itemName: "Kardus Bekas (OCC)", quantity: "", unit: "ton", unitPrice: "", notes: "" });
    loadSales();
    triggerRefresh();
  };

  const updateSalesStatus = async (id: string, status: string) => {
    try {
      await api.put(`/penjualan/${id}/status`, { status });
      loadSales();
      triggerRefresh();
    } catch (e: any) {
      alert(e.response?.data?.message || "Error updating status");
    }
  };

  const deleteSalesOrder = async (id: string) => {
    if (!confirm("Hapus sales order ini?")) return;
    await api.delete(`/penjualan/${id}`);
    loadSales();
    triggerRefresh();
  };

  const statusBadge = (s: string) => ({ ACTIVE: "badge-success", INACTIVE: "badge-neutral", BLACKLISTED: "badge-danger" }[s] || "badge-neutral");
  const statusLabel = (s: string) => ({ ACTIVE: "Aktif", INACTIVE: "Nonaktif", BLACKLISTED: "Diblokir" }[s] || s);

  const salesStatusBadge: any = { PENDING: "badge-warning", APPROVED: "badge-info", SHIPPED: "badge-success", CANCELLED: "badge-danger" };
  const salesStatusLabel: any = { PENDING: "Menunggu", APPROVED: "Disetujui", SHIPPED: "Terkirim", CANCELLED: "Dibatalkan" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Procurement & Sales</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Manajemen Supplier & Penjualan Barang</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {activeTab === "supplier" ? (
            <button className="btn btn-primary" onClick={() => setShowSupplierForm(true)}>+ Tambah Supplier</button>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowSalesForm(true)}>+ Buat Sales Order</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border-light)", paddingBottom: 16 }}>
        <button
          onClick={() => setActiveTab("supplier")}
          style={{
            padding: "8px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer",
            background: activeTab === "supplier" ? "var(--color-purple)" : "transparent",
            color: activeTab === "supplier" ? "#fff" : "var(--text-secondary)"
          }}
        >
          🏢 Manajemen Supplier
        </button>
        <button
          onClick={() => setActiveTab("penjualan")}
          style={{
            padding: "8px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer",
            background: activeTab === "penjualan" ? "var(--color-purple)" : "transparent",
            color: activeTab === "penjualan" ? "#fff" : "var(--text-secondary)"
          }}
        >
          📦 Manajemen Penjualan
        </button>
      </div>

      {/* TAB: SUPPLIER */}
      {activeTab === "supplier" && (
        <>
          {!loadingSuppliers && suppliers.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {[
                { label: "Total Supplier", value: suppliers.length, icon: "🏢", variant: "dark" },
                { label: "Supplier Aktif", value: suppliers.filter(s => s.status === "ACTIVE").length, icon: "✅", variant: "mint" },
                { label: "Diblokir", value: suppliers.filter(s => s.status === "BLACKLISTED").length, icon: "🚫", variant: "pink" },
              ].map((k, i) => (
                <div key={i} className="kpi-card" style={{ background: ({ dark: "var(--kpi-dark)", mint: "var(--kpi-mint-bg)", pink: "var(--kpi-pink-bg)" } as any)[k.variant], borderColor: k.variant === "dark" ? "transparent" : undefined }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: k.variant === "dark" ? "rgba(255,255,255,0.6)" : "var(--text-secondary)" }}>{k.label}</span>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: k.variant === "dark" ? "rgba(255,255,255,0.12)" : k.variant === "mint" ? "rgba(78,205,196,0.15)" : "rgba(255,107,157,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{k.icon}</div>
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.03em", color: k.variant === "dark" ? "#fff" : "var(--text-primary)", lineHeight: 1.2 }}>{k.value}</div>
                </div>
              ))}
            </div>
          )}

          {showSupplierForm && (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
              <div className="erp-card animate-fade-in" style={{ width: "100%", maxWidth: 700, margin: 20, maxHeight: "90vh", overflowY: "auto", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
                <div className="erp-card-header" style={{ position: "sticky", top: 0, background: "#fff", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 className="erp-card-title" style={{ fontSize: 20 }}>Registrasi Supplier Baru</h3>
                  <button type="button" onClick={() => setShowSupplierForm(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
                </div>
                <div className="erp-card-body" style={{ padding: 24 }}>
                  <form onSubmit={submitSupplier}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                      {[
                        { key: "companyName", label: "Nama Perusahaan", placeholder: "PT Contoh Jaya" },
                        { key: "picName", label: "Nama PIC", placeholder: "Budi Santoso" },
                        { key: "phone", label: "Telepon", placeholder: "021-xxxxxxx" },
                        { key: "email", label: "Email", placeholder: "pic@perusahaan.com" },
                        { key: "taxNumber", label: "NPWP", placeholder: "xx.xxx.xxx.x-xxx.xxx" },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="form-label">{f.label}</label>
                          <input className="form-input" value={(supplierForm as any)[f.key]} onChange={e => setSupplierForm({ ...supplierForm, [f.key]: e.target.value })} placeholder={f.placeholder} required />
                        </div>
                      ))}
                      <div style={{ gridColumn: "span 2" }}>
                        <label className="form-label">Alamat</label>
                        <textarea className="form-input" rows={2} value={supplierForm.address} onChange={e => setSupplierForm({ ...supplierForm, address: e.target.value })} placeholder="Jl. Contoh No. 1, Kota, Provinsi" style={{ height: "auto" }} required />
                      </div>
                    </div>
                    <div style={{ paddingTop: 20, borderTop: "1px solid var(--border-light)", display: "flex", gap: 12, justifyContent: "flex-end" }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowSupplierForm(false)}>Batal</button>
                      <button type="submit" className="btn btn-primary" style={{ padding: "0 24px" }}>💾 Simpan Supplier</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          <div className="erp-card">
            <div className="erp-card-header">
              <span className="erp-card-title">Daftar Supplier</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="erp-table">
                <thead>
                  <tr><th>Nama Perusahaan</th><th>PIC</th><th>Kontak</th><th>Rating</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {suppliers.map((s: any) => (
                    <tr key={s.id}>
                      <td><div style={{ fontWeight: 600 }}>{s.companyName}</div></td>
                      <td style={{ fontWeight: 500 }}>{s.picName}</td>
                      <td style={{ color: "var(--text-secondary)" }}>{s.phone}</td>
                      <td>★ {s.rating?.toFixed(1) || "—"}</td>
                      <td><span className={`badge ${statusBadge(s.status)}`}>{statusLabel(s.status)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB: PENJUALAN */}
      {activeTab === "penjualan" && (
        <>
          {showSalesForm && (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
              <div className="erp-card animate-fade-in" style={{ width: "100%", maxWidth: 680, margin: 20, maxHeight: "90vh", overflowY: "auto", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
                <div className="erp-card-header" style={{ position: "sticky", top: 0, background: "#fff", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 className="erp-card-title" style={{ fontSize: 20 }}>Buat Sales Order Baru</h3>
                  <button type="button" onClick={() => setShowSalesForm(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
                </div>
                <div className="erp-card-body" style={{ padding: 24 }}>
                  <form onSubmit={submitSales}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                      <div className="form-group" style={{ gridColumn: "span 2", marginBottom: 0 }}>
                        <label className="form-label">Nama Pembeli (Customer)</label>
                        <input className="form-input" value={salesForm.customerName} onChange={e => setSalesForm({ ...salesForm, customerName: e.target.value })} required placeholder="PT Pembeli Kertas" />
                      </div>
                      <div className="form-group" style={{ gridColumn: "span 2", marginBottom: 0 }}>
                        <label className="form-label">Nama Barang</label>
                        <input className="form-input" value={salesForm.itemName} onChange={e => setSalesForm({ ...salesForm, itemName: e.target.value })} required />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Jumlah</label>
                        <input className="form-input" type="number" step="0.01" value={salesForm.quantity} onChange={e => setSalesForm({ ...salesForm, quantity: e.target.value })} required placeholder="10" />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Satuan</label>
                        <select className="form-input" value={salesForm.unit} onChange={e => setSalesForm({ ...salesForm, unit: e.target.value })}>
                          <option value="ton">Ton</option>
                          <option value="kg">Kg</option>
                          <option value="pcs">Pcs</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Harga Satuan (Rp)</label>
                        <input className="form-input" type="number" value={salesForm.unitPrice} onChange={e => setSalesForm({ ...salesForm, unitPrice: e.target.value })} required placeholder="3000000" />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Catatan</label>
                        <input className="form-input" value={salesForm.notes} onChange={e => setSalesForm({ ...salesForm, notes: e.target.value })} placeholder="Catatan tambahan..." />
                      </div>
                    </div>
                    
                    {parseFloat(salesForm.quantity) > 0 && parseFloat(salesForm.unitPrice) > 0 && (
                      <div style={{ background: "var(--kpi-mint-bg)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>Total Nilai Penjualan</span>
                        <span style={{ fontSize: 18, fontWeight: 700, color: "var(--color-teal)" }}>{fmtRp(parseFloat(salesForm.quantity) * parseFloat(salesForm.unitPrice))}</span>
                      </div>
                    )}

                    <div style={{ paddingTop: 20, borderTop: "1px solid var(--border-light)", display: "flex", gap: 12, justifyContent: "flex-end" }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowSalesForm(false)}>Batal</button>
                      <button type="submit" className="btn btn-primary" style={{ padding: "0 24px" }}>💾 Buat Sales Order</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          <div className="erp-card">
            <div className="erp-card-header">
              <span className="erp-card-title">Daftar Sales Order (Penjualan)</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>No. SO</th>
                    <th>Customer</th>
                    <th>Barang</th>
                    <th>Qty</th>
                    <th>Total Harga</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {salesOrders.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Belum ada sales order</td></tr>
                  ) : salesOrders.map((so: any) => (
                    <tr key={so.id}>
                      <td style={{ fontFamily: "monospace", color: "var(--color-purple)", fontWeight: 600 }}>{so.orderNumber}</td>
                      <td style={{ fontWeight: 500 }}>{so.customerName}</td>
                      <td>{so.itemName}</td>
                      <td style={{ color: "var(--text-secondary)" }}>{so.quantity} {so.unit}</td>
                      <td style={{ fontWeight: 700, color: "var(--color-teal)" }}>{fmtRp(so.totalAmount)}</td>
                      <td><span className={`badge ${salesStatusBadge[so.status]}`}>{salesStatusLabel[so.status]}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          {so.status === "PENDING" && (
                            <button onClick={() => updateSalesStatus(so.id, "APPROVED")} className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: 12 }}>Setujui</button>
                          )}
                          {so.status === "APPROVED" && (
                            <button onClick={() => updateSalesStatus(so.id, "SHIPPED")} className="btn btn-primary" style={{ padding: "4px 8px", fontSize: 12 }}>Kirim & Kurangi Stok</button>
                          )}
                          {so.status === "PENDING" && (
                            <button onClick={() => deleteSalesOrder(so.id)} style={{ padding: "4px 8px", fontSize: 12, border: "1px solid red", color: "red", background: "none", borderRadius: 6, cursor: "pointer" }}>Hapus</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
