import { Injectable } from '@nestjs/common';
import { Log, LogLevel } from '../../../domain/entities/log.entity';
import { LogRepository } from '../../../domain/repositories/log.repository';
import { CassandraService } from './cassandra.service';

@Injectable()
export class CassandraLogRepository implements LogRepository {
  constructor(private readonly cassandraService: CassandraService) {}

  async save(log: Log): Promise<void> {
    const query = `
      INSERT INTO logs (partition_date, id, level, message, context, timestamp, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await this.cassandraService.execute(query, [
      log.partitionDate,
      log.id,
      log.level,
      log.message,
      log.context,
      log.timestamp,
      JSON.stringify(log.metadata),
    ]);
  }

  async findByDate(date: string): Promise<Log[]> {
    const query = `
      SELECT * FROM logs WHERE partition_date = ?
    `;

    const result = await this.cassandraService.execute(query, [date]);
    return result.rows.map((row) => this.mapRowToLog(row));
  }

  async findByDateAndLevel(date: string, level: string): Promise<Log[]> {
    const query = `
      SELECT * FROM logs WHERE partition_date = ? AND level = ? ALLOW FILTERING
    `;

    const result = await this.cassandraService.execute(query, [date, level]);
    return result.rows.map((row) => this.mapRowToLog(row));
  }

  async findById(date: string, id: string): Promise<Log | null> {
    const query = `
      SELECT * FROM logs WHERE partition_date = ? AND id = ? ALLOW FILTERING
    `;

    const result = await this.cassandraService.execute(query, [date, id]);
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToLog(result.rows[0]);
  }

  private mapRowToLog(row: Record<string, unknown>): Log {
    const metadataStr = row['metadata'] as string | undefined;
    const metadata: Record<string, unknown> = metadataStr
      ? (JSON.parse(metadataStr) as Record<string, unknown>)
      : {};

    return new Log({
      id: String(row['id']),
      level: row['level'] as LogLevel,
      message: row['message'] as string,
      context: row['context'] as string,
      timestamp: row['timestamp'] as Date,
      metadata,
    });
  }
}
