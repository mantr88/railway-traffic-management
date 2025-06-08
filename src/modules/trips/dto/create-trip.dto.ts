import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Max,
  Min,
  ValidateBy,
  ValidationOptions,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

function IsAfterDepartureTime(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isAfterDepartureTime',
      validator: {
        validate(value: any, args: any) {
          const departureTime = args.object.departureTime;
          if (!departureTime || !value) return false;

          const departure = new Date(departureTime);
          const arrival = new Date(value);

          return arrival > departure;
        },
        defaultMessage() {
          return 'Arrival time must be after departure time';
        },
      },
    },
    validationOptions,
  );
}

export class CreateTripDto {
  @ApiProperty({
    description: 'Train number (3 digits + Cyrillic letter)',
    example: '001Л',
    pattern: '^[0-9]{3}[А-Яа-яІіЄєЇїЁё]$',
  })
  @IsString({ message: 'Train number must be a string' })
  @IsNotEmpty({ message: 'Train number cannot be empty' })
  @Transform(({ value }) => value?.trim())
  @Matches(/^[0-9]{3}[А-Яа-яІіЄєЇїЁё]$/, {
    message: 'Train number must consist of three digits and a Cyrillic letter (e.g., "001Л")',
  })
  trainNumber: string;

  @ApiProperty({
    description: 'Departure station code (7-digit number starting with 22)',
    example: 2200001,
    minimum: 2200000,
    maximum: 2299999,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Station code cannot be empty' })
  @Min(2200000, {
    message: 'Station code must be a 7-digit number starting with 22',
  })
  @Max(2299999, {
    message: 'Station code must be a 7-digit number starting with 22',
  })
  departureStationCode: number;

  @ApiProperty({
    description: 'Arrival station code (7-digit number starting with 22)',
    example: 2200002,
    minimum: 2200000,
    maximum: 2299999,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Station code cannot be empty' })
  @Min(2200000, {
    message: 'Station code must be a 7-digit number starting with 22',
  })
  @Max(2299999, {
    message: 'Station code must be a 7-digit number starting with 22',
  })
  arrivalStationCode: number;

  @ApiProperty({
    description: 'Departure time in ISO format',
    example: '2024-12-25T10:30:00.000Z',
    format: 'date-time',
  })
  @IsString()
  @IsNotEmpty({ message: 'Departure time cannot be empty' })
  @IsDateString(
    {},
    {
      message: 'Departure time must be a valid ISO date string (YYYY-MM-DDTHH:mm:ss.sssZ)',
    },
  )
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/, {
    message: 'Departure time must be in format YYYY-MM-DDTHH:mm:ss.sssZ or YYYY-MM-DDTHH:mm:ss',
  })
  departureTime: string;

  @ApiProperty({
    description: 'Arrival time in ISO format (must be after departure time)',
    example: '2024-12-25T14:45:00.000Z',
    format: 'date-time',
  })
  @IsString()
  @IsNotEmpty({ message: 'Arrival time cannot be empty' })
  @IsDateString(
    {},
    {
      message: 'Arrival time must be a valid ISO date string (YYYY-MM-DDTHH:mm:ss.sssZ)',
    },
  )
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/, {
    message: 'Arrival time must be in format YYYY-MM-DDTHH:mm:ss.sssZ or YYYY-MM-DDTHH:mm:ss',
  })
  @IsAfterDepartureTime({
    message: 'Arrival time must be after departure time',
  })
  arrivalTime: string;
}
