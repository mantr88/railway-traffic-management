import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Trip } from './entities/trip.entity';

@Injectable()
export class TripsRepository {
  constructor(private readonly db: DatabaseService) {}

  async createTrip(
    trainNumber: string,
    departureStationCode: number,
    arrivalStationCode: number,
    departureTime: string,
    arrivalTime: string,
  ): Promise<Trip> {
    const query = `INSERT INTO trips (
    train_number, 
    departure_station_code, 
    arrival_station_code, 
    departure_time, 
    arrival_time
) VALUES ($1, $2, $3, $4, $5)
RETURNING 
    id,
    train_number,
    departure_station_code,
    arrival_station_code,
    departure_time,
    arrival_time,
    created_at,
    updated_at;`;

    const values = [
      trainNumber,
      departureStationCode,
      arrivalStationCode,
      departureTime,
      arrivalTime,
    ];
    try {
      const result = await this.db.query<any>(query, values);

      if (result.rows.length === 0) {
        throw new Error('Failed to create trip');
      }

      const tripData = result.rows[0];
      return new Trip(
        tripData.train_number,
        tripData.departure_station_code,
        tripData.arrival_station_code,
        new Date(tripData.departure_time),
        new Date(tripData.arrival_time),
        tripData.id,
        tripData.created_at,
        tripData.updated_at,
      );
    } catch (error) {
      console.error('Failed to create trip:', error.message);
      throw new Error(`Failed to create trip: ${error.message}`);
    }
  }

  async findExistingTrip(
    trainNumber: string,
    departureStationCode: number,
    arrivalStationCode: number,
    departureTime: string,
  ): Promise<boolean> {
    try {
      const existingTripQuery = `
        SELECT COUNT(*) as count
        FROM trips 
        WHERE 
          train_number = $1 
          AND departure_station_code = $2 
          AND arrival_station_code = $3 
          AND departure_time = $4
      `;

      const existingResult = await this.db.query<any>(existingTripQuery, [
        trainNumber,
        departureStationCode,
        arrivalStationCode,
        departureTime,
      ]);

      return existingResult.rows[0].count > 0;
    } catch (error) {
      console.error('Failed to find existing trip:', error.message);
      throw new Error(`Failed to find existing trip: ${error.message}`);
    }
  }
}
