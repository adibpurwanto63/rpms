import * as dotenv from 'dotenv';
dotenv.config();
import { defineConfig } from 'prisma/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as pg from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://rpms_user:rpms_pass@localhost:5433/rpms_db?schema=public';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: connectionString,
  },
  migrations: {
    seed: 'ts-node prisma/seed.ts',
  },
  migrate: {
    adapter: async () => {
      const pool = new pg.Pool({ connectionString });
      return new PrismaPg(pool);
    },
  },
});
