"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function PurchasePage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ companyName: "", picName: "", phone: "", email: "", address: "", taxNumber: "" });

  const load = () => {
    api.get("/suppliers").then(r => setSuppliers(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/suppliers", form);
    setShowForm(false);
    setForm({ companyName: "", picName: "", phone: "", email: "", address: "", taxNumber: "" });
    load();
  };

  const statusBadge = (s: string) => ({ ACTIVE: "badge-success", INACTIVE: "badge-neutral", BLACKLISTED: "badge-danger" }[s] || "badge-neutral");
  const statusLabel = (s: string) => ({ ACTIVE: "Aktif", INACTIVE: "Nonaktif", BLACKLISTED: "Diblokir" }[s] || s);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Manajemen Supplier</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Database supplier & histori pembelian OCC</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Tutup" : "+ Tambah Supplier"}
        </button>
      </div>

      {/* Stats summary row */}
      {!loading && suppliers.length > 0 && (
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

      {/* Add Supplier Form */}
      {showForm && (
        <div className="erp-card animate-fade-in">
          <div className="erp-card-header">
            <h3 className="erp-card-title">Registrasi Supplier Baru</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>✕</button>
          </div>
          <div className="erp-card-body">
            <form onSubmit={submit}>
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
                    <input className="form-input" value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} />
                  </div>
                ))}
                <div style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Alamat</label>
                  <textarea className="form-input" rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Jl. Contoh No. 1, Kota, Provinsi" style={{ height: "auto" }} />
                </div>
              </div>
              <div style={{ paddingTop: 16, borderTop: "1px solid var(--border-light)", display: "flex", gap: 8 }}>
                <button type="submit" className="btn btn-primary">💾 Simpan Supplier</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #EDE9FF", borderTop: "3px solid #7C6FE0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : (
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Daftar Supplier</span>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{suppliers.length} supplier terdaftar</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Nama Perusahaan</th>
                  <th>PIC</th>
                  <th>Kontak</th>
                  <th>Rating</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Belum ada supplier terdaftar</td></tr>
                ) : suppliers.map((s: any) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{s.companyName}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{s.email}</div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{s.picName}</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{s.phone}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ color: "#FBBF24", fontSize: 14 }}>★</span>
                        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{s.rating?.toFixed(1) || "—"}</span>
                      </div>
                    </td>
                    <td><span className={`badge ${statusBadge(s.status)}`}>{statusLabel(s.status)}</span></td>
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
