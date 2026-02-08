import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { uuidv7 } from 'uuidv7';

interface RequestContextStore {
  requestId: string;
}

/**
 * RequestContextService
 *
 * 用 AsyncLocalStorage 管理 per-request 的 requestId，讓深層 service 不必透過參數傳遞。
 *
 * 使用：
 *   ctx.run(requestId, () => next());          // middleware 起 scope
 *   ctx.getRequestIdOrGenerate();              // service 寫 audit_log 時取
 *
 * 注意：
 * - `getRequestId()` 在 ALS 範圍外（cron / worker / startup）會回 undefined
 * - `getRequestIdOrGenerate()` 在 ALS 範圍外會 fallback `uuidv7()`，
 *   仍能滿足 audit_log.request_id 為 PostgreSQL uuid 型別的寫入要求
 */
@Injectable()
export class RequestContextService {
  private readonly als = new AsyncLocalStorage<RequestContextStore>();

  /** 在指定 requestId 下執行 fn（及其 async 後續） */
  run<T>(requestId: string, fn: () => T): T {
    return this.als.run({ requestId }, fn);
  }

  /** 讀取當前 requestId；ALS 外回 undefined */
  getRequestId(): string | undefined {
    return this.als.getStore()?.requestId;
  }

  /**
   * 取當前 requestId；不在 request scope 內時 fallback 自生 uuidv7()。
   * 適用於 service 層寫 audit_log（同一個 API 同時涵蓋 request 流程與 cron/worker）。
   */
  getRequestIdOrGenerate(): string {
    return this.getRequestId() ?? uuidv7();
  }
}
