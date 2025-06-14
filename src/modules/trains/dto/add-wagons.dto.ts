import { IsArray, ArrayMinSize, IsString, Matches, ArrayUnique } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateWagonsDto {
  @ApiProperty({
    description: 'List of wagons to add/remove (format: 2 digits + class letter К/П/Л)',
    example: ['05К', '06П'],
    type: [String],
    items: {
      pattern: '^[0-9]{2}[КПЛ]$',
    },
  })
  @IsArray({ message: 'Wagon list must be an array' })
  @ArrayMinSize(1, {
    message: 'At least one wagon must be specified for addition',
  })
  @ArrayUnique({ message: 'Wagon list cannot contain duplicates' })
  @IsString({ each: true, message: 'Each wagon must be a string' })
  @Transform(({ value }) => value?.map((wagon: string) => wagon?.trim()))
  @Matches(/^[0-9]{2}[КПЛ]$/, {
    each: true,
    message:
      'Each wagon must be in the format "01К", "02П", "03Л" where К is coupe, П is platzkart, Л is luxe',
  })
  wagons: string[];
}
