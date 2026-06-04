"use client";
import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Plus, UserPlus, Shield, Mail, Lock, User, CheckCircle, XCircle, Settings, Edit2, Trash2, Power, Camera } from "lucide-react";

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
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"PROCUREMENT_MANAGER" });
  const { user: currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    api.get("/users").then(r => setUsers(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    
    // Resize image using Canvas to save DB space and bandwidth
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG with 0.8 quality
        const base64String = canvas.toDataURL("image/jpeg", 0.8);
        
        try {
          await api.put(`/users/me/avatar`, { avatarUrl: base64String });
          const uStr = localStorage.getItem("rpms_user");
          if (uStr) {
            const uObj = JSON.parse(uStr);
            uObj.avatarUrl = base64String;
            localStorage.setItem("rpms_user", JSON.stringify(uObj));
          }
          alert("Foto profil berhasil diperbarui!");
          window.location.reload(); 
        } catch (err) {
          console.error(err);
          alert("Gagal mengunggah foto. Pastikan koneksi lancar.");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const openAddUser = () => {
    setEditId(null);
    setForm({ name:"", email:"", password:"", role:"PROCUREMENT_MANAGER" });
    setShowForm(true);
  };

  const openEditUser = (user: any) => {
    setEditId(user.id);
    setForm({ name: user.name, email: user.email, password: "", role: user.role });
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      const payload: any = { name: form.name, email: form.email, role: form.role };
      if (form.password) payload.password = form.password; // only update password if provided
      await api.put(`/users/${editId}`, payload);
    } else {
      await api.post("/users", form);
    }
    setShowForm(false);
    load();
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await api.put(`/users/${id}`, { isActive: !isActive });
    load();
  };

  const deleteUser = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus pengguna ini permanen?")) {
      await api.delete(`/users/${id}`);
      load();
    }
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
          <button className="btn btn-primary" onClick={openAddUser} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 20px" }}>
            <Plus size={18} strokeWidth={2.5} /> <span>Tambah Pengguna</span>
          </button>
        )}
      </div>

      <div className="erp-card" style={{ display: "flex", alignItems: "center", gap: 24, padding: "24px 32px" }}>
        <div style={{ position: "relative" }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: roleColors[currentUser?.role || ""] || "var(--color-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 32,
            overflow: "hidden"
          }}>
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              currentUser?.name?.charAt(0).toUpperCase()
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            title="Ubah Foto Profil"
            style={{
              position: "absolute", bottom: 0, right: 0,
              width: 28, height: 28, borderRadius: "50%",
              background: "#fff", border: "1px solid var(--border-light)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text-secondary)",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
            }}
          >
            <Camera size={14} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAvatarChange} 
            accept="image/*" 
            style={{ display: "none" }} 
          />
        </div>
        <div>
          <h3 style={{ margin: "0 0 4px 0", fontSize: 20, color: "var(--text-primary)" }}>{currentUser?.name}</h3>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>{currentUser?.email}</p>
          <div style={{ marginTop: 8, display: "inline-block", background: "rgba(124,111,224,0.1)", color: "var(--color-primary)", padding: "4px 10px", borderRadius: 100, fontSize: 12, fontWeight: 600 }}>
            {currentUser?.role.replace(/_/g, " ")}
          </div>
        </div>
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
                {editId ? <Edit2 size={20} color="var(--color-primary)" /> : <UserPlus size={20} color="var(--color-primary)" />}
                <h3 className="erp-card-title" style={{ fontSize: 18, margin: 0 }}>{editId ? "Edit Pengguna" : "Tambah Pengguna Baru"}</h3>
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
                    <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}><Lock size={14} /> Password {editId && <span style={{ fontSize: 11, fontWeight: "normal", color: "var(--text-muted)" }}>(Kosongkan jika tidak ingin diubah)</span>}</label>
                    <input className="form-input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required={!editId} placeholder={editId ? "Kosongkan untuk tetap menggunakan sandi lama" : "Buat kata sandi"} />
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
                        <td style={{ textAlign: "center", paddingRight: 24 }}>
                          {u.id !== currentUser.id ? (
                            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                              <button 
                                onClick={() => toggleActive(u.id, u.isActive)} 
                                title={u.isActive ? "Nonaktifkan Akses" : "Aktifkan Akses"}
                                style={{ 
                                  background: u.isActive ? "var(--color-red-light)" : "var(--color-green-light)", 
                                  border: "none", 
                                  width: 32, height: 32,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  borderRadius: 6,
                                  cursor: "pointer", 
                                  color: u.isActive ? "var(--color-red)" : "var(--color-green)",
                                  transition: "all 0.2s"
                                }}
                              >
                                <Power size={16} />
                              </button>
                              <button 
                                onClick={() => openEditUser(u)}
                                title="Edit Pengguna"
                                style={{ 
                                  background: "var(--bg-secondary)", 
                                  border: "none", 
                                  width: 32, height: 32,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  borderRadius: 6,
                                  cursor: "pointer", 
                                  color: "var(--text-secondary)",
                                  transition: "all 0.2s"
                                }}
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => deleteUser(u.id)}
                                title="Hapus Pengguna"
                                style={{ 
                                  background: "var(--color-red-light)", 
                                  border: "none", 
                                  width: 32, height: 32,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  borderRadius: 6,
                                  cursor: "pointer", 
                                  color: "var(--color-red)",
                                  transition: "all 0.2s"
                                }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
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
