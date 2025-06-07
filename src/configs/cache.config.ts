import { CacheModuleOptions } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

export const getCacheConfig = (): CacheModuleOptions => {
  if (process.env.REDIS_URL) {
    return {
      store: redisStore,
      url: process.env.REDIS_URL,
      ttl: 60,
    };
  }

  if (process.env.REDIS_HOST) {
    return {
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT ?? '6379'),
      ttl: 60,
    };
  }

  return {
    store: 'memory',
    ttl: 60,
    max: 1000,
  };
};
