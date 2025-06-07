import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Wagon } from './entities/wagon.entity';

@Injectable()
export class WagonsRepository {
  constructor(private readonly db: DatabaseService) {}

  async createWagons(trainId: number, wagons: string[]): Promise<void> {
    const values = wagons
      .map((wagon, index) => `(${trainId}, '${wagon}', ${index + 1})`)
      .join(', ');

    const query = `
      INSERT INTO train_wagons (train_id, wagon_number, position) 
      VALUES ${values}
    `;

    await this.db.query(query);
  }

  async findByTrainId(trainId: number): Promise<Wagon[]> {
    const query = `
      SELECT id, train_id, wagon_number, position, created_at
      FROM train_wagons 
      WHERE train_id = $1 
      ORDER BY position
    `;

    const result = await this.db.query(query, [trainId]);
    return result.rows;
  }

  async addWagons(trainId: number, wagons: string[]): Promise<void> {
    // Отримуємо останню позицію
    const lastPositionQuery = `
      SELECT COALESCE(MAX(position), 0) as last_position 
      FROM train_wagons 
      WHERE train_id = $1
    `;

    const lastPositionResult = await this.db.query(lastPositionQuery, [
      trainId,
    ]);
    const lastPosition = lastPositionResult.rows[0].last_position;

    // Додаємо нові вагони
    const values = wagons
      .map(
        (wagon, index) =>
          `(${trainId}, '${wagon}', ${lastPosition + index + 1})`,
      )
      .join(', ');

    const query = `
      INSERT INTO train_wagons (train_id, wagon_number, position) 
      VALUES ${values}
    `;

    await this.db.query(query);
  }

  async removeWagons(trainId: number, wagons: string[]): Promise<void> {
    // Handle empty wagons array
    if (!wagons || wagons.length === 0) {
      return;
    }

    await this.db.transaction(async (client) => {
      const placeholders = wagons.map((_, index) => `$${index + 2}`).join(', ');

      const deleteQuery = `
        DELETE FROM train_wagons 
        WHERE train_id = $1 AND wagon_number IN (${placeholders})
      `;

      await client.query(deleteQuery, [trainId, ...wagons]);

      // Переіндексуємо позиції
      const reindexQuery = `
        UPDATE train_wagons 
        SET position = subquery.new_position
        FROM (
          SELECT id, ROW_NUMBER() OVER (ORDER BY position) as new_position
          FROM train_wagons 
          WHERE train_id = $1
        ) as subquery
        WHERE train_wagons.id = subquery.id
      `;

      await client.query(reindexQuery, [trainId]);
    });
  }
}
