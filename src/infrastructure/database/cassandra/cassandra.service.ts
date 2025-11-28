import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, types } from 'cassandra-driver';

@Injectable()
export class CassandraService implements OnModuleInit, OnModuleDestroy {
  private client: Client;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const contactPoints = this.configService.get<string>(
      'CASSANDRA_CONTACT_POINTS',
      'localhost',
    );
    const localDataCenter = this.configService.get<string>(
      'CASSANDRA_LOCAL_DATACENTER',
      'datacenter1',
    );
    const keyspace = this.configService.get<string>(
      'CASSANDRA_KEYSPACE',
      'logs_keyspace',
    );

    this.client = new Client({
      contactPoints: contactPoints.split(','),
      localDataCenter,
      keyspace,
    });

    await this.client.connect();
    await this.createKeyspaceAndTables();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.shutdown();
    }
  }

  private async createKeyspaceAndTables(): Promise<void> {
    const keyspace = this.configService.get<string>(
      'CASSANDRA_KEYSPACE',
      'logs_keyspace',
    );

    // Create keyspace if not exists
    const createKeyspaceQuery = `
      CREATE KEYSPACE IF NOT EXISTS ${keyspace}
      WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}
    `;

    await this.client.execute(createKeyspaceQuery);

    // Create logs table partitioned by date
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${keyspace}.logs (
        partition_date text,
        id uuid,
        level text,
        message text,
        context text,
        timestamp timestamp,
        metadata text,
        PRIMARY KEY ((partition_date), timestamp, id)
      ) WITH CLUSTERING ORDER BY (timestamp DESC, id ASC)
    `;

    await this.client.execute(createTableQuery);

    // Create index on level for filtering
    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS logs_level_idx ON ${keyspace}.logs (level)
    `;

    await this.client.execute(createIndexQuery);
  }

  async execute(query: string, params?: unknown[]): Promise<types.ResultSet> {
    return this.client.execute(query, params, { prepare: true });
  }

  getClient(): Client {
    return this.client;
  }
}
