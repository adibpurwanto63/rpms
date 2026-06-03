export const ROLE_MODULES: Record<string, string[]> = {
  SUPER_ADMIN: ["dashboard","purchase","weighbridge","qc","pembelian","production","warehouse","logistics","finance","bcp","settings"],
  DIRECTOR: ["dashboard","finance","bcp","pembelian"],
  FINANCE_MANAGER: ["dashboard","finance","pembelian"],
  PROCUREMENT_MANAGER: ["dashboard","purchase","weighbridge","pembelian"],
  QC_OFFICER: ["dashboard","qc","weighbridge"],
  PRODUCTION_SUPERVISOR: ["dashboard","production","warehouse"],
  WAREHOUSE_SUPERVISOR: ["dashboard","warehouse","production"],
  LOGISTICS_MANAGER: ["dashboard","logistics","warehouse"],
  SUPPLIER: ["supplier-portal"],
};

export function canAccess(role: string, module: string): boolean {
  return ROLE_MODULES[role]?.includes(module) ?? false;
}
