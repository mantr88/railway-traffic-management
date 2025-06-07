import {
  IsString,
  MinLength,
  Matches,
  IsNumber,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';

export class CreateStationDto {
  @IsString()
  @IsNotEmpty({ message: 'Station name cannot be empty' })
  @MinLength(3)
  @Matches(/^[а-яА-ЯёЁіІїЇєЄ0-9\-']+$/, {
    message:
      'Station name can only contain Cyrillic letters, numbers, hyphens and apostrophes',
  })
  name: string;

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
