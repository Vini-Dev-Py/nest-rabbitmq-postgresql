import { Injectable } from '@nestjs/common';
import { CreateLogDto } from '../../../application/dtos/create-log.dto';
import { RabbitMQService } from './rabbitmq.service';
import { LOG_EXCHANGE, LOG_ROUTING_KEY } from './log.consumer';

@Injectable()
export class LogProducer {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  publishLog(logDto: CreateLogDto): boolean {
    return this.rabbitMQService.publish(LOG_EXCHANGE, LOG_ROUTING_KEY, logDto);
  }
}
