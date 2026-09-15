import { Global, Module } from '@nestjs/common';
import { Redis } from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        const isUpstash = redisUrl.includes('upstash.io');
        const isTls = redisUrl.startsWith('rediss://') || isUpstash;
        
        // If it's an upstash URL but starts with redis://, it might fail without TLS
        const client = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          enableOfflineQueue: false, // Don't hang if disconnected
          family: 0, // Force IPv4 to fix connection issues
          ...(isTls ? { tls: { rejectUnauthorized: false } } : {})
        });
        
        client.on('error', (err) => {
          console.error('Redis connection error:', err.message);
        });
        
        return client;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
