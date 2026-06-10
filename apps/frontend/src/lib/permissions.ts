export const ROLE_MODULES: Record<string, string[]> = {
  SUPER_ADMIN: ["dashboard","purchase","weighbridge","qc","pembelian","material","production","warehouse","logistics","finance","bcp","settings"],
  DIRECTOR: ["dashboard","finance","bcp","pembelian","material"],
  FINANCE_MANAGER: ["dashboard","finance","pembelian","material"],
  PROCUREMENT_MANAGER: ["dashboard","purchase","weighbridge","pembelian","material"],
  QC_OFFICER: ["dashboard","qc","weighbridge"],
  PRODUCTION_SUPERVISOR: ["dashboard","production","warehouse","material"],
  WAREHOUSE_SUPERVISOR: ["dashboard","warehouse","production","material","logistics"],
  LOGISTICS_MANAGER: ["dashboard","logistics","warehouse"],
  SUPPLIER: ["supplier-portal"],
};

export function canAccess(role: string, module: string): boolean {
  return ROLE_MODULES[role]?.includes(module) ?? false;
}
