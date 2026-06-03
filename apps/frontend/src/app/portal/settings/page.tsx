"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const roleColors: any = {
  SUPER_ADMIN: "#a855f7", DIRECTOR: "#3b82f6", FINANCE_MANAGER: "#f59e0b",
  PROCUREMENT_MANAGER: "#10b981", QC_OFFICER: "#f97316", PRODUCTION_SUPERVISOR: "#06b6d4",
  WAREHOUSE_SUPERVISOR: "#ec4899", LOGISTICS_MANAGER: "#8b5cf6", SUPPLIER: "#ef4444",
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Settings & User Management</h2>
          <p className="text-slate-400 text-sm">Kelola akun pengguna dan hak akses sistem</p>
        </div>
        {currentUser?.role === "SUPER_ADMIN" && (
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "✕ Tutup" : "👤 Tambah User"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-6 mb-6 animate-fade-in">
          <h3 className="font-bold mb-4">Tambah Pengguna Baru</h3>
          <form onSubmit={submit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nama pengguna" required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="user@rpms.id" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  {roles.map(r => <option key={r} value={r}>{r.replace(/_/g," ")}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary">💾 Simpan Pengguna</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table>
            <thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Status</th><th>Dibuat</th>{currentUser?.role === "SUPER_ADMIN" && <th>Aksi</th>}</tr></thead>
            <tbody>
              {users.map((u:any) => {
                const color = roleColors[u.role] || "#94a3b8";
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: color, color: "white" }}>{u.name.charAt(0)}</div>
                        <span className="font-semibold text-sm">{u.name}</span>
                        {u.id === currentUser?.id && <span className="badge badge-info text-xs">Anda</span>}
                      </div>
                    </td>
                    <td className="text-slate-400 text-sm">{u.email}</td>
                    <td><span className="badge text-xs" style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}>{u.role.replace(/_/g," ")}</span></td>
                    <td><span className={`badge ${u.isActive ? "badge-success" : "badge-gray"}`}>{u.isActive ? "Aktif" : "Nonaktif"}</span></td>
                    <td className="text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString("id-ID")}</td>
                    {currentUser?.role === "SUPER_ADMIN" && (
                      <td>
                        {u.id !== currentUser.id && (
                          <button onClick={() => toggleActive(u.id, u.isActive)} className={`text-xs ${u.isActive ? "text-red-400 hover:text-red-300" : "text-emerald-400 hover:text-emerald-300"}`}>
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
      )}
    </div>
  );
}
