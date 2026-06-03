"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const gradeColor: any = { A: "badge-success", B: "badge-warning", REJECT: "badge-danger" };
const statusColor: any = { IN_STOCK: "badge-success", RESERVED: "badge-info", SHIPPED: "badge-neutral", DAMAGED: "badge-danger" };

export default function WarehousePage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ area: "", status: "", grade: "" });

  const load = () => {
    const params = new URLSearchParams();
    if (filter.area) params.set("area", filter.area);
    if (filter.status) params.set("status", filter.status);
    if (filter.grade) params.set("grade", filter.grade);
    Promise.all([
      api.get(`/warehouse?${params}`),
      api.get("/warehouse/summary"),
    ]).then(([inv, sum]) => { setInventory(inv.data); setSummary(sum.data); }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [filter]);

  const totalWeight = inventory.reduce((a, i) => a + (i.weight || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Manajemen Gudang</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Tracking bale, stok inventory, dan metode FIFO</p>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {["RAW_MATERIAL", "FINISHED_GOODS", "REJECTED"].map(area => {
          const areaData = summary.filter((s: any) => s.area === area);
          const count = areaData.reduce((a: any, s: any) => a + s._count, 0);
          const weight = areaData.reduce((a: any, s: any) => a + (s._sum?.weight || 0), 0);
          const icons = { RAW_MATERIAL: "📥", FINISHED_GOODS: "📦", REJECTED: "🗑️" };
          const variants = { RAW_MATERIAL: "dark", FINISHED_GOODS: "mint", REJECTED: "pink" };
          const labels = { RAW_MATERIAL: "Bahan Baku (OCC)", FINISHED_GOODS: "Barang Jadi (Bale)", REJECTED: "Reject" };
          const v = (variants as any)[area];
          return (
            <div key={area} className="kpi-card" style={{ background: ({ dark: "var(--kpi-dark)", mint: "var(--kpi-mint-bg)", pink: "var(--kpi-pink-bg)" } as any)[v], borderColor: v === "dark" ? "transparent" : undefined }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: v === "dark" ? "rgba(255,255,255,0.6)" : "var(--text-secondary)" }}>{(labels as any)[area]}</span>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: v === "dark" ? "rgba(255,255,255,0.12)" : v === "mint" ? "rgba(78,205,196,0.15)" : "rgba(255,107,157,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{(icons as any)[area]}</div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <div style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.03em", color: v === "dark" ? "#fff" : "var(--text-primary)", lineHeight: 1.2 }}>{count}</div>
                <div style={{ fontSize: "0.9rem", color: v === "dark" ? "rgba(255,255,255,0.7)" : "var(--text-secondary)" }}>bale</div>
              </div>
              <div style={{ fontSize: "0.85rem", color: v === "dark" ? "rgba(255,255,255,0.5)" : "var(--text-muted)", marginTop: 4 }}>Total: {(weight / 1000).toFixed(2)} Ton</div>
            </div>
          );
        })}
      </div>

      {/* Filters & Table wrapper */}
      <div className="erp-card">
        <div className="erp-card-header" style={{ borderBottom: "none", paddingBottom: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
            <div>
              <span className="erp-card-title">Daftar Inventory</span>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                {inventory.length} item ditemukan — Total: <span style={{ fontWeight: 700, color: "var(--brand-teal)" }}>{(totalWeight / 1000).toFixed(2)} Ton</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <select className="form-input" style={{ width: 160 }} value={filter.area} onChange={e => setFilter({ ...filter, area: e.target.value })}>
                <option value="">Semua Area</option>
                <option value="RAW_MATERIAL">Bahan Baku</option>
                <option value="FINISHED_GOODS">Barang Jadi</option>
                <option value="REJECTED">Reject</option>
              </select>
              <select className="form-input" style={{ width: 140 }} value={filter.grade} onChange={e => setFilter({ ...filter, grade: e.target.value })}>
                <option value="">Semua Grade</option>
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="REJECT">Reject</option>
              </select>
              <select className="form-input" style={{ width: 140 }} value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
                <option value="">Semua Status</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="RESERVED">Reserved</option>
                <option value="SHIPPED">Shipped</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
            <div style={{ width: 36, height: 36, border: "3px solid #EDE9FF", borderTop: "3px solid #7C6FE0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : (
          <div style={{ overflowX: "auto", marginTop: 16 }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Bale ID</th>
                  <th>Berat</th>
                  <th>Grade</th>
                  <th>Area</th>
                  <th>Lokasi</th>
                  <th>Status</th>
                  <th>Tgl Produksi</th>
                </tr>
              </thead>
              <tbody>
                {inventory.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Data inventory tidak ditemukan</td></tr>
                ) : inventory.map((item: any) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, color: "var(--brand-purple)" }}>{item.baleId}</td>
                    <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{item.weight?.toLocaleString("id-ID")} kg</td>
                    <td><span className={`badge ${gradeColor[item.grade]}`}>{item.grade}</span></td>
                    <td style={{ color: "var(--text-secondary)" }}>{item.area?.replace("_", " ")}</td>
                    <td style={{ color: "var(--text-muted)", fontFamily: "monospace" }}>{item.location || "—"}</td>
                    <td><span className={`badge ${statusColor[item.status]}`}>{item.status}</span></td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{item.productionDate ? new Date(item.productionDate).toLocaleDateString("id-ID") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
