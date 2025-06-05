import { Logger, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Module({
  providers: [DatabaseService, Logger],
  exports: [DatabaseService],
})
export class DatabaseModule {}
