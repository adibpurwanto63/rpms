"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRefresh } from "@/lib/refresh-context";
import { ArrowDownToLine, ArrowUpFromLine, Package, BarChart2, Factory, Save, Trash2, Edit2, Plus, PlusCircle } from "lucide-react";

const machineStatusColor: any = { RUNNING: "badge-success", IDLE: "badge-neutral", MAINTENANCE: "badge-warning", BREAKDOWN: "badge-danger" };
const machineStatusLabel: any = { RUNNING: "Berjalan", IDLE: "Standby", MAINTENANCE: "Maintenance", BREAKDOWN: "Rusak" };

export default function ProductionPage() {
  const [machines, setMachines] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ machineId: "", materialId: "", inputWeight: "", outputWeight: "", baleCount: "", runtimeMinutes: "", downtimeMinutes: "0" });

  const [showMachineForm, setShowMachineForm] = useState(false);
  const [editMachineId, setEditMachineId] = useState<string | null>(null);
  const [machineForm, setMachineForm] = useState({ name: "", type: "HORIZONTAL_BALER", location: "" });

  const [materials, setMaterials] = useState<any[]>([]);
  const [materialFilter, setMaterialFilter] = useState("");

  const { triggerRefresh, refreshKey } = useRefresh();

  const load = async () => {
    setLoading(true);
    try {
      const m = await api.get("/production/machines");
      setMachines(m.data);
    } catch (e) { console.error("Error loading machines", e); }
    
    try {
      const r = await api.get("/production");
      setRecords(r.data);
    } catch (e) { console.error("Error loading records", e); }
    
    try {
      const s = await api.get("/production/stats/today");
      setStats(s.data);
    } catch (e) { console.error("Error loading stats", e); }
    
    try {
      const m = await api.get("/materials");
      setMaterials(m.data);
    } catch (e) { console.error("Error loading materials", e); }
    
    setLoading(false);
  };
  useEffect(() => { load(); }, [refreshKey]);

  const updateMachineStatus = async (id: string, status: string) => {
    try {
      await api.put(`/production/machines/${id}/status`, { status });
      load();
      triggerRefresh();
    } catch (e: any) {
      alert("Gagal mengubah status: " + (e.response?.data?.message || e.message));
    }
  };

  const openMachineForm = (m?: any) => {
    if (m) {
      setEditMachineId(m.id);
      setMachineForm({ name: m.name, type: m.type, location: m.location || "" });
    } else {
      setEditMachineId(null);
      setMachineForm({ name: "", type: "HORIZONTAL_BALER", location: "" });
    }
    setShowMachineForm(true);
  };

  const submitMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMachineId) {
        await api.put(`/production/machines/${editMachineId}`, machineForm);
      } else {
        await api.post("/production/machines", machineForm);
      }
      setShowMachineForm(false);
      load();
      triggerRefresh();
    } catch (e: any) {
      alert("Gagal menyimpan mesin: " + (e.response?.data?.message || e.message));
    }
  };

  const deleteMachine = async (id: string) => {
    if (!confirm("Hapus mesin ini? Semua data produksi terkait juga akan terhapus.")) return;
    try {
      await api.delete(`/production/machines/${id}`);
      load();
      triggerRefresh();
    } catch (e: any) {
      alert("Gagal menghapus mesin: " + (e.response?.data?.message || e.message));
    }
  };

  const openForm = (r?: any) => {
    if (r) {
      setEditId(r.id);
      setForm({
        machineId: r.machineId,
        materialId: r.materialId || "",
        inputWeight: r.inputWeight.toString(),
        outputWeight: r.outputWeight.toString(),
        baleCount: r.baleCount.toString(),
        runtimeMinutes: r.runtimeMinutes.toString(),
        downtimeMinutes: r.downtimeMinutes.toString()
      });
    } else {
      setEditId(null);
      setForm({ machineId: "", materialId: "", inputWeight: "", outputWeight: "", baleCount: "", runtimeMinutes: "", downtimeMinutes: "0" });
    }
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { 
      machineId: form.machineId,
      materialId: form.materialId || null,
      inputWeight: parseFloat(form.inputWeight), 
      outputWeight: parseFloat(form.outputWeight), 
      baleCount: parseInt(form.baleCount), 
      runtimeMinutes: parseInt(form.runtimeMinutes), 
      downtimeMinutes: parseInt(form.downtimeMinutes) 
    };

    try {
      if (editId) {
        await api.put(`/production/${editId}`, payload);
      } else {
        await api.post("/production", payload);
      }
      setShowForm(false);
      load();
      triggerRefresh();
    } catch (e: any) {
      alert("Gagal menyimpan data: " + (e.response?.data?.message || e.message));
    }
  };

  const deleteRecord = async (id: string) => {
    if (!confirm("Hapus data produksi ini?")) return;
    await api.delete(`/production/${id}`);
    load();
    triggerRefresh();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page Header */}
      <div className="page-header-responsive" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Monitoring Produksi</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Status mesin, performa OEE, dan catatan produksi baling</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-secondary" onClick={() => openMachineForm()}>
            <PlusCircle size={16} /> Tambah Mesin
          </button>
          <button className="btn btn-primary" onClick={() => openForm()}>
            + Input Produksi
          </button>
        </div>
      </div>

      {/* Machine Cards */}
      <div className="rg-auto">
        {machines.map((m: any) => (
          <div key={m.id} className="erp-card" style={{ padding: "16px", background: "var(--bg-card)", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Factory size={24} color="var(--color-primary)" />
                <div>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "1rem" }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{m.location}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <select 
                  className={`badge ${machineStatusColor[m.status]}`}
                  style={{ border: "none", outline: "none", cursor: "pointer", fontWeight: 600 }}
                  value={m.status}
                  onChange={(e) => updateMachineStatus(m.id, e.target.value)}
                >
                  {Object.keys(machineStatusLabel).map(k => (
                    <option key={k} value={k}>{machineStatusLabel[k]}</option>
                  ))}
                </select>
                <button onClick={() => openMachineForm(m)} title="Edit Mesin" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 2 }}>
                  <Edit2 size={14} />
                </button>
                <button onClick={() => deleteMachine(m.id)} title="Hapus Mesin" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-red)", padding: 2 }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Machine Form Modal */}
      {showMachineForm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div className="erp-card animate-fade-in" style={{ width: "100%", maxWidth: 500, margin: 20, border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div className="erp-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="erp-card-title" style={{ fontSize: 18 }}>{editMachineId ? "Edit Mesin" : "Tambah Mesin Baru"}</h3>
              <button type="button" onClick={() => setShowMachineForm(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
            </div>
            <div className="erp-card-body" style={{ padding: 24 }}>
              <form onSubmit={submitMachine}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label className="form-label">Nama Mesin</label>
                    <input className="form-input" value={machineForm.name} onChange={e => setMachineForm({ ...machineForm, name: e.target.value })} placeholder="Cth: Baler #1" required />
                  </div>
                  <div>
                    <label className="form-label">Tipe Mesin</label>
                    <select className="form-input" value={machineForm.type} onChange={e => setMachineForm({ ...machineForm, type: e.target.value })}>
                      <option value="HORIZONTAL_BALER">Horizontal Baler</option>
                      <option value="CONVEYOR">Conveyor</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Lokasi</label>
                    <input className="form-input" value={machineForm.location} onChange={e => setMachineForm({ ...machineForm, location: e.target.value })} placeholder="Cth: Gedung A, Lantai 1" />
                  </div>
                </div>
                <div style={{ paddingTop: 20, borderTop: "1px solid var(--border-light)", display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowMachineForm(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary"><Save size={16} /> Simpan Mesin</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Today stats summary row */}
      {!loading && stats && (
        <div className="rg-4">
          {[
            { label: "Material", value: `${((stats._sum?.inputWeight || 0) / 1000).toFixed(2)} Ton`, Icon: ArrowDownToLine, variant: "neutral" },
            { label: "Output Produksi", value: `${((stats._sum?.outputWeight || 0) / 1000).toFixed(2)} Ton`, Icon: ArrowUpFromLine, variant: "mint" },
            { label: "Bale Selesai", value: stats._sum?.baleCount || 0, Icon: Package, variant: "dark" },
            { label: "Rata-Rata OEE", value: `${(stats._avg?.oee || 0).toFixed(1)}%`, Icon: BarChart2, variant: "pink" },
          ].map((k, i) => (
            <div key={i} className="kpi-card" style={{ background: ({ dark: "var(--kpi-dark)", mint: "var(--kpi-mint-bg)", pink: "var(--kpi-pink-bg)", neutral: "var(--kpi-neutral-bg)" } as any)[k.variant], borderColor: undefined }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>{k.label}</span>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: k.variant === "mint" ? "rgba(78,205,196,0.15)" : k.variant === "neutral" ? "#EDE9FF" : "rgba(255,107,157,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>{k.Icon && <k.Icon size={18} strokeWidth={2} />}</div>
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)", lineHeight: 1.2 }}>{k.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Record Form Modal */}
      {showForm && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(4px)"
        }}>
          <div className="erp-card animate-fade-in" style={{ width: "100%", maxWidth: 700, margin: 20, maxHeight: "90vh", overflowY: "auto", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div className="erp-card-header" style={{ position: "sticky", top: 0, background: "#fff", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="erp-card-title" style={{ fontSize: 20 }}>{editId ? "Edit Catatan Produksi" : "Catat Hasil Produksi"}</h3>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
            </div>
            <div className="erp-card-body" style={{ padding: 24 }}>
              <form onSubmit={submit}>
                <div className="modal-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div style={{ gridColumn: "span 3" }}>
                    <label className="form-label">Pilih Mesin</label>
                    <select className="form-input" value={form.machineId} onChange={e => setForm({ ...form, machineId: e.target.value })} required>
                      <option value="">-- Pilih Mesin --</option>
                      {machines.map((m: any) => <option key={m.id} value={m.id}>{m.name} ({machineStatusLabel[m.status]})</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: "span 3", padding: "12px 14px", background: "var(--kpi-mint-bg)", borderRadius: 10, border: "1px solid var(--color-teal)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 8, flexWrap: "wrap" }}>
                      <label className="form-label" style={{ marginBottom: 0 }}>Material *</label>
                      <input
                        type="text"
                        placeholder="Cari material..."
                        value={materialFilter}
                        onChange={e => setMaterialFilter(e.target.value)}
                        style={{ padding: "4px 8px", border: "1px solid var(--border-medium)", borderRadius: 6, fontSize: 12, background: "var(--bg-card)", color: "var(--text-primary)", outline: "none", width: 160 }}
                      />
                    </div>
                    <select
                      className="form-input"
                      value={form.materialId}
                      onChange={e => setForm({ ...form, materialId: e.target.value })}
                      required
                    >
                      <option value="">-- Pilih Material (Stok akan otomatis terpotong) --</option>
                      {materials
                        .filter((m: any) => !materialFilter || m.name.toLowerCase().includes(materialFilter.toLowerCase()) || (m.category || "").toLowerCase().includes(materialFilter.toLowerCase()))
                        .map((m: any) => {
                          const low = m.lowStockThreshold > 0 && m.stock <= m.lowStockThreshold;
                          return (
                            <option key={m.id} value={m.id} disabled={m.stock <= 0}>
                              {m.name} — Stok: {m.stock.toLocaleString("id-ID")} {m.unit}{m.category ? ` (${m.category})` : ""}{low ? " ⚠ Stok Menipis" : ""}{m.stock <= 0 ? " ❌ Habis" : ""}
                            </option>
                          );
                        })}
                    </select>
                    {form.materialId && (() => {
                      const m = materials.find((x: any) => x.id === form.materialId);
                      if (!m) return null;
                      return (
                        <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-secondary)" }}>
                          Stok tersedia: <strong style={{ color: m.stock > 0 ? "var(--color-teal)" : "var(--color-pink)" }}>{m.stock.toLocaleString("id-ID")} {m.unit}</strong>
                        </div>
                      );
                    })()}
                  </div>
                  {[
                    { key: "inputWeight", label: "Material (kg)", placeholder: "5000" },
                    { key: "outputWeight", label: "Output Produksi (kg)", placeholder: "4500" },
                    { key: "baleCount", label: "Jumlah Bale", placeholder: "9" },
                    { key: "runtimeMinutes", label: "Waktu Jalan (Menit)", placeholder: "420" },
                    { key: "downtimeMinutes", label: "Waktu Henti (Menit)", placeholder: "0" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="form-label">{f.label}</label>
                      <input className="form-input" type="number" step="any" value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} required />
                    </div>
                  ))}
                </div>
                <div style={{ paddingTop: 20, borderTop: "1px solid var(--border-light)", display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: "8px 24px", display: "flex", alignItems: "center", gap: 6 }}><Save size={16} /> Simpan Catatan</button>
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
            <span className="erp-card-title">Riwayat Produksi</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Mesin</th>
                  <th>Material</th>
                  <th>Input</th>
                  <th>Output</th>
                  <th>Bale</th>
                  <th>Runtime</th>
                  <th>Downtime</th>
                  <th>OEE</th>
                  <th>Tanggal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={10} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Belum ada catatan produksi</td></tr>
                ) : records.map((r: any) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600, color: "var(--brand-purple)" }}>{r.machine?.name}</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>{r.material?.name || "—"}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{r.inputWeight?.toLocaleString("id-ID")} kg</td>
                    <td style={{ fontWeight: 600, color: "var(--brand-teal)" }}>{r.outputWeight?.toLocaleString("id-ID")} kg</td>
                    <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>{r.baleCount}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{r.runtimeMinutes} min</td>
                    <td style={{ color: r.downtimeMinutes > 30 ? "#FF6B9D" : "var(--text-secondary)", fontWeight: r.downtimeMinutes > 30 ? 600 : 400 }}>{r.downtimeMinutes} min</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 60, height: 8, background: "var(--border-light)", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ height: "100%", background: r.oee >= 85 ? "var(--brand-teal)" : r.oee >= 70 ? "#FBBF24" : "#FF6B9D", width: `${Math.min(100, Math.max(0, r.oee))}%` }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{r.oee?.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{new Date(r.date).toLocaleDateString("id-ID")}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => openForm(r)} className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}><Edit2 size={12} /> Edit</button>
                        <button onClick={() => deleteRecord(r.id)} style={{ padding: "4px 8px", fontSize: 12, border: "1px solid red", color: "red", background: "none", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><Trash2 size={12} /> Hapus</button>
                      </div>
                    </td>
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
