import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { TripsRepository } from './trips.repository';
import { Trip } from './entities/trip.entity';
import { CreateTripDto } from './dto/create-trip.dto';

@Injectable()
export class TripsService {
  constructor(
    private readonly tripsRepository: TripsRepository,
    private readonly logger: Logger,
  ) {}

  async createTrip(createTripDto: CreateTripDto): Promise<Trip> {
    try {
      const {
        trainNumber,
        departureStationCode,
        arrivalStationCode,
        departureTime,
        arrivalTime,
      } = createTripDto;

      if (departureStationCode === arrivalStationCode) {
        throw new BadRequestException(
          'Departure station and arrival station cannot be the same',
        );
      }

      const existingTrip = await this.tripsRepository.findExistingTrip(
        trainNumber,
        departureStationCode,
        arrivalStationCode,
        departureTime,
      );

      if (existingTrip) {
        throw new BadRequestException(
          `Trip with train number ${trainNumber} from station ${departureStationCode} to station ${arrivalStationCode} at ${departureTime} already exists`,
        );
      }

      const trip = await this.tripsRepository.createTrip(
        trainNumber,
        departureStationCode,
        arrivalStationCode,
        departureTime,
        arrivalTime,
      );

      if (!trip.id) {
        throw new BadRequestException(
          `Failed to create a trip with train number ${trainNumber}`,
        );
      }

      return trip;
    } catch (error) {
      this.handleUpdateError(error, 'Failed to create trip');
    }
  }

  async searchTrips(
    departureStationCode: number,
    arrivalStationCode: number,
    date: string,
  ): Promise<Trip[]> {
    try {
      if (departureStationCode === arrivalStationCode) {
        throw new BadRequestException(
          'Departure station and arrival station cannot be the same',
        );
      }
      const trips = await this.tripsRepository.searchTrips(
        departureStationCode,
        arrivalStationCode,
        date,
      );
      if (!trips || trips.length === 0) {
        throw new NotFoundException(
          `No trips found from station ${departureStationCode} to station ${arrivalStationCode} on date ${date}`,
        );
      }
      return trips;
    } catch (error) {
      this.handleUpdateError(
        error,
        `Failed to search trips from station ${departureStationCode} to station ${arrivalStationCode} on date ${date}`,
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
