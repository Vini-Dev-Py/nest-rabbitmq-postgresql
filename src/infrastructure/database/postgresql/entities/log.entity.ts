import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity('logs')
@Index(['timestamp'])
@Index(['level'])
export class LogEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10 })
  level: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', length: 100, default: 'default' })
  context: string;

  @CreateDateColumn({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;
}
