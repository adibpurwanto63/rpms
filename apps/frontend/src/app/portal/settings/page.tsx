"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const roleColors: any = {
  SUPER_ADMIN: "#6f42c1", DIRECTOR: "#007bff", FINANCE_MANAGER: "#fd7e14",
  PROCUREMENT_MANAGER: "#28a745", QC_OFFICER: "#e83e8c", PRODUCTION_SUPERVISOR: "#17a2b8",
  WAREHOUSE_SUPERVISOR: "#d63384", LOGISTICS_MANAGER: "#6610f2", SUPPLIER: "#dc3545",
};

export default function SettingsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", password:"Admin@123", role:"PROCUREMENT_MANAGER" });
  const { user: currentUser } = useAuth();

  const load = () => {
    api.get("/users").then(r => setUsers(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/users", form);
    setShowForm(false);
    setForm({ name:"", email:"", password:"Admin@123", role:"PROCUREMENT_MANAGER" });
    load();
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await api.put(`/users/${id}`, { isActive: !isActive });
    load();
  };

  const roles = ["SUPER_ADMIN","DIRECTOR","FINANCE_MANAGER","PROCUREMENT_MANAGER","QC_OFFICER","PRODUCTION_SUPERVISOR","WAREHOUSE_SUPERVISOR","LOGISTICS_MANAGER","SUPPLIER"];

  return (
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Settings & User Management</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Kelola akun pengguna dan hak akses sistem</p>
        </div>
        {currentUser?.role === "SUPER_ADMIN" && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "✕ Tutup" : "👤 Tambah User"}
          </button>
        )}
      </div>

      {showForm && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(4px)"
        }}>
          <div className="erp-card animate-fade-in" style={{ width: "100%", maxWidth: 700, margin: 20, maxHeight: "90vh", overflowY: "auto", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div className="erp-card-header" style={{ position: "sticky", top: 0, background: "#fff", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="erp-card-title" style={{ fontSize: 20 }}>Tambah Pengguna Baru</h3>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
            </div>
            <div className="erp-card-body" style={{ padding: 24 }}>
              <form onSubmit={submit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label className="form-label">Nama Lengkap</label>
                    <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nama pengguna" required />
                  </div>
                  <div>
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="user@rpms.id" required />
                  </div>
                  <div>
                    <label className="form-label">Password</label>
                    <input className="form-input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
                  </div>
                  <div>
                    <label className="form-label">Role</label>
                    <select className="form-input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                      {roles.map(r => <option key={r} value={r}>{r.replace(/_/g," ")}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ paddingTop: 20, borderTop: "1px solid var(--border-light)", display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: "0 24px" }}>💾 Simpan Pengguna</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #EDE9FF", borderTop: "3px solid #7C6FE0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : (
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Daftar Pengguna Sistem</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="erp-table">
              <thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Status</th><th>Dibuat</th>{currentUser?.role === "SUPER_ADMIN" && <th>Aksi</th>}</tr></thead>
              <tbody>
                {users.map((u:any) => {
                  const color = roleColors[u.role] || "#6c757d";
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, background: color, color: "white" }}>{u.name.charAt(0).toUpperCase()}</div>
                          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{u.name}</span>
                          {u.id === currentUser?.id && <span className="badge badge-info" style={{ marginLeft: 8 }}>Anda</span>}
                        </div>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>{u.email}</td>
                      <td><span className="badge" style={{ background: `${color}15`, color, border: `1px solid ${color}40`, letterSpacing: "0.02em" }}>{u.role.replace(/_/g," ")}</span></td>
                      <td><span className={`badge ${u.isActive ? "badge-success" : "badge-neutral"}`}>{u.isActive ? "Aktif" : "Nonaktif"}</span></td>
                      <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString("id-ID")}</td>
                      {currentUser?.role === "SUPER_ADMIN" && (
                        <td>
                          {u.id !== currentUser.id && (
                            <button onClick={() => toggleActive(u.id, u.isActive)} style={{ background: "transparent", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", color: u.isActive ? "var(--color-red)" : "var(--color-green)" }}>
                              {u.isActive ? "Nonaktifkan" : "Aktifkan"}
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
