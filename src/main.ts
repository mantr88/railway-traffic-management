import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Railway traffic management API')
    .setDescription('The test task for the railway traffic management system')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  if (process.env.NODE_ENV !== 'production') {
    SwaggerModule.setup('api/v1/swagger-html', app, documentFactory);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0', async () => {
    const url = await app.getUrl();

    const logger = new Logger('NestApplication');
    logger.log(`Server running on ${url}`);

    if (process.env.NODE_ENV !== 'production') {
      logger.log(`OpenAPI: ${url}/api/v1/swagger-html`);
    }
  });
}
bootstrap();
