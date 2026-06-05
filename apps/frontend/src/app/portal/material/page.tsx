"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRefresh } from "@/lib/refresh-context";
import { Package, Plus, Save, Trash2, Edit2, Search, AlertTriangle, Boxes, TrendingUp, Tags } from "lucide-react";

const fmt = (n: number) => new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n || 0);

export default function MaterialPage() {
  const [items, setItems] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", category: "", stock: "0", unit: "kg",
    lowStockThreshold: "0", supplierId: "", notes: ""
  });
  const [adjustModal, setAdjustModal] = useState<{ id: string; name: string; stock: number; unit: string } | null>(null);
  const [adjustDelta, setAdjustDelta] = useState("");
  const [adjustNote, setAdjustNote] = useState("");
  const { triggerRefresh } = useRefresh();

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterLowStock) params.set("lowStock", "true");
    try {
      const [m, d, s] = await Promise.all([
        api.get(`/materials?${params}`),
        api.get("/materials/dashboard"),
        api.get("/suppliers?status=ACTIVE"),
      ]);
      setItems(m.data);
      setDashboard(d.data);
      setSuppliers(s.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [search, filterLowStock]);

  const openForm = (m?: any) => {
    if (m) {
      setEditId(m.id);
      setForm({
        name: m.name, category: m.category || "", stock: m.stock.toString(),
        unit: m.unit, lowStockThreshold: m.lowStockThreshold.toString(),
        supplierId: m.supplierId || "", notes: m.notes || ""
      });
    } else {
      setEditId(null);
      setForm({ name: "", category: "", stock: "0", unit: "kg", lowStockThreshold: "0", supplierId: "", notes: "" });
    }
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      category: form.category || null,
      stock: parseFloat(form.stock) || 0,
      unit: form.unit,
      lowStockThreshold: parseFloat(form.lowStockThreshold) || 0,
      supplierId: form.supplierId || null,
      notes: form.notes || null,
    };
    try {
      if (editId) {
        await api.put(`/materials/${editId}`, payload);
      } else {
        await api.post("/materials", payload);
      }
      setShowForm(false);
      load();
      triggerRefresh();
    } catch (e: any) {
      alert("Gagal menyimpan material: " + (e.response?.data?.message || e.message));
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus material ini?")) return;
    try {
      await api.delete(`/materials/${id}`);
      load();
      triggerRefresh();
    } catch (e: any) {
      alert("Gagal menghapus: " + (e.response?.data?.message || e.message));
    }
  };

  const submitAdjust = async () => {
    if (!adjustModal) return;
    const delta = parseFloat(adjustDelta);
    if (isNaN(delta) || delta === 0) {
      alert("Masukkan nilai perubahan stok (positif untuk tambah, negatif untuk kurangi)");
      return;
    }
    try {
      await api.post(`/materials/${adjustModal.id}/adjust`, { delta });
      setAdjustModal(null);
      setAdjustDelta("");
      setAdjustNote("");
      load();
      triggerRefresh();
    } catch (e: any) {
      alert("Gagal menyesuaikan stok: " + (e.response?.data?.message || e.message));
    }
  };

  const filtered = items.filter(m => filterCategory === "all" || m.category === filterCategory);

  const categories = dashboard?.categories || [];
  const kpis = dashboard ? [
    { label: "Total Material", value: fmt(dashboard.total), Icon: Package, variant: "dark" },
    { label: "Total Stok", value: fmt(dashboard.totalStock), Icon: Boxes, variant: "mint" },
    { label: "Stok Menipis", value: fmt(dashboard.lowStock), Icon: AlertTriangle, variant: "pink" },
    { label: "Kategori", value: fmt(categories.length), Icon: Tags, variant: "neutral" },
  ] : [];

  const variantBg: any = {
    dark: "var(--kpi-dark)", mint: "var(--kpi-mint-bg)",
    pink: "var(--kpi-pink-bg)", neutral: "var(--kpi-neutral-bg)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="page-header-responsive" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Manajemen Material</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Kelola stok material baku (Kardus, Kertas Bekas) dari supplier</p>
        </div>
        <button className="btn btn-primary" onClick={() => openForm()}>
          <Plus size={16} /> Tambah Material
        </button>
      </div>

      {dashboard && (
        <div className="rg-4">
          {kpis.map((k, i) => (
            <div key={i} className="kpi-card" style={{ background: variantBg[k.variant], borderColor: undefined }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>{k.label}</span>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(124,111,224,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>
                  <k.Icon size={18} strokeWidth={2} />
                </div>
              </div>
              <div style={{ fontSize: "1.65rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)", lineHeight: 1.15 }}>{k.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="page-header-responsive" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau kategori..."
            style={{ width: "100%", padding: "10px 12px 10px 36px", border: "1px solid var(--border-medium)", borderRadius: 10, fontSize: 13, color: "var(--text-primary)", background: "var(--bg-card)", outline: "none" }}
          />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="form-input" style={{ minWidth: 160, padding: "10px 12px" }}>
          <option value="all">Semua Kategori</option>
          {categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer", padding: "8px 14px", border: "1px solid var(--border-medium)", borderRadius: 10, background: filterLowStock ? "var(--kpi-pink-bg)" : "var(--bg-card)" }}>
          <input type="checkbox" checked={filterLowStock} onChange={e => setFilterLowStock(e.target.checked)} style={{ accentColor: "var(--color-pink)" }} />
          <AlertTriangle size={14} color={filterLowStock ? "var(--color-pink)" : "var(--text-muted)"} />
          Stok Menipis
        </label>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #EDE9FF", borderTop: "3px solid #7C6FE0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="erp-card" style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
          <Package size={48} style={{ opacity: 0.3, margin: "0 auto 12px" }} />
          <div style={{ fontSize: 15, fontWeight: 600 }}>Belum ada material</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Tambah material untuk mulai mengelola stok</div>
        </div>
      ) : (
        <div className="rg-3">
          {filtered.map((m: any) => {
            const low = m.lowStockThreshold > 0 && m.stock <= m.lowStockThreshold;
            return (
              <div key={m.id} className="erp-card" style={{ padding: 16, background: "var(--bg-card)", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: low ? "var(--kpi-pink-bg)" : "var(--kpi-mint-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Package size={20} color={low ? "var(--color-pink)" : "var(--color-teal)"} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{m.category || "Tanpa kategori"} • {m.supplier?.companyName || "Internal"}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => openForm(m)} title="Edit" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => remove(m.id)} title="Hapus" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-red)", padding: 4 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "baseline", gap: 6, padding: "8px 0", borderTop: "1px solid var(--border-light)", borderBottom: "1px solid var(--border-light)" }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: low ? "var(--color-pink)" : "var(--text-primary)", letterSpacing: "-0.02em" }}>{fmt(m.stock)}</span>
                  <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>{m.unit}</span>
                  {low && (
                    <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "var(--color-pink)", background: "var(--kpi-pink-bg)", padding: "2px 8px", borderRadius: 6 }}>
                      <AlertTriangle size={11} /> Stok Menipis
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "var(--text-muted)" }}>
                  <span>Min: {fmt(m.lowStockThreshold)} {m.unit}</span>
                  <button
                    onClick={() => { setAdjustModal({ id: m.id, name: m.name, stock: m.stock, unit: m.unit }); setAdjustDelta(""); }}
                    style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 6, border: "1px solid var(--color-teal)", color: "var(--color-teal)", background: "transparent", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    <TrendingUp size={12} /> Adjust
                  </button>
                </div>
                {m.notes && <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>📝 {m.notes}</div>}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div className="erp-card animate-fade-in" style={{ width: "100%", maxWidth: 580, margin: 20, maxHeight: "90vh", overflowY: "auto", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div className="erp-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="erp-card-title" style={{ fontSize: 18 }}>{editId ? "Edit Material" : "Tambah Material Baru"}</h3>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
            </div>
            <div className="erp-card-body" style={{ padding: 24 }}>
              <form onSubmit={submit}>
                <div className="modal-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div style={{ gridColumn: "span 2" }}>
                    <label className="form-label">Nama Material *</label>
                    <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Cth: Kardus (OCC)" required />
                  </div>
                  <div>
                    <label className="form-label">Kategori</label>
                    <input className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Cth: Kardus, Kertas" list="cat-list" />
                    <datalist id="cat-list">
                      {categories.map((c: string) => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="form-label">Supplier</label>
                    <select className="form-input" value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })}>
                      <option value="">-- Internal --</option>
                      {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.companyName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Stok Awal</label>
                    <input className="form-input" type="number" step="0.01" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="0" />
                  </div>
                  <div>
                    <label className="form-label">Satuan</label>
                    <select className="form-input" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                      <option value="kg">kg</option>
                      <option value="ton">ton</option>
                      <option value="pcs">pcs</option>
                      <option value="liter">liter</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Batas Stok Minimum</label>
                    <input className="form-input" type="number" step="0.01" value={form.lowStockThreshold} onChange={e => setForm({ ...form, lowStockThreshold: e.target.value })} placeholder="0" />
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label className="form-label">Catatan</label>
                    <input className="form-input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Catatan tambahan..." />
                  </div>
                </div>
                <div style={{ paddingTop: 20, borderTop: "1px solid var(--border-light)", display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary"><Save size={16} /> Simpan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {adjustModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div className="erp-card animate-fade-in" style={{ width: "100%", maxWidth: 420, margin: 20, border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div className="erp-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="erp-card-title" style={{ fontSize: 16 }}>Sesuaikan Stok</h3>
              <button type="button" onClick={() => setAdjustModal(null)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
            </div>
            <div className="erp-card-body" style={{ padding: 24 }}>
              <div style={{ marginBottom: 16, padding: "12px 16px", background: "var(--bg-secondary)", borderRadius: 10 }}>
                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{adjustModal.name}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginTop: 4 }}>
                  {fmt(adjustModal.stock)} <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{adjustModal.unit}</span>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Perubahan Stok (positif = tambah, negatif = kurangi)</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.01"
                  value={adjustDelta}
                  onChange={e => setAdjustDelta(e.target.value)}
                  placeholder="Cth: 100 atau -50"
                  autoFocus
                />
              </div>
              <div style={{ paddingTop: 16, borderTop: "1px solid var(--border-light)", display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setAdjustModal(null)}>Batal</button>
                <button type="button" className="btn btn-primary" onClick={submitAdjust}><Save size={16} /> Terapkan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
