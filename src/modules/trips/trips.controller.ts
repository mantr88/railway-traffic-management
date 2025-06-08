import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  UseInterceptors,
  Inject,
  Logger,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { Trip } from './entities/trip.entity';
import { CacheInterceptor, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@ApiTags('trips')
@Controller('trips')
export class TripsController {
  constructor(
    private readonly tripsService: TripsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly logger: Logger,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new trip',
    description: 'Creates a new trip with the provided details.',
  })
  @ApiBody({
    type: CreateTripDto,
    examples: {
      example1: {
        summary: 'Kyiv to Lviv express trip',
        value: {
          trainNumber: '001Л',
          departureStationCode: 2200001,
          arrivalStationCode: 2200120,
          departureTime: '2024-12-25T10:30:00.000Z',
          arrivalTime: '2024-12-25T16:45:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Trip created successfully',
    schema: {
      example: {
        id: 1,
        trainNumber: '001Л',
        departureStationCode: 2200001,
        arrivalStationCode: 2200120,
        departureTime: '2024-12-25T10:30:00.000Z',
        arrivalTime: '2024-12-25T16:45:00.000Z',
        createdAt: '2024-12-25T08:00:00.000Z',
        updatedAt: '2024-12-25T08:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request, possibly due to invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error, possibly due to database issues',
  })
  async createTrip(@Body() createTripDto: CreateTripDto): Promise<Trip> {
    const trip = await this.tripsService.createTrip(createTripDto);

    const baseCachePattern = `trips:search:${createTripDto.departureStationCode}:${createTripDto.arrivalStationCode}:`;

    await this.cacheManager.del(`${baseCachePattern}${createTripDto.departureTime}`);

    this.logger.log(
      `Cleared cache for route ${createTripDto.departureStationCode} -> ${createTripDto.arrivalStationCode}`,
    );

    return trip;
  }

  @Get('search')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({
    summary: 'Search for trips',
    description: 'Searches for trips based on departure and arrival stations and date.',
  })
  @ApiQuery({
    name: 'departureStationCode',
    required: true,
    type: 'number',
    description: 'Code of the departure station (7-digit number starting with 22)',
    example: 2200001,
    schema: {
      minimum: 2200000,
      maximum: 2299999,
    },
  })
  @ApiQuery({
    name: 'arrivalStationCode',
    required: true,
    type: 'number',
    description: 'Code of the arrival station (7-digit number starting with 22)',
    example: 2200120,
    schema: {
      minimum: 2200000,
      maximum: 2299999,
    },
  })
  @ApiQuery({
    name: 'date',
    required: true,
    type: 'string',
    description: 'Date of the trip in YYYY-MM-DDTHH:mm:ss.sssZ format',
    example: '2024-12-25T08:00:00.000Z',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of trips found based on the search criteria',
    schema: {
      example: [
        {
          id: 1,
          trainNumber: '001Л',
          departureStationCode: 2200001,
          arrivalStationCode: 2200120,
          departureTime: '2024-12-25T10:30:00.000Z',
          arrivalTime: '2024-12-25T16:45:00.000Z',
          createdAt: '2024-12-25T08:00:00.000Z',
          updatedAt: '2024-12-25T08:00:00.000Z',
        },
        {
          id: 2,
          trainNumber: '007Л',
          departureStationCode: 2200001,
          arrivalStationCode: 2200120,
          departureTime: '2024-12-25T22:00:00.000Z',
          arrivalTime: '2024-12-26T06:30:00.000Z',
          createdAt: '2024-12-25T08:30:00.000Z',
          updatedAt: '2024-12-25T08:30:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request, possibly due to invalid query parameters',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No trips found for the specified criteria',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error, possibly due to database issues',
  })
  async searchTrips(
    @Query('departureStationCode') departureStationCode: number,
    @Query('arrivalStationCode') arrivalStationCode: number,
    @Query('date') date: string,
  ): Promise<Trip[]> {
    const cacheKey = `trips:search:${departureStationCode}:${arrivalStationCode}:${date}`;

    const cachedTrips = await this.cacheManager.get<Trip[]>(cacheKey);

    if (cachedTrips) {
      this.logger.log(
        `Returning cached trips for route ${departureStationCode} -> ${arrivalStationCode} on ${date}`,
      );
      return cachedTrips;
    }

    const trips = await this.tripsService.searchTrips(
      departureStationCode,
      arrivalStationCode,
      date,
    );

    await this.cacheManager.set(cacheKey, trips, 60000);

    return trips;
  }
}
