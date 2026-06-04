"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRefresh } from "@/lib/refresh-context";
import { Building2, CheckCircle2, Ban, Users, Package } from "lucide-react";

const fmtRp = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function PurchasePage() {
  const [activeTab, setActiveTab] = useState("supplier"); // 'supplier' | 'penjualan' | 'customer'
  
  // Supplier State
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ companyName: "", picName: "", phone: "", email: "", address: "", taxNumber: "" });

  // Customer State
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerForm, setCustomerForm] = useState({ companyName: "", picName: "", phone: "", email: "", address: "", taxNumber: "" });

  // Penjualan State
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [showSalesForm, setShowSalesForm] = useState(false);
  const [salesForm, setSalesForm] = useState({ customerId: "", itemName: "Kardus Bekas (OCC)", quantity: "", unit: "ton", unitPrice: "", notes: "" });

  const { triggerRefresh } = useRefresh();

  // Load Data
  const loadSuppliers = () => {
    api.get("/suppliers").then(r => setSuppliers(r.data)).finally(() => setLoadingSuppliers(false));
  };
  const loadCustomers = () => {
    api.get("/customers").then(r => setCustomers(r.data)).finally(() => setLoadingCustomers(false));
  };
  const loadSales = () => {
    api.get("/penjualan").then(r => setSalesOrders(r.data)).finally(() => setLoadingSales(false));
  };

  useEffect(() => {
    if (activeTab === "supplier") loadSuppliers();
    else if (activeTab === "customer") loadCustomers();
    else {
      loadSales();
      loadCustomers(); // Load customers for dropdown
    }
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

  const updateSupplierStatus = async (id: string, status: string) => {
    try {
      await api.put(`/suppliers/${id}/status`, { status });
      loadSuppliers();
      triggerRefresh();
    } catch (e: any) {
      alert(e.response?.data?.message || "Error updating status");
    }
  };

  const deleteSupplier = async (id: string) => {
    if (!confirm("Hapus supplier ini? (Akan gagal jika masih ada data PO/Timbangan terkait)")) return;
    try {
      await api.delete(`/suppliers/${id}`);
      loadSuppliers();
      triggerRefresh();
    } catch (e: any) {
      alert("Gagal menghapus supplier. Pastikan tidak ada data yang terkait dengan supplier ini.");
    }
  };

  // Actions Customer
  const submitCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/customers", customerForm);
    setShowCustomerForm(false);
    setCustomerForm({ companyName: "", picName: "", phone: "", email: "", address: "", taxNumber: "" });
    loadCustomers();
    triggerRefresh();
  };

  const updateCustomerStatus = async (id: string, status: string) => {
    try {
      await api.put(`/customers/${id}/status`, { status });
      loadCustomers();
      triggerRefresh();
    } catch (e: any) {
      alert(e.response?.data?.message || "Error updating status");
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!confirm("Hapus customer ini? (Akan gagal jika masih ada data SO terkait)")) return;
    try {
      await api.delete(`/customers/${id}`);
      loadCustomers();
      triggerRefresh();
    } catch (e: any) {
      alert("Gagal menghapus customer. Pastikan tidak ada data yang terkait dengan customer ini.");
    }
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
    setSalesForm({ customerId: "", itemName: "Kardus Bekas (OCC)", quantity: "", unit: "ton", unitPrice: "", notes: "" });
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
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Manajemen Supplier, Customer & Penjualan Barang</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {activeTab === "supplier" && <button className="btn btn-primary" onClick={() => setShowSupplierForm(true)}>+ Tambah Supplier</button>}
          {activeTab === "customer" && <button className="btn btn-primary" onClick={() => setShowCustomerForm(true)}>+ Tambah Customer</button>}
          {activeTab === "penjualan" && <button className="btn btn-primary" onClick={() => setShowSalesForm(true)}>+ Buat Sales Order</button>}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border-light)", paddingBottom: 16 }}>
        <button
          onClick={() => setActiveTab("supplier")}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer",
            background: activeTab === "supplier" ? "var(--color-purple)" : "transparent",
            color: activeTab === "supplier" ? "#fff" : "var(--text-secondary)"
          }}
        >
          <Building2 size={16} /> Manajemen Supplier
        </button>
        <button
          onClick={() => setActiveTab("customer")}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer",
            background: activeTab === "customer" ? "var(--color-purple)" : "transparent",
            color: activeTab === "customer" ? "#fff" : "var(--text-secondary)"
          }}
        >
          <Users size={16} /> Manajemen Customer
        </button>
        <button
          onClick={() => setActiveTab("penjualan")}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer",
            background: activeTab === "penjualan" ? "var(--color-purple)" : "transparent",
            color: activeTab === "penjualan" ? "#fff" : "var(--text-secondary)"
          }}
        >
          <Package size={16} /> Manajemen Penjualan
        </button>
      </div>

      {/* TAB: SUPPLIER */}
      {activeTab === "supplier" && (
        <>
          {!loadingSuppliers && suppliers.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {[
                { label: "Total Supplier", value: suppliers.length, Icon: Building2, variant: "dark" },
                { label: "Supplier Aktif", value: suppliers.filter(s => s.status === "ACTIVE").length, Icon: CheckCircle2, variant: "mint" },
                { label: "Diblokir", value: suppliers.filter(s => s.status === "BLACKLISTED").length, Icon: Ban, variant: "pink" },
              ].map((k, i) => (
                <div key={i} className="kpi-card" style={{ background: ({ dark: "var(--kpi-dark)", mint: "var(--kpi-mint-bg)", pink: "var(--kpi-pink-bg)" } as any)[k.variant], borderColor: k.variant === "dark" ? "transparent" : undefined }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: k.variant === "dark" ? "rgba(255,255,255,0.6)" : "var(--text-secondary)" }}>{k.label}</span>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: k.variant === "dark" ? "rgba(255,255,255,0.12)" : k.variant === "mint" ? "rgba(78,205,196,0.15)" : "rgba(255,107,157,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: k.variant === "dark" ? "#fff" : "var(--color-primary)" }}>{k.Icon && <k.Icon size={18} strokeWidth={2} />}</div>
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
                  <tr><th>Nama Perusahaan</th><th>PIC</th><th>Kontak</th><th>Rating</th><th>Status</th><th>Aksi</th></tr>
                </thead>
                <tbody>
                  {suppliers.map((s: any) => (
                    <tr key={s.id}>
                      <td><div style={{ fontWeight: 600 }}>{s.companyName}</div></td>
                      <td style={{ fontWeight: 500 }}>{s.picName}</td>
                      <td style={{ color: "var(--text-secondary)" }}>{s.phone}</td>
                      <td>★ {s.rating?.toFixed(1) || "—"}</td>
                      <td><span className={`badge ${statusBadge(s.status)}`}>{statusLabel(s.status)}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          {s.status === "ACTIVE" ? (
                            <button onClick={() => updateSupplierStatus(s.id, "INACTIVE")} className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: 12 }}>Nonaktifkan</button>
                          ) : (
                            <button onClick={() => updateSupplierStatus(s.id, "ACTIVE")} className="btn btn-primary" style={{ padding: "4px 8px", fontSize: 12 }}>Aktifkan</button>
                          )}
                          <button onClick={() => deleteSupplier(s.id)} style={{ padding: "4px 8px", fontSize: 12, border: "1px solid red", color: "red", background: "none", borderRadius: 6, cursor: "pointer" }}>Hapus</button>
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

      {/* TAB: CUSTOMER */}
      {activeTab === "customer" && (
        <>
          {showCustomerForm && (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
              <div className="erp-card animate-fade-in" style={{ width: "100%", maxWidth: 700, margin: 20, maxHeight: "90vh", overflowY: "auto", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
                <div className="erp-card-header" style={{ position: "sticky", top: 0, background: "#fff", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 className="erp-card-title" style={{ fontSize: 20 }}>Registrasi Customer Baru</h3>
                  <button type="button" onClick={() => setShowCustomerForm(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
                </div>
                <div className="erp-card-body" style={{ padding: 24 }}>
                  <form onSubmit={submitCustomer}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                      {[
                        { key: "companyName", label: "Nama Perusahaan (Customer)", placeholder: "PT Contoh Pembeli" },
                        { key: "picName", label: "Nama PIC", placeholder: "Budi Santoso" },
                        { key: "phone", label: "Telepon", placeholder: "021-xxxxxxx" },
                        { key: "email", label: "Email", placeholder: "pic@perusahaan.com" },
                        { key: "taxNumber", label: "NPWP", placeholder: "xx.xxx.xxx.x-xxx.xxx" },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="form-label">{f.label}</label>
                          <input className="form-input" value={(customerForm as any)[f.key]} onChange={e => setCustomerForm({ ...customerForm, [f.key]: e.target.value })} placeholder={f.placeholder} required />
                        </div>
                      ))}
                      <div style={{ gridColumn: "span 2" }}>
                        <label className="form-label">Alamat</label>
                        <textarea className="form-input" rows={2} value={customerForm.address} onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })} placeholder="Jl. Contoh No. 1, Kota, Provinsi" style={{ height: "auto" }} required />
                      </div>
                    </div>
                    <div style={{ paddingTop: 20, borderTop: "1px solid var(--border-light)", display: "flex", gap: 12, justifyContent: "flex-end" }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowCustomerForm(false)}>Batal</button>
                      <button type="submit" className="btn btn-primary" style={{ padding: "0 24px" }}>💾 Simpan Customer</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          <div className="erp-card">
            <div className="erp-card-header">
              <span className="erp-card-title">Daftar Customer Pembeli</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="erp-table">
                <thead>
                  <tr><th>Nama Perusahaan</th><th>PIC</th><th>Kontak</th><th>Status</th><th>Aksi</th></tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Belum ada data customer</td></tr>
                  ) : customers.map((c: any) => (
                    <tr key={c.id}>
                      <td><div style={{ fontWeight: 600 }}>{c.companyName}</div></td>
                      <td style={{ fontWeight: 500 }}>{c.picName}</td>
                      <td style={{ color: "var(--text-secondary)" }}>{c.phone}</td>
                      <td><span className={`badge ${statusBadge(c.status)}`}>{statusLabel(c.status)}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          {c.status === "ACTIVE" ? (
                            <button onClick={() => updateCustomerStatus(c.id, "INACTIVE")} className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: 12 }}>Nonaktifkan</button>
                          ) : (
                            <button onClick={() => updateCustomerStatus(c.id, "ACTIVE")} className="btn btn-primary" style={{ padding: "4px 8px", fontSize: 12 }}>Aktifkan</button>
                          )}
                          <button onClick={() => deleteCustomer(c.id)} style={{ padding: "4px 8px", fontSize: 12, border: "1px solid red", color: "red", background: "none", borderRadius: 6, cursor: "pointer" }}>Hapus</button>
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
                        <select className="form-input" value={salesForm.customerId} onChange={e => setSalesForm({ ...salesForm, customerId: e.target.value })} required>
                          <option value="">-- Pilih Customer --</option>
                          {customers.filter(c => c.status === "ACTIVE").map(c => (
                            <option key={c.id} value={c.id}>{c.companyName}</option>
                          ))}
                        </select>
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
                      <td style={{ fontWeight: 500 }}>{so.customer?.companyName || "N/A"}</td>
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

