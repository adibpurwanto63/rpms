"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  ShieldCheck, Mail, Lock, ArrowRight, Activity
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@rpms.id");
  const [password, setPassword] = useState("Admin@123");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password, remember);
      router.push("/portal/dashboard");
    } catch {
      setError("Email atau password salah. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { email: "admin@rpms.id", role: "Super Admin", color: "#7C6FE0" },
    { email: "director@rpms.id", role: "Director", color: "#4ECDC4" },
    { email: "finance@rpms.id", role: "Finance Manager", color: "#FF6B9D" },
    { email: "procurement@rpms.id", role: "Procurement", color: "#7C6FE0" },
    { email: "qc@rpms.id", role: "QC Officer", color: "#FFB020" },
    { email: "production@rpms.id", role: "Production", color: "#4ECDC4" },
    { email: "warehouse@rpms.id", role: "Warehouse", color: "#FF6B9D" },
    { email: "logistics@rpms.id", role: "Logistics", color: "#7C6FE0" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
      fontFamily: "'Inter', -apple-system, sans-serif",
      position: "relative",
      padding: 24,
      overflow: "hidden"
    }}>
      {/* Ambient Glow Effects */}
      <div style={{ position: "absolute", top: "5%", left: "10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,111,224,0.15) 0%, rgba(124,111,224,0) 60%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "5%", right: "10%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(78,205,196,0.12) 0%, rgba(78,205,196,0) 60%)", pointerEvents: "none" }} />

      {/* Modern dark grid background */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        pointerEvents: "none"
      }} />

      {/* Login Card */}
      <div style={{ 
        width: "100%", maxWidth: 480,
        background: "var(--bg-card)",
        padding: "48px",
        borderRadius: 24,
        boxShadow: "var(--shadow-card)",
        position: "relative",
        zIndex: 10
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40, justifyContent: "center" }}>
          <img src="/logo.png" alt="RPMS Logo" style={{ width: 44, height: 44, objectFit: "contain" }} />
          <span style={{ color: "var(--text-primary)", fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Aftech<span style={{ color: "var(--text-muted)", fontWeight: 400 }}> RPMS</span>
          </span>
        </div>

        <div style={{ marginBottom: 36, textAlign: "center" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>Selamat datang kembali</h2>
          <p style={{ color: "var(--text-secondary)", marginTop: 8, fontSize: 15 }}>Masuk ke akun RPMS Anda untuk melanjutkan</p>
        </div>

        {error && (
          <div style={{
            background: "var(--color-red-light)",
            border: "1px solid var(--color-red)",
            borderRadius: 12,
            padding: "14px 16px",
            marginBottom: 24,
            color: "var(--color-red)",
            fontSize: 14,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <ShieldCheck size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Alamat Email</label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                <Mail size={18} />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="anda@perusahaan.com"
                required
                autoComplete="username"
                style={{ 
                  width: "100%", padding: "12px 16px 12px 42px", 
                  border: "1px solid var(--border-medium)", borderRadius: 12, 
                  fontSize: 14, color: "var(--text-primary)", outline: "none",
                  background: "var(--bg-card)",
                  transition: "all 0.2s ease"
                }}
                onFocus={e => { e.target.style.borderColor = "var(--color-primary)"; e.target.style.boxShadow = "0 0 0 3px rgba(124,111,224,0.15)"; }}
                onBlur={e => { e.target.style.borderColor = "var(--border-medium)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Kata Sandi</label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                <Lock size={18} />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{ 
                  width: "100%", padding: "12px 16px 12px 42px", 
                  border: "1px solid var(--border-medium)", borderRadius: 12, 
                  fontSize: 14, color: "var(--text-primary)", outline: "none",
                  background: "var(--bg-card)",
                  transition: "all 0.2s ease"
                }}
                onFocus={e => { e.target.style.borderColor = "var(--color-primary)"; e.target.style.boxShadow = "0 0 0 3px rgba(124,111,224,0.15)"; }}
                onBlur={e => { e.target.style.borderColor = "var(--border-medium)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: -4 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ accentColor: "var(--color-primary)", width: 16, height: 16 }}
              />
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                Ingat saya ({remember ? "30 hari" : "sesi ini saja"})
              </span>
            </label>
            <a href="#" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-primary)", textDecoration: "none" }}>Lupa sandi?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "var(--text-muted)" : "#4ECDC4",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => { if(!loading) e.currentTarget.style.background = "#3DB5AD"; }}
            onMouseLeave={e => { if(!loading) e.currentTarget.style.background = "#4ECDC4"; }}
          >
            {loading ? (
              <>
                <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Memproses...
              </>
            ) : (
              <>Masuk ke Dashboard <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        {/* Demo Accounts */}
        <div style={{ marginTop: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border-light)" }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Atau coba demo akses</span>
            <div style={{ flex: 1, height: 1, background: "var(--border-light)" }} />
          </div>
          <div className="rg-2" style={{ gap: 8 }}>
            {demoAccounts.map((a, i) => (
              <button
                type="button"
                key={i}
                onClick={() => { setEmail(a.email); setPassword("Admin@123"); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  textAlign: "left",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--border-light)",
                  background: "var(--bg-card)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = "var(--bg-hover)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.background = "var(--bg-card)"; }}
              >
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: a.color }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{a.role}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{a.email.split('@')[0]}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
