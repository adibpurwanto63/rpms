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
    { email: "admin@rpms.id", role: "Super Admin", color: "#7C6FE0", bg: "rgba(124,111,224,0.08)" },
    { email: "director@rpms.id", role: "Director", color: "#4ECDC4", bg: "rgba(78,205,196,0.08)" },
    { email: "finance@rpms.id", role: "Finance Manager", color: "#FF6B9D", bg: "rgba(255,107,157,0.08)" },
    { email: "procurement@rpms.id", role: "Procurement", color: "#7C6FE0", bg: "rgba(124,111,224,0.08)" },
    { email: "qc@rpms.id", role: "QC Officer", color: "#FFB020", bg: "rgba(255,176,32,0.08)" },
    { email: "production@rpms.id", role: "Production", color: "#4ECDC4", bg: "rgba(78,205,196,0.08)" },
    { email: "warehouse@rpms.id", role: "Warehouse", color: "#FF6B9D", bg: "rgba(255,107,157,0.08)" },
    { email: "logistics@rpms.id", role: "Logistics", color: "#7C6FE0", bg: "rgba(124,111,224,0.08)" },
    { email: "supplier@rpms.id", role: "Supplier", color: "#9CA3AF", bg: "#F3F4F6" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "var(--bg-app)",
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* Left Panel - Brand */}
      <div style={{
        flex: "0 0 44%",
        background: "linear-gradient(135deg, #2D2D3A 0%, #1a1a26 50%, #0f0f1a 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "48px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(124,111,224,0.15)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 250, height: 250, borderRadius: "50%", background: "rgba(78,205,196,0.1)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "40%", right: 20, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,107,157,0.08)", pointerEvents: "none" }} />

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "linear-gradient(135deg, #7C6FE0, #4ECDC4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: 20,
          }}>R</div>
          <span style={{ color: "#fff", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
            RPMS<span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>.flow</span>
          </span>
        </div>

        {/* Center content */}
        <div style={{ position: "relative" }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: "rgba(124,111,224,0.8)",
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16,
          }}>
            ERP System
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: "#fff", lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 16 }}>
            Kelola bisnis<br />
            lebih <span style={{ background: "linear-gradient(135deg, #7C6FE0, #4ECDC4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>cerdas</span>
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 340 }}>
            Platform ERP terpadu untuk mengelola pengadaan, produksi, logistik, dan keuangan dalam satu dasbor.
          </p>

          {/* Feature chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 28 }}>
            {["📊 Dashboard", "🛒 Procurement", "🏭 Produksi", "💹 Keuangan", "🚛 Logistik", "📦 Gudang"].map(item => (
              <div key={item} style={{
                padding: "6px 14px", borderRadius: 99,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.65)",
                fontSize: 12, fontWeight: 500,
              }}>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, position: "relative" }}>
          © 2025 RPMS.flow · Powered by Next.js
        </div>
      </div>

      {/* Right Panel - Login */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px",
        overflowY: "auto",
      }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>Selamat datang kembali 👋</h2>
            <p style={{ color: "var(--text-secondary)", marginTop: 8, fontSize: 15 }}>Masuk ke akun RPMS Anda</p>
          </div>

          {error && (
            <div style={{
              background: "#FFF5F5",
              border: "1px solid #FEE2E2",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 20,
              color: "var(--color-red)",
              fontSize: 14,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="form-label">Email</label>
              <input
                id="email"
                className="form-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="anda@perusahaan.com"
                required
                autoComplete="username"
                style={{ marginTop: 4 }}
              />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input
                id="password"
                className="form-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{ marginTop: 4 }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                background: loading ? "#9CA3AF" : "linear-gradient(135deg, #7C6FE0, #4ECDC4)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: loading ? "none" : "0 4px 16px rgba(124,111,224,0.35)",
                transition: "all 0.2s ease",
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  Memproses...
                </>
              ) : "Masuk ke Dashboard"}
            </button>
          </form>

          {/* Demo Accounts */}
          <div style={{ marginTop: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: "var(--border-light)" }} />
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Demo</span>
              <div style={{ flex: 1, height: 1, background: "var(--border-light)" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {demoAccounts.map((a, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => { setEmail(a.email); setPassword("Admin@123"); }}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border-light)",
                    background: a.bg,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: a.color }}>{a.role}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
