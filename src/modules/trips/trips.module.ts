import { Logger, Module } from '@nestjs/common';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { DatabaseModule } from 'src/database/database.module';
import { TripsRepository } from './trips.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [TripsController],
  providers: [TripsService, TripsRepository, Logger],
})
export class TripsModule {}
