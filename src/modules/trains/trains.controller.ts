import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  HttpStatus,
  UseInterceptors,
  Inject,
  Logger,
} from '@nestjs/common';
import { TrainsService } from './trains.service';
import { CreateTrainDto } from './dto/create-train.dto';
import { UpdateWagonsDto } from './dto/add-wagons.dto';
import { Train } from './entities/train.entity';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@ApiTags('trains')
@Controller('trains')
export class TrainsController {
  constructor(
    private readonly trainsService: TrainsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly logger: Logger,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new train',
    description: 'Creates a new train with the provided train number and wagons.',
  })
  @ApiBody({
    type: CreateTrainDto,
    examples: {
      example1: {
        summary: 'Express train with mixed wagons',
        value: {
          trainNumber: '001Л',
          wagons: ['01К', '02К', '03П', '04П', '05Л'],
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Train created successfully',
    schema: {
      example: {
        id: 1,
        trainNumber: '001Л',
        wagons: ['01К', '02К', '03П', '04П', '05Л'],
        createdAt: '2024-12-25T10:30:00.000Z',
        updatedAt: '2024-12-25T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to create train',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid train data or train already exists',
  })
  async createTrain(@Body() createTrainDto: CreateTrainDto) {
    const train = await this.trainsService.createTrain(createTrainDto);

    const cacheKey = `train:${train.trainNumber}`;
    await this.cacheManager.set(cacheKey, train, 60000);

    return train;
  }

  @Get(':trainNumber')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({
    summary: 'Get train by number',
    description: 'Retrieves a train by its unique train number.',
  })
  @ApiParam({
    name: 'trainNumber',
    description: 'Train number (3 digits + Cyrillic letter)',
    type: 'string',
    required: true,
    example: '001Л',
    schema: {
      pattern: '^[0-9]{3}[А-Яа-яІіЄєЇїЁё]$',
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Train retrieved successfully',
    schema: {
      example: {
        id: 1,
        trainNumber: '001Л',
        wagons: ['01К', '02К', '03П', '04П', '05Л'],
        createdAt: '2024-12-25T10:30:00.000Z',
        updatedAt: '2024-12-25T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Train not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to fetch train',
  })
  async getTrainByNumber(@Param('trainNumber') trainNumber: string): Promise<Train> {
    const cacheKey = `train:${trainNumber}`;
    const cachedTrain = await this.cacheManager.get<Train>(cacheKey);

    if (cachedTrain) {
      this.logger.log(`Returning cached train: ${trainNumber}`);
      return cachedTrain;
    }

    const train = await this.trainsService.getTrainByNumber(trainNumber);
    await this.cacheManager.set(cacheKey, train, 60000);

    return train;
  }

  @Patch(':trainNumber/add-wagons')
  @ApiOperation({
    summary: 'Add wagons to a train',
    description: 'Adds new wagons to an existing train.',
  })
  @ApiParam({
    name: 'trainNumber',
    description: 'Train number (3 digits + Cyrillic letter)',
    type: 'string',
    required: true,
    example: '001Л',
    schema: {
      pattern: '^[0-9]{3}[А-Яа-яІіЄєЇїЁё]$',
    },
  })
  @ApiBody({
    type: UpdateWagonsDto,
    examples: {
      example1: {
        summary: 'Add coupe wagons',
        value: {
          wagons: ['06К', '07К'],
        },
      },
      example2: {
        summary: 'Add luxury wagon',
        value: {
          wagons: ['08Л'],
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Wagons added successfully',
    schema: {
      example: {
        id: 1,
        trainNumber: '001Л',
        wagons: ['01К', '02К', '03П', '04П', '05Л', '06К', '07К'],
        createdAt: '2024-12-25T10:30:00.000Z',
        updatedAt: '2024-12-25T11:15:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Train not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid wagon data or train not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to add wagons to train',
  })
  async addWagons(
    @Param('trainNumber') trainNumber: string,
    @Body() addWagonsDto: UpdateWagonsDto,
  ) {
    const updatedTrain = await this.trainsService.addWagons(trainNumber, addWagonsDto.wagons);

    const cacheKey = `train:${trainNumber}`;
    await this.cacheManager.set(cacheKey, updatedTrain, 60000);

    return updatedTrain;
  }

  @Patch(':trainNumber/remove-wagons')
  @ApiOperation({
    summary: 'Remove wagons from a train',
    description: 'Removes specified wagons from an existing train.',
  })
  @ApiParam({
    name: 'trainNumber',
    description: 'Train number (3 digits + Cyrillic letter)',
    type: 'string',
    required: true,
    example: '001Л',
    schema: {
      pattern: '^[0-9]{3}[А-Яа-яІіЄєЇїЁё]$',
    },
  })
  @ApiBody({
    type: UpdateWagonsDto,
    examples: {
      example1: {
        summary: 'Remove specific wagons',
        value: {
          wagons: ['05Л', '06К'],
        },
      },
      example2: {
        summary: 'Remove platzkart wagon',
        value: {
          wagons: ['03П'],
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Wagons removed successfully',
    schema: {
      example: {
        id: 1,
        trainNumber: '001Л',
        wagons: ['01К', '02К', '04П'],
        createdAt: '2024-12-25T10:30:00.000Z',
        updatedAt: '2024-12-25T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Train not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid wagon data or train not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to remove wagons from train',
  })
  async removeWagons(
    @Param('trainNumber') trainNumber: string,
    @Body() removeWagonsDto: UpdateWagonsDto,
  ) {
    const updatedTrain = await this.trainsService.removeWagons(trainNumber, removeWagonsDto.wagons);

    const cacheKey = `train:${trainNumber}`;
    await this.cacheManager.set(cacheKey, updatedTrain, 60000);

    return updatedTrain;
  }
}
