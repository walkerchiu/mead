import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'AUDIT_LOG_QUEUE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const url = configService.get<string>('RABBITMQ_URL');
          if (!url) {
            throw new Error('RABBITMQ_URL environment variable is required');
          }
          return {
            transport: Transport.RMQ,
            options: {
              urls: [url],
              queue: 'audit_logs',
              queueOptions: {
                durable: true, // 持久化佇列
              },
            },
          };
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class QueueModule {}
