"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const roleColors: any = {
  SUPER_ADMIN: "#7C6FE0", DIRECTOR: "#4ECDC4", FINANCE_MANAGER: "#FF6B9D",
  PROCUREMENT_MANAGER: "#7C6FE0", QC_OFFICER: "#FFB020",
  PRODUCTION_SUPERVISOR: "#4ECDC4", WAREHOUSE_SUPERVISOR: "#FF6B9D",
  LOGISTICS_MANAGER: "#7C6FE0", SUPPLIER: "#9CA3AF",
};

const roles = [
  "SUPER_ADMIN", "DIRECTOR", "FINANCE_MANAGER", "PROCUREMENT_MANAGER",
  "QC_OFFICER", "PRODUCTION_SUPERVISOR", "WAREHOUSE_SUPERVISOR", "LOGISTICS_MANAGER", "SUPPLIER"
];

export default function SettingsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "Admin@123", role: "PROCUREMENT_MANAGER" });
  const { user: currentUser } = useAuth();

  const load = () => {
    setLoading(true);
    api.get("/users").then(r => setUsers(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/users", form);
      setShowForm(false);
      setForm({ name: "", email: "", password: "Admin@123", role: "PROCUREMENT_MANAGER" });
      load();
    } finally { setSubmitting(false); }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await api.put(`/users/${id}`, { isActive: !isActive });
    load();
  };

  const activeCount = users.filter(u => u.isActive).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
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

      {/* Stats */}
      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {[
            { label: "Total Pengguna", value: users.length, icon: "👥", variant: "dark" },
            { label: "Pengguna Aktif", value: activeCount, icon: "✅", variant: "mint" },
            { label: "Nonaktif", value: users.length - activeCount, icon: "⏸️", variant: "pink" },
          ].map((k, i) => (
            <div key={i} className="kpi-card" style={{
              background: ({ dark: "var(--kpi-dark)", mint: "var(--kpi-mint-bg)", pink: "var(--kpi-pink-bg)" } as any)[k.variant],
              borderColor: k.variant === "dark" ? "transparent" : undefined
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: k.variant === "dark" ? "rgba(255,255,255,0.6)" : "var(--text-secondary)" }}>{k.label}</span>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: k.variant === "dark" ? "rgba(255,255,255,0.12)" : "rgba(78,205,196,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{k.icon}</div>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.04em", color: k.variant === "dark" ? "#fff" : "var(--text-primary)", lineHeight: 1.2 }}>{k.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add User Form */}
      {showForm && (
        <div className="erp-card animate-fade-in">
          <div className="erp-card-header">
            <h3 className="erp-card-title">Tambah Pengguna Baru</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>✕</button>
          </div>
          <div className="erp-card-body">
            <form onSubmit={submit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="form-label">Nama Lengkap</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nama pengguna" required />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="user@rpms.id" required autoComplete="off" />
                </div>
                <div>
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required autoComplete="new-password" />
                </div>
                <div>
                  <label className="form-label">Role</label>
                  <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    {roles.map(r => (
                      <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ paddingTop: 16, borderTop: "1px solid var(--border-light)", display: "flex", gap: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "⏳ Menyimpan..." : "💾 Simpan Pengguna"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #EDE9FF", borderTop: "3px solid #7C6FE0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : (
        <div className="erp-card">
          <div className="erp-card-header">
            <span className="erp-card-title">Daftar Pengguna</span>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{users.length} pengguna</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Dibuat</th>
                  {currentUser?.role === "SUPER_ADMIN" && <th>Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => {
                  const color = roleColors[u.role] || "#9CA3AF";
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                            background: color, color: "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 700, fontSize: 13,
                          }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{u.name}</div>
                            {u.id === currentUser?.id && (
                              <span className="badge badge-purple" style={{ fontSize: 10 }}>Anda</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>{u.email}</td>
                      <td>
                        <span className="badge" style={{ background: `${color}18`, color, border: `1px solid ${color}44` }}>
                          {u.role.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.isActive ? "badge-success" : "badge-neutral"}`}>
                          {u.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>{new Date(u.createdAt).toLocaleDateString("id-ID")}</td>
                      {currentUser?.role === "SUPER_ADMIN" && (
                        <td>
                          {u.id !== currentUser.id && (
                            <button
                              onClick={() => toggleActive(u.id, u.isActive)}
                              className={`btn btn-sm ${u.isActive ? "btn-danger" : "btn-secondary"}`}
                              style={u.isActive ? {} : { color: "var(--color-green)", borderColor: "var(--color-green)", background: "var(--color-green-light)" }}
                            >
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
