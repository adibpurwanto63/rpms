const fs = require('fs');

const files = [
  "apps/frontend/src/app/portal/weighbridge/page.tsx",
  "apps/frontend/src/app/portal/dashboard/page.tsx",
  "apps/frontend/src/app/portal/bcp/page.tsx",
  "apps/frontend/src/app/portal/production/page.tsx",
  "apps/frontend/src/app/portal/purchase/page.tsx",
  "apps/frontend/src/app/portal/finance/page.tsx",
  "apps/frontend/src/app/portal/qc/page.tsx",
  "apps/frontend/src/app/portal/pembelian/page.tsx",
  "apps/frontend/src/app/portal/warehouse/page.tsx"
];

for (let file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Strip ternary for text colors
  content = content.replace(/color:\s*k\.variant\s*===\s*"dark"\s*\?\s*"#fff"\s*:\s*"var\(--text-primary\)"/g, 'color: "var(--text-primary)"');
  content = content.replace(/color:\s*k\.variant\s*===\s*"dark"\s*\?\s*"rgba\(255,255,255,0\.6\)"\s*:\s*"var\(--text-secondary\)"/g, 'color: "var(--text-secondary)"');
  content = content.replace(/color:\s*k\.variant\s*===\s*"dark"\s*\?\s*"#fff"\s*:\s*"var\(--color-primary\)"/g, 'color: "var(--color-primary)"');
  
  // Icon bg ternary
  content = content.replace(/background:\s*k\.variant\s*===\s*"dark"\s*\?\s*"rgba\(255,255,255,0\.12\)"\s*:\s*([^,]+)/g, 'background: $1');
  
  // Border transparent ternary
  content = content.replace(/borderColor:\s*k\.variant\s*===\s*"dark"\s*\?\s*"transparent"\s*:\s*undefined/g, 'borderColor: undefined');
  
  // trendUp ternary in finance
  content = content.replace(/color:\s*k\.trendUp\s*\?\s*\(k\.variant\s*===\s*"dark"\s*\?\s*"#5FE09F"\s*:\s*"var\(--color-green\)"\)\s*:\s*"var\(--color-red\)"/g, 'color: k.trendUp ? "var(--color-green)" : "var(--color-red)"');

  // Warehouse kpi.dark specific
  content = content.replace(/color:\s*kpi\.dark\s*\?\s*"rgba\(255,255,255,0\.6\)"\s*:\s*"var\(--text-secondary\)"/g, 'color: "var(--text-secondary)"');
  content = content.replace(/color:\s*kpi\.dark\s*\?\s*"#fff"\s*:\s*"var\(--text-primary\)"/g, 'color: "var(--text-primary)"');
  content = content.replace(/color:\s*kpi\.dark\s*\?\s*"rgba\(255,255,255,0\.5\)"\s*:\s*"var\(--text-muted\)"/g, 'color: "var(--text-muted)"');
  content = content.replace(/borderColor:\s*kpi\.dark\s*\?\s*"transparent"\s*:\s*undefined/g, 'borderColor: undefined');

  fs.writeFileSync(file, content);
}
console.log("Done updating variants");
