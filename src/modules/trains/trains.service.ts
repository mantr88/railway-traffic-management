import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { TrainsRepository } from './trains.repository';
import { CreateTrainDto } from './dto/create-train.dto';
import { Train } from './entities/train.entity';

@Injectable()
export class TrainsService {
  constructor(
    private readonly trainsRepository: TrainsRepository,
    private readonly logger: Logger,
  ) {}

  async createTrain(createTrainDto: CreateTrainDto): Promise<Train> {
    try {
      const uniqueWagons = [...new Set(createTrainDto.wagons)];
      if (uniqueWagons.length !== createTrainDto.wagons.length) {
        throw new BadRequestException(
          'A train cannot have wagons with duplicate numbers',
        );
      }

      const existingTrain = await this.trainsRepository.findByNumber(
        createTrainDto.trainNumber,
      );
      if (existingTrain) {
        throw new BadRequestException(
          `Train with number ${createTrainDto.trainNumber} already exists`,
        );
      }
      const orderedWagons = this.orderedWagons(createTrainDto.wagons);

      const train = await this.trainsRepository.createTrain(
        createTrainDto.trainNumber,
        orderedWagons,
      );

      if (!train.id) {
        throw new BadRequestException(
          `Failed to create a train with number ${createTrainDto.trainNumber}`,
        );
      }

      const createdTrain = await this.trainsRepository.findByNumber(
        createTrainDto.trainNumber,
      );

      if (!createdTrain) {
        throw new BadRequestException('Failed to retrieve created train');
      }

      return createdTrain;
    } catch (error) {
      this.handleUpdateError(error, 'Failed to create train');
    }
  }

  async getTrainByNumber(trainNumber: string): Promise<Train> {
    const train = await this.trainsRepository.findByNumber(trainNumber);

    if (!train) {
      throw new NotFoundException(`Train with number ${trainNumber} not found`);
    }

    return train;
  }

  async addWagons(trainNumber: string, newWagons: string[]): Promise<Train> {
    try {
      const train = await this.trainsRepository.findByNumber(trainNumber);
      if (!train?.id) {
        throw new NotFoundException(
          `Train with number ${trainNumber} not found`,
        );
      }

      const duplicates = newWagons.filter((wagon) =>
        train.wagons.includes(wagon),
      );
      if (duplicates.length > 0) {
        throw new BadRequestException(
          `Wagons with ${duplicates.join(', ')} already exist in train ${trainNumber}`,
        );
      }

      const orderedWagons = this.orderedWagons([...train.wagons, ...newWagons]);

      await this.trainsRepository.updateWagons(
        train.trainNumber,
        orderedWagons,
      );

      return this.getTrainByNumber(trainNumber);
    } catch (error) {
      this.handleUpdateError(error, 'Failed to add wagons to train');
    }
  }

  async removeWagons(
    trainNumber: string,
    wagonsToRemove: string[],
  ): Promise<Train> {
    try {
      const train = await this.trainsRepository.findByNumber(trainNumber);
      if (!train) {
        throw new NotFoundException(
          `Train with number ${trainNumber} not found`,
        );
      }

      const invalidWagons = wagonsToRemove.filter(
        (wagon) => !train.wagons.includes(wagon),
      );
      if (invalidWagons.length > 0) {
        throw new BadRequestException(
          `Wagons with numbers ${invalidWagons.join(
            ', ',
          )} do not exist in train ${trainNumber}`,
        );
      }

      const remainingWagons = train.wagons.filter(
        (w) => !wagonsToRemove.includes(w),
      );

      if (remainingWagons.length === 0) {
        throw new BadRequestException('A train must have at least one wagon');
      }

      const updatedWagons = this.orderedWagons(remainingWagons);

      await this.trainsRepository.updateWagons(
        train.trainNumber,
        updatedWagons,
      );

      return this.getTrainByNumber(trainNumber);
    } catch (error) {
      this.handleUpdateError(error, 'Failed to remove wagons from train');
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

  private orderedWagons(wagons: string[]): string[] {
    return wagons.sort((a, b) => {
      const numberA = parseInt(a.slice(0, 2), 10);
      const numberB = parseInt(b.slice(0, 2), 10);
      return numberA - numberB;
    });
  }
}
