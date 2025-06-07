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
  @ApiBody({ type: CreateTripDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Trip created successfully',
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

    // Очищуємо кеш для всіх можливих пошуків цього маршруту
    // Оскільки ключ кешу містить точну дату/час, очищуємо по шаблону
    const baseCachePattern = `trips:search:${createTripDto.departureStationCode}:${createTripDto.arrivalStationCode}:`;

    // Примітка: У production середовищі краще використовувати Redis SCAN для пошуку ключів за шаблоном
    // Для простоти тут ми просто очищуємо кеш з тим самим значенням дати
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
    description: 'Code of the departure station',
  })
  @ApiQuery({
    name: 'arrivalStationCode',
    required: true,
    description: 'Code of the arrival station',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    description: 'Date of the trip in YYYY-MM-DDTHH:mm:ss.sssZ format',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of trips found based on the search criteria',
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
