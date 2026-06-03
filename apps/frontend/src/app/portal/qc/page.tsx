"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const gradeColor = { A: "badge-success", B: "badge-warning", REJECT: "badge-danger" };
const gradeLabel = { A: "Grade A", B: "Grade B", REJECT: "Reject" };

export default function QcPage() {
  const [inspections, setInspections] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ticketId:"", grade:"A", moisturePct:0, plasticPct:0, metalPct:0, contaminationPct:0, notes:"" });

  const load = () => {
    Promise.all([api.get("/qc"), api.get("/qc/stats"), api.get("/weighbridge")]).then(([q,s,t]) => {
      setInspections(q.data); setStats(s.data); setTickets(t.data.filter((t:any) => !t.qcInspection));
    }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/qc", form);
    setShowForm(false); load();
  };

  const SliderField = ({ label, field, unit="%" }: {label:string, field:string, unit?:string}) => (
    <div className="form-group mb-0">
      <label>{label} — <span className="text-primary">{(form as any)[field]}{unit}</span></label>
      <input type="range" min={0} max={50} step={0.5} value={(form as any)[field]}
        onChange={e => setForm({...form, [field]: parseFloat(e.target.value)})}
        style={{ accentColor: "#007bff" }} className="w-full" />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Quality Control</h2>
          <p className="text-gray-500 text-sm">Inspeksi material & grading OCC</p>
        </div>
        <button className="btn-primary shadow-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Tutup" : "🔬 Input Inspeksi"}
        </button>
      </div>

      {/* Grade Stats */}
      {stats.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          {stats.map((s: any) => (
            <div key={s.grade} className="admin-card text-center py-4">
              <div className={`text-3xl font-bold mb-2 ${s.grade === "A" ? "text-success" : s.grade === "B" ? "text-warning" : "text-danger"}`}>{s._count}</div>
              <div className={`badge ${(gradeColor as any)[s.grade]} mx-auto`}>{(gradeLabel as any)[s.grade]}</div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="admin-card primary mb-4 animate-fade-in">
          <div className="card-header">
            <h3 className="card-title">Form Inspeksi QC</h3>
          </div>
          <div className="card-body">
            <form onSubmit={submit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group mb-0">
                  <label>Tiket Timbangan</label>
                  <select value={form.ticketId} onChange={e => setForm({...form, ticketId: e.target.value})} required>
                    <option value="">Pilih Tiket</option>
                    {tickets.map((t:any) => <option key={t.id} value={t.id}>{t.ticketNumber} — {t.supplier?.companyName}</option>)}
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label>Grade</label>
                  <select value={form.grade} onChange={e => setForm({...form, grade: e.target.value})}>
                    <option value="A">Grade A</option>
                    <option value="B">Grade B</option>
                    <option value="REJECT">Reject</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <SliderField label="Kadar Air (Moisture)" field="moisturePct" />
                <SliderField label="Kontaminasi Plastik" field="plasticPct" />
                <SliderField label="Kontaminasi Metal" field="metalPct" />
                <SliderField label="Kontaminasi Total" field="contaminationPct" />
              </div>
              <div className="form-group mb-0">
                <label>Catatan QC</label>
                <textarea rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Catatan tambahan pemeriksaan..." />
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200">
                <button type="submit" className="btn-primary">💾 Simpan Inspeksi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="admin-card">
          <div className="card-body p-0 overflow-x-auto">
            <table className="m-0">
              <thead><tr><th>Tiket</th><th>Supplier</th><th>Grade</th><th>Moisture</th><th>Plastik</th><th>Metal</th><th>Tanggal</th></tr></thead>
              <tbody>
                {inspections.map((q:any) => (
                  <tr key={q.id}>
                    <td className="font-mono text-sm text-blue-600">{q.ticket?.ticketNumber}</td>
                    <td className="text-sm">{q.ticket?.supplier?.companyName}</td>
                    <td><span className={`badge ${(gradeColor as any)[q.grade]}`}>{q.grade}</span></td>
                    <td className="text-gray-700">{q.moisturePct?.toFixed(1)}%</td>
                    <td className="text-gray-700">{q.plasticPct?.toFixed(1)}%</td>
                    <td className="text-gray-700">{q.metalPct?.toFixed(1)}%</td>
                    <td className="text-sm text-gray-500">{new Date(q.inspectedAt).toLocaleDateString("id-ID")}</td>
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
