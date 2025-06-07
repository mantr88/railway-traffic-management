import {
  IsString,
  IsArray,
  ArrayMinSize,
  Matches,
  ArrayUnique,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTrainDto {
  @IsString({ message: 'Номер поїзда має бути рядком' })
  @IsNotEmpty({ message: 'Номер поїзда не може бути порожнім' })
  @Transform(({ value }) => value?.trim())
  @Matches(/^[0-9]{3}[А-Яа-яІіЄєЇїЁё]$/, {
    message:
      'Номер поїзда має складатися з трьох цифр і кириличної літери (наприклад: "001Л")',
  })
  trainNumber: string;

  @IsArray({ message: 'Список вагонів має бути масивом' })
  @ArrayMinSize(1, {
    message: 'Поїзд має складатися щонайменше з одного вагона',
  })
  @ArrayUnique({
    message: 'В одному поїзді не може бути вагонів з однаковим номером',
  })
  @IsString({ each: true, message: 'Кожен вагон має бути рядком' })
  @Transform(({ value }) => value?.map((wagon: string) => wagon?.trim()))
  @Matches(/^[0-9]{2}[КПЛ]$/, {
    each: true,
    message:
      'Кожен вагон має бути у форматі "01К", "02П", "03Л" де К-купе, П-плацкарт, Л-люкс',
  })
  wagons: string[];
}
