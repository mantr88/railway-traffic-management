import { Logger, Module } from '@nestjs/common';
import { TrainsController } from './trains.controller';
import { TrainsService } from './trains.service';
import { DatabaseModule } from 'src/database/database.module';
import { TrainsRepository } from './trains.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [TrainsController],
  providers: [TrainsService, TrainsRepository, Logger],
})
export class TrainsModule {}
