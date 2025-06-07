import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { StationsRepository } from './stations.repository';
import { CreateStationDto } from './dto/create-station.dto';
import { Station } from './entities/station.entity';
import { StationNameResponseDto } from './dto/station-response.dto';

@Injectable()
export class StationsService {
  constructor(
    private readonly stationsRepository: StationsRepository,
    private readonly logger: Logger,
  ) {}

  async addStation(createStationDto: CreateStationDto): Promise<Station> {
    try {
      const newStation =
        await this.stationsRepository.createStation(createStationDto);
      return newStation;
    } catch (error) {
      this.handleUpdateError(error, 'Failed to create station');
    }
  }

  async getAll(): Promise<Station[]> {
    try {
      return await this.stationsRepository.findAllStations();
    } catch (error) {
      this.handleUpdateError(error, 'Failed to fetch stations');
    }
  }

  async getStationByCode(code: number): Promise<StationNameResponseDto> {
    try {
      const station = await this.stationsRepository.findStationByCode(code);

      if (!station) {
        throw new NotFoundException(`Station with code ${code} not found`);
      }

      return station;
    } catch (error) {
      this.handleUpdateError(
        error,
        `Failed to fetch station with code ${code}`,
      );
    }
  }

  private handleUpdateError(error: any, text: string): never {
    console.error(`${text}:`, error.message);
    this.logger.error(text, error);

    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException
    ) {
      throw error;
    }

    throw new InternalServerErrorException(text);
  }
}
