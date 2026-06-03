import { Module } from "@nestjs/common";
import { PenjualanService } from "./penjualan.service";
import { PenjualanController } from "./penjualan.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [PenjualanController],
  providers: [PenjualanService],
  exports: [PenjualanService],
})
export class PenjualanModule {}
