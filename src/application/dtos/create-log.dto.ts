import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LogLevel } from '../../domain/entities/log.entity';

export class CreateLogDto {
  @IsEnum(LogLevel)
  @IsNotEmpty()
  level: LogLevel;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  context?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}
