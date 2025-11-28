import { Module } from '@nestjs/common';
import { LOG_REPOSITORY } from '../../../domain/repositories';
import { CassandraLogRepository } from './cassandra-log.repository';
import { CassandraService } from './cassandra.service';

@Module({
  providers: [
    CassandraService,
    {
      provide: LOG_REPOSITORY,
      useClass: CassandraLogRepository,
    },
  ],
  exports: [CassandraService, LOG_REPOSITORY],
})
export class CassandraModule {}
