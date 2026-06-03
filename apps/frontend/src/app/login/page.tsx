"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password);
      router.push("/portal/dashboard");
    } catch {
      setError("Email atau password salah. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { email: "admin@rpms.id", role: "Super Admin", color: "text-purple-400" },
    { email: "director@rpms.id", role: "Director", color: "text-blue-400" },
    { email: "finance@rpms.id", role: "Finance Manager", color: "text-yellow-400" },
    { email: "procurement@rpms.id", role: "Procurement", color: "text-green-400" },
    { email: "qc@rpms.id", role: "QC Officer", color: "text-orange-400" },
    { email: "production@rpms.id", role: "Production", color: "text-cyan-400" },
    { email: "warehouse@rpms.id", role: "Warehouse", color: "text-pink-400" },
    { email: "logistics@rpms.id", role: "Logistics", color: "text-indigo-400" },
    { email: "supplier@rpms.id", role: "Supplier", color: "text-red-400" },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #0f172a 50%, #071a2e 100%)" }}>
      {/* Left - Branding */}
      <div className="hidden lg:flex flex-col justify-center px-16 flex-1 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #10b981 0%, transparent 60%), radial-gradient(circle at 70% 20%, #0ea5e9 0%, transparent 50%)" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: "linear-gradient(135deg, #10b981, #0ea5e9)" }}>♻</div>
            <div>
              <div className="text-xl font-bold gradient-text">RPMS</div>
              <div className="text-xs text-slate-500">Recovered Paper Management System</div>
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Kelola Operasional<br />
            <span className="gradient-text">Kertas Daur Ulang</span><br />
            Lebih Cerdas
          </h1>
          <p className="text-slate-400 text-lg mb-10 max-w-md">
            Platform terintegrasi untuk Procurement, Timbangan, QC, Produksi, Gudang, Logistik, dan Keuangan dalam satu sistem.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {[
              { icon: "⚖️", label: "Weighbridge Digital", desc: "Tiket otomatis + QR Code" },
              { icon: "🏭", label: "Production OEE", desc: "Monitor mesin real-time" },
              { icon: "📦", label: "Bale Tracking FIFO", desc: "Inventori presisi 99%" },
              { icon: "💹", label: "Finance Dashboard", desc: "AR/AP & Cash Flow" },
            ].map((f, i) => (
              <div key={i} className="glass rounded-xl p-4">
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="font-semibold text-sm">{f.label}</div>
                <div className="text-xs text-slate-500">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Login form */}
      <div className="flex flex-col justify-center px-8 py-12 w-full lg:w-[480px] lg:max-w-[480px]">
        <div className="glass rounded-2xl p-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: "linear-gradient(135deg, #10b981, #0ea5e9)" }}>♻</div>
            <div className="font-bold text-lg gradient-text">RPMS Portal</div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Selamat Datang</h2>
          <p className="text-slate-400 text-sm mb-8">Masuk ke portal manajemen Anda</p>

          {error && (
            <div className="badge badge-danger mb-6 w-full justify-center py-3 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="nama@rpms.id" required />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-3 text-base" disabled={loading}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Memproses...</>
              ) : "Masuk ke Portal"}
            </button>
          </form>

          <div className="mt-8">
            <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-semibold">Akun Demo (Password: Admin@123)</p>
            <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto pr-1">
              {demoAccounts.map((a, i) => (
                <button key={i} onClick={() => { setEmail(a.email); setPassword("Admin@123"); }}
                  className="text-left px-3 py-2 rounded-lg text-xs transition-all"
                  style={{ background: "rgba(148,163,184,0.05)", border: "1px solid rgba(148,163,184,0.1)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(16,185,129,0.05)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(148,163,184,0.05)")}>
                  <span className={`font-semibold ${a.color}`}>{a.role}</span>
                  <span className="text-slate-500 ml-2">{a.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
