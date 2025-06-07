import {
  IsArray,
  ArrayMinSize,
  IsString,
  Matches,
  ArrayUnique,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class AddWagonsDto {
  @IsArray({ message: 'Список вагонів має бути масивом' })
  @ArrayMinSize(1, {
    message: 'Необхідно вказати принаймні один вагон для додавання',
  })
  @ArrayUnique({ message: 'Список вагонів не може містити дублікатів' })
  @IsString({ each: true, message: 'Кожен вагон має бути рядком' })
  @Transform(({ value }) => value?.map((wagon: string) => wagon?.trim()))
  @Matches(/^[0-9]{2}[КПЛ]$/, {
    each: true,
    message:
      'Кожен вагон має бути у форматі "01К", "02П", "03Л" де К-купе, П-плацкарт, Л-люкс',
  })
  wagons: string[];
}
