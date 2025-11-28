import { Module } from '@nestjs/common';
import { CassandraModule } from '../../database/cassandra/cassandra.module';
import { CreateLogUseCase } from '../../../application/use-cases/create-log.use-case';
import { LogConsumer } from './log.consumer';
import { LogProducer } from './log.producer';
import { RabbitMQService } from './rabbitmq.service';

@Module({
  imports: [CassandraModule],
  providers: [RabbitMQService, LogConsumer, LogProducer, CreateLogUseCase],
  exports: [RabbitMQService, LogProducer],
})
export class RabbitMQModule {}
