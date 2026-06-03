"use client";
import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { canAccess } from "@/lib/permissions";

const navItems = [
  { href: "/portal/dashboard", icon: "📊", label: "Dashboard", module: "dashboard" },
  { href: "/portal/purchase", icon: "🛒", label: "Procurement", module: "purchase" },
  { href: "/portal/weighbridge", icon: "⚖️", label: "Timbangan", module: "weighbridge" },
  { href: "/portal/qc", icon: "🔬", label: "Quality Control", module: "qc" },
  { href: "/portal/production", icon: "🏭", label: "Produksi", module: "production" },
  { href: "/portal/warehouse", icon: "📦", label: "Gudang", module: "warehouse" },
  { href: "/portal/logistics", icon: "🚛", label: "Logistik", module: "logistics" },
  { href: "/portal/finance", icon: "💹", label: "Keuangan", module: "finance" },
  { href: "/portal/bcp", icon: "🛡️", label: "BCP Center", module: "bcp" },
  { href: "/portal/settings", icon: "⚙️", label: "Settings", module: "settings" },
];

const roleBadgeColor: Record<string, string> = {
  SUPER_ADMIN: "#a855f7", DIRECTOR: "#3b82f6", FINANCE_MANAGER: "#f59e0b",
  PROCUREMENT_MANAGER: "#10b981", QC_OFFICER: "#f97316", PRODUCTION_SUPERVISOR: "#06b6d4",
  WAREHOUSE_SUPERVISOR: "#ec4899", LOGISTICS_MANAGER: "#8b5cf6", SUPPLIER: "#ef4444",
};

const roleLabel: Record<string, string> = {
  SUPER_ADMIN: "Super Admin", DIRECTOR: "Director", FINANCE_MANAGER: "Finance Manager",
  PROCUREMENT_MANAGER: "Procurement Mgr", QC_OFFICER: "QC Officer",
  PRODUCTION_SUPERVISOR: "Production Supv.", WAREHOUSE_SUPERVISOR: "Warehouse Supv.",
  LOGISTICS_MANAGER: "Logistics Mgr", SUPPLIER: "Supplier",
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const accessible = navItems.filter(n => canAccess(user.role, n.module));
  const color = roleBadgeColor[user.role] || "#10b981";

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="glass flex flex-col transition-all duration-300 border-r" style={{
        width: collapsed ? "72px" : "240px", minHeight: "100vh", position: "fixed", top: 0, left: 0, zIndex: 40
      }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: "rgba(148,163,184,0.1)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #10b981, #0ea5e9)" }}>♻</div>
          {!collapsed && <div className="font-bold text-sm gradient-text">RPMS Portal</div>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {accessible.map(item => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg mb-0.5 transition-all text-sm"
                style={{
                  background: active ? "rgba(16,185,129,0.12)" : "transparent",
                  color: active ? "#10b981" : "#94a3b8",
                  borderLeft: active ? "3px solid #10b981" : "3px solid transparent",
                }}
                title={collapsed ? item.label : undefined}>
                <span className="text-base flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t p-3" style={{ borderColor: "rgba(148,163,184,0.1)" }}>
          {!collapsed ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: color, color: "white" }}>{user.name.charAt(0)}</div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">{user.name}</div>
                  <div className="text-xs truncate" style={{ color }}>{roleLabel[user.role]}</div>
                </div>
              </div>
              <button onClick={logout} className="w-full text-left text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded">
                🚪 Keluar
              </button>
            </div>
          ) : (
            <button onClick={() => {}} title={user.name}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mx-auto"
              style={{ background: color, color: "white" }}>{user.name.charAt(0)}</button>
          )}
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full border flex items-center justify-center text-xs"
          style={{ background: "#0f172a", borderColor: "rgba(148,163,184,0.2)", color: "#94a3b8" }}>
          {collapsed ? "›" : "‹"}
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col" style={{ marginLeft: collapsed ? "72px" : "240px", transition: "margin 0.3s" }}>
        {/* Topbar */}
        <header className="glass sticky top-0 z-30 border-b px-6 py-3 flex items-center justify-between"
          style={{ borderColor: "rgba(148,163,184,0.1)" }}>
          <div>
            <h1 className="font-bold text-sm">
              {accessible.find(n => pathname.startsWith(n.href))?.icon}{" "}
              {accessible.find(n => pathname.startsWith(n.href))?.label || "Portal"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-500">{new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
            <div className="badge" style={{ background: `${color}22`, color, borderColor: `${color}55`, fontSize: "0.7rem" }}>
              {roleLabel[user.role]}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-6 animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
