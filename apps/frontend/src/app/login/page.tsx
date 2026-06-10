"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff, ShieldCheck, Recycle } from "lucide-react";

const DEMO_ACCOUNTS = [
  { email: "admin@rpms.id", role: "SUPER_ADMIN", label: "Super Admin", color: "#2563eb" },
  { email: "director@rpms.id", role: "DIRECTOR", label: "Director", color: "#2563eb" },
  { email: "finance@rpms.id", role: "FINANCE_MANAGER", label: "Finance Manager", color: "#2563eb" },
  { email: "procurement@rpms.id", role: "PROCUREMENT_MANAGER", label: "Procurement Mgr", color: "#2563eb" },
  { email: "qc@rpms.id", role: "QC_OFFICER", label: "QC Officer", color: "#2563eb" },
  { email: "production@rpms.id", role: "PRODUCTION_SUPERVISOR", label: "Production Supv.", color: "#2563eb" },
  { email: "warehouse@rpms.id", role: "WAREHOUSE_SUPERVISOR", label: "Warehouse Supv.", color: "#2563eb" },
  { email: "logistics@rpms.id", role: "LOGISTICS_MANAGER", label: "Logistics Mgr", color: "#2563eb" },
  { email: "supplier@rpms.id", role: "SUPPLIER", label: "Supplier", color: "#2563eb" },
];

const DEMO_PASSWORD = "password123";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@rpms.id");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
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
    setShowDemoAccounts(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#ffffff",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding: "24px",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 440,
        animation: "fadeInUp 0.35s ease both",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "#EEF2FF",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 24,
          }}>
            <Recycle size={26} color="#2563eb" strokeWidth={2.5} />
          </div>

          <h1 style={{
            fontSize: 26, fontWeight: 700, color: "#111827",
            letterSpacing: "-0.02em", margin: 0, textAlign: "center",
          }}>
            Selamat datang kembali!
          </h1>
          <p style={{ color: "#6B7280", fontSize: 14, marginTop: 8, textAlign: "center" }}>
            {selectedAccount ? (
              <>Masuk sebagai <span style={{ color: "#2563eb", fontWeight: 600 }}>{selectedAccount.label}</span></>
            ) : (
              <>Masuk ke akun RPMS Anda</>
            )}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#FEF2F2",
            border: "1px solid #FCA5A5",
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 20,
            color: "#DC2626",
            fontSize: 13,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <ShieldCheck size={16} /> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Email */}
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(""); }}
            placeholder="Email address"
            required
            autoComplete="username"
            style={{
              width: "100%", padding: "14px 18px",
              border: "1.5px solid #E5E7EB",
              borderRadius: 14,
              fontSize: 14, color: "#111827", outline: "none",
              background: "#ffffff",
              transition: "border-color 0.2s, box-shadow 0.2s",
              boxSizing: "border-box",
            }}
            onFocus={e => {
              e.target.style.borderColor = "#2563eb";
              e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
            }}
            onBlur={e => {
              e.target.style.borderColor = "#E5E7EB";
              e.target.style.boxShadow = "none";
            }}
          />

          {/* Password */}
          <div style={{ position: "relative" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              placeholder="Password"
              required
              autoComplete="current-password"
              style={{
                width: "100%", padding: "14px 48px 14px 18px",
                border: "1.5px solid #E5E7EB",
                borderRadius: 14,
                fontSize: 14, color: "#111827", outline: "none",
                background: "#ffffff",
                transition: "border-color 0.2s, box-shadow 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={e => {
                e.target.style.borderColor = "#2563eb";
                e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
              }}
              onBlur={e => {
                e.target.style.borderColor = "#E5E7EB";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              style={{
                position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "#9CA3AF", display: "flex", padding: 0,
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Remember + Forgot */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "#2563eb", borderRadius: 4, cursor: "pointer" }}
              />
              <span style={{ fontSize: 13, color: "#6B7280" }}>Remember me</span>
            </label>
            <a href="#" style={{ fontSize: 13, fontWeight: 600, color: "#2563eb", textDecoration: "none" }}>
              Forgot password?
            </a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "#93C5FD" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 9999,
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.2s ease",
              letterSpacing: "-0.01em",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#1d4ed8"; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#2563eb"; }}
          >
            {loading ? (
              <>
                <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Memproses...
              </>
            ) : (
              "Log in"
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "24px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
          <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.05em" }}>OR</span>
          <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
        </div>

        {/* Demo Accounts toggle */}
        <button
          type="button"
          onClick={() => setShowDemoAccounts(!showDemoAccounts)}
          style={{
            width: "100%",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#2563eb",
            fontSize: 14,
            fontWeight: 600,
            textAlign: "center",
            padding: "4px 0",
            letterSpacing: "-0.01em",
          }}
        >
          {showDemoAccounts ? "Sembunyikan akun demo ↑" : "Akses cepat akun demo →"}
        </button>

        {/* Demo Accounts Grid */}
        {showDemoAccounts && (
          <div style={{
            marginTop: 16,
            background: "#F9FAFB",
            border: "1.5px solid #E5E7EB",
            borderRadius: 16,
            padding: 16,
            animation: "fadeInUp 0.2s ease both",
          }}>
            <p style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>
              Pilih akun demo
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {DEMO_ACCOUNTS.map((acc, i) => {
                const isSelected = email === acc.email;
                return (
                  <button
                    type="button"
                    key={i}
                    onClick={() => selectAccount(acc)}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      padding: "10px 6px",
                      borderRadius: 10,
                      border: isSelected ? "1.5px solid #2563eb" : "1.5px solid #E5E7EB",
                      background: isSelected ? "#EEF2FF" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = "#93C5FD";
                        e.currentTarget.style.background = "#F5F8FF";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = "#E5E7EB";
                        e.currentTarget.style.background = "#ffffff";
                      }
                    }}
                  >
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: isSelected ? "#2563eb" : "#D1D5DB",
                    }} />
                    <div style={{
                      fontSize: 10, fontWeight: 600,
                      color: isSelected ? "#2563eb" : "#374151",
                      textAlign: "center", lineHeight: 1.3,
                    }}>
                      {acc.label}
                    </div>
                    <div style={{ fontSize: 9, color: "#9CA3AF" }}>
                      {acc.email.split("@")[0]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: 12, color: "#D1D5DB", marginTop: 32 }}>
          © 2026 Aftech RPMS — All rights reserved
        </p>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 480px) {
          [style*="gridTemplateColumns: 1fr 1fr 1fr"] {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
