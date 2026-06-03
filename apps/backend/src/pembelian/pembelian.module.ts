import { Module } from "@nestjs/common";
import { PembelianService } from "./pembelian.service";
import { PembelianController } from "./pembelian.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [PembelianController],
  providers: [PembelianService],
  exports: [PembelianService],
})
export class PembelianModule {}
