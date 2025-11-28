import { randomUUID } from 'crypto';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogProps {
  id?: string;
  level: LogLevel;
  message: string;
  context?: string;
  timestamp?: Date;
  metadata?: Record<string, unknown>;
}

export class Log {
  private readonly _id: string;
  private readonly _level: LogLevel;
  private readonly _message: string;
  private readonly _context: string;
  private readonly _timestamp: Date;
  private readonly _metadata: Record<string, unknown>;
  private readonly _partitionDate: string;

  constructor(props: LogProps) {
    this._id = props.id || randomUUID();
    this._level = props.level;
    this._message = props.message;
    this._context = props.context || 'default';
    this._timestamp = props.timestamp || new Date();
    this._metadata = props.metadata || {};
    this._partitionDate = this.formatPartitionDate(this._timestamp);
  }

  private formatPartitionDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get id(): string {
    return this._id;
  }

  get level(): LogLevel {
    return this._level;
  }

  get message(): string {
    return this._message;
  }

  get context(): string {
    return this._context;
  }

  get timestamp(): Date {
    return this._timestamp;
  }

  get metadata(): Record<string, unknown> {
    return this._metadata;
  }

  get partitionDate(): string {
    return this._partitionDate;
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this._id,
      level: this._level,
      message: this._message,
      context: this._context,
      timestamp: this._timestamp.toISOString(),
      metadata: this._metadata,
      partitionDate: this._partitionDate,
    };
  }
}
