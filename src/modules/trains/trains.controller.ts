import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  HttpStatus,
} from '@nestjs/common';
import { TrainsService } from './trains.service';
import { CreateTrainDto } from './dto/create-train.dto';
import { UpdateWagonsDto } from './dto/add-wagons.dto';
import { Train } from './entities/train.entity';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('trains')
@Controller('trains')
export class TrainsController {
  constructor(private readonly trainsService: TrainsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new train',
    description:
      'Creates a new train with the provided train number and wagons.',
  })
  @ApiBody({ type: CreateTrainDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Train created successfully',
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
    return this.trainsService.createTrain(createTrainDto);
  }

  @Get(':trainNumber')
  @ApiOperation({
    summary: 'Get train by number',
    description: 'Retrieves a train by its unique train number.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Train retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Train not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to fetch train',
  })
  async getTrainByNumber(
    @Param('trainNumber') trainNumber: string,
  ): Promise<Train> {
    return this.trainsService.getTrainByNumber(trainNumber);
  }

  @Patch(':trainNumber/add-wagons')
  @ApiOperation({
    summary: 'Add wagons to a train',
    description: 'Adds new wagons to an existing train.',
  })
  @ApiBody({ type: UpdateWagonsDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Wagons added successfully',
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
    return this.trainsService.addWagons(trainNumber, addWagonsDto.wagons);
  }

  @ApiOperation({
    summary: 'Remove wagons from a train',
    description: 'Removes specified wagons from an existing train.',
  })
  @ApiBody({ type: UpdateWagonsDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Wagons removed successfully',
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
  @Patch(':trainNumber/remove-wagons')
  async removeWagons(
    @Param('trainNumber') trainNumber: string,
    @Body() removeWagonsDto: UpdateWagonsDto,
  ) {
    return this.trainsService.removeWagons(trainNumber, removeWagonsDto.wagons);
  }
}
