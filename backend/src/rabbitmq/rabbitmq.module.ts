import { Module } from '@nestjs/common';
import { TelemetriaModule } from '../telemetria/telemetria.module';
import { RabbitmqTelemetriaConsumer } from './rabbitmq-telemetria.consumer';

@Module({
  imports: [TelemetriaModule],
  providers: [RabbitmqTelemetriaConsumer],
})
export class RabbitmqModule {}
