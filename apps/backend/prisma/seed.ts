import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient, UserRole, SupplierStatus, MachineType, MachineStatus, VehicleType, QcGrade, IncidentSeverity, IncidentStatus, AlertType, InvoiceType, PaymentStatus, InventoryStatus, InventoryArea, DeliveryStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

import { PrismaPg } from '@prisma/adapter-pg';
import * as pg from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://rpms_user:rpms_pass@localhost:5433/rpms_db?schema=public';
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding RPMS database...');

  // ── USERS ────────────────────────────────────────────────────
  const password = await bcrypt.hash('Admin@123', 12);

  const users = [
    { name: 'Super Administrator', email: 'admin@rpms.id', role: UserRole.SUPER_ADMIN },
    { name: 'Budi Santoso', email: 'director@rpms.id', role: UserRole.DIRECTOR },
    { name: 'Siti Rahayu', email: 'finance@rpms.id', role: UserRole.FINANCE_MANAGER },
    { name: 'Agus Wijaya', email: 'procurement@rpms.id', role: UserRole.PROCUREMENT_MANAGER },
    { name: 'Dewi Lestari', email: 'qc@rpms.id', role: UserRole.QC_OFFICER },
    { name: 'Eko Prasetyo', email: 'production@rpms.id', role: UserRole.PRODUCTION_SUPERVISOR },
    { name: 'Fitri Handayani', email: 'warehouse@rpms.id', role: UserRole.WAREHOUSE_SUPERVISOR },
    { name: 'Hendra Kusuma', email: 'logistics@rpms.id', role: UserRole.LOGISTICS_MANAGER },
  ];

  const createdUsers: Record<string, any> = {};
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { name: u.name, email: u.email, passwordHash: password, role: u.role, isActive: true },
    });
    createdUsers[u.role] = user;
    console.log(`  ✓ User: ${u.email} (${u.role})`);
  }

  // ── SUPPLIERS ────────────────────────────────────────────────
  const suppliersData = [
    { companyName: 'PT Kertas Maju Bersama', picName: 'Andi Saputra', phone: '021-5556789', email: 'supplier@rpms.id', address: 'Jl. Industri Raya No. 12, Bekasi', taxNumber: '01.234.567.8-901.000', status: SupplierStatus.ACTIVE, rating: 4.8 },
    { companyName: 'CV Sumber Kertas Jaya', picName: 'Bambang Irawan', phone: '022-7778901', email: 'supplier2@rpms.id', address: 'Jl. Raya Cibinong No. 45, Bogor', taxNumber: '02.345.678.9-012.000', status: SupplierStatus.ACTIVE, rating: 4.5 },
    { companyName: 'PT Daur Ulang Nusantara', picName: 'Cahyono Wibisono', phone: '031-4445678', email: 'supplier3@rpms.id', address: 'Jl. Surabaya Industri No. 78, Surabaya', taxNumber: '03.456.789.0-123.000', status: SupplierStatus.ACTIVE, rating: 4.2 },
    { companyName: 'UD Kertas Barat', picName: 'Diana Permata', phone: '024-3334567', email: 'supplier4@rpms.id', address: 'Jl. Gatot Subroto No. 99, Semarang', taxNumber: '04.567.890.1-234.000', status: SupplierStatus.INACTIVE, rating: 3.5 },
    { companyName: 'PT Indo Paper Recycle', picName: 'Eka Nugroho', phone: '021-6667890', email: 'supplier5@rpms.id', address: 'Jl. Tol Jagorawi KM 5, Cibubur', taxNumber: '05.678.901.2-345.000', status: SupplierStatus.ACTIVE, rating: 4.9 },
  ];

  const createdSuppliers: any[] = [];
  for (const s of suppliersData) {
    const supplier = await prisma.supplier.upsert({
      where: { id: `supplier-${s.companyName.replace(/\s/g, '-').toLowerCase().slice(0, 20)}` },
      update: {},
      create: { id: `supplier-${s.companyName.replace(/\s/g, '-').toLowerCase().slice(0, 20)}`, ...s },
    });
    createdSuppliers.push(supplier);
  }

  // Supplier user linked to first supplier
  await prisma.user.upsert({
    where: { email: 'supplier@rpms.id' },
    update: {},
    create: { name: 'Andi Saputra', email: 'supplier@rpms.id', passwordHash: password, role: UserRole.SUPPLIER, isActive: true, supplierId: createdSuppliers[0].id },
  });
  console.log('  ✓ Suppliers and supplier user seeded');

  // ── WEIGHING TICKETS ─────────────────────────────────────────
  const materials = ['OCC', 'ONP', 'Mixed Paper', 'White Ledger'];
  const tickets: any[] = [];
  for (let i = 1; i <= 10; i++) {
    const gross = 15000 + Math.random() * 5000;
    const tare = 4000 + Math.random() * 1000;
    const ticket = await prisma.weighingTicket.upsert({
      where: { ticketNumber: `TKT-2024-${String(i).padStart(4, '0')}` },
      update: {},
      create: {
        ticketNumber: `TKT-2024-${String(i).padStart(4, '0')}`,
        supplierId: createdSuppliers[i % createdSuppliers.length].id,
        truckNumber: `B ${1000 + i * 123} XYZ`,
        driverName: `Driver ${i}`,
        materialType: materials[i % materials.length],
        grossWeight: parseFloat(gross.toFixed(2)),
        tareWeight: parseFloat(tare.toFixed(2)),
        netWeight: parseFloat((gross - tare).toFixed(2)),
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      },
    });
    tickets.push(ticket);
  }
  console.log('  ✓ Weighing tickets seeded');

  // ── QC INSPECTIONS ───────────────────────────────────────────
  const grades = [QcGrade.A, QcGrade.A, QcGrade.B, QcGrade.B, QcGrade.REJECT];
  for (let i = 0; i < Math.min(tickets.length, 8); i++) {
    await prisma.qcInspection.upsert({
      where: { ticketId: tickets[i].id },
      update: {},
      create: {
        ticketId: tickets[i].id,
        grade: grades[i % grades.length],
        moisturePct: parseFloat((5 + Math.random() * 15).toFixed(1)),
        plasticPct: parseFloat((1 + Math.random() * 5).toFixed(1)),
        metalPct: parseFloat((0.5 + Math.random() * 2).toFixed(1)),
        contaminationPct: parseFloat((1 + Math.random() * 4).toFixed(1)),
        photoUrls: [],
        notes: 'Pemeriksaan standar berjalan dengan baik.',
        officerId: createdUsers[UserRole.QC_OFFICER].id,
      },
    });
  }
  console.log('  ✓ QC inspections seeded');

  // ── MACHINES ─────────────────────────────────────────────────
  const machinesData = [
    { id: 'machine-baler-1', name: 'Horizontal Baler #1', type: MachineType.HORIZONTAL_BALER, status: MachineStatus.RUNNING, location: 'Hall A' },
    { id: 'machine-baler-2', name: 'Horizontal Baler #2', type: MachineType.HORIZONTAL_BALER, status: MachineStatus.IDLE, location: 'Hall A' },
    { id: 'machine-conveyor-1', name: 'Conveyor #1', type: MachineType.CONVEYOR, status: MachineStatus.RUNNING, location: 'Hall B' },
    { id: 'machine-conveyor-2', name: 'Conveyor #2', type: MachineType.CONVEYOR, status: MachineStatus.MAINTENANCE, location: 'Hall B' },
  ];
  for (const m of machinesData) {
    await prisma.machine.upsert({ where: { id: m.id }, update: {}, create: m });
  }
  console.log('  ✓ Machines seeded');

  // ── PRODUCTION RECORDS ───────────────────────────────────────
  const productions: any[] = [];
  for (let i = 0; i < 7; i++) {
    const input = 5000 + Math.random() * 3000;
    const output = input * (0.85 + Math.random() * 0.1);
    const runtime = 400 + Math.random() * 60;
    const downtime = Math.random() * 30;
    const oee = ((runtime / (runtime + downtime)) * (output / input) * 0.95 * 100);
    const prod = await prisma.productionRecord.create({
      data: {
        machineId: i % 2 === 0 ? 'machine-baler-1' : 'machine-baler-2',
        inputWeight: parseFloat(input.toFixed(2)),
        outputWeight: parseFloat(output.toFixed(2)),
        baleCount: Math.floor(output / 500),
        runtimeMinutes: Math.floor(runtime),
        downtimeMinutes: Math.floor(downtime),
        oee: parseFloat(oee.toFixed(2)),
        operatorId: createdUsers[UserRole.PRODUCTION_SUPERVISOR].id,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      },
    });
    productions.push(prod);
  }
  console.log('  ✓ Production records seeded');

  // ── INVENTORY ────────────────────────────────────────────────
  const areas = [InventoryArea.FINISHED_GOODS, InventoryArea.RAW_MATERIAL, InventoryArea.REJECTED];
  for (let i = 1; i <= 20; i++) {
    await prisma.inventoryItem.upsert({
      where: { baleId: `BALE-${String(i).padStart(5, '0')}` },
      update: {},
      create: {
        baleId: `BALE-${String(i).padStart(5, '0')}`,
        weight: parseFloat((400 + Math.random() * 200).toFixed(2)),
        grade: grades[i % grades.length],
        area: areas[i % areas.length],
        location: `Rack-${String.fromCharCode(65 + (i % 5))}-${Math.ceil(i / 5)}`,
        status: InventoryStatus.IN_STOCK,
        productionId: productions[i % productions.length].id,
        productionDate: new Date(Date.now() - i * 12 * 60 * 60 * 1000),
      },
    });
  }
  console.log('  ✓ Inventory seeded');

  // ── VEHICLES ─────────────────────────────────────────────────
  const vehiclesData = [
    { id: 'vehicle-1', plate: 'B 1234 ABC', type: VehicleType.TRONTON, driverName: 'Supardi', status: 'AVAILABLE' },
    { id: 'vehicle-2', plate: 'B 5678 DEF', type: VehicleType.TRONTON, driverName: 'Wahyu', status: 'ON_TRIP' },
    { id: 'vehicle-3', plate: 'D 9012 GHI', type: VehicleType.ENGKEL, driverName: 'Rudi', status: 'AVAILABLE' },
    { id: 'vehicle-4', plate: 'F 3456 JKL', type: VehicleType.VENDOR, driverName: 'Vendor Driver', status: 'MAINTENANCE' },
  ];
  for (const v of vehiclesData) {
    await prisma.vehicle.upsert({ where: { id: v.id }, update: {}, create: { ...v, status: v.status as any } });
  }
  console.log('  ✓ Vehicles seeded');

  // ── DELIVERY ORDERS ──────────────────────────────────────────
  const destinations = ['PT Kertas Indonesia - Jakarta', 'PT Paper Asia - Tangerang', 'CV Distribusi Raya - Bekasi'];
  for (let i = 1; i <= 5; i++) {
    await prisma.deliveryOrder.upsert({
      where: { orderNumber: `DO-2024-${String(i).padStart(4, '0')}` },
      update: {},
      create: {
        orderNumber: `DO-2024-${String(i).padStart(4, '0')}`,
        vehicleId: vehiclesData[i % 2].id,
        destination: destinations[i % destinations.length],
        loadingWeight: parseFloat((8000 + Math.random() * 4000).toFixed(2)),
        loadingTime: new Date(Date.now() - i * 48 * 60 * 60 * 1000),
        arrivalTime: i < 3 ? new Date(Date.now() - i * 36 * 60 * 60 * 1000) : null,
        status: i < 3 ? DeliveryStatus.DELIVERED : i === 3 ? DeliveryStatus.IN_TRANSIT : DeliveryStatus.SCHEDULED,
      },
    });
  }
  console.log('  ✓ Delivery orders seeded');

  // ── INVOICES ─────────────────────────────────────────────────
  const invoicesData = [
    { invoiceNumber: 'INV-AP-2024-001', type: InvoiceType.ACCOUNTS_PAYABLE, supplierOrCustomer: 'PT Kertas Maju Bersama', amount: 45000000, paidAmount: 45000000, paymentStatus: PaymentStatus.PAID, dueDate: new Date('2024-11-30') },
    { invoiceNumber: 'INV-AP-2024-002', type: InvoiceType.ACCOUNTS_PAYABLE, supplierOrCustomer: 'CV Sumber Kertas Jaya', amount: 32000000, paidAmount: 15000000, paymentStatus: PaymentStatus.PARTIAL, dueDate: new Date('2024-12-15') },
    { invoiceNumber: 'INV-AP-2024-003', type: InvoiceType.ACCOUNTS_PAYABLE, supplierOrCustomer: 'PT Daur Ulang Nusantara', amount: 28000000, paidAmount: 0, paymentStatus: PaymentStatus.OVERDUE, dueDate: new Date('2024-11-01') },
    { invoiceNumber: 'INV-AR-2024-001', type: InvoiceType.ACCOUNTS_RECEIVABLE, supplierOrCustomer: 'PT Paper Asia', amount: 125000000, paidAmount: 125000000, paymentStatus: PaymentStatus.PAID, dueDate: new Date('2024-11-20') },
    { invoiceNumber: 'INV-AR-2024-002', type: InvoiceType.ACCOUNTS_RECEIVABLE, supplierOrCustomer: 'PT Kertas Indonesia', amount: 98000000, paidAmount: 50000000, paymentStatus: PaymentStatus.PARTIAL, dueDate: new Date('2024-12-31') },
    { invoiceNumber: 'INV-AR-2024-003', type: InvoiceType.ACCOUNTS_RECEIVABLE, supplierOrCustomer: 'CV Distribusi Raya', amount: 67000000, paidAmount: 0, paymentStatus: PaymentStatus.PENDING, dueDate: new Date('2025-01-15') },
  ];
  for (const inv of invoicesData) {
    await prisma.invoice.upsert({ where: { invoiceNumber: inv.invoiceNumber }, update: {}, create: inv });
  }
  console.log('  ✓ Invoices seeded');

  // ── INCIDENTS ────────────────────────────────────────────────
  const incidentsData = [
    { type: AlertType.DOWNTIME, severity: IncidentSeverity.HIGH, title: 'Baler #2 Breakdown', description: 'Horizontal Baler #2 mengalami kerusakan pada belt conveyor, produksi terhenti selama 4 jam.', status: IncidentStatus.RESOLVED },
    { type: AlertType.POWER_FAILURE, severity: IncidentSeverity.MEDIUM, title: 'Pemadaman PLN 2 Jam', description: 'Pemadaman listrik PLN selama 2 jam, genset berhasil diaktifkan dalam 3 menit.', status: IncidentStatus.CLOSED },
    { type: AlertType.FIRE, severity: IncidentSeverity.CRITICAL, title: 'Kebakaran Kecil Gudang', description: 'Percikan api di area gudang bahan baku, berhasil dipadamkan dalam 10 menit.', status: IncidentStatus.RESOLVED },
    { type: AlertType.INTERNET_FAILURE, severity: IncidentSeverity.LOW, title: 'Gangguan Internet', description: 'Koneksi internet terputus selama 30 menit.', status: IncidentStatus.CLOSED },
  ];
  for (let i = 0; i < incidentsData.length; i++) {
    const inc = incidentsData[i];
    await prisma.incident.create({
      data: { ...inc, reportedBy: createdUsers[UserRole.SUPER_ADMIN].id, resolvedAt: inc.status === IncidentStatus.CLOSED || inc.status === IncidentStatus.RESOLVED ? new Date() : null, createdAt: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000) },
    });
  }
  console.log('  ✓ Incidents seeded');

  // ── RISK REGISTER ────────────────────────────────────────────
  const risks = [
    { category: 'Operasional', description: 'Kerusakan mesin baler utama', likelihood: 3, impact: 5, mitigation: 'Preventive maintenance mingguan dan stok suku cadang kritis', owner: 'Production Supervisor' },
    { category: 'Keuangan', description: 'Fluktuasi harga OCC internasional', likelihood: 4, impact: 4, mitigation: 'Kontrak harga jangka panjang dengan supplier utama', owner: 'Finance Manager' },
    { category: 'Supply Chain', description: 'Keterlambatan pengiriman dari supplier', likelihood: 3, impact: 3, mitigation: 'Diversifikasi supplier dan safety stock 3 hari produksi', owner: 'Procurement Manager' },
    { category: 'Regulasi', description: 'Perubahan regulasi impor kertas bekas', likelihood: 2, impact: 5, mitigation: 'Monitoring regulasi dan lobi asosiasi industri', owner: 'Director' },
  ];
  for (const r of risks) {
    await prisma.riskRegister.create({ data: r });
  }
  console.log('  ✓ Risk register seeded');

  console.log('\n✅ Database seeded successfully!');
  console.log('\n🔑 Demo Accounts:');
  console.log('   admin@rpms.id       → Super Admin');
  console.log('   director@rpms.id    → Director');
  console.log('   finance@rpms.id     → Finance Manager');
  console.log('   procurement@rpms.id → Procurement Manager');
  console.log('   qc@rpms.id          → QC Officer');
  console.log('   production@rpms.id  → Production Supervisor');
  console.log('   warehouse@rpms.id   → Warehouse Supervisor');
  console.log('   logistics@rpms.id   → Logistics Manager');
  console.log('   supplier@rpms.id    → Supplier');
  console.log('   Password: Admin@123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
