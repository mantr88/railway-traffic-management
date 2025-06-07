import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Train } from './entities/train.entity';

@Injectable()
export class TrainsRepository {
  constructor(private readonly db: DatabaseService) {}

  async createTrain(trainNumber: string, wagons: string[]): Promise<Train> {
    try {
      const query = `INSERT INTO trains (train_number, wagons) 
VALUES ($1, $2::jsonb) 
RETURNING id, train_number, wagons, created_at as createdAt, updated_at as updatedAt;`;

      const result = await this.db.query<any>(query, [
        trainNumber,
        JSON.stringify(wagons),
      ]);

      if (result.rows.length === 0) {
        throw new Error('Failed to create train');
      }

      const train = result.rows[0];

      return new Train(
        train.train_number,
        train.wagons,
        train.id,
        train.createdat,
        train.updatedat,
      );
    } catch (error) {
      console.error('Failed to create train:', error.message);
      throw new Error(`Failed to create train: ${error.message}`);
    }
  }

  async findByNumber(trainNumber: string): Promise<Train | null> {
    try {
      const query = `SELECT id, train_number, wagons, created_at, updated_at 
FROM trains 
WHERE train_number = $1;`;

      const result = await this.db.query<any>(query, [trainNumber]);

      if (result.rows.length === 0) {
        return null;
      }

      const train = result.rows[0];

      return new Train(
        train.train_number,
        train.wagons,
        train.id,
        train.createdat,
        train.updatedat,
      );
    } catch (error) {
      console.error('Failed to find train:', error.message);
      throw new Error(`Failed to find train: ${error.message}`);
    }
  }

  async updateWagons(
    trainNumber: string,
    wagons: string[],
  ): Promise<Train | null> {
    const query = `UPDATE trains
  SET wagons = $2::jsonb,
      updated_at = CURRENT_TIMESTAMP
  WHERE train_number = $1
  RETURNING id, train_number, wagons, created_at, updated_at;`;

    try {
      const result = await this.db.query<any>(query, [
        trainNumber,
        JSON.stringify(wagons),
      ]);

      if (result.rows.length === 0) {
        return null;
      }

      const train = result.rows[0];

      return new Train(
        train.train_number,
        train.wagons,
        train.id,
        train.createdat,
        train.updatedat,
      );
    } catch (error) {
      console.error('Failed to add wagons:', error.message);
      throw new Error(`Failed to add wagons: ${error.message}`);
    }
  }
}
