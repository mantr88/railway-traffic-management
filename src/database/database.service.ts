import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Pool, PoolClient, QueryResult } from 'pg';
import { ConfigService } from '@nestjs/config';
import { runMigrations } from './migrate';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor(
    private configService: ConfigService,
    private readonly logger: Logger,
  ) {}

  async onModuleInit() {
    this.pool = new Pool({
      host: this.configService.get('DB_HOST'),
      port: this.configService.get('DB_PORT'),
      database: this.configService.get('DB_NAME'),
      user: this.configService.get('DB_USER'),
      password: this.configService.get('DB_PASSWORD'),
      max: 16,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    try {
      await this.pool.query('SELECT NOW()');
      this.logger.log('Database connected successfully');

      if (this.configService.get('NODE_ENV') === 'production') {
        await runMigrations(this.pool);
      }
    } catch (error) {
      this.logger.error('Database connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async query<T extends import('pg').QueryResultRow = any>(
    text: string,
    params?: any[],
  ): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;

      if (process.env.NODE_ENV === 'development') {
        this.logger.log('Query executed:', {
          text,
          duration: `${duration}ms`,
          rows: result.rowCount,
        });
      }

      return result;
    } catch (error) {
      this.logger.error('Database query error:', { text, params, error });
      throw error;
    }
  }

  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
