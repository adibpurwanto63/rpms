"use client";
import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef, Fragment } from "react";
import Link from "next/link";
import { canAccess } from "@/lib/permissions";
import { RefreshProvider } from "@/lib/refresh-context";
import api from "@/lib/api";
import {
  LayoutDashboard, ShoppingCart, Scale, ShoppingBag, Factory,
  Warehouse, Truck, BarChart2, ShieldCheck, Settings,
  Bell, ChevronRight, Home, LogOut, User
} from "lucide-react";

const navItems = [
  { href: "/portal/dashboard",  Icon: LayoutDashboard, label: "Dashboard",  module: "dashboard",   category: "Core" },
  { href: "/portal/purchase",   Icon: ShoppingCart,    label: "Procurement", module: "purchase",    category: "Supply Chain" },
  { href: "/portal/weighbridge",Icon: Scale,           label: "Timbangan",  module: "weighbridge", category: "Supply Chain" },
  { href: "/portal/pembelian",  Icon: ShoppingBag,     label: "Pembelian",  module: "pembelian",   category: "Supply Chain" },
  { href: "/portal/production", Icon: Factory,         label: "Produksi",   module: "production",  category: "Operations" },
  { href: "/portal/warehouse",  Icon: Warehouse,       label: "Gudang",     module: "warehouse",   category: "Operations" },
  { href: "/portal/logistics",  Icon: Truck,           label: "Logistik",   module: "logistics",   category: "Operations" },
  { href: "/portal/finance",    Icon: BarChart2,       label: "Keuangan",   module: "finance",     category: "Finance & Admin" },
  { href: "/portal/bcp",        Icon: ShieldCheck,     label: "BCP Center", module: "bcp",         category: "Finance & Admin" },
  { href: "/portal/settings",   Icon: Settings,        label: "Settings",   module: "settings",    category: "Finance & Admin" },
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setUserMenuOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) setNotificationsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data || []);
    } catch (e) {}
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // poll every 10 seconds
    return () => clearInterval(interval);
  }, [user]);

  const handleNotificationsClick = async () => {
    setNotificationsOpen(!notificationsOpen);
    if (!notificationsOpen && notifications.length > 0) {
      // Mark as read when opening
      try {
        await api.post("/notifications/mark-read");
        setNotifications([]);
      } catch (e) {}
    }
  };

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
        width: collapsed ? "60px" : "220px",
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
          height: 52,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: collapsed ? "0 14px" : "0 16px",
          borderBottom: "1px solid var(--border-light)",
          flexShrink: 0,
        }}>
          <div style={{
            width: 28, height: 28,
            borderRadius: 5,
            background: "var(--color-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff",
            fontWeight: 700, fontSize: 13,
            flexShrink: 0,
          }}>R</div>
          {!collapsed && (
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
              RPMS <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: 13 }}>ERP</span>
            </span>
          )}
        </div>


        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: "auto", padding: collapsed ? "8px 6px" : "8px 0" }}>
          {accessible.map((item, index) => {
            const active = pathname.startsWith(item.href);
            const showCategory = index === 0 || item.category !== accessible[index - 1].category;

            return (
              <Fragment key={item.href}>
                {showCategory && !collapsed && (
                  <div style={{ 
                    fontSize: 10, fontWeight: 600, color: "var(--text-muted)", 
                    textTransform: "uppercase", letterSpacing: "0.10em", 
                    padding: index === 0 ? "10px 14px 4px" : "20px 14px 4px",
                  }}>
                    {item.category}
                  </div>
                )}
                {showCategory && collapsed && index > 0 && (
                  <div style={{ height: 1, background: "var(--border-light)", margin: "8px 14px" }} />
                )}
                <Link href={item.href}
                  title={collapsed ? item.label : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: collapsed ? "9px 14px" : "7px 14px",
                  borderRadius: 0,
                  margin: "1px 0",
                  color: active ? "var(--color-primary)" : "var(--text-secondary)",
                  fontWeight: active ? 600 : 400,
                  fontSize: 13,
                  textDecoration: "none",
                  background: active ? "rgba(36,144,239,0.07)" : "transparent",
                  borderLeft: active ? "3px solid var(--color-primary)" : "3px solid transparent",
                  transition: "all 0.12s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; } }}
              >
                <item.Icon
                  size={16}
                  strokeWidth={active ? 2 : 1.75}
                  style={{ flexShrink: 0, width: 20 }}
                />
                {!collapsed && <span>{item.label}</span>}
                </Link>
              </Fragment>
            );
          })}
        </nav>

        {/* User Panel */}
        <div style={{
          borderTop: "1px solid var(--border-light)",
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            background: roleColor[user.role] || "var(--color-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 600, fontSize: 12,
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{roleLabel[user.role]}</div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Wrapper ── */}
      <div style={{
        marginLeft: collapsed ? 60 : 220,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        transition: "margin-left 0.25s ease",
      }}>

        {/* Top Navbar — ERPNext style: compact flat bar */}
        <header style={{
          background: "#fff",
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          borderBottom: "1px solid var(--border-light)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Collapse button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                width: 28, height: 28, borderRadius: 4,
                border: "1px solid var(--border-light)",
                background: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "var(--text-secondary)",
                fontSize: 13,
                transition: "all 0.15s ease",
              }}
              title="Toggle sidebar"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <line x1="1" y1="4" x2="13" y2="4"/>
                <line x1="1" y1="8" x2="13" y2="8"/>
                <line x1="1" y1="12" x2="13" y2="12"/>
              </svg>
            </button>

            {/* Breadcrumb / Page title */}
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Home size={12} color="var(--text-muted)" />
              <ChevronRight size={11} color="var(--text-muted)" />
              {currentPage?.Icon && (
                <currentPage.Icon size={13} color="var(--color-primary)" strokeWidth={2} />
              )}
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                {currentPage?.label || "Portal"}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Notification bell */}
            <div ref={notificationsRef} style={{ position: "relative" }}>
              <div
                onClick={handleNotificationsClick}
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  border: "1px solid var(--border-light)",
                  background: notificationsOpen ? "#F3F4F6" : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", position: "relative",
                  transition: "background 0.15s ease",
                }}>
                <Bell size={16} color={notifications.length > 0 ? "var(--color-primary)" : "var(--text-secondary)"} />
                {notifications.length > 0 && (
                  <div style={{
                    position: "absolute", top: 6, right: 6,
                    width: 8, height: 8, borderRadius: "50%",
                    background: "var(--color-pink)",
                    border: "2px solid #fff",
                  }} />
                )}
              </div>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: 320,
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  border: "1px solid var(--border-light)",
                  overflow: "hidden",
                  zIndex: 100,
                }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-light)", background: "#F9FAFB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Notifikasi</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", cursor: "pointer" }} onClick={() => { api.post("/notifications/mark-read"); setNotifications([]); }}>Tandai semua dibaca</div>
                  </div>
                  <div style={{ maxHeight: 300, overflowY: "auto", padding: 8 }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: "20px 10px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                        Belum ada notifikasi baru.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} style={{ padding: "10px 12px", borderRadius: 8, borderBottom: "1px solid var(--border-light)", marginBottom: 4, background: n.isRead ? "transparent" : "#F3F4F6" }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{n.title}</div>
                          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{n.message}</div>
                          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>{new Date(n.createdAt).toLocaleString("id-ID")}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
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
        <main style={{ flex: 1, padding: "20px 24px", animation: "fadeInUp 0.25s ease both" }}>
          <RefreshProvider>
            {children}
          </RefreshProvider>
        </main>
      </div>
    </div>
  );
}
