import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CassandraModule } from './infrastructure/database/cassandra/cassandra.module';
import { RabbitMQModule } from './infrastructure/messaging/rabbitmq/rabbitmq.module';
import { LogController } from './infrastructure/http/log.controller';
import { GetLogsByDateUseCase } from './application/use-cases/get-logs-by-date.use-case';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CassandraModule,
    RabbitMQModule,
  ],
  controllers: [AppController, LogController],
  providers: [AppService, GetLogsByDateUseCase],
})
export class AppModule {}
