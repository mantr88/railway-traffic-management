import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Station } from './entities/station.entity';
import { CreateStationDto } from './dto/create-station.dto';

@Injectable()
export class StationsRepository {
  constructor(private databaseService: DatabaseService) {}

  async create(createStationDto: CreateStationDto): Promise<Station> {
    const query = `
      INSERT INTO stations (name, code) 
      VALUES ($1, $2) 
      RETURNING *
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
  }
}
