import { IsString, IsArray, ArrayMinSize, Matches, ArrayUnique, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTrainDto {
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
    description: 'List of wagons (format: 2 digits + class letter К/П/Л)',
    example: ['01К', '02П', '03Л', '04К'],
    type: [String],
    items: {
      pattern: '^[0-9]{2}[КПЛ]$',
    },
  })
  @IsArray({ message: 'Wagon list must be an array' })
  @ArrayMinSize(1, {
    message: 'A train must consist of at least one wagon',
  })
  @ArrayUnique({
    message: 'A train cannot have wagons with duplicate numbers',
  })
  @IsString({ each: true, message: 'Each wagon must be a string' })
  @Transform(({ value }) => value?.map((wagon: string) => wagon?.trim()))
  @Matches(/^[0-9]{2}[КПЛ]$/, {
    each: true,
    message:
      'Each wagon must be in the format "01К", "02П", "03Л" where К is coupe, П is platzkart, Л is luxe',
  })
  wagons: string[];
}
