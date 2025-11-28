import { Inject, Injectable } from '@nestjs/common';
import type { LogRepository } from '../../domain/repositories';
import { LOG_REPOSITORY } from '../../domain/repositories';
import { LogResponseDto } from '../dtos/log-response.dto';

@Injectable()
export class GetLogsByDateUseCase {
  constructor(
    @Inject(LOG_REPOSITORY)
    private readonly logRepository: LogRepository,
  ) {}

  async execute(date: string): Promise<LogResponseDto[]> {
    const logs = await this.logRepository.findByDate(date);

    return logs.map((log) => ({
      id: log.id,
      level: log.level,
      message: log.message,
      context: log.context,
      timestamp: log.timestamp.toISOString(),
      metadata: log.metadata,
      partitionDate: log.partitionDate,
    }));
  }
}
