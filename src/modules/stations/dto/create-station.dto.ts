import { IsString, MinLength, Matches, IsNumber, Min, Max, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStationDto {
  @ApiProperty({
    description:
      'Station name (minimum 3 characters, Cyrillic letters, numbers, hyphens and apostrophes)',
    example: 'Київ-Пасажирський',
    minLength: 3,
    pattern: "^[а-яА-ЯёЁіІїЇєЄ0-9\\-']+$",
  })
  @IsString()
  @IsNotEmpty({ message: 'Station name cannot be empty' })
  @MinLength(3)
  @Matches(/^[а-яА-ЯёЁіІїЇєЄ0-9\-']+$/, {
    message: 'Station name can only contain Cyrillic letters, numbers, hyphens and apostrophes',
  })
  name: string;

  @ApiProperty({
    description: 'Station code (7-digit number starting with 22)',
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
  code: number;
}
