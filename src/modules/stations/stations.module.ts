import { Logger, Module } from '@nestjs/common';
import { StationsController } from './stations.controller';
import { StationsService } from './stations.service';
import { StationsRepository } from './stations.repository';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [StationsController],
  providers: [StationsService, StationsRepository, Logger],
})
export class StationsModule {}
