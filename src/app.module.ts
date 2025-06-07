import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { CacheModule } from '@nestjs/cache-manager';
import { getCacheConfig } from './configs/cache.config';
import { StationsModule } from './modules/stations/stations.module';
import { TrainsModule } from './modules/trains/trains.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    CacheModule.register({
      isGlobal: true,
      ...getCacheConfig(),
    }),
    StationsModule,
    TrainsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
