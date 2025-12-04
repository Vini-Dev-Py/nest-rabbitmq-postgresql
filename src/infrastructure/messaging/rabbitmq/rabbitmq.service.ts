import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
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

    await this.connect(url);
  }

  private async connect(url: string, retries = 5): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        this.connection = await amqp.connect(url);
        this.channel = await this.connection.createChannel();
        console.log('RabbitMQ connected successfully');
        return;
      } catch (error) {
        console.error(
          `Failed to connect to RabbitMQ (attempt ${i + 1}/${retries}):`,
          error,
        );
        if (i === retries - 1) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
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
    this.ensureChannel();
    await this.channel.assertQueue(queue, { durable: true });
  }

  async assertExchange(
    exchange: string,
    type: 'direct' | 'topic' | 'fanout' | 'headers',
  ): Promise<void> {
    this.ensureChannel();
    await this.channel.assertExchange(exchange, type, { durable: true });
  }

  async bindQueue(
    queue: string,
    exchange: string,
    routingKey: string,
  ): Promise<void> {
    this.ensureChannel();
    await this.channel.bindQueue(queue, exchange, routingKey);
  }

  publish(exchange: string, routingKey: string, message: unknown): boolean {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    const buffer = Buffer.from(JSON.stringify(message));
    return this.channel.publish(exchange, routingKey, buffer, {
      persistent: true,
      contentType: 'application/json',
    });
  }

  sendToQueue(queue: string, message: unknown): boolean {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
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
    this.ensureChannel();
    await this.channel.consume(queue, callback, { noAck: false });
  }

  ack(message: amqp.ConsumeMessage): void {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    this.channel.ack(message);
  }

  nack(message: amqp.ConsumeMessage, requeue = false): void {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    this.channel.nack(message, false, requeue);
  }

  getChannel(): amqp.Channel {
    return this.channel;
  }

  private ensureChannel(): void {
    if (!this.channel) {
      throw new Error(
        'RabbitMQ channel not initialized. Service may not have started correctly.',
      );
    }
  }
}
