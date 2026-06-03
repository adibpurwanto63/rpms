"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@rpms.id");
  const [password, setPassword] = useState("Admin@123");
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
    { email: "admin@rpms.id", role: "Super Admin", color: "text-purple-600" },
    { email: "director@rpms.id", role: "Director", color: "text-blue-600" },
    { email: "finance@rpms.id", role: "Finance Manager", color: "text-yellow-600" },
    { email: "procurement@rpms.id", role: "Procurement", color: "text-green-600" },
    { email: "qc@rpms.id", role: "QC Officer", color: "text-orange-600" },
    { email: "production@rpms.id", role: "Production", color: "text-cyan-600" },
    { email: "warehouse@rpms.id", role: "Warehouse", color: "text-pink-600" },
    { email: "logistics@rpms.id", role: "Logistics", color: "text-indigo-600" },
    { email: "supplier@rpms.id", role: "Supplier", color: "text-red-600" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* Decorative background shapes for modern SaaS look */}
      <div className="absolute top-0 left-0 w-full h-96 bg-[#4195D5] opacity-[0.05] -skew-y-6 transform origin-top-left -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#93C83D] rounded-full filter blur-[100px] opacity-[0.1] -z-10"></div>
      
      <div className="w-full max-w-[440px] animate-fade-in">
        {/* Login Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#4195D5] flex items-center justify-center text-4xl text-white font-bold mx-auto mb-4 shadow-lg shadow-blue-500/20">
            P
          </div>
          <div className="text-3xl font-bold text-gray-800 tracking-tight">
            Paper<span className="text-[#4195D5]">RPMS</span>
          </div>
          <p className="text-gray-500 mt-2 font-medium">Masuk ke akun Anda</p>
        </div>

        {/* Login Card */}
        <div className="paper-card p-8 sm:p-10 bg-white">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm text-center border border-red-100 font-medium">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-5">
              <label htmlFor="email">Email</label>
              <div className="relative mt-1.5">
                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="anda@perusahaan.com" required autoComplete="username"
                  className="pl-4 pr-10" />
                <span className="absolute right-4 top-3 text-gray-400">✉️</span>
              </div>
            </div>
            <div className="form-group mb-8">
              <label htmlFor="password">Password</label>
              <div className="relative mt-1.5">
                <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required autoComplete="current-password"
                  className="pl-4 pr-10" />
                <span className="absolute right-4 top-3 text-gray-400">🔒</span>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full py-3.5 text-base shadow-md shadow-blue-500/30" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Memproses...
                </span>
              ) : "Masuk"}
            </button>
          </form>

          <div className="mt-10 border-t border-gray-100 pt-8">
            <p className="text-xs text-gray-400 mb-4 uppercase tracking-wider font-bold text-center">Demo Accounts</p>
            <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-2 custom-scrollbar">
              {demoAccounts.map((a, i) => (
                <button type="button" key={i} onClick={() => { setEmail(a.email); setPassword("Admin@123"); }}
                  className="text-left px-4 py-3 rounded-xl text-xs transition-all bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 flex items-center justify-between group">
                  <span className={`font-semibold ${a.color} group-hover:text-blue-700`}>{a.role}</span>
                  <span className="text-gray-500 group-hover:text-blue-600 font-medium">{a.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
