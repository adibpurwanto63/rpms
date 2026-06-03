"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const gradeColor: any = { A: "badge-success", B: "badge-warning", REJECT: "badge-danger" };
const statusColor: any = { IN_STOCK: "badge-success", RESERVED: "badge-info", SHIPPED: "badge-neutral", DAMAGED: "badge-danger" };
const statusLabel: any = { IN_STOCK: "Tersedia", RESERVED: "Reserved", SHIPPED: "Terkirim", DAMAGED: "Rusak" };

export default function WarehousePage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ area: "", status: "", grade: "" });

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.area) params.set("area", filter.area);
    if (filter.status) params.set("status", filter.status);
    if (filter.grade) params.set("grade", filter.grade);
    Promise.all([
      api.get(`/warehouse?${params}`),
      api.get("/warehouse/summary"),
    ]).then(([inv, sum]) => {
      setInventory(inv.data); setSummary(sum.data);
    }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [filter]);

  const totalWeight = inventory.reduce((a, i) => a + (i.weight || 0), 0);

  const areaCards = [
    { area: "RAW_MATERIAL", icon: "📥", label: "Bahan Baku", variant: "dark" },
    { area: "FINISHED_GOODS", icon: "📦", label: "Barang Jadi", variant: "mint" },
    { area: "REJECTED", icon: "🗑️", label: "Reject", variant: "pink" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Manajemen Gudang</h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Tracking bale, stok inventory, dan FIFO</p>
      </div>

      {/* Area Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {areaCards.map(({ area, icon, label, variant }) => {
          const areaData = summary.filter((s: any) => s.area === area);
          const count = areaData.reduce((a: any, s: any) => a + s._count, 0);
          const weight = areaData.reduce((a: any, s: any) => a + (s._sum?.weight || 0), 0);
          const variantBg: any = { dark: "var(--kpi-dark)", mint: "var(--kpi-mint-bg)", pink: "var(--kpi-pink-bg)" };
          return (
            <div key={area} className="kpi-card" style={{ background: variantBg[variant], borderColor: variant === "dark" ? "transparent" : undefined }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: variant === "dark" ? "rgba(255,255,255,0.6)" : "var(--text-secondary)" }}>{label}</span>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: variant === "dark" ? "rgba(255,255,255,0.12)" : "rgba(78,205,196,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.03em", color: variant === "dark" ? "#fff" : "var(--text-primary)", lineHeight: 1.2 }}>{count} Bale</div>
              <div style={{ fontSize: 13, color: variant === "dark" ? "rgba(255,255,255,0.5)" : "var(--text-muted)" }}>{(weight / 1000).toFixed(2)} Ton</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="erp-card">
        <div style={{ padding: "16px 20px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Filter:</span>
          <select className="form-select" value={filter.area} onChange={e => setFilter({ ...filter, area: e.target.value })} style={{ minWidth: 140, flex: 1 }}>
            <option value="">Semua Area</option>
            <option value="RAW_MATERIAL">Bahan Baku</option>
            <option value="FINISHED_GOODS">Barang Jadi</option>
            <option value="REJECTED">Reject</option>
          </select>
          <select className="form-select" value={filter.grade} onChange={e => setFilter({ ...filter, grade: e.target.value })} style={{ minWidth: 130, flex: 1 }}>
            <option value="">Semua Grade</option>
            <option value="A">Grade A</option>
            <option value="B">Grade B</option>
            <option value="REJECT">Reject</option>
          </select>
          <select className="form-select" value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })} style={{ minWidth: 130, flex: 1 }}>
            <option value="">Semua Status</option>
            <option value="IN_STOCK">Tersedia</option>
            <option value="RESERVED">Reserved</option>
            <option value="SHIPPED">Terkirim</option>
          </select>
          {(filter.area || filter.grade || filter.status) && (
            <button className="btn btn-ghost btn-sm" onClick={() => setFilter({ area: "", status: "", grade: "" })}>
              ✕ Reset
            </button>
          )}
        </div>
      </div>

      {/* Summary bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 14 }}>
        <span style={{ color: "var(--text-secondary)" }}>{inventory.length} bale ditemukan</span>
        <span style={{ color: "var(--text-muted)" }}>·</span>
        <span style={{ fontWeight: 700, color: "var(--color-teal)" }}>Total: {(totalWeight / 1000).toFixed(2)} Ton</span>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #EDE9FF", borderTop: "3px solid #7C6FE0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : (
        <div className="erp-card">
          <div style={{ overflowX: "auto" }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Bale ID</th><th>Berat (kg)</th><th>Grade</th>
                  <th>Area</th><th>Lokasi</th><th>Status</th><th>Tgl Produksi</th>
                </tr>
              </thead>
              <tbody>
                {inventory.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Tidak ada bale ditemukan</td></tr>
                ) : inventory.map((item: any) => (
                  <tr key={item.id}>
                    <td style={{ fontFamily: "monospace", fontSize: 13, color: "var(--color-purple)", fontWeight: 600 }}>{item.baleId}</td>
                    <td style={{ fontWeight: 600 }}>{item.weight?.toLocaleString("id-ID")}</td>
                    <td><span className={`badge ${gradeColor[item.grade]}`}>{item.grade}</span></td>
                    <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>{item.area?.replace("_", " ")}</td>
                    <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)" }}>{item.location || "—"}</td>
                    <td><span className={`badge ${statusColor[item.status]}`}>{statusLabel[item.status] || item.status}</span></td>
                    <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      {item.productionDate ? new Date(item.productionDate).toLocaleDateString("id-ID") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
