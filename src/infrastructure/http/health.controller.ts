import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import * as os from 'os';
import { DataSource } from 'typeorm';
import { RabbitMQService } from '../messaging/rabbitmq/rabbitmq.service';

@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  @Get()
  async checkHealth(): Promise<{
    status: string;
    timestamp: string;
    hostname: string;
    services: {
      database: string;
      rabbitmq: string;
    };
  }> {
    const checks = {
      database: 'unknown',
      rabbitmq: 'unknown',
    };

    // Check database connection
    try {
      await this.dataSource.query('SELECT 1');
      checks.database = 'healthy';
    } catch {
      checks.database = 'unhealthy';
    }

    // Check RabbitMQ connection
    try {
      const channel = this.rabbitMQService.getChannel();
      checks.rabbitmq = channel ? 'healthy' : 'unhealthy';
    } catch {
      checks.rabbitmq = 'unhealthy';
    }

    const allHealthy =
      checks.database === 'healthy' && checks.rabbitmq === 'healthy';

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      hostname: os.hostname(),
      services: checks,
    };
  }
}
