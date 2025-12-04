import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Log, LogLevel } from '../../../domain/entities/log.entity';
import { LogRepository } from '../../../domain/repositories/log.repository';
import { LogEntity } from './entities/log.entity';

@Injectable()
export class PostgresqlLogRepository implements LogRepository {
  constructor(
    @InjectRepository(LogEntity)
    private readonly logRepository: Repository<LogEntity>,
  ) {}

  async save(log: Log): Promise<void> {
    const logEntity = new LogEntity();
    logEntity.id = log.id;
    logEntity.level = log.level;
    logEntity.message = log.message;
    logEntity.context = log.context;
    logEntity.timestamp = log.timestamp;
    logEntity.metadata = log.metadata;

    await this.logRepository.save(logEntity);
  }

  async findByDate(date: string): Promise<Log[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const logEntities = await this.logRepository.find({
      where: {
        timestamp: Between(startOfDay, endOfDay),
      },
      order: {
        timestamp: 'DESC',
      },
    });

    return logEntities.map((entity) => this.mapEntityToDomain(entity));
  }

  async findByDateAndLevel(date: string, level: string): Promise<Log[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const logEntities = await this.logRepository.find({
      where: {
        timestamp: Between(startOfDay, endOfDay),
        level,
      },
      order: {
        timestamp: 'DESC',
      },
    });

    return logEntities.map((entity) => this.mapEntityToDomain(entity));
  }

  async findById(date: string, id: string): Promise<Log | null> {
    const logEntity = await this.logRepository.findOne({
      where: { id },
    });

    if (!logEntity) {
      return null;
    }

    return this.mapEntityToDomain(logEntity);
  }

  private mapEntityToDomain(entity: LogEntity): Log {
    return new Log({
      id: entity.id,
      level: entity.level as LogLevel,
      message: entity.message,
      context: entity.context,
      timestamp: entity.timestamp,
      metadata: entity.metadata || {},
    });
  }
}
