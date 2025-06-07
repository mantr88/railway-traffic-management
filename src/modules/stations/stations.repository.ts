import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Station } from './entities/station.entity';
import { CreateStationDto } from './dto/create-station.dto';
import { StationNameResponseDto } from './dto/station-response.dto';

@Injectable()
export class StationsRepository {
  constructor(private databaseService: DatabaseService) {}

  async createStation(createStationDto: CreateStationDto): Promise<Station> {
    try {
      const query = `
      INSERT INTO stations (name, code) 
      VALUES ($1, $2) 
      RETURNING id, name, code, created_at AS "createdAt"
    `;

      const createdStation = await this.databaseService.query<Station>(query, [
        createStationDto.name,
        createStationDto.code,
      ]);

      return new Station(
        createdStation.rows[0].name,
        createdStation.rows[0].code,
        createdStation.rows[0].id,
        createdStation.rows[0].createdAt,
      );
    } catch (error) {
      console.error('Database error in StationsRepository.create:', error);

      throw new Error(`Failed to create station: ${error.message}`);
    }
  }

  async findAllStations(): Promise<Station[]> {
    try {
      const query =
        'SELECT id, name, code, created_at FROM stations ORDER BY name';
      const result = await this.databaseService.query<Station>(query);

      return result.rows.map(
        (row) => new Station(row.name, row.code, row.id, row.createdAt),
      );
    } catch (error) {
      console.error('Database error in StationsRepository.findAll:', error);
      throw new Error(`Failed to fetch stations: ${error.message}`);
    }
  }

  async findStationByCode(
    code: number,
  ): Promise<StationNameResponseDto | null> {
    try {
      const query = 'SELECT name FROM stations WHERE code = $1';
      const result = await this.databaseService.query<Station>(query, [code]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return { stationName: row.name };
    } catch (error) {
      console.error('Database error in StationsRepository.findByCode:', error);
      throw new Error(`Failed to fetch station by code: ${error.message}`);
    }
  }
}
