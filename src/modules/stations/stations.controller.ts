import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { StationsService } from './stations.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateStationDto } from './dto/create-station.dto';
import { Station } from './entities/station.entity';
import { StationNameResponseDto } from './dto/station-response.dto';

@Controller('stations')
export class StationsController {
  constructor(
    private readonly stationsService: StationsService,
    private readonly logger: Logger,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new station',
    description: 'Creates a new station with the provided details.',
  })
  @ApiBody({ type: CreateStationDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Station created successfully',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to create station',
  })
  async createStation(
    @Body() createStationDto: CreateStationDto,
  ): Promise<Station> {
    this.logger.log('Creating a new station', createStationDto);
    return this.stationsService.create(createStationDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all stations',
    description: 'Retrieves a list of all stations.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of stations retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to fetch stations',
  })
  async getAllStations(): Promise<Station[]> {
    this.logger.log('Fetching all stations');
    return this.stationsService.getAll();
  }

  @Get(':stationCode')
  @ApiOperation({
    summary: 'Get station by code',
    description: 'Retrieves a station by its unique code.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Station retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Station with code XXXXXXX not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to fetch station with code XXXXXXX',
  })
  async getStationByCode(
    @Param('stationCode') stationCode: string,
  ): Promise<StationNameResponseDto> {
    this.logger.log(`Fetching station with code: ${stationCode}`);
    const station = await this.stationsService.getByCode(+stationCode);
    return station;
  }
}
