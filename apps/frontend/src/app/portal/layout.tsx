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
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const accessible = navItems.filter(n => canAccess(user.role, n.module));

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Sidebar - Paper.id Style (White, clean) */}
      <aside className="bg-white text-gray-800 flex flex-col transition-all duration-300 z-40 border-r border-gray-200" style={{
        width: collapsed ? "73px" : "250px", minHeight: "100vh", position: "fixed", top: 0, left: 0
      }}>
        {/* Brand Logo */}
        <Link href="/portal/dashboard" className="flex items-center gap-3 px-6 h-[72px] border-b border-gray-100 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-[#4195D5] flex items-center justify-center text-lg flex-shrink-0 text-white font-bold text-center ml-1">P</div>
          {!collapsed && <span className="font-semibold text-[1.25rem] text-[#1A1C21] tracking-tight truncate">Paper<span className="text-[#4195D5]">RPMS</span></span>}
        </Link>

        {/* Sidebar Menu */}
        <nav className="flex-1 py-6 overflow-y-auto px-4">
          <ul className="space-y-1.5">
            {accessible.map(item => {
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link href={item.href}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium"
                    style={{
                      backgroundColor: active ? "rgba(65, 149, 213, 0.1)" : "transparent",
                      color: active ? "#4195D5" : "#5F6B7C",
                    }}
                    title={collapsed ? item.label : undefined}>
                    <span className="text-lg flex-shrink-0 text-center w-6">{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* User Panel (Bottom) */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2 border border-gray-100">
            <div className="w-8 h-8 rounded-full bg-[#4195D5] flex items-center justify-center text-sm font-bold flex-shrink-0 text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-gray-800 truncate">{user.name}</div>
                <div className="text-xs text-gray-500 truncate">{roleLabel[user.role]}</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: collapsed ? "73px" : "250px", transition: "margin 0.3s" }}>
        
        {/* Top Navbar */}
        <header className="bg-white sticky top-0 z-30 h-[72px] flex items-center justify-between px-6 border-b border-gray-200 transition-all">
          <div className="flex items-center gap-6">
            <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-[#4195D5] transition-colors p-1 flex items-center justify-center w-8 h-8 rounded-md bg-gray-50 border border-gray-200">
              {collapsed ? "»" : "«"}
            </button>
            {/* Breadcrumb replacement for modern look */}
            <div className="hidden sm:flex items-center text-sm font-medium text-gray-400">
               <span className="text-[#4195D5]">RPMS</span>
               <span className="mx-2">/</span>
               <span className="text-gray-800">{accessible.find(n => pathname.startsWith(n.href))?.label || "Portal"}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm text-gray-500 font-medium">{new Date().toLocaleDateString("id-ID", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</div>
            <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>
            <button onClick={logout} className="text-sm font-semibold text-[#F04438] hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors">
              Keluar
            </button>
          </div>
        </header>

        {/* Page Content */}
        <section className="flex-1 p-6 sm:p-8 animate-fade-in">
          {children}
        </section>
      </div>
    </div>
  );
}
