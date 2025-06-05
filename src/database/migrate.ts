import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';

export async function runMigrations(pool: Pool) {
  const migrations = ['0001_create_stations.sql'];

  for (const migration of migrations) {
    const migrationPath = path.join(__dirname, 'migrations', migration);

    try {
      const sql = fs.readFileSync(migrationPath, 'utf8');
      await pool.query(sql);
      console.log(`Applied ${migration}`);
    } catch (error) {
      console.error(`Failed to apply migration ${migration}:`, error);
      throw error;
    }
  }
}
