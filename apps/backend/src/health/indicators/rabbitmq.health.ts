import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { timeout, catchError, of, lastValueFrom } from 'rxjs';

/**
 * RabbitMQ Health Indicator
 *
 * 檢查 RabbitMQ 連線狀態
 */
@Injectable()
export class RabbitMQHealthIndicator extends HealthIndicator {
  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // 發送 ping 訊息並等待回應（5 秒超時）
      const pattern = { cmd: 'ping' };
      const result$ = this.client.send(pattern, {}).pipe(
        timeout(5000),
        catchError((_error) => {
          // 捕獲錯誤並返回 null
          return of(null);
        }),
      );

      const result = await lastValueFrom(result$);

      // 檢查是否收到回應
      if (result !== null) {
        return this.getStatus(key, true, {
          message: 'RabbitMQ is healthy',
        });
      } else {
        // 如果沒有收到回應，檢查連線狀態
        // 注意：ClientProxy 沒有直接的方法檢查連線，所以我們認為沒有回應就是連線失敗
        throw new Error('RabbitMQ ping timeout or no response');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // 即使 RabbitMQ 失敗，應用程式也可以繼續運行（降級服務）
      // 所以我們返回警告而不是錯誤
      return this.getStatus(key, true, {
        status: 'warning',
        message: `RabbitMQ is not responding: ${errorMessage}`,
      });
    }
  }
}
