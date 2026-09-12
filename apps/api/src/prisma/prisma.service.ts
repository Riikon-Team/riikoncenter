import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/riikoncenter?schema=public';
    
    // Extract schema from URL or default to public
    let schema = 'public';
    try {
      const url = new URL(connectionString);
      schema = url.searchParams.get('schema') || 'public';
    } catch (e) {
      // Ignored
    }

    // Initialize pool with SSL for Supabase compatibility
    const pool = new Pool({
      connectionString,
      ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : undefined
    });

    // CRITICAL: The 'pg' driver ignores the ?schema= query parameter in connection strings.
    // We must manually execute SET search_path whenever a new connection is established in the pool.
    pool.on('connect', (client) => {
      client.query(`SET search_path TO "${schema}", "public"`);
    });

    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
