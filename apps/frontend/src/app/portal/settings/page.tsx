"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { UserPlus, Shield, Mail, Lock, User, CheckCircle, XCircle, Settings } from "lucide-react";

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "#7C6FE0", DIRECTOR: "#4ECDC4", FINANCE_MANAGER: "#FF6B9D",
  PROCUREMENT_MANAGER: "#7C6FE0", QC_OFFICER: "#FFB020",
  PRODUCTION_SUPERVISOR: "#4ECDC4", WAREHOUSE_SUPERVISOR: "#FF6B9D",
  LOGISTICS_MANAGER: "#7C6FE0", SUPPLIER: "#9CA3AF",
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
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(124,111,224,0.1)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Settings size={24} strokeWidth={2} />
          </div>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>User Management</h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 2 }}>Kelola akun pengguna dan hak akses sistem</p>
          </div>
        </div>
        {currentUser?.role === "SUPER_ADMIN" && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 20px" }}>
            {showForm ? "✕ Batal" : <><UserPlus size={18} /> <span>Tambah Pengguna</span></>}
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
          <div className="erp-card animate-fade-in" style={{ width: "100%", maxWidth: 600, margin: 20, maxHeight: "90vh", overflowY: "auto", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div className="erp-card-header" style={{ position: "sticky", top: 0, background: "#fff", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--border-light)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <UserPlus size={20} color="var(--color-primary)" />
                <h3 className="erp-card-title" style={{ fontSize: 18, margin: 0 }}>Tambah Pengguna Baru</h3>
              </div>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
            </div>
            <div className="erp-card-body" style={{ padding: "24px" }}>
              <form onSubmit={submit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                  <div style={{ gridColumn: "span 2" }}>
                    <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}><User size={14} /> Nama Lengkap</label>
                    <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Masukkan nama pengguna" required />
                  </div>
                  <div>
                    <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}><Mail size={14} /> Alamat Email</label>
                    <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="user@rpms.id" required />
                  </div>
                  <div>
                    <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}><Lock size={14} /> Password</label>
                    <input className="form-input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}><Shield size={14} /> Hak Akses (Role)</label>
                    <select className="form-input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                      {roles.map(r => <option key={r} value={r}>{r.replace(/_/g," ")}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ paddingTop: 20, borderTop: "1px solid var(--border-light)", display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: "0 24px" }}>Simpan Pengguna</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #EDE9FF", borderTop: "3px solid var(--color-primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : (
        <div className="erp-card">
          <div className="erp-card-header" style={{ padding: "20px 24px" }}>
            <span className="erp-card-title">Daftar Pengguna Sistem</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 24 }}>PENGGUNA</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th>STATUS</th>
                  <th>TERDAFTAR</th>
                  {currentUser?.role === "SUPER_ADMIN" && <th style={{ textAlign: "right", paddingRight: 24 }}>AKSI</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((u:any) => {
                  const color = roleColors[u.role] || "#9CA3AF";
                  return (
                    <tr key={u.id}>
                      <td style={{ paddingLeft: 24 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0, background: `${color}20`, color: color }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>{u.name}</div>
                            {u.id === currentUser?.id && <div style={{ fontSize: 11, color: "var(--color-primary)", fontWeight: 600, marginTop: 2 }}>Akun Anda</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ color: "var(--text-secondary)", fontSize: 14 }}>{u.email}</td>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: `${color}15`, color: color, border: `1px solid ${color}40`, letterSpacing: "0.04em" }}>
                          <Shield size={12} />
                          {u.role.replace(/_/g," ")}
                        </span>
                      </td>
                      <td>
                        {u.isActive ? (
                          <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><CheckCircle size={12}/> Aktif</span>
                        ) : (
                          <span className="badge badge-neutral" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><XCircle size={12}/> Nonaktif</span>
                        )}
                      </td>
                      <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      {currentUser?.role === "SUPER_ADMIN" && (
                        <td style={{ textAlign: "right", paddingRight: 24 }}>
                          {u.id !== currentUser.id ? (
                            <button 
                              onClick={() => toggleActive(u.id, u.isActive)} 
                              style={{ 
                                background: u.isActive ? "var(--color-red-light)" : "var(--color-green-light)", 
                                border: "none", 
                                padding: "6px 12px",
                                borderRadius: 6,
                                fontSize: 12, 
                                fontWeight: 600, 
                                cursor: "pointer", 
                                color: u.isActive ? "var(--color-red)" : "var(--color-green)",
                                transition: "all 0.2s"
                              }}
                            >
                              {u.isActive ? "Nonaktifkan" : "Aktifkan"}
                            </button>
                          ) : (
                            <span style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>-</span>
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
