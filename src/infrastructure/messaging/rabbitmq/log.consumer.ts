import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateLogUseCase } from '../../../application/use-cases/create-log.use-case';
import { CreateLogDto } from '../../../application/dtos/create-log.dto';
import { RabbitMQService } from './rabbitmq.service';

export const LOG_QUEUE = 'logs_queue';
export const LOG_EXCHANGE = 'logs_exchange';
export const LOG_ROUTING_KEY = 'log.create';

@Injectable()
export class LogConsumer implements OnModuleInit {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly createLogUseCase: CreateLogUseCase,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.setupQueue();
    await this.startConsuming();
  }

  private async setupQueue(): Promise<void> {
    await this.rabbitMQService.assertExchange(LOG_EXCHANGE, 'topic');
    await this.rabbitMQService.assertQueue(LOG_QUEUE);
    await this.rabbitMQService.bindQueue(
      LOG_QUEUE,
      LOG_EXCHANGE,
      LOG_ROUTING_KEY,
    );
  }

  private async startConsuming(): Promise<void> {
    await this.rabbitMQService.consume(LOG_QUEUE, (message) => {
      if (!message) {
        return;
      }

      const processMessage = async (): Promise<void> => {
        try {
          const content = JSON.parse(
            message.content.toString(),
          ) as CreateLogDto;
          await this.createLogUseCase.execute(content);
          this.rabbitMQService.ack(message);
        } catch (error) {
          console.error('Error processing log message:', error);
          this.rabbitMQService.nack(message, false);
        }
      };

      void processMessage();
    });
  }
}
