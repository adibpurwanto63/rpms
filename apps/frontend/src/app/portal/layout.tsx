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
      <div className="flex items-center justify-center min-h-screen bg-[#f4f6f9]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const accessible = navItems.filter(n => canAccess(user.role, n.module));

  return (
    <div className="flex min-h-screen bg-[#f4f6f9]">
      {/* Sidebar - AdminLTE Dark */}
      <aside className="bg-[#343a40] text-white flex flex-col transition-all duration-300 shadow-[0_14px_28px_rgba(0,0,0,.25),_0_10px_10px_rgba(0,0,0,.22)] z-40" style={{
        width: collapsed ? "73px" : "250px", minHeight: "100vh", position: "fixed", top: 0, left: 0
      }}>
        {/* Brand Logo */}
        <Link href="/portal/dashboard" className="flex items-center gap-3 px-4 h-[57px] border-b border-[#4b545c] hover:text-white transition-colors">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg flex-shrink-0 shadow-sm text-center ml-1">♻</div>
          {!collapsed && <span className="font-light text-[1.25rem] truncate">RPMS<span className="font-bold">Portal</span></span>}
        </Link>

        {/* User Panel */}
        <div className="border-b border-[#4b545c] p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm text-white">
            {user.name.charAt(0)}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm text-[#c2c7d0] hover:text-white transition-colors truncate">{user.name}</div>
            </div>
          )}
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-1 py-4 overflow-y-auto px-2">
          <ul className="space-y-1">
            {accessible.map(item => {
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded transition-colors text-[0.9rem]"
                    style={{
                      backgroundColor: active ? "#007bff" : "transparent",
                      color: active ? "#ffffff" : "#c2c7d0",
                    }}
                    title={collapsed ? item.label : undefined}>
                    <span className="text-base flex-shrink-0 text-center w-5">{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: collapsed ? "73px" : "250px", transition: "margin 0.3s" }}>
        
        {/* Top Navbar */}
        <header className="bg-white sticky top-0 z-30 h-[57px] flex items-center justify-between px-4 border-b border-gray-200 transition-all">
          <div className="flex items-center gap-4">
            <button onClick={() => setCollapsed(!collapsed)} className="text-gray-500 hover:text-gray-700 p-1">
              {collapsed ? "»" : "«"}
            </button>
            <span className="hidden sm:inline text-sm text-gray-500 font-medium">Home</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-xs text-gray-500">{new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
            <div className="badge badge-info">{roleLabel[user.role]}</div>
            <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500 px-2 py-1">
              Logout
            </button>
          </div>
        </header>

        {/* Content Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl sm:text-2xl font-light text-gray-800 m-0">
            {accessible.find(n => pathname.startsWith(n.href))?.label || "Portal"}
          </h1>
          <ol className="flex text-sm text-gray-500 mt-2 sm:mt-0">
            <li><Link href="/portal/dashboard" className="text-blue-500 hover:underline">Home</Link></li>
            <li className="mx-2">/</li>
            <li className="text-gray-500 active">{accessible.find(n => pathname.startsWith(n.href))?.label}</li>
          </ol>
        </div>

        {/* Page Content */}
        <section className="flex-1 px-4 sm:px-6 pb-6 animate-fade-in">
          {children}
        </section>
      </div>
    </div>
  );
}
