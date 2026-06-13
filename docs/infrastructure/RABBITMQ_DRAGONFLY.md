# RabbitMQ 和 Dragonfly 整合文件

訊息佇列與快取服務設置，提升審計日誌系統效能。

---

## 目錄

- [RabbitMQ 和 Dragonfly 整合文件](#rabbitmq-和-dragonfly-整合文件)
  - [目錄](#目錄)
  - [概述](#概述)
  - [架構](#架構)
  - [RabbitMQ](#rabbitmq)
    - [用途](#用途)
    - [服務資訊](#服務資訊)
    - [管理介面](#管理介面)
  - [Dragonfly](#dragonfly)
    - [用途](#用途-1)
    - [服務資訊](#服務資訊-1)
    - [為什麼選 Dragonfly？](#為什麼選-dragonfly)
  - [Docker Compose 設定](#docker-compose-設定)
    - [完整服務](#完整服務)
    - [啟動服務](#啟動服務)
    - [健康檢查](#健康檢查)
  - [應用程式整合](#應用程式整合)
    - [環境變數](#環境變數)
    - [Queue Module](#queue-module)
    - [Cache Module](#cache-module)
  - [使用範例](#使用範例)
    - [發送到佇列](#發送到佇列)
    - [處理佇列訊息](#處理佇列訊息)
    - [使用快取](#使用快取)
  - [效能優化](#效能優化)
    - [批次處理策略](#批次處理策略)
    - [快取策略](#快取策略)
  - [監控](#監控)
    - [RabbitMQ 監控](#rabbitmq-監控)
    - [Dragonfly 監控](#dragonfly-監控)
    - [效能指標](#效能指標)
  - [生產環境配置](#生產環境配置)
    - [RabbitMQ](#rabbitmq)
    - [Dragonfly](#dragonfly)
    - [高可用性](#高可用性)
  - [故障排除](#故障排除)
    - [RabbitMQ 問題](#rabbitmq-問題)
    - [Dragonfly 問題](#dragonfly-問題)
  - [效能提升](#效能提升)
    - [Before (無佇列/快取)](#before-無佇列快取)
    - [After (有佇列/快取)](#after-有佇列快取)
  - [相關資源](#相關資源)

---

## 概述

系統已整合 RabbitMQ (訊息佇列) 和 Dragonfly (Redis 替代方案) 來改善 Audit Log 的存取體驗。

## 架構

```text
API Request
    ↓
AuditLogInterceptor
    ↓
發送到 RabbitMQ Queue (非阻塞)
    ↓
AuditLogConsumer 批次處理
    ↓
寫入 TimescaleDB
    ↑
查詢時從 Dragonfly Cache 讀取
```

## RabbitMQ

### 用途

- **非阻塞寫入**: 日誌發送到佇列後立即返回，不阻塞主請求
- **批次處理**: Consumer 批次寫入資料庫，提升效能
- **可靠性**: 持久化佇列，系統重啟不丟失資料
- **高流量處理**: 緩衝大量請求

### 服務資訊

- **AMQP 端口**: 5672
- **管理介面**: <http://localhost:15672>
- **預設帳號**: hq / password
- **佇列名稱**: `audit_logs`

### 管理介面

訪問 <http://localhost:15672> 可以：

- 查看佇列狀態
- 監控訊息數量
- 查看 Consumer 連線
- 手動發送測試訊息

## Dragonfly

### 用途

- **查詢快取**: 快取常用查詢結果
- **Session 儲存**: 用戶 Session 管理
- **Rate Limiting 共享**: 分散式 Rate Limit
- **即時資料**: 減少資料庫負載

### 服務資訊

- **端口**: 6379 (Redis 協定相容)
- **記憶體限制**: 512MB
- **淘汰策略**: LRU (Least Recently Used)

### 為什麼選 Dragonfly？

相比 Redis：

- ✅ 更高效能 (25x 吞吐量)
- ✅ 更少記憶體使用
- ✅ 完全相容 Redis 協定
- ✅ 多執行緒架構
- ✅ 垂直擴展能力強

## Docker Compose 設定

### 完整服務

```yaml
services:
  timescaledb: # 資料庫
  rabbitmq: # 訊息佇列
  dragonfly: # 快取
```

### 啟動服務

```bash
# 啟動所有服務
docker-compose up -d

# 只啟動特定服務
docker-compose up -d rabbitmq dragonfly

# 查看狀態
docker-compose ps

# 查看日誌
docker-compose logs -f rabbitmq
docker-compose logs -f dragonfly
```

### 健康檢查

```bash
# RabbitMQ
curl -u hq:password http://localhost:15672/api/healthchecks/node

# Dragonfly
redis-cli ping
# 或（使用動態容器名稱）
docker exec $(grep DRAGONFLY_CONTAINER_NAME .env.docker | cut -d'=' -f2) redis-cli ping
```

## 應用程式整合

### 環境變數

在 `.env` 中設定：

```env
# RabbitMQ
RABBITMQ_URL=amqp://hq:password@localhost:5672

# Dragonfly/Redis
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD=  # 可選
```

### Queue Module

```typescript
// src/queue/queue.module.ts
@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUDIT_LOG_QUEUE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL],
          queue: 'audit_logs',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
})
export class QueueModule {}
```

### Cache Module

```typescript
// src/cache/cache.module.ts
@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => ({
        store: await redisStore({
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT),
          ttl: 300, // 5 分鐘
        }),
      }),
    }),
  ],
})
export class CacheModule {}
```

## 使用範例

### 發送到佇列

```typescript
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

export class AuditLogService {
  constructor(
    @Inject('AUDIT_LOG_QUEUE')
    private auditQueue: ClientProxy,
  ) {}

  async createAsync(data: CreateAuditLogDto) {
    // 非阻塞發送到佇列
    this.auditQueue.emit('audit_log.create', data);
  }
}
```

### 處理佇列訊息

```typescript
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AuditLogConsumer {
  @EventPattern('audit_log.create')
  async handleCreate(@Payload() data: CreateAuditLogDto) {
    // 批次處理或直接寫入資料庫
    await this.prisma.auditLog.create({ data });
  }
}
```

### 使用快取

```typescript
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export class AuditLogService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async findAll(filters: any) {
    const cacheKey = `audit_logs:${JSON.stringify(filters)}`;

    // 先從快取讀取
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    // 查詢資料庫
    const result = await this.prisma.auditLog.findMany({
      where: filters,
    });

    // 寫入快取（5 分鐘）
    await this.cacheManager.set(cacheKey, result, 300);

    return result;
  }
}
```

## 效能優化

### 批次處理策略

```typescript
export class AuditLogConsumer {
  private buffer: CreateAuditLogDto[] = [];
  private readonly BATCH_SIZE = 100;
  private readonly BATCH_INTERVAL = 5000; // 5 秒

  async handleCreate(data: CreateAuditLogDto) {
    this.buffer.push(data);

    if (this.buffer.length >= this.BATCH_SIZE) {
      await this.flush();
    }
  }

  @Interval(5000) // 每 5 秒執行一次
  async flush() {
    if (this.buffer.length === 0) return;

    const items = [...this.buffer];
    this.buffer = [];

    await this.prisma.auditLog.createMany({
      data: items,
      skipDuplicates: true,
    });

    console.log(`✅ 批次寫入 ${items.length} 筆 audit logs`);
  }
}
```

### 快取策略

#### 1. 查詢結果快取

```typescript
// 快取 5 分鐘
@CacheKey('audit_logs_recent')
@CacheTTL(300)
async findRecent() {
  return this.prisma.auditLog.findMany({
    take: 100,
    orderBy: { timestamp: 'desc' },
  });
}
```

#### 2. 統計資料快取

```typescript
// 快取 1 小時
@CacheKey('audit_stats')
@CacheTTL(3600)
async getStatistics() {
  return this.calculateStats();
}
```

#### 3. 手動快取控制

```typescript
// 清除特定快取
await this.cacheManager.del('audit_logs_recent');

// 清除所有快取
await this.cacheManager.reset();
```

## 監控

### RabbitMQ 監控

**管理介面指標**：

- Queue Length: 佇列中的訊息數量
- Message Rate: 訊息處理速率
- Consumer Count: Consumer 數量
- Unacked Messages: 未確認的訊息

**警報規則**：

```typescript
// 當佇列積壓超過 10000 則警報
if (queueLength > 10000) {
  await alertService.send('RabbitMQ queue overflow!');
}
```

### Dragonfly 監控

```bash
# 連線到 Dragonfly
redis-cli -p 6379

# 查看資訊
INFO

# 查看所有鍵
KEYS *

# 查看記憶體使用
INFO memory

# 查看命中率
INFO stats
```

### 效能指標

```typescript
// 追蹤佇列處理時間
const start = Date.now();
await this.processAuditLog(data);
const duration = Date.now() - start;

if (duration > 1000) {
  console.warn(`⚠️ 慢查詢: ${duration}ms`);
}
```

## 生產環境配置

### RabbitMQ

```yaml
rabbitmq:
  environment:
    RABBITMQ_DEFAULT_USER: ${RABBITMQ_USER}
    RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASS}
    RABBITMQ_VM_MEMORY_HIGH_WATERMARK: 0.6 # 記憶體限制
  resources:
    limits:
      memory: 2G
      cpus: '2'
```

### Dragonfly

```yaml
dragonfly:
  command: >
    --maxmemory=2gb
    --cache_mode=true
    --snapshot_cron="0 */6 * * *"  # 每 6 小時備份
  resources:
    limits:
      memory: 2.5G
      cpus: '4'
```

### 高可用性

**RabbitMQ 集群**：

```yaml
services:
  rabbitmq1:
    environment:
      RABBITMQ_ERLANG_COOKIE: 'secret_cookie'
  rabbitmq2:
    environment:
      RABBITMQ_ERLANG_COOKIE: 'secret_cookie'
```

**Dragonfly 複製**：

```yaml
dragonfly-master:
  command: --replicaof no one

dragonfly-replica:
  command: --replicaof dragonfly-master 6379
```

## 故障排除

### RabbitMQ 問題

**問題**: 訊息積壓

```bash
# 查看佇列狀態（使用動態容器名稱）
docker exec $(grep RABBITMQ_CONTAINER_NAME .env.docker | cut -d'=' -f2) rabbitmqctl list_queues

# 增加 Consumer 數量
# 或調整 prefetchCount
```

**問題**: 連線失敗

```bash
# 檢查網路（使用動態容器名稱）
docker exec $(grep RABBITMQ_CONTAINER_NAME .env.docker | cut -d'=' -f2) rabbitmqctl node_health_check

# 重啟服務
docker-compose restart rabbitmq
```

### Dragonfly 問題

**問題**: 記憶體不足

```bash
# 檢查記憶體
redis-cli INFO memory

# 清理快取
redis-cli FLUSHDB
```

**問題**: 連線逾時

```bash
# 檢查連線
redis-cli ping

# 重啟服務
docker-compose restart dragonfly
```

## 效能提升

### Before (無佇列/快取)

- Audit Log 寫入時間: ~50ms
- 資料庫負載: 高
- 高流量時延遲: 明顯

### After (有佇列/快取)

- Audit Log 寫入時間: <5ms (非阻塞)
- 資料庫負載: 低 (批次寫入)
- 查詢速度: 快 10-100 倍 (快取命中)
- 高流量處理: 平順

## 相關資源

- [RabbitMQ 官方文件](https://www.rabbitmq.com/documentation.html)
- [Dragonfly 官方文件](https://www.dragonflydb.io/docs)
- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [NestJS Caching](https://docs.nestjs.com/techniques/caching)
