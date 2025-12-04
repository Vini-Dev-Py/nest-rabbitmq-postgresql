import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LOG_REPOSITORY } from '../../../domain/repositories';
import { LogEntity } from './entities/log.entity';
import { PostgresqlLogRepository } from './postgresql-log.repository';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'logs_db'),
        entities: [LogEntity],
        synchronize: true, // Auto-create tables (disable in production)
        logging: false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([LogEntity]),
  ],
  providers: [
    {
      provide: LOG_REPOSITORY,
      useClass: PostgresqlLogRepository,
    },
  ],
  exports: [LOG_REPOSITORY],
})
export class PostgresqlModule {}
