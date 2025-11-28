import { Inject, Injectable } from '@nestjs/common';
import { Log } from '../../domain/entities/log.entity';
import type { LogRepository } from '../../domain/repositories';
import { LOG_REPOSITORY } from '../../domain/repositories';
import { CreateLogDto } from '../dtos/create-log.dto';
import { LogResponseDto } from '../dtos/log-response.dto';

@Injectable()
export class CreateLogUseCase {
  constructor(
    @Inject(LOG_REPOSITORY)
    private readonly logRepository: LogRepository,
  ) {}

  async execute(dto: CreateLogDto): Promise<LogResponseDto> {
    const log = new Log({
      level: dto.level,
      message: dto.message,
      context: dto.context,
      metadata: dto.metadata,
    });

    await this.logRepository.save(log);

    return {
      id: log.id,
      level: log.level,
      message: log.message,
      context: log.context,
      timestamp: log.timestamp.toISOString(),
      metadata: log.metadata,
      partitionDate: log.partitionDate,
    };
  }
}
