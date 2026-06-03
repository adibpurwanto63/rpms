export const ROLE_MODULES: Record<string, string[]> = {
  SUPER_ADMIN: ["dashboard","purchase","weighbridge","qc","production","warehouse","logistics","finance","bcp","settings"],
  DIRECTOR: ["dashboard","finance","bcp"],
  FINANCE_MANAGER: ["dashboard","finance"],
  PROCUREMENT_MANAGER: ["dashboard","purchase","weighbridge"],
  QC_OFFICER: ["dashboard","qc","weighbridge"],
  PRODUCTION_SUPERVISOR: ["dashboard","production","warehouse"],
  WAREHOUSE_SUPERVISOR: ["dashboard","warehouse","production"],
  LOGISTICS_MANAGER: ["dashboard","logistics","warehouse"],
  SUPPLIER: ["supplier-portal"],
};

export function canAccess(role: string, module: string): boolean {
  return ROLE_MODULES[role]?.includes(module) ?? false;
}
