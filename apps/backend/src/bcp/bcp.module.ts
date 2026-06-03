import { Module } from "@nestjs/common";
import { BcpController } from "./bcp.controller";
import { BcpService } from "./bcp.service";

@Module({ controllers: [BcpController], providers: [BcpService] })
export class BcpModule {}
