"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const gradeColor = { A: "badge-success", B: "badge-warning", REJECT: "badge-danger" };
const statusColor = { IN_STOCK: "badge-success", RESERVED: "badge-info", SHIPPED: "badge-secondary", DAMAGED: "badge-danger" };

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
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold mb-1">Manajemen Gudang</h2>
        <p className="text-gray-500 text-sm">Tracking bale, stok inventory, dan FIFO</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {["RAW_MATERIAL","FINISHED_GOODS","REJECTED"].map(area => {
          const areaData = summary.filter((s:any) => s.area === area);
          const count = areaData.reduce((a:any, s:any) => a + s._count, 0);
          const weight = areaData.reduce((a:any, s:any) => a + (s._sum?.weight || 0), 0);
          const icons = { RAW_MATERIAL: "📥", FINISHED_GOODS: "📦", REJECTED: "🗑️" };
          const colors = { RAW_MATERIAL: "text-info", FINISHED_GOODS: "text-success", REJECTED: "text-danger" };
          const labels = { RAW_MATERIAL: "Bahan Baku", FINISHED_GOODS: "Barang Jadi", REJECTED: "Reject" };
          return (
            <div key={area} className="erp-card px-4 py-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xl">{(icons as any)[area]}</span>
                <span className="text-sm font-semibold text-gray-600">{(labels as any)[area]}</span>
              </div>
              <div className={`text-2xl font-bold ${(colors as any)[area]}`}>{count} Bale</div>
              <div className="text-sm text-gray-500">{(weight/1000).toFixed(2)} Ton</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="erp-card mb-4 flex gap-4 flex-wrap p-3 bg-gray-50">
        <select value={filter.area} onChange={e => setFilter({...filter, area: e.target.value})} className="form-control flex-1 min-w-[140px] m-0">
          <option value="">Semua Area</option>
          <option value="RAW_MATERIAL">Bahan Baku</option>
          <option value="FINISHED_GOODS">Barang Jadi</option>
          <option value="REJECTED">Reject</option>
        </select>
        <select value={filter.grade} onChange={e => setFilter({...filter, grade: e.target.value})} className="form-control flex-1 min-w-[120px] m-0">
          <option value="">Semua Grade</option>
          <option value="A">Grade A</option>
          <option value="B">Grade B</option>
          <option value="REJECT">Reject</option>
        </select>
        <select value={filter.status} onChange={e => setFilter({...filter, status: e.target.value})} className="form-control flex-1 min-w-[120px] m-0">
          <option value="">Semua Status</option>
          <option value="IN_STOCK">In Stock</option>
          <option value="RESERVED">Reserved</option>
          <option value="SHIPPED">Shipped</option>
        </select>
      </div>

      <div className="mb-3 text-sm text-gray-600">
        {inventory.length} bale — Total: <span className="font-bold text-success">{(totalWeight/1000).toFixed(2)} Ton</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div style={{width:36,height:36,border:"3px solid #EDE9FF",borderTop:"3px solid #7C6FE0",borderRadius:"50%",animation:"spin 0.8s linear infinite"}} /></div>
      ) : (
        <div className="erp-card ">
          <div className="erp-card-body overflow-x-auto">
            <table className="erp-table">
              <thead><tr><th>Bale ID</th><th>Berat (kg)</th><th>Grade</th><th>Area</th><th>Lokasi</th><th>Status</th><th>Tgl Produksi</th></tr></thead>
              <tbody>
                {inventory.map((item:any) => (
                  <tr key={item.id}>
                    <td className="font-mono text-sm text-blue-600">{item.baleId}</td>
                    <td className="font-semibold text-gray-800">{item.weight?.toLocaleString("id-ID")}</td>
                    <td><span className={`badge ${(gradeColor as any)[item.grade]}`}>{item.grade}</span></td>
                    <td className="text-sm text-gray-600">{item.area?.replace("_"," ")}</td>
                    <td className="font-mono text-sm text-gray-500">{item.location || "—"}</td>
                    <td><span className={`badge ${(statusColor as any)[item.status]}`}>{item.status}</span></td>
                    <td className="text-sm text-gray-500">{item.productionDate ? new Date(item.productionDate).toLocaleDateString("id-ID") : "—"}</td>
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
