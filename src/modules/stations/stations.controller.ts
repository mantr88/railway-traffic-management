import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  Post,
  UseInterceptors,
  Inject,
} from '@nestjs/common';
import { StationsService } from './stations.service';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateStationDto } from './dto/create-station.dto';
import { Station } from './entities/station.entity';
import { StationNameResponseDto } from './dto/station-response.dto';
import { CacheInterceptor, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@ApiTags('stations')
@Controller('stations')
export class StationsController {
  constructor(
    private readonly stationsService: StationsService,
    private readonly logger: Logger,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
  async createStation(@Body() createStationDto: CreateStationDto): Promise<Station> {
    this.logger.log('Creating a new station', createStationDto);
    const station = await this.stationsService.addStation(createStationDto);

    await this.cacheManager.del('stations:all');

    return station;
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
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

    const cacheKey = 'stations:all';
    const cachedStations = await this.cacheManager.get<Station[]>(cacheKey);

    if (cachedStations) {
      this.logger.log('Returning cached stations');
      return cachedStations;
    }

    const stations = await this.stationsService.getAll();
    await this.cacheManager.set(cacheKey, stations, 60000);

    return stations;
  }

  @Get(':stationCode')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({
    summary: 'Get station by code',
    description: 'Retrieves a station by its unique code.',
  })
  @ApiParam({
    name: 'stationCode',
    description: 'Unique code of the station to retrieve',
    type: 'number',
    required: true,
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

    const cacheKey = `station:code:${stationCode}`;
    const cachedStation = await this.cacheManager.get<StationNameResponseDto>(cacheKey);

    if (cachedStation) {
      this.logger.log(`Returning cached station for code: ${stationCode}`);
      return cachedStation;
    }

    const station = await this.stationsService.getStationByCode(+stationCode);
    await this.cacheManager.set(cacheKey, station, 60000);

    return station;
  }
}
