"use client";
import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { canAccess } from "@/lib/permissions";
import { RefreshProvider } from "@/lib/refresh-context";
import GlobalSearch from "@/components/GlobalSearch";

const navItems = [
  { href: "/portal/dashboard", icon: "⊞", label: "Dashboard", module: "dashboard" },
  { href: "/portal/purchase", icon: "🛒", label: "Procurement", module: "purchase" },
  { href: "/portal/weighbridge", icon: "⚖️", label: "Timbangan", module: "weighbridge" },
  { href: "/portal/pembelian", icon: "🛍️", label: "Pembelian", module: "pembelian" },
  { href: "/portal/production", icon: "🏭", label: "Produksi", module: "production" },
  { href: "/portal/warehouse", icon: "📦", label: "Gudang", module: "warehouse" },
  { href: "/portal/logistics", icon: "🚛", label: "Logistik", module: "logistics" },
  { href: "/portal/finance", icon: "💹", label: "Keuangan", module: "finance" },
  { href: "/portal/bcp", icon: "🛡️", label: "BCP Center", module: "bcp" },
  { href: "/portal/settings", icon: "⚙️", label: "Settings", module: "settings" },
];

const roleLabel: Record<string, string> = {
  SUPER_ADMIN: "Super Admin", DIRECTOR: "Director", FINANCE_MANAGER: "Finance Manager",
  PROCUREMENT_MANAGER: "Procurement Mgr", QC_OFFICER: "QC Officer",
  PRODUCTION_SUPERVISOR: "Production Supv.", WAREHOUSE_SUPERVISOR: "Warehouse Supv.",
  LOGISTICS_MANAGER: "Logistics Mgr", SUPPLIER: "Supplier",
};

const roleColor: Record<string, string> = {
  SUPER_ADMIN: "#7C6FE0", DIRECTOR: "#4ECDC4", FINANCE_MANAGER: "#FF6B9D",
  PROCUREMENT_MANAGER: "#7C6FE0", QC_OFFICER: "#FFB020",
  PRODUCTION_SUPERVISOR: "#4ECDC4", WAREHOUSE_SUPERVISOR: "#FF6B9D",
  LOGISTICS_MANAGER: "#7C6FE0", SUPPLIER: "#9CA3AF",
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg-app)" }}>
        <div style={{
          width: 48, height: 48,
          border: "3px solid var(--color-purple-light)",
          borderTop: "3px solid var(--color-purple)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite"
        }} />
      </div>
    );
  }

  const accessible = navItems.filter(n => canAccess(user.role, n.module));
  const currentPage = accessible.find(n => pathname.startsWith(n.href));

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-app)" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        background: "var(--bg-sidebar)",
        width: collapsed ? "72px" : "252px",
        minHeight: "100vh",
        position: "fixed",
        top: 0, left: 0,
        boxShadow: "var(--shadow-sidebar)",
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
      }}>

        {/* Brand */}
        <div style={{
          height: 72,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: collapsed ? "0 16px" : "0 24px",
          borderBottom: "1px solid var(--border-light)",
          flexShrink: 0,
        }}>
          <div style={{
            width: 36, height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #7C6FE0 0%, #4ECDC4 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff",
            fontWeight: 800, fontSize: 16,
            flexShrink: 0,
          }}>R</div>
          {!collapsed && (
            <span style={{ fontWeight: 700, fontSize: 18, color: "var(--text-primary)", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
              RPMS<span style={{ color: "var(--color-purple)", fontWeight: 400 }}>.flow</span>
            </span>
          )}
        </div>

        {/* Search bar */}
        {!collapsed && <GlobalSearch />}

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "8px 8px 4px", display: collapsed ? "none" : "block" }}>
            Menu
          </div>
          {accessible.map(item => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                title={collapsed ? item.label : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 10px",
                  borderRadius: 8,
                  margin: "2px 0",
                  color: active ? "var(--color-purple)" : "var(--text-secondary)",
                  fontWeight: active ? 600 : 400,
                  fontSize: 14,
                  textDecoration: "none",
                  background: active ? "var(--color-purple-light)" : "transparent",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; } }}
              >
                <span style={{ fontSize: 17, lineHeight: 1, flexShrink: 0, width: 22, textAlign: "center" }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Panel */}
        <div style={{
          borderTop: "1px solid var(--border-light)",
          padding: "14px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
            background: roleColor[user.role] || "#7C6FE0",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 14,
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{roleLabel[user.role]}</div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Wrapper ── */}
      <div style={{
        marginLeft: collapsed ? 72 : 252,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}>

        {/* Top Navbar */}
        <header style={{
          background: "#fff",
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          borderBottom: "1px solid var(--border-light)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Collapse button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                width: 36, height: 36, borderRadius: 8,
                border: "1px solid var(--border-light)",
                background: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "var(--text-secondary)",
                fontSize: 16,
                transition: "all 0.15s ease",
              }}
              title="Toggle sidebar"
            >
              ☰
            </button>

            {/* Page title */}
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                {currentPage?.label || "Portal"}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>
                {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Notification bell */}
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              border: "1px solid var(--border-light)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 16, position: "relative",
            }}>
              🔔
              <div style={{
                position: "absolute", top: 6, right: 6,
                width: 8, height: 8, borderRadius: "50%",
                background: "var(--color-pink)",
                border: "2px solid #fff",
              }} />
            </div>

            {/* User badge with dropdown */}
            <div ref={userMenuRef} style={{ position: "relative" }}>
              <div 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 12px 6px 6px",
                  background: userMenuOpen ? "#F3F4F6" : "#F9FAFB",
                  borderRadius: 10,
                  border: "1px solid var(--border-light)",
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: roleColor[user.role] || "#7C6FE0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: 12,
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{user.name.split(" ")[0]}</span>
              </div>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: 200,
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  border: "1px solid var(--border-light)",
                  overflow: "hidden",
                  zIndex: 100,
                }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-light)", background: "#F9FAFB" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{user.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{roleLabel[user.role]}</div>
                  </div>
                  
                  <div style={{ padding: 8 }}>
                    <Link href="/portal/settings" onClick={() => setUserMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, textDecoration: "none", color: "var(--text-secondary)", fontSize: 13, transition: "background 0.2s ease" }} onMouseEnter={e => (e.currentTarget.style.background = "#F3F4F6")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <span>⚙️</span> Settings
                    </Link>
                    <Link href="#" onClick={() => setUserMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, textDecoration: "none", color: "var(--text-secondary)", fontSize: 13, transition: "background 0.2s ease" }} onMouseEnter={e => (e.currentTarget.style.background = "#F3F4F6")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <span>ℹ️</span> Help Center
                    </Link>
                    
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 8, cursor: "pointer", transition: "background 0.2s ease" }} onMouseEnter={e => (e.currentTarget.style.background = "#F3F4F6")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span>🌙</span>
                        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Dark mode</span>
                      </div>
                      <div style={{ width: 32, height: 18, borderRadius: 10, background: "#E5E7EB", position: "relative" }}>
                        <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: 8, borderTop: "1px solid var(--border-light)" }}>
                    <button
                      onClick={logout}
                      style={{
                        width: "100%",
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "none",
                        background: "transparent",
                        color: "var(--color-red)",
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: "pointer",
                        transition: "background 0.2s ease",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#FFF5F5")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ transform: "rotate(180deg)" }}>🚪</span> Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: "28px 32px", animationName: "fadeInUp", animationDuration: "0.4s", animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <RefreshProvider>
            {children}
          </RefreshProvider>
        </main>
      </div>
    </div>
  );
}
