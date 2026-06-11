"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff, ShieldCheck, Recycle, ArrowRight } from "lucide-react";

const DEMO_ACCOUNTS = [
  { email: "admin@rpms.id", label: "Super Admin", icon: "👑" },
  { email: "director@rpms.id", label: "Director", icon: "📊" },
  { email: "finance@rpms.id", label: "Finance", icon: "💰" },
  { email: "procurement@rpms.id", label: "Procurement", icon: "🛒" },
  { email: "qc@rpms.id", label: "QC Officer", icon: "🔬" },
  { email: "production@rpms.id", label: "Production", icon: "🏭" },
  { email: "warehouse@rpms.id", label: "Warehouse", icon: "📦" },
  { email: "logistics@rpms.id", label: "Logistics", icon: "🚛" },
  { email: "supplier@rpms.id", label: "Supplier", icon: "🤝" },
];

const DEMO_PASSWORD = "Admin@123";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@rpms.id");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const selectedAccount = useMemo(
    () => DEMO_ACCOUNTS.find(a => a.email === email),
    [email]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password, remember);
      router.push("/portal/dashboard");
    } catch {
      setError("Email atau password salah. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const selectAccount = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(DEMO_PASSWORD);
    setError("");
    setShowDemo(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
      /* Deep navy background */
      background: "linear-gradient(145deg, #0a0e27 0%, #111642 40%, #0d1137 100%)",
    }}>
      {/* Decorative background elements */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {/* Grid pattern */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        {/* Glow orb top-right */}
        <div style={{
          position: "absolute", top: "-15%", right: "-10%",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 65%)",
        }} />
        {/* Glow orb bottom-left */}
        <div style={{
          position: "absolute", bottom: "-20%", left: "-15%",
          width: 700, height: 700, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 60%)",
        }} />
        {/* Floating ring */}
        <div style={{
          position: "absolute", top: "12%", left: "8%",
          width: 120, height: 120, borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.04)",
          animation: "floatSlow 8s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: "15%", right: "12%",
          width: 80, height: 80, borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.03)",
          animation: "floatSlow 6s ease-in-out infinite reverse",
        }} />
      </div>

      {/* Card */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        position: "relative",
        zIndex: 1,
        animation: "cardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
      }}>
        {/* Brand header above card */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 56, height: 56, borderRadius: 16,
            background: "linear-gradient(135deg, #2563eb, #4f46e5)",
            boxShadow: "0 8px 32px rgba(37,99,235,0.3)",
            marginBottom: 20,
          }}>
            <Recycle size={28} color="#fff" strokeWidth={2} />
          </div>
          <h1 style={{
            fontSize: 28, fontWeight: 800, color: "#ffffff",
            letterSpacing: "-0.03em", margin: 0,
          }}>
            Aftech <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>RPMS</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 6, letterSpacing: "0.02em" }}>
            Recovered Paper Management System
          </p>
        </div>

        {/* White form card */}
        <div style={{
          background: "#ffffff",
          borderRadius: 20,
          padding: "36px 32px 32px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)",
        }}>
          {/* Card header */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{
              fontSize: 20, fontWeight: 700, color: "#111827",
              letterSpacing: "-0.02em", margin: 0,
            }}>
              Masuk ke akun Anda
            </h2>
            <p style={{ color: "#9CA3AF", fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
              {selectedAccount
                ? <>Login sebagai <span style={{ color: "#2563eb", fontWeight: 600 }}>{selectedAccount.label}</span></>
                : "Masukkan kredensial untuk melanjutkan"
              }
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "#FEF2F2", border: "1px solid #FECACA",
              borderRadius: 12, padding: "11px 14px",
              marginBottom: 20, color: "#DC2626",
              fontSize: 13, fontWeight: 500,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <ShieldCheck size={15} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, letterSpacing: "0.01em" }}>
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="nama@perusahaan.com"
                required
                autoComplete="username"
                style={{
                  width: "100%", padding: "12px 14px",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: 10,
                  fontSize: 14, color: "#111827", outline: "none",
                  background: "#F9FAFB",
                  transition: "all 0.2s ease",
                  boxSizing: "border-box",
                }}
                onFocus={e => {
                  e.target.style.borderColor = "#2563eb";
                  e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)";
                  e.target.style.background = "#ffffff";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "#E5E7EB";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "#F9FAFB";
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, letterSpacing: "0.01em" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{
                    width: "100%", padding: "12px 44px 12px 14px",
                    border: "1.5px solid #E5E7EB",
                    borderRadius: 10,
                    fontSize: 14, color: "#111827", outline: "none",
                    background: "#F9FAFB",
                    transition: "all 0.2s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = "#2563eb";
                    e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)";
                    e.target.style.background = "#ffffff";
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = "#E5E7EB";
                    e.target.style.boxShadow = "none";
                    e.target.style.background = "#F9FAFB";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "#9CA3AF", display: "flex", padding: 2,
                  }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  style={{ width: 15, height: 15, accentColor: "#2563eb", cursor: "pointer" }}
                />
                <span style={{ fontSize: 13, color: "#6B7280" }}>Ingat saya</span>
              </label>
              <a href="#" style={{ fontSize: 13, fontWeight: 600, color: "#2563eb", textDecoration: "none" }}>
                Lupa password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "13px",
                background: loading ? "#93C5FD" : "linear-gradient(135deg, #2563eb, #4f46e5)",
                color: "#fff", border: "none",
                borderRadius: 10,
                fontSize: 14, fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: 4,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.25s ease",
                boxShadow: loading ? "none" : "0 4px 14px rgba(37,99,235,0.35)",
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.45)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
              onMouseLeave={e => { if (!loading) { e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,99,235,0.35)"; e.currentTarget.style.transform = "translateY(0)"; } }}
            >
              {loading ? (
                <>
                  <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  Memproses...
                </>
              ) : (
                <>Masuk <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Demo divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "22px 0 16px" }}>
            <div style={{ flex: 1, height: 1, background: "#F3F4F6" }} />
            <span style={{ fontSize: 11, color: "#D1D5DB", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Akun Demo</span>
            <div style={{ flex: 1, height: 1, background: "#F3F4F6" }} />
          </div>

          {/* Demo toggle */}
          <button
            type="button"
            onClick={() => setShowDemo(!showDemo)}
            style={{
              width: "100%", padding: "10px",
              background: showDemo ? "#EEF2FF" : "#F9FAFB",
              border: showDemo ? "1.5px solid #C7D2FE" : "1.5px solid #E5E7EB",
              borderRadius: 10,
              fontSize: 13, fontWeight: 600,
              color: showDemo ? "#4338CA" : "#6B7280",
              cursor: "pointer",
              transition: "all 0.2s ease",
              letterSpacing: "-0.01em",
            }}
            onMouseEnter={e => { if (!showDemo) e.currentTarget.style.background = "#F3F4F6"; }}
            onMouseLeave={e => { if (!showDemo) e.currentTarget.style.background = "#F9FAFB"; }}
          >
            {showDemo ? "Sembunyikan ↑" : "Pilih akun demo →"}
          </button>

          {/* Demo accounts grid */}
          {showDemo && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 6,
              marginTop: 12,
              animation: "fadeInUp 0.2s ease both",
            }}>
              {DEMO_ACCOUNTS.map((acc, i) => {
                const isSel = email === acc.email;
                return (
                  <button
                    type="button"
                    key={i}
                    onClick={() => selectAccount(acc)}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                      padding: "10px 4px 8px",
                      borderRadius: 10,
                      border: isSel ? "1.5px solid #2563eb" : "1.5px solid #F3F4F6",
                      background: isSel ? "#EEF2FF" : "#FAFAFA",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={e => { if (!isSel) { e.currentTarget.style.borderColor = "#C7D2FE"; e.currentTarget.style.background = "#F5F7FF"; } }}
                    onMouseLeave={e => { if (!isSel) { e.currentTarget.style.borderColor = "#F3F4F6"; e.currentTarget.style.background = "#FAFAFA"; } }}
                  >
                    <span style={{ fontSize: 16 }}>{acc.icon}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      color: isSel ? "#2563eb" : "#4B5563",
                      textAlign: "center", lineHeight: 1.3,
                    }}>
                      {acc.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 28, letterSpacing: "0.01em" }}>
          © 2026 Aftech Developer — All rights reserved
        </p>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @media (max-width: 480px) {
          [style*="gridTemplateColumns: 1fr 1fr 1fr"] {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}} />
    </div>
  );
}
