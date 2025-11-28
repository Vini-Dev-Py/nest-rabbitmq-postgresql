import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.ChannelModel;
  private channel: amqp.Channel;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const url = this.configService.get<string>(
      'RABBITMQ_URL',
      'amqp://localhost:5672',
    );

    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }

  async assertQueue(queue: string): Promise<void> {
    await this.channel.assertQueue(queue, { durable: true });
  }

  async assertExchange(
    exchange: string,
    type: 'direct' | 'topic' | 'fanout' | 'headers',
  ): Promise<void> {
    await this.channel.assertExchange(exchange, type, { durable: true });
  }

  async bindQueue(
    queue: string,
    exchange: string,
    routingKey: string,
  ): Promise<void> {
    await this.channel.bindQueue(queue, exchange, routingKey);
  }

  publish(exchange: string, routingKey: string, message: unknown): boolean {
    const buffer = Buffer.from(JSON.stringify(message));
    return this.channel.publish(exchange, routingKey, buffer, {
      persistent: true,
      contentType: 'application/json',
    });
  }

  sendToQueue(queue: string, message: unknown): boolean {
    const buffer = Buffer.from(JSON.stringify(message));
    return this.channel.sendToQueue(queue, buffer, {
      persistent: true,
      contentType: 'application/json',
    });
  }

  async consume(
    queue: string,
    callback: (message: amqp.ConsumeMessage | null) => void,
  ): Promise<void> {
    await this.channel.consume(queue, callback, { noAck: false });
  }

  ack(message: amqp.ConsumeMessage): void {
    this.channel.ack(message);
  }

  nack(message: amqp.ConsumeMessage, requeue = false): void {
    this.channel.nack(message, false, requeue);
  }

  getChannel(): amqp.Channel {
    return this.channel;
  }
}
