import * as dotenv from 'dotenv';
dotenv.config();
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { execSync } from 'child_process';
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
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({ adapter } as any);
  }

  async onModuleInit() {
    await this.$connect();
    await this.runMigrations();
  }

  private async runMigrations() {
    try {
      const effectiveUrl = dbUrl || fallbackDbUrl;
      this.logger.log('Running pending database migrations...');
      execSync('npx prisma migrate deploy', {
        cwd: process.cwd(),
        env: { ...process.env, DATABASE_URL: effectiveUrl },
        stdio: 'inherit',
      });
      this.logger.log('Database migrations applied successfully.');
    } catch (e: any) {
      this.logger.warn('Migration check skipped (may already be up to date): ' + (e.message?.substring(0, 200) || ''));
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await pool.end();
  }
}
