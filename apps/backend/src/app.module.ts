import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { CustomersModule } from './customers/customers.module';
import { WeighbridgeModule } from './weighbridge/weighbridge.module';
import { QcModule } from './qc/qc.module';
import { ProductionModule } from './production/production.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { LogisticsModule } from './logistics/logistics.module';
import { FinanceModule } from './finance/finance.module';
import { BcpModule } from './bcp/bcp.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PembelianModule } from './pembelian/pembelian.module';
import { PenjualanModule } from './penjualan/penjualan.module';
import { SearchModule } from './search/search.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SuppliersModule,
    CustomersModule,
    WeighbridgeModule,
    QcModule,
    ProductionModule,
    WarehouseModule,
    LogisticsModule,
    FinanceModule,
    BcpModule,
    DashboardModule,
    PembelianModule,
    PenjualanModule,
    SearchModule,
    NotificationsModule,
  ],
})
export class AppModule {}
