import { LogLevel } from '../../domain/entities/log.entity';

export class LogResponseDto {
  id: string;
  level: LogLevel;
  message: string;
  context: string;
  timestamp: string;
  metadata: Record<string, unknown>;
  partitionDate: string;
}
