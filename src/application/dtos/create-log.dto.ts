import { LogLevel } from '../../domain/entities/log.entity';

export class CreateLogDto {
  level: LogLevel;
  message: string;
  context?: string;
  metadata?: Record<string, unknown>;
}
