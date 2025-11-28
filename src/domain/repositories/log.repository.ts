import { Log } from '../entities/log.entity';

export interface LogRepository {
  save(log: Log): Promise<void>;
  findByDate(date: string): Promise<Log[]>;
  findByDateAndLevel(date: string, level: string): Promise<Log[]>;
  findById(date: string, id: string): Promise<Log | null>;
}

export const LOG_REPOSITORY = Symbol('LogRepository');
