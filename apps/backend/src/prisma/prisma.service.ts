import * as dotenv from 'dotenv';
dotenv.config();
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("CRITICAL ERROR: DATABASE_URL environment variable is missing!");
  console.error("Please add DATABASE_URL to your Hugging Face Space Secrets.");
} else {
  console.log("PrismaService initializing with DB URL:", dbUrl.substring(0, 30) + "...");
}

const fallbackDbUrl = "postgresql://neondb_owner:npg_dnWjzf4P8FRw@ep-ancient-wind-apqnezaa-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const pool = new Pool({
  connectionString: dbUrl || fallbackDbUrl,
});

const adapter = new PrismaPg(pool);

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({ adapter } as any);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await pool.end();
  }
}
