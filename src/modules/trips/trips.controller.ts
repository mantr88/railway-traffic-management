import { Body, Controller, Get, HttpStatus, Post, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { Trip } from './entities/trip.entity';

@ApiTags('trips')
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

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
    return this.tripsService.createTrip(createTripDto);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search for trips',
    description:
      'Searches for trips based on departure and arrival stations and date.',
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
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error, possibly due to database issues',
  })
  async searchTrips(
    @Query('departureStationCode') departureStationCode: number,
    @Query('arrivalStationCode') arrivalStationCode: number,
    @Query('date') date: string,
  ): Promise<Trip[]> {
    return this.tripsService.searchTrips(
      departureStationCode,
      arrivalStationCode,
      date,
    );
  }
}
