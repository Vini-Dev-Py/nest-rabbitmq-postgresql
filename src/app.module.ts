import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GetLogsByDateUseCase } from './application/use-cases/get-logs-by-date.use-case';
import { PostgresqlModule } from './infrastructure/database/postgresql/postgresql.module';
import { HealthController } from './infrastructure/http/health.controller';
import { LogController } from './infrastructure/http/log.controller';
import { RabbitMQModule } from './infrastructure/messaging/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PostgresqlModule,
    RabbitMQModule,
  ],
  controllers: [AppController, LogController, HealthController],
  providers: [AppService, GetLogsByDateUseCase],
})
export class AppModule {}
