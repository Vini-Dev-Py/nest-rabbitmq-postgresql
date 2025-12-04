import { Module } from '@nestjs/common';
import { CreateLogUseCase } from '../../../application/use-cases/create-log.use-case';
import { PostgresqlModule } from '../../database/postgresql/postgresql.module';
import { LogConsumer } from './log.consumer';
import { LogProducer } from './log.producer';
import { RabbitMQService } from './rabbitmq.service';

@Module({
  imports: [PostgresqlModule],
  providers: [RabbitMQService, LogConsumer, LogProducer, CreateLogUseCase],
  exports: [RabbitMQService, LogProducer, CreateLogUseCase],
})
export class RabbitMQModule {}
