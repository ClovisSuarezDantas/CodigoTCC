import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Channel, ChannelModel, ConsumeMessage } from 'amqplib';
import { TelemetriaService } from '../telemetria/telemetria.service';

type TelemetriaRabbitPayload = {
  pacoteId?: string;
  codigoDispositivo: string;
  timestamp?: string;
  velocidadeObd?: number;
  rpm?: number;
  temperaturaMotor?: number;
};

@Injectable()
export class RabbitmqTelemetriaConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqTelemetriaConsumer.name);
  private connection?: ChannelModel;
  private channel?: Channel;

  constructor(
    private readonly configService: ConfigService,
    private readonly telemetriaService: TelemetriaService,
  ) {}

  async onModuleInit() {
    const enabled = this.configService.get<string>('RABBITMQ_ENABLED') ?? 'false';
    if (enabled.toLowerCase() !== 'true') {
      this.logger.log('RabbitMQ desabilitado. Defina RABBITMQ_ENABLED=true para consumir telemetria.');
      return;
    }

    const url = this.configService.get<string>('RABBITMQ_URL') ?? 'amqp://guest:guest@localhost:5672';
    const exchange = this.configService.get<string>('RABBITMQ_EXCHANGE') ?? 'amq.topic';
    const queue = this.configService.get<string>('RABBITMQ_QUEUE') ?? 'telemetria.veicular';
    const routingKey = this.configService.get<string>('RABBITMQ_ROUTING_KEY') ?? 'telemetria.veicular';

    const connection = await connect(url);
    const channel = await connection.createChannel();
    this.connection = connection;
    this.channel = channel;

    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);
    await channel.prefetch(10);

    await channel.consume(queue, (message) => void this.handleMessage(message), {
      noAck: false,
    });

    this.logger.log(`Consumindo RabbitMQ queue=${queue} exchange=${exchange} routingKey=${routingKey}`);
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }

  private async handleMessage(message: ConsumeMessage | null) {
    if (!message || !this.channel) return;

    try {
      const content = message.content.toString('utf8');
      const parsed = JSON.parse(content) as TelemetriaRabbitPayload | TelemetriaRabbitPayload[];
      const payloads = Array.isArray(parsed) ? parsed : [parsed];

      for (const payload of payloads) {
        const resultado = await this.telemetriaService.create({
          pacoteId: payload.pacoteId,
          codigoDispositivo: payload.codigoDispositivo,
          timestamp: payload.timestamp ?? new Date().toISOString(),
          velocidadeObd: payload.velocidadeObd,
          rpm: payload.rpm,
          temperaturaMotor: payload.temperaturaMotor,
        });
        this.publishAck(payload, resultado.configuracaoAplicada);
      }

      this.channel.ack(message);
    } catch (error) {
      const messageText = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha ao processar telemetria RabbitMQ: ${messageText}`);
      this.channel.nack(message, false, false);
    }
  }

  private publishAck(payload: TelemetriaRabbitPayload, configuracaoAplicada?: unknown) {
    if (!payload.pacoteId || !this.channel) return;

    const exchange = this.configService.get<string>('RABBITMQ_EXCHANGE') ?? 'amq.topic';
    const routingKey = `telemetria.ack.${payload.codigoDispositivo}`;
    const ackPayload = {
      pacoteId: payload.pacoteId,
      codigoDispositivo: payload.codigoDispositivo,
      status: 'SALVO_NO_POSTGRES',
      configuracaoAplicada,
      timestamp: new Date().toISOString(),
    };

    this.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(ackPayload)), {
      contentType: 'application/json',
      persistent: false,
    });
  }
}
