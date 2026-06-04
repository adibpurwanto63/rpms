"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard, ShoppingCart, Factory, BarChart2, Truck, Warehouse, ShieldCheck, Mail, Lock, ArrowRight, Activity
} from "lucide-react";

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
      background: "#F8FAFC",
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* Left Panel - Brand */}
      <div style={{
        flex: "0 0 45%",
        background: "linear-gradient(135deg, #1E1E2E 0%, #11111A 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Modern Grid Background */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none"
        }} />
        
        {/* Glow Effects */}
        <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,111,224,0.15) 0%, rgba(124,111,224,0) 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -150, left: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(78,205,196,0.1) 0%, rgba(78,205,196,0) 70%)", pointerEvents: "none" }} />

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "linear-gradient(135deg, #7C6FE0, #4ECDC4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: 24,
            boxShadow: "0 8px 20px rgba(124,111,224,0.4)"
          }}>R</div>
          <span style={{ color: "#fff", fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>
            RPMS<span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 400 }}>.flow</span>
          </span>
        </div>

        {/* Center content */}
        <div style={{ position: "relative", marginTop: "auto", marginBottom: "auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 12px", borderRadius: 99, background: "rgba(124,111,224,0.15)",
            border: "1px solid rgba(124,111,224,0.3)",
            fontSize: 12, fontWeight: 600, color: "#A79DFF",
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 24,
          }}>
            <Activity size={14} /> Next-Gen ERP
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 800, color: "#fff", lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 20 }}>
            Kelola bisnis<br />
            lebih <span style={{ background: "linear-gradient(135deg, #A79DFF, #6EE7B7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>cerdas</span>
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, maxWidth: 380 }}>
            Platform ERP Enterprise terpadu untuk mengelola pengadaan, produksi, logistik, dan keuangan dalam satu ekosistem yang mulus.
          </p>

          {/* Feature chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 32 }}>
            {[
              { icon: LayoutDashboard, label: "Dashboard" },
              { icon: ShoppingCart, label: "Procurement" },
              { icon: Factory, label: "Produksi" },
              { icon: BarChart2, label: "Keuangan" },
              { icon: Truck, label: "Logistik" },
              { icon: Warehouse, label: "Gudang" },
            ].map(item => (
              <div key={item.label} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 16px", borderRadius: 99,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.7)",
                fontSize: 13, fontWeight: 500,
                backdropFilter: "blur(10px)"
              }}>
                <item.icon size={14} style={{ color: "#A79DFF" }} />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, position: "relative" }}>
          © 2026 RPMS.flow · Enterprise Edition
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
        <div style={{ 
          width: "100%", maxWidth: 440,
          background: "#fff",
          padding: "48px",
          borderRadius: 24,
          boxShadow: "0 20px 40px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)"
        }}>
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.03em" }}>Selamat datang kembali</h2>
            <p style={{ color: "#64748B", marginTop: 8, fontSize: 15 }}>Masuk ke akun RPMS Anda untuk melanjutkan</p>
          </div>

          {error && (
            <div style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: 12,
              padding: "14px 16px",
              marginBottom: 24,
              color: "#DC2626",
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
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 8 }}>Alamat Email</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>
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
                    border: "1px solid #E2E8F0", borderRadius: 12, 
                    fontSize: 14, color: "#0F172A", outline: "none",
                    transition: "all 0.2s ease"
                  }}
                  onFocus={e => { e.target.style.borderColor = "#7C6FE0"; e.target.style.boxShadow = "0 0 0 3px rgba(124,111,224,0.15)"; }}
                  onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 8 }}>Kata Sandi</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>
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
                    border: "1px solid #E2E8F0", borderRadius: 12, 
                    fontSize: 14, color: "#0F172A", outline: "none",
                    transition: "all 0.2s ease"
                  }}
                  onFocus={e => { e.target.style.borderColor = "#7C6FE0"; e.target.style.boxShadow = "0 0 0 3px rgba(124,111,224,0.15)"; }}
                  onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: -4 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" style={{ accentColor: "#7C6FE0", width: 16, height: 16 }} />
                <span style={{ fontSize: 13, color: "#64748B" }}>Ingat saya</span>
              </label>
              <a href="#" style={{ fontSize: 13, fontWeight: 600, color: "#7C6FE0", textDecoration: "none" }}>Lupa sandi?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                background: loading ? "#94A3B8" : "#1E1E2E",
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
              onMouseEnter={e => { if(!loading) e.currentTarget.style.background = "#0F172A"; }}
              onMouseLeave={e => { if(!loading) e.currentTarget.style.background = "#1E1E2E"; }}
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
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
              <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Atau coba demo akses</span>
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
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
                    border: "1px solid #E2E8F0",
                    background: "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = "#F8FAFC"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#fff"; }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: a.color }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>{a.role}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{a.email.split('@')[0]}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
