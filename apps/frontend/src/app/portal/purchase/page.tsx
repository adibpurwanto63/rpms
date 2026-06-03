"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function PurchasePage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ companyName:"", picName:"", phone:"", email:"", address:"", taxNumber:"" });

  const load = () => {
    api.get("/suppliers").then(r => setSuppliers(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/suppliers", form);
    setShowForm(false);
    setForm({ companyName:"", picName:"", phone:"", email:"", address:"", taxNumber:"" });
    load();
  };

  const statusBadge = (s: string) => ({
    ACTIVE: "badge-success", INACTIVE: "badge-gray", BLACKLISTED: "badge-danger"
  }[s] || "badge-gray");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Manajemen Supplier</h2>
          <p className="text-slate-400 text-sm">Database supplier & histori pembelian OCC</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Tutup" : "+ Tambah Supplier"}
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-6 mb-6 animate-fade-in">
          <h3 className="font-bold mb-4">Registrasi Supplier Baru</h3>
          <form onSubmit={submit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "companyName", label: "Nama Perusahaan", placeholder: "PT Contoh Jaya" },
                { key: "picName", label: "Nama PIC", placeholder: "Budi Santoso" },
                { key: "phone", label: "Telepon", placeholder: "021-xxxxxxx" },
                { key: "email", label: "Email", placeholder: "pic@perusahaan.com" },
                { key: "taxNumber", label: "NPWP", placeholder: "xx.xxx.xxx.x-xxx.xxx" },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label>{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} placeholder={f.placeholder} />
                </div>
              ))}
              <div className="form-group md:col-span-2">
                <label>Alamat</label>
                <textarea rows={2} value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Jl. Contoh No. 1, Kota, Provinsi" />
              </div>
            </div>
            <button type="submit" className="btn-primary">💾 Simpan Supplier</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table>
            <thead><tr>
              <th>Nama Perusahaan</th><th>PIC</th><th>Telepon</th><th>Rating</th><th>Status</th>
            </tr></thead>
            <tbody>
              {suppliers.map((s: any) => (
                <tr key={s.id}>
                  <td>
                    <div className="font-semibold">{s.companyName}</div>
                    <div className="text-xs text-slate-500">{s.email}</div>
                  </td>
                  <td>{s.picName}</td>
                  <td className="text-slate-400">{s.phone}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="font-semibold">{s.rating?.toFixed(1)}</span>
                    </div>
                  </td>
                  <td><span className={`badge ${statusBadge(s.status)}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
