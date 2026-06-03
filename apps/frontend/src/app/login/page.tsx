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
    <div className="min-h-screen flex items-center justify-center bg-[#e9ecef] py-12 px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Login Logo */}
        <div className="text-center mb-4">
          <div className="text-4xl font-bold text-gray-800 tracking-tight">
            RPMS<span className="font-light">Portal</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="admin-card border-t-0 shadow-md">
          <div className="card-body p-8">
            <p className="text-center text-gray-500 mb-6">Sign in to start your session</p>

            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center border border-red-200">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group mb-4 relative">
                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Email" required autoComplete="username"
                  className="pl-3 pr-10" />
                <span className="absolute right-3 top-2.5 text-gray-400">✉️</span>
              </div>
              <div className="form-group mb-6 relative">
                <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Password" required autoComplete="current-password"
                  className="pl-3 pr-10" />
                <span className="absolute right-3 top-2.5 text-gray-400">🔒</span>
              </div>
              <button type="submit" className="btn-primary w-full justify-center py-2.5 text-base shadow-sm" disabled={loading}>
                {loading ? "Memproses..." : "Sign In"}
              </button>
            </form>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-semibold text-center">Demo Accounts</p>
              <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {demoAccounts.map((a, i) => (
                  <button type="button" key={i} onClick={() => { setEmail(a.email); setPassword("Admin@123"); }}
                    className="text-left px-3 py-2 rounded text-xs transition-colors bg-gray-50 hover:bg-gray-100 border border-gray-100">
                    <span className={`font-semibold ${a.color}`}>{a.role}</span>
                    <span className="text-gray-500 ml-2">{a.email}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
