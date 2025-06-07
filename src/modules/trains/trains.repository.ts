import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Train } from './entities/train.entity';

@Injectable()
export class TrainsRepository {
  constructor(private readonly db: DatabaseService) {}

  async createTrain(trainNumber: string): Promise<Train> {
    const query = `
      INSERT INTO trains (train_number) 
      VALUES ($1) 
      RETURNING id, train_number, created_at, updated_at
    `;

    const result = await this.db.query(query, [trainNumber]);
    return result.rows[0];
  }

  async findByNumber(trainNumber: string): Promise<Train | null> {
    const query = `
      SELECT id, train_number, created_at, updated_at 
      FROM trains 
      WHERE train_number = $1
    `;

    const result = await this.db.query(query, [trainNumber]);
    return result.rows[0] || null;
  }
}
